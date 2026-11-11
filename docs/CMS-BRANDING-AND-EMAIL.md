# Linkfields CMS — branding, admin access and enquiry emails

This guide covers three things added in November 2026: the Linkfields-branded Strapi admin, how website enquiries
are stored with a unique reference, and the thank-you / sales-alert emails sent for every enquiry.

---

## 1. Admin access

| Item | Value |
| --- | --- |
| Admin URL (preview environment) | `https://1337-iwwzmmmft1qavwa01w9mi-1fb5a9e2.us5.manus.computer/admin` |
| Production admin URL (after go-live) | `https://cms.linkfields.com/admin` (or the CMS host chosen at go-live) |
| Super admin account | `admin@linkfields.local` (the password is handed over privately and stored on the server in `~/.secrets/strapi_admin`, mode 600) |
| Content editor account | `editor@linkfields.local`, role **Editor** (password handed over privately; stored in `~/.secrets/strapi_editor`, mode 600) |

Role permissions were refreshed on 10 Nov 2026. Strapi fixes the Editor and Author permissions when it is first
installed, so content types and fields added later (the **Event** collection, the Global offices, menu groups and
badges, the new blog-post and lead fields) were not available to those roles. Editors now have full access to every
content type and field. Authors have the same, limited to entries they created. When a developer adds a new content
type, tick it for the Editor and Author roles under *Settings › Administration panel › Roles*.

Good practice for the Linkfields team:

1. **Change the password at first sign-in**: avatar (bottom left) › *Profile* › *Change password*.
2. **Give every editor their own account** instead of sharing the super admin: *Settings › Administration panel ›
   Users › Invite new user*. Use the **Editor** role for marketing/content staff (they can create and publish
   content) and **Author** for contributors who should only draft. Keep *Super Admin* to one or two people.
3. Change the super admin's email to a real, monitored mailbox (for example `webadmin@linkfields.com`) so that
   *Forgot your password?* works: *Profile › Email*.
4. If a password is ever lost, a server administrator can reset it:
   `cd apps/cms && pnpm exec strapi admin:reset-user-password --email=<email> --password=<new password>`.

---

## 2. Linkfields branding of the admin

Everything lives in `apps/cms/src/admin/` and is applied when the admin is rebuilt (`pnpm build` in `apps/cms`,
then restart the CMS service).

| What | Where | Notes |
| --- | --- | --- |
| Login logo (navy plate, full Linkfields logo) | `extensions/linkfields-auth-logo.svg` | `config.auth.logo` |
| Navigation mark | `extensions/linkfields-mark.svg` | `config.menu.logo` |
| Browser favicon | `extensions/linkfields-favicon.png` | `config.head.favicon` |
| Login background (globe artwork, brand gradient) | `extensions/linkfields-globe.jpg` + login CSS in `app.tsx` | |
| Colours | `app.tsx` › `theme.light` / `theme.dark` | Linkfields orange as primary; deeper orange (#CC4A00) for white text so buttons pass WCAG AA contrast |
| Wording | `app.tsx` › `translations.en` | "Welcome to Linkfields CMS", "Sign in", tab title "Linkfields CMS", home subtitle |
| Strapi tutorials / release pop-ups | `tutorials: false`, `notifications.releases: false` | Hidden for editors |

Logos uploaded through *Settings › Overview* override the files above. Leave those empty to keep the branded set.

---

## 3. How an enquiry flows

1. A visitor submits the **Let's connect** form (page form or pop-up).
2. The website (`apps/web/src/app/api/contact/route.ts`) validates the fields, checks the honeypot, rate-limits per
   IP and stores the enquiry in Strapi with a **create-only API token** (`STRAPI_LEAD_TOKEN`).
3. Strapi gives the lead a **unique reference** in the format `LF-YYMMDD-XXXXX` (date in South African time plus five
   characters from an alphabet without 0/O/1/I, e.g. `LF-261110-Q4J2D`).
4. The website replaces the form with a **receipt panel**: "Thank you for submitting your enquiry. Our expert
   consultants will be in touch.", the reference with a *Copy* button, the address the confirmation went to, an
   urgent-contact link to sales@linkfields.com and *Submit another enquiry*. In the pop-up, the receipt stays open
   until the visitor closes it.
5. In the background Strapi sends:
   - the **thank-you email** to the visitor, and
   - a **sales alert** to `ENQUIRY_NOTIFY_TO` (default sales@linkfields.com), with *Reply-To* set to the visitor
     and a button that opens the lead in the CMS.
6. The outcome is recorded on the lead: **Email status** (`sent` / `failed` / `not-configured`), **Email sent at**
   and **Email error**.

Leads are in *Content Manager › Lead*. The list shows Reference, Name, Organisation, Enquiry type, Email status and
Received, newest first.

---

## 4. The thank-you email

**Subject:** `Linkfields – <Enquiry type> – Ref. <reference>`, for example:

- `Linkfields – Agentic AI & GenAI enquiry – Ref. LF-261110-Q4J2D`
- `Linkfields – Africa Tech Festival 2026 meeting request – Ref. LF-261110-GZ9GD`
- after an event has ended: `Linkfields – Africa Tech Festival 2026 follow-up – Ref. …`

**Body** (HTML with a plain-text alternative, Linkfields header, mobile-friendly):

> Dear *{visitor name}*,
>
> Thank you for submitting your enquiry. **Our expert team will contact you within 24 hours.**
>
> We appreciate your trust in our services and look forward to engaging with you.
>
> **Your enquiry reference:** LF-…  (please quote it in any correspondence)
>
> *Your enquiry at a glance:* enquiry type, area of interest, organisation, name, email, phone, submitted time
> (SAST) and the requirements they wrote.
>
> *Event enquiries only:* "Let's meet in person": event name, dates, stand, venue, *Add to calendar* and
> *Plan your visit* buttons.
>
> *What happens next:* the three steps from *Global › Contact form › Next steps*.
>
> **Need an urgent response?** Please write to sales@linkfields.com, quoting your reference.
>
> Regards,
> **Linkfields – Sales team**

The footer carries the tagline, the office countries (from *Global › Offices*), a "you are receiving this because…"
line and the Privacy Policy link.

**What editors can change without a developer**

| Content in the email | Where to edit |
| --- | --- |
| Area-of-interest names → enquiry type | *Global › Contact form › Service options* |
| "What happens next" steps | *Global › Contact form › Next steps* |
| Sales address shown in the email | *Global › Sales email* |
| Office countries in the footer | *Global › Offices* |
| Event name, dates, stand, venue | *Event* record |
| On-site thank-you message | *Global › Contact form › Success message* (first sentence becomes the heading) |

Fixed wording (greeting, 24-hour promise, sign-off) is in `apps/cms/src/utils/enquiry-email.ts`.

---

## 5. SMTP configuration (go-live)

The CMS sends through SMTP with the official `@strapi/provider-email-nodemailer` provider (`apps/cms/config/plugins.ts`).
Settings are environment variables in `apps/cms/.env` (template: `apps/cms/.env.example`):

| Variable | Purpose | Example |
| --- | --- | --- |
| `SMTP_HOST` / `SMTP_PORT` | SMTP relay | `smtp-relay.brevo.com` / `587` |
| `SMTP_SECURE` | `true` only for port 465 | `false` |
| `SMTP_REQUIRE_TLS` | Force STARTTLS on 587 | `true` |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | Relay credentials (keep secret) | — |
| `EMAIL_FROM` | Sender | `Linkfields Sales <sales@linkfields.com>` |
| `EMAIL_REPLY_TO` | Where visitor replies go | `sales@linkfields.com` |
| `ENQUIRY_NOTIFY_TO` | Sales alert recipients (comma-separated) | `sales@linkfields.com` |
| `ENQUIRY_EMAILS_ENABLED` | `false` stops both emails (leads are still stored) | `true` |
| `WEBSITE_URL` | Used for links in the email | `https://www.linkfields.com` |

**Which relay?** linkfields.com's SPF record already authorises Microsoft 365, Brevo (Sendinblue) and Amazon SES.

- **Recommended: Brevo or Amazon SES.** Both are built for application email, give delivery logs, and work with a
  simple SMTP key.
- **Microsoft 365 mailbox (`smtp.office365.com:587`)** only if Linkfields' IT allows it. Microsoft disables
  Basic-authentication SMTP AUTH **by default for existing tenants at the end of December 2026** (an admin can still
  re-enable it until a final removal date is announced in the second half of 2027). Source: Microsoft Exchange Team
  blog, "Updated Exchange Online SMTP AUTH Basic Authentication Deprecation Timeline", 27 Jan 2026.

### Microsoft 365 via Microsoft Graph (recommended for Microsoft 365)

Instead of SMTP, the CMS can send through Microsoft Graph `sendMail` with an Entra ID app registration
(OAuth client credentials, so the Basic-auth SMTP deprecation does not apply). Set `EMAIL_PROVIDER=graph`;
`SMTP_*` are then ignored. Provider: the local package `strapi-provider-email-graph` in
`apps/cms/providers/email-graph` (a `file:` dependency in `apps/cms/package.json`; the Dockerfile copies it before
`npm ci`). Configured in the local Docker setup since 11 Nov 2026; on AWS set `enquiry_email_provider = "graph"` in
Terraform (see below). On a single server, put the variables in `apps/cms/.env` and restart `lf-cms`.

| Variable | Purpose |
| --- | --- |
| `EMAIL_PROVIDER` | `graph` for Microsoft Graph, `nodemailer` (default) for SMTP |
| `MS_GRAPH_TENANT_ID` / `MS_GRAPH_CLIENT_ID` | Directory (tenant) ID and Application (client) ID of the app registration (`Linkfields_Website_New`) |
| `MS_GRAPH_CLIENT_SECRET` | Client secret **value** (not its ID). Secret: keep it in `.env` / the secrets store only; note its expiry date |
| `MS_GRAPH_SENDER` | Mailbox sent from; empty = the address in `EMAIL_FROM` (`sales@linkfields.com`). The From line uses this mailbox with the `EMAIL_FROM` display name |

How it sends: the message is built as MIME (Nodemailer's composer) and posted as base64 MIME, so the plain-text
alternative, the inline logo and the `Auto-Submitted` header are kept; `X-Auto-Response-Suppress: All` is added for
Outlook/Exchange auto-responders. A copy is always saved in the sender's Sent Items (Graph cannot turn this off for MIME
sends). Throttling (429/503/504) is retried up to 4 times, honouring `Retry-After`; a 401 refreshes the token once.
Missing `MS_GRAPH_*` settings never stop the CMS from starting: the send fails and the lead shows *Email status: failed*
with the reason.

Azure requirements: Microsoft Graph **application** permission `Mail.Send` with admin consent. That permission lets the
app send as *any* mailbox in the tenant, so Linkfields IT should limit it to the sender mailbox with an Exchange
application access policy / RBAC for Applications scope.

**AWS (Terraform):** set `enquiry_email_provider = "graph"`, `ms_graph_tenant_id`, `ms_graph_client_id` and optionally
`ms_graph_sender` in `terraform.tfvars`, apply, then put the client secret value into the secret named by the output
`ms_graph_client_secret_arn` (`aws secretsmanager put-secret-value --secret-id <arn> --secret-string '<value>'`) and
redeploy the CMS service. The default `enquiry_email_provider = "none"` keeps enquiry emails off (leads are still stored).

**DNS for deliverability** (current state checked 10 Nov 2026):

- SPF: already includes all three providers. No change needed.
- DKIM: no DKIM records were found. **Enable DKIM** for the chosen provider (Brevo › Senders & domains, SES › Verified
  identities, or Microsoft 365 Defender › DKIM) and publish the CNAMEs it gives you.
- DMARC: currently `p=none` (monitoring). Once DKIM is live and reports are clean, move to `p=quarantine`.

**After changing `.env`:** restart the CMS (`sudo systemctl restart lf-cms`), then send a test from *Settings › Email
› Send test email* and submit a test enquiry on the website. Check the lead's *Email status*.

---

## 6. Testing and troubleshooting

- In the preview environment the SMTP settings point to **Mailpit**, a local test inbox (`127.0.0.1:1025`, web UI on
  `127.0.0.1:8025`). Mails are caught there and not delivered to real people.
- *Email status = failed*: the *Email error* field shows the SMTP error (wrong credentials, TLS, sender not verified).
- *Email status = not-configured*: `ENQUIRY_EMAILS_ENABLED=false`.
- No lead created at all: the website's `STRAPI_LEAD_TOKEN` is missing or invalid. Production loads it from
  `/home/ubuntu/lf-run/web.env` via the systemd drop-in `/etc/systemd/system/lf-web.service.d/env.conf`, so deploys
  never remove it.
