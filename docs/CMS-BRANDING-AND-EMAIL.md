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

**Privacy Policy pop-up on the enquiry form.** The "Privacy Policy" link under the enquiry form opens the policy in a
pop-up above the form, so visitors can read it without losing what they have typed. The pop-up shows the text of the
published *Privacy policy* page (Content Manager › Page › `/privacy-policy`, its Rich text sections). Edit and publish that
page; the pop-up and the page update together (a browser that already opened the pop-up may show the previous text for up
to five minutes).

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

## 5. Microsoft 365 email via Microsoft Graph (go-live)

The CMS sends through **Microsoft 365 using the Microsoft Graph API** (`POST /users/{mailbox}/sendMail`), with the
local provider `apps/cms/providers/email-graph` (selected in `apps/cms/config/plugins.ts`). It signs in with an
Entra ID app registration (OAuth 2.0 client credentials). It needs no mailbox password and no SMTP AUTH, so it is not
affected by Microsoft switching off Basic-authentication SMTP AUTH (default-off for existing tenants from the end of
December 2026). Messages are saved in the mailbox's *Sent Items*.

Settings are environment variables (root `.env` for Docker, `apps/cms/.env` otherwise):

| Variable | Purpose | Example |
| --- | --- | --- |
| `EMAIL_PROVIDER` | `graph` (default). `nodemailer` switches to SMTP for a local Mailpit test inbox | `graph` |
| `MS_GRAPH_TENANT_ID` | Directory (tenant) ID of the app registration | GUID |
| `MS_GRAPH_CLIENT_ID` | Application (client) ID | GUID |
| `MS_GRAPH_CLIENT_SECRET` | Client secret value (keep secret; note its expiry date) | — |
| `MS_GRAPH_SENDER` | Mailbox the app sends as (user or shared mailbox). Empty = the address in `EMAIL_FROM` | `sales@linkfields.com` |
| `MS_GRAPH_SAVE_TO_SENT_ITEMS` | Keep a copy in Sent Items | `true` |
| `EMAIL_FROM` | Display name and address shown as sender (must be the sending mailbox, or one it has *Send As* rights on) | `Linkfields Sales <sales@linkfields.com>` |
| `EMAIL_REPLY_TO` | Where visitor replies go | `sales@linkfields.com` |
| `ENQUIRY_NOTIFY_TO` | Sales alert recipients (comma-separated) | `sales@linkfields.com` |
| `ENQUIRY_EMAILS_ENABLED` | `false` stops both emails (leads are still stored) | `true` |
| `WEBSITE_URL` | Used for links in the email | `https://www.linkfields.com` |

**One-off Microsoft 365 set-up (tenant admin):**

1. *Entra admin centre › App registrations › New registration* (single tenant, no redirect URI).
2. *API permissions › Add › Microsoft Graph › Application permissions › `Mail.Send`*, then **Grant admin consent**.
3. *Certificates & secrets › New client secret*. Copy the value into `MS_GRAPH_CLIENT_SECRET` and diary the expiry
   date (renew before it expires, or emails will fail with `invalid_client`).
4. **Restrict the app to the sending mailbox.** By default `Mail.Send` allows sending as *any* mailbox in the tenant.
   Limit it with Exchange Online RBAC for Applications (Exchange Online PowerShell):

   ```powershell
   New-ServicePrincipal -AppId <client-id> -ObjectId <enterprise-app-object-id> -DisplayName "Linkfields website mail"
   New-ManagementScope -Name "Linkfields website sender" -RecipientRestrictionFilter "PrimarySmtpAddress -eq 'sales@linkfields.com'"
   New-ManagementRoleAssignment -App <client-id> -Role "Application Mail.Send" -CustomResourceScope "Linkfields website sender"
   Test-ServicePrincipalAuthorization -Identity <client-id> -Resource sales@linkfields.com
   ```

   When using RBAC for Applications, remove the tenant-wide `Mail.Send` grant from the app registration so the scoped
   assignment is the only one. (The older *Application Access Policy* also works but Microsoft recommends RBAC.)

Graph limits: about 30 messages per minute and 10,000 recipients per day per mailbox. The provider retries
throttling (429) and temporary errors with back-off, and refreshes the token automatically. Graph only accepts
custom headers starting with `X-`; others (such as `Auto-Submitted`) are left out.

**DNS for deliverability** (current state checked 10 Nov 2026):

- SPF: already includes all three providers. No change needed.
- DKIM: no DKIM records were found. **Enable DKIM** in Microsoft 365 Defender › Email authentication › DKIM for
  linkfields.com and publish the two CNAMEs it gives you.
- DMARC: currently `p=none` (monitoring). Once DKIM is live and reports are clean, move to `p=quarantine`.

**After changing `.env`:** restart the CMS (`sudo systemctl restart lf-cms`), then send a test from *Settings › Email
› Send test email* and submit a test enquiry on the website. Check the lead's *Email status*.

---

## 6. Testing and troubleshooting

- For a local test inbox, set `EMAIL_PROVIDER=nodemailer` and point `SMTP_HOST`/`SMTP_PORT` at **Mailpit**
  (`127.0.0.1:1025`, web UI on `127.0.0.1:8025`). Mails are caught there and not delivered to real people.
- *Email status = failed*: the *Email error* field shows the Microsoft Graph error. Common ones:
  `invalid_client` (wrong or expired client secret), `ErrorAccessDenied` (no admin consent, or the RBAC scope does
  not include the sending mailbox), `ErrorInvalidUser`/`MailboxNotEnabledForRESTAPI` (`MS_GRAPH_SENDER` is not an
  Exchange Online mailbox), `ErrorSendAsDenied` (`EMAIL_FROM` differs from the mailbox without Send As rights).
- *Email status = not-configured*: `ENQUIRY_EMAILS_ENABLED=false`.
- No lead created at all: the website's `STRAPI_LEAD_TOKEN` is missing or invalid. Production loads it from
  `/home/ubuntu/lf-run/web.env` via the systemd drop-in `/etc/systemd/system/lf-web.service.d/env.conf`, so deploys
  never remove it.
