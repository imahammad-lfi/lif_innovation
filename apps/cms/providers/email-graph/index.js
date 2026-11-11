'use strict';

/**
 * Strapi email provider that sends through Microsoft Graph (Microsoft 365 / Exchange Online)
 * with an Entra ID app registration and the client-credentials flow.
 *
 * Installed as the local package "strapi-provider-email-graph" (apps/cms/package.json, file: dependency),
 * so config/plugins.ts can name it like any provider: provider: 'strapi-provider-email-graph'.
 *
 * Azure set-up: app registration with the *application* permission Microsoft Graph › Mail.Send
 * (admin consent granted) and a client secret. Recommended: restrict the app to the sender
 * mailbox with Exchange RBAC for Applications / an application access policy.
 *
 * providerOptions: { tenantId, clientId, clientSecret, sender }
 * settings:        { defaultFrom, defaultReplyTo }
 *
 * Messages are built as MIME with Nodemailer's composer (already a Strapi dependency) and posted to
 * POST /users/{sender}/sendMail as base64 MIME. That keeps the multipart/alternative text part,
 * inline cid images and standard headers such as Auto-Submitted, which Graph's JSON message
 * format cannot carry (it only accepts custom "X-" headers).
 */

const MailComposer = require('nodemailer/lib/mail-composer');

const GRAPH = 'https://graph.microsoft.com/v1.0';
const MAX_ATTEMPTS = 4;
const MAX_RETRY_WAIT_MS = 30_000;

const log = (level, message) => {
  const logger = typeof strapi !== 'undefined' && strapi && strapi.log ? strapi.log : console;
  (logger[level] || logger.info).call(logger, `[email-graph] ${message}`);
};

/** "Name <a@b.c>" | "a@b.c" | { name, address } → { name?, address } */
function parseAddress(value) {
  if (value && typeof value === 'object') return { address: String(value.address || '').trim(), ...(value.name ? { name: value.name } : {}) };
  const s = String(value || '').trim();
  const m = s.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { address: m[2].trim(), ...(m[1].trim() ? { name: m[1].trim() } : {}) };
  return { address: s };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retry-After is seconds (or an HTTP date); falls back to exponential back-off. */
function retryDelay(res, attempt) {
  const header = res.headers.get('retry-after');
  let ms = header ? (/^\d+$/.test(header) ? Number(header) * 1000 : Date.parse(header) - Date.now()) : NaN;
  if (!Number.isFinite(ms) || ms < 0) ms = 1000 * 2 ** attempt;
  return Math.min(ms, MAX_RETRY_WAIT_MS);
}

function buildMime(mail) {
  return new Promise((resolve, reject) => {
    const node = new MailComposer(mail).compile();
    node.keepBcc = true; // Graph takes the recipients (Bcc included) from the MIME headers.
    node.build((err, message) => (err ? reject(err) : resolve(message)));
  });
}

module.exports = {
  init(providerOptions = {}, settings = {}) {
    const { tenantId, clientId, clientSecret } = providerOptions;
    const missing = ['tenantId', 'clientId', 'clientSecret'].filter((k) => !providerOptions[k]);
    const defaultFrom = parseAddress(settings.defaultFrom);
    const mailbox = String(providerOptions.sender || defaultFrom.address || '').trim();
    // Never throw here: Strapi initialises providers at boot, and a missing email secret must only fail
    // the send (recorded on the lead), not take the whole CMS down.
    if (missing.length) log('error', `missing provider option(s): ${missing.join(', ')}; emails will fail until they are set`);
    if (!mailbox) log('error', 'no sender mailbox (MS_GRAPH_SENDER or EMAIL_FROM); emails will fail until it is set');

    let token = null;
    let tokenExpires = 0;
    let tokenRequest = null;

    async function fetchToken() {
      const res = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
        signal: AbortSignal.timeout(15_000),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.access_token) {
        throw new Error(`[email-graph] token request failed (${res.status}): ${json.error || ''} ${json.error_description || ''}`.trim());
      }
      token = json.access_token;
      tokenExpires = Date.now() + (Number(json.expires_in) || 3600) * 1000;
      return token;
    }

    /** Cached token; concurrent callers share one in-flight request. */
    function accessToken() {
      if (token && Date.now() < tokenExpires - 60_000) return Promise.resolve(token);
      if (!tokenRequest) tokenRequest = fetchToken().finally(() => (tokenRequest = null));
      return tokenRequest;
    }

    return {
      async send(options = {}) {
        if (missing.length) throw new Error(`[email-graph] not configured: missing ${missing.join(', ')}`);
        if (!mailbox) throw new Error('[email-graph] no sender mailbox configured (MS_GRAPH_SENDER or EMAIL_FROM)');

        const { from, to, cc, bcc, replyTo, subject, text, html, attachments = [], headers = {} } = options;
        // Graph sends from the mailbox in the URL. Without an explicit "from", use that mailbox (keeping the
        // EMAIL_FROM display name), so setting MS_GRAPH_SENDER alone never needs Send As rights. An explicit
        // "from" on a different address requires Send As on that mailbox.
        const fromAddress = from
          ? parseAddress(from)
          : { address: mailbox, ...(defaultFrom.name ? { name: defaultFrom.name } : {}) };

        const extraHeaders = { ...headers };
        // Exchange/Outlook auto-responders honour X-Auto-Response-Suppress rather than RFC 3834 Auto-Submitted.
        if (Object.keys(extraHeaders).some((h) => h.toLowerCase() === 'auto-submitted') && !('X-Auto-Response-Suppress' in extraHeaders)) {
          extraHeaders['X-Auto-Response-Suppress'] = 'All';
        }

        const mime = await buildMime({
          from: fromAddress,
          to,
          cc,
          bcc,
          replyTo: replyTo || settings.defaultReplyTo,
          subject: subject || '',
          text,
          html,
          attachments: attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType,
            ...(a.cid ? { cid: a.cid, contentDisposition: 'inline' } : {}),
          })),
          headers: extraHeaders,
        });
        const body = mime.toString('base64');
        // MIME sends always keep a copy in the sender's Sent Items (Graph has no saveToSentItems for MIME).
        const url = `${GRAPH}/users/${encodeURIComponent(mailbox)}/sendMail`;

        let refreshedToken = false;
        for (let attempt = 1; ; attempt++) {
          const res = await fetch(url, {
            method: 'POST',
            headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'text/plain' },
            body,
            signal: AbortSignal.timeout(30_000),
          });
          if (res.status === 202) return;

          // 401: token revoked/rotated before expiry. Drop it and retry once with a fresh one.
          if (res.status === 401 && !refreshedToken) {
            token = null;
            refreshedToken = true;
            continue;
          }
          // Throttling / transient outage: Graph has not accepted the message, so retrying cannot duplicate it.
          if ([429, 503, 504].includes(res.status) && attempt < MAX_ATTEMPTS) {
            const wait = retryDelay(res, attempt);
            log('warn', `sendMail ${res.status}; retrying in ${Math.round(wait / 1000)} s (attempt ${attempt + 1}/${MAX_ATTEMPTS})`);
            await sleep(wait);
            continue;
          }

          const text = await res.text().catch(() => '');
          let detail = text;
          try {
            const e = JSON.parse(text).error;
            detail = `${e.code}: ${e.message}`;
          } catch {}
          throw new Error(`[email-graph] sendMail as ${mailbox} failed (${res.status}): ${detail.slice(0, 500)}`);
        }
      },
    };
  },
};
