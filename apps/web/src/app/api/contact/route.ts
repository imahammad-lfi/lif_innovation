import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";

import { strapiPost } from "@/lib/content/strapi";
import { env } from "@/lib/env";

/**
 * Contact form endpoint. Validates server-side (same rules as the form), drops bots (honeypot,
 * optional Cloudflare Turnstile, per-IP rate limit) and stores the enquiry as a Strapi `lead`.
 * Strapi can then notify sales via its email plugin / webhooks.
 */

type Body = {
  name?: string;
  phoneNo?: string;
  phoneCountry?: string;
  email?: string;
  company?: string;
  service?: string;
  message?: string;
  sourcePath?: string;
  company_website?: string;
  turnstileToken?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

async function turnstileOk(token: string | undefined, ip: string) {
  if (!env.turnstileSecret) return true;
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret: env.turnstileSecret, response: token, remoteip: ip }),
  });
  const json = (await res.json().catch(() => ({}))) as { success?: boolean };
  return Boolean(json.success);
}

// Control characters (CR/LF, tab, NUL, DEL, C1), line/paragraph separators and bidi overrides are never legitimate in
// form input; CR/LF in particular must not reach stored records, CMS lists or e-mail subjects. Letters of every script
// (Zoë, Müller, Ndlovu, Devanagari, Arabic …) are left untouched.
const UNSAFE = /[\p{Cc}\u2028\u2029\u202A-\u202E\u2066-\u2069]/gu;
const UNSAFE_KEEP_NEWLINE = /[^\P{Cc}\n]|[\u2028\u2029\u202A-\u202E\u2066-\u2069]/gu;
/** Single-line field: unsafe characters become spaces, whitespace collapses, then trim and cap. */
const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(UNSAFE, " ").replace(/\s+/g, " ").trim().slice(0, max) : "");
/** Multi-line field (message): keeps line breaks (CRLF → LF, at most two blank lines), drops other unsafe characters. */
const text = (v: unknown, max: number) =>
  typeof v === "string"
    ? v.replace(/\r\n?/g, "\n").replace(/\t/g, " ").replace(UNSAFE_KEEP_NEWLINE, "").replace(/\n{4,}/g, "\n\n\n").trim().slice(0, max)
    : "";
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
/** Same format as the CMS (apps/cms/src/utils/enquiry-email.ts); only used when no CMS is connected. */
function makeReference(now = new Date()) {
  const d = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Johannesburg", year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => d.find((p) => p.type === t)?.value ?? "00";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `LF-${get("year")}${get("month")}${get("day")}-${Array.from(bytes, (b) => REF_ALPHABET[b % 32]).join("")}`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  // Honeypot filled in → pretend success so bots don't retry.
  if (body.company_website) return Response.json({ ok: true });

  const country = str(body.phoneCountry, 2).toUpperCase();
  const parsed = parsePhoneNumberFromString(str(body.phoneNo, 40), /^[A-Z]{2}$/.test(country) ? (country as CountryCode) : undefined);
  const lead = {
    name: str(body.name, 200),
    phone: parsed?.isValid() ? parsed.formatInternational() : str(body.phoneNo, 40),
    phoneCountry: parsed?.country ?? (country || ""),
    email: str(body.email, 200),
    company: str(body.company, 200),
    service: str(body.service, 200),
    message: text(body.message, 5000),
    sourcePath: str(body.sourcePath, 300),
  };
  const errors: Record<string, string> = {};
  if (!lead.name) errors.name = "Please enter your name";
  if (!EMAIL.test(lead.email)) errors.email = "Please enter a valid business email address";
  if (!lead.company) errors.company = "Please enter your organisation name";
  if (!lead.phone) errors.phoneNo = "Please enter your phone number";
  else if (!parsed?.isValid()) errors.phoneNo = "Please enter a valid phone number for the selected country";
  if (!lead.service) errors.service = "Please choose an area of interest";
  if (!lead.message) errors.message = "Please tell us briefly about your business requirements";
  else if (lead.message.length < 10) errors.message = "Please add a little more detail (at least 10 characters)";
  if (Object.keys(errors).length) {
    return Response.json({ ok: false, error: "Please correct the highlighted fields.", errors }, { status: 422 });
  }

  if (!(await turnstileOk(body.turnstileToken, ip))) {
    return Response.json({ ok: false, error: "Verification failed. Please try again." }, { status: 403 });
  }

  if (env.contentSource === "local" || !env.strapiLeadToken) {
    // Development without a CMS: accept and log the enquiry.
    console.info("[contact] lead received (not stored – CONTENT_SOURCE=local or no STRAPI_LEAD_TOKEN):", { ...lead, message: `${lead.message.slice(0, 60)}…` });
    return Response.json({ ok: true, stored: false, reference: makeReference() });
  }

  try {
    // Strapi assigns the unique reference (LF-YYMMDD-XXXXX) and emails the visitor + sales team.
    const created = await strapiPost<{ data?: { reference?: string | null } }>("/leads", { data: { ...lead, status: "new" } }, env.strapiLeadToken);
    return Response.json({ ok: true, stored: true, reference: created?.data?.reference || null, email: lead.email });
  } catch (error) {
    console.error("[contact] failed to store lead", error);
    return Response.json({ ok: false, error: "We couldn't submit your enquiry. Please try again." }, { status: 502 });
  }
}
