'use strict';

/**
 * Strapi 5 email provider: Microsoft 365 through the Microsoft Graph API (`POST /users/{sender}/sendMail`).
 *
 * Authentication is OAuth 2.0 client credentials (an Entra ID app registration with the *application*
 * permission Mail.Send), so no mailbox password and no SMTP AUTH are involved. Limit the app to the sending
 * mailbox with Exchange Online RBAC for Applications (see docs/CMS-BRANDING-AND-EMAIL.md).
 *
 * Accepts the same `send()` options as the Nodemailer provider that it replaces:
 *   from, to, cc, bcc, replyTo, subject, text, html, attachments[{ filename, content, contentType, cid,
 *   contentDisposition }], headers.
 * Graph only accepts custom headers whose names start with "X-"; other headers are dropped.
 *
 * Plain CommonJS with no dependencies (Node 18+ global fetch), loaded by path from config/plugins.ts.
 */

const GRAPH = 'https://graph.microsoft.com/v1.0';
const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const TIMEOUT_MS = 20_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** "Name <a@b.c>" | "a@b.c" -> { emailAddress: { address, name? } } */
function parseAddress(value) {
  const s = String(value).trim();
  const m = s.match(/^\s*"?([^"<]*?)"?\s*<\s*([^<>\s]+@[^<>\s]+)\s*>\s*$/);
  if (m) return { emailAddress: m[1].trim() ? { name: m[1].trim(), address: m[2] } : { address: m[2] } };
  if (/^[^\s@<>]+@[^\s@<>]+$/.test(s)) return { emailAddress: { address: s } };
  throw new Error(`Invalid email address: ${s}`);
}

/** Accepts a string (comma/semicolon separated, commas inside quotes or <> respected), an object or an array. */
function parseList(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) return value.flatMap(parseList);
  if (typeof value === 'object') {
    if (!value.address) throw new Error('Invalid email address object');
    return [{ emailAddress: value.name ? { name: value.name, address: value.address } : { address: value.address } }];
  }
  const parts = [];
  let buf = '';
  let quoted = false;
  let angle = false;
  for (const ch of String(value)) {
    if (ch === '"') quoted = !quoted;
    else if (ch === '<') angle = true;
    else if (ch === '>') angle = false;
    if ((ch === ',' || ch === ';') && !quoted && !angle) {
      if (buf.trim()) parts.push(buf);
      buf = '';
    } else buf += ch;
  }
  if (buf.trim()) parts.push(buf);
  return parts.map(parseAddress);
}

function toAttachment(a) {
  let content = a.content;
  if (content == null) {
    // Same rule as the Strapi Nodemailer provider: no file paths or URLs, inline content only.
    throw new Error(`Attachment "${a.filename || 'unnamed'}" has no inline content (paths and URLs are not supported)`);
  }
  const bytes = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content, a.encoding === 'base64' ? 'base64' : 'utf8');
  const inline = Boolean(a.cid) || a.contentDisposition === 'inline';
  return {
    '@odata.type': '#microsoft.graph.fileAttachment',
    name: a.filename || 'attachment',
    contentType: a.contentType || 'application/octet-stream',
    contentBytes: bytes.toString('base64'),
    isInline: inline,
    ...(a.cid ? { contentId: a.cid } : {}),
  };
}

function toHeaders(headers) {
  if (!headers) return [];
  const entries = Array.isArray(headers)
    ? headers.map((h) => [h.key ?? h.name, h.value])
    : Object.entries(headers);
  return entries
    .filter(([name, value]) => /^x-/i.test(String(name)) && value != null && value !== '')
    .map(([name, value]) => ({ name: String(name), value: String(value) }));
}

async function graphError(res) {
  let detail = '';
  try {
    const body = await res.json();
    detail = body?.error ? `${body.error.code}: ${body.error.message}` : body?.error_description || JSON.stringify(body);
  } catch {
    detail = await res.text().catch(() => '');
  }
  const err = new Error(`Microsoft Graph ${res.status}${detail ? ` ${detail}` : ''}`.slice(0, 1500));
  err.status = res.status;
  return err;
}

module.exports = {
  init(providerOptions = {}, settings = {}) {
    const {
      tenantId,
      clientId,
      clientSecret,
      sender,
      saveToSentItems = true,
      authority = 'https://login.microsoftonline.com',
    } = providerOptions;

    const missing = Object.entries({ tenantId, clientId, clientSecret })
      .filter(([, v]) => !v)
      .map(([k]) => k);

    let token = null; // { value, expiresAt }

    async function getToken(force = false) {
      if (!force && token && Date.now() < token.expiresAt) return token.value;
      const res = await fetch(`${authority}/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'https://graph.microsoft.com/.default',
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw await graphError(res);
      const body = await res.json();
      // Refresh five minutes before expiry.
      token = { value: body.access_token, expiresAt: Date.now() + Math.max(60, (body.expires_in || 3600) - 300) * 1000 };
      return token.value;
    }

    return {
      async send(options = {}) {
        if (missing.length) {
          throw new Error(`Microsoft Graph email is not configured (missing ${missing.join(', ')}; set MS_GRAPH_* in .env)`);
        }
        const from = options.from || settings.defaultFrom;
        const fromAddr = from ? parseList(from)[0] : undefined;
        const mailbox = sender || fromAddr?.emailAddress.address;
        if (!mailbox) throw new Error('No sending mailbox: set MS_GRAPH_SENDER or EMAIL_FROM');

        const toRecipients = parseList(options.to);
        if (!toRecipients.length) throw new Error('Email has no recipient');
        const replyTo = parseList(options.replyTo || settings.defaultReplyTo);
        const attachments = (options.attachments || []).map(toAttachment);
        const internetMessageHeaders = toHeaders(options.headers);

        const message = {
          subject: options.subject || '',
          body: options.html
            ? { contentType: 'HTML', content: options.html }
            : { contentType: 'Text', content: options.text || '' },
          toRecipients,
          ...(parseList(options.cc).length ? { ccRecipients: parseList(options.cc) } : {}),
          ...(parseList(options.bcc).length ? { bccRecipients: parseList(options.bcc) } : {}),
          ...(replyTo.length ? { replyTo } : {}),
          // `from` only differs from the mailbox when the app's mailbox has Send As / Send on Behalf rights.
          ...(fromAddr ? { from: fromAddr } : {}),
          ...(attachments.length ? { attachments } : {}),
          ...(internetMessageHeaders.length ? { internetMessageHeaders } : {}),
        };
        const payload = JSON.stringify({ message, saveToSentItems: Boolean(saveToSentItems) });
        const url = `${GRAPH}/users/${encodeURIComponent(mailbox)}/sendMail`;

        let refreshed = false;
        for (let attempt = 1; ; attempt++) {
          let res;
          try {
            res = await fetch(url, {
              method: 'POST',
              headers: { authorization: `Bearer ${await getToken()}`, 'content-type': 'application/json' },
              body: payload,
              signal: AbortSignal.timeout(TIMEOUT_MS),
            });
          } catch (e) {
            if (attempt >= MAX_ATTEMPTS) throw new Error(`Microsoft Graph request failed: ${e.message}`);
            await sleep(1000 * 2 ** (attempt - 1));
            continue;
          }
          if (res.status === 202 || res.ok) return;
          if (res.status === 401 && !refreshed) {
            refreshed = true;
            await getToken(true);
            continue;
          }
          if (RETRYABLE.has(res.status) && attempt < MAX_ATTEMPTS) {
            const retryAfter = Number(res.headers.get('retry-after'));
            await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 30) * 1000 : 1000 * 2 ** (attempt - 1));
            continue;
          }
          throw await graphError(res);
        }
      },
    };
  },
};
