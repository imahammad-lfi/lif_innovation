/**
 * Website enquiry emails.
 *
 * Every lead created by the website gets a unique reference (LF-YYMMDD-XXXXX). After it is stored:
 *   1. the visitor receives a branded thank-you email:
 *      subject "Linkfields – <Enquiry type> – Ref. <reference>";
 *   2. the sales team (ENQUIRY_NOTIFY_TO) receives an internal alert with reply-to set to the visitor.
 * Content (area-of-interest labels, "What happens next" steps, offices, events) comes from the CMS, so
 * editors' changes flow into the emails. SMTP settings: config/plugins.ts + .env (see docs/CMS-BRANDING-AND-EMAIL.md).
 */
import { randomInt } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

export type Lead = {
  id: number;
  documentId?: string;
  reference?: string | null;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  phoneCountry?: string | null;
  service?: string | null;
  message?: string | null;
  sourcePath?: string | null;
  createdAt?: string | Date | null;
};

type Option = { label?: string | null; value?: string | null; group?: string | null };
type Step = { title?: string | null; description?: string | null };
type EventInfo = {
  title: string;
  slug?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  dateLabel?: string | null;
  venue?: string | null;
  city?: string | null;
  stand?: string | null;
  role?: string | null;
  detailLink?: { href?: string | null } | null;
};

export type EnquiryContext = {
  reference: string;
  enquiryType: string;
  area: string;
  practice?: { label: string; href: string } | null;
  event?: (EventInfo & { past: boolean }) | null;
  steps: string[];
  offices: string[];
  submittedAt: string;
  websiteUrl: string;
  salesEmail: string;
  adminUrl?: string;
};

/* ---------------------------------------------------------------------------------------------- */
/* Reference                                                                                       */
/* ---------------------------------------------------------------------------------------------- */

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O/1/I to avoid misreading

/** LF-YYMMDD-XXXXX in South African time, e.g. LF-261110-7K3QX (32^5 ≈ 33.5M combinations per day). */
export function makeReference(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Johannesburg',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  let suffix = '';
  for (let i = 0; i < 5; i += 1) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `LF-${get('year')}${get('month')}${get('day')}-${suffix}`;
}

/* ---------------------------------------------------------------------------------------------- */
/* Context from the CMS                                                                            */
/* ---------------------------------------------------------------------------------------------- */

const PRACTICE_PAGES: Record<string, string> = {
  'Digital Transformation': '/services/digital-transformation',
  'Intelligent Enterprise Platforms': '/services/intelligent-enterprise-platforms',
  'Data & AI': '/services/data-ai',
  'Cyber Security': '/services/cyber-security',
  'Talent Advisory & GCC': '/services/talent-advisory-gcc',
  'Products & accelerators': '/products-and-accelerators',
};
const SOLUTION_PAGES: Record<string, string> = {
  'AI Code Assurance': '/solutions/ai-code-assurance',
  'Modernisation & Programme Assurance': '/solutions/modernisation-programme-assurance',
  'Regulated Cyber Readiness': '/solutions/regulated-cyber-readiness',
  'Intelligent Operations': '/solutions/intelligent-operations',
  'Capability Centres with Embedded IP': '/solutions/capability-centres-embedded-ip',
};

const DEFAULT_STEPS = [
  'We route your enquiry to the relevant portfolio specialist.',
  'Where needed, we agree an NDA before you share confidential information.',
  'We clarify your priorities and agree the right next step with you.',
];

export const websiteUrl = () => (process.env.WEBSITE_URL || 'https://www.linkfields.com').replace(/\/+$/, '');
const absolute = (href: string) => (/^https?:\/\//.test(href) ? href : `${websiteUrl()}${href.startsWith('/') ? '' : '/'}${href}`);

function formatSubmitted(value?: string | Date | null) {
  const date = value ? new Date(value) : new Date();
  const text = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Johannesburg',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return `${text.replace(' at ', ', ')} SAST`;
}

function eventEndsAt(e: EventInfo) {
  const last = e.endDate || e.startDate;
  return last ? new Date(`${last}T23:59:59+02:00`).getTime() : 0;
}

export async function buildContext(strapi: Core.Strapi, lead: Lead): Promise<EnquiryContext> {
  const global = (await strapi.documents('api::global.global').findFirst({
    populate: { contactForm: { populate: ['serviceOptions', 'nextSteps'] }, offices: true },
  } as never)) as unknown as {
    salesEmail?: string | null;
    contactForm?: { serviceOptions?: Option[]; nextSteps?: Step[] } | null;
    offices?: { country?: string | null; isHeadquarters?: boolean | null }[];
  } | null;

  const service = (lead.service || '').trim();
  const options = global?.contactForm?.serviceOptions ?? [];
  const option = options.find((o) => (o.value ?? o.label) === service);
  let enquiryType = 'General enquiry';
  let area = service || 'General enquiry';
  let practice: EnquiryContext['practice'] = null;
  let event: EnquiryContext['event'] = null;

  if (service.startsWith('Event: ')) {
    const title = service.slice('Event: '.length).trim();
    const found = (await strapi.documents('api::event.event').findFirst({
      filters: { title },
      populate: { detailLink: true },
    } as never)) as unknown as EventInfo | null;
    const past = found ? Date.now() > eventEndsAt(found) : false;
    event = found ? { ...found, past } : null;
    enquiryType = past ? `${title} follow-up` : `${title} meeting request`;
    area = past ? `Follow-up from ${title}` : `Meeting at ${title}`;
    const href = found?.detailLink?.href || (found?.slug ? `/events/${found.slug}` : '/events');
    practice = { label: title, href: absolute(href) };
  } else if (option) {
    const label = (option.label || service).trim();
    enquiryType = /enquiry$/i.test(label) ? label : `${label} enquiry`;
    const group = (option.group || '').trim();
    area = group && !['Other', 'Events'].includes(group) ? `${group.replace(' (value plays)', '')} › ${label}` : label;
    const href = SOLUTION_PAGES[label] || PRACTICE_PAGES[group];
    if (href) practice = { label: SOLUTION_PAGES[label] ? label : group, href: absolute(href) };
  } else if (service) {
    const [group, label] = service.includes(': ') ? service.split(/:\s+/, 2) : ['', service];
    enquiryType = /enquiry$/i.test(label) ? label : `${label} enquiry`;
    area = group ? `${group} › ${label}` : label;
    if (PRACTICE_PAGES[group]) practice = { label: group, href: absolute(PRACTICE_PAGES[group]) };
  }

  const steps = (global?.contactForm?.nextSteps ?? [])
    .map((s) => [s.title, s.description].filter(Boolean).join(' ').trim())
    .filter(Boolean);
  const offices = (global?.offices ?? [])
    .map((o) => (o.country || '').trim())
    .filter(Boolean);
  const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/+$/, '');

  return {
    reference: lead.reference || '',
    enquiryType,
    area,
    practice,
    event,
    steps: steps.length ? steps : DEFAULT_STEPS,
    offices,
    submittedAt: formatSubmitted(lead.createdAt),
    websiteUrl: websiteUrl(),
    salesEmail: (global?.salesEmail || 'sales@linkfields.com').trim(),
    adminUrl:
      publicUrl && lead.documentId
        ? `${publicUrl}/admin/content-manager/collection-types/api::lead.lead/${lead.documentId}`
        : undefined,
  };
}

/* ---------------------------------------------------------------------------------------------- */
/* Templates                                                                                       */
/* ---------------------------------------------------------------------------------------------- */

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const multiline = (v: unknown) => esc(v).replace(/\r?\n/g, '<br>');

const C = {
  navy: '#0B1020',
  ink: '#111827',
  body: '#374151',
  muted: '#6B7280',
  line: '#E5E7EB',
  soft: '#F6F7FB',
  orange: '#FF7800',
  orangeDeep: '#CC4A00',
  blue: '#2D58C0',
};
const FONT = "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif";
const LOGO_CID = 'linkfields-logo';

function button(href: string, label: string, primary = true) {
  const bg = primary ? C.orangeDeep : '#FFFFFF';
  const color = primary ? '#FFFFFF' : C.navy;
  const border = primary ? C.orangeDeep : '#D1D5DB';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 8px 10px 0"><tr><td bgcolor="${bg}" style="border-radius:999px;border:1px solid ${border};background:${bg};${primary ? `background-image:linear-gradient(115deg,#FF8A1F 0%,#EC5A06 50%,${C.orangeDeep} 100%);` : ''}">
<a href="${esc(href)}" target="_blank" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:14px;font-weight:700;line-height:1;color:${color};text-decoration:none;border-radius:999px">${esc(label)}&nbsp;&rarr;</a></td></tr></table>`;
}

function row(label: string, value: string, isHtml = false) {
  return `<tr>
<td valign="top" style="padding:11px 0;border-bottom:1px solid ${C.line};width:34%;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:${C.muted}">${esc(label)}</td>
<td valign="top" style="padding:11px 0 11px 12px;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:14px;line-height:1.55;color:${C.ink}">${isHtml ? value : esc(value)}</td>
</tr>`;
}

function shell(opts: { preheader: string; eyebrow: string; content: string; footer: string }) {
  return `<!doctype html>
<html lang="en-GB" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Linkfields</title>
<style>
  @media (max-width:620px){ .container{width:100%!important} .px{padding-left:22px!important;padding-right:22px!important} .stack td{display:block!important;width:100%!important;padding-left:0!important} }
  a{color:${C.orangeDeep}}
</style>
</head>
<body style="margin:0;padding:0;background:#EEF1F6;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(opts.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#EEF1F6" style="background:#EEF1F6">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px -30px rgba(11,16,32,.45)">
<tr><td class="px" bgcolor="${C.navy}" style="background:${C.navy};background-image:linear-gradient(135deg,#141D3A 0%,#070B16 100%);padding:26px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle"><img src="cid:${LOGO_CID}" width="150" height="38" alt="Linkfields" style="display:block;border:0;outline:none;width:150px;height:auto"></td>
<td valign="middle" align="right" style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#FFB066">${esc(opts.eyebrow)}</td>
</tr></table>
</td></tr>
<tr><td height="4" bgcolor="${C.orange}" style="height:4px;line-height:4px;font-size:0;background:${C.orange};background-image:linear-gradient(90deg,#FFA033 0%,#FF7800 45%,#2D58C0 100%)">&nbsp;</td></tr>
${opts.content}
<tr><td class="px" bgcolor="${C.soft}" style="background:${C.soft};padding:22px 36px;border-top:1px solid ${C.line};font-family:${FONT};font-size:12px;line-height:1.6;color:${C.muted}">${opts.footer}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function customerEmail(lead: Lead, ctx: EnquiryContext) {
  const subject = `Linkfields – ${ctx.enquiryType} – Ref. ${ctx.reference}`;
  const name = (lead.name || '').trim() || 'there';
  const urgentHref = `mailto:${ctx.salesEmail}?subject=${encodeURIComponent(`Urgent: ${ctx.reference} – ${ctx.enquiryType}`)}`;
  const ev = ctx.event;
  const where = ev ? [ev.stand ? `Stand ${ev.stand}` : '', ev.venue, ev.city].filter(Boolean).join(' · ') : '';

  const eventBlock = ev
    ? `<tr><td class="px" style="padding:0 36px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:14px;background:${C.navy};background-image:linear-gradient(135deg,#141D3A 0%,#0B1020 60%,#1B2A5C 100%)"><tr><td style="padding:20px 22px;font-family:${FONT}">
<div style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#FFB066">${ev.past ? 'Thank you for visiting us' : 'Let’s meet in person'}</div>
<div style="margin-top:6px;font-size:18px;font-weight:700;color:#FFFFFF">${esc(ev.title)}</div>
<div style="margin-top:4px;font-size:14px;line-height:1.55;color:rgba(255,255,255,.75)">${esc([ev.dateLabel, where].filter(Boolean).join(' · '))}</div>
${ev.past ? '' : `<div style="margin-top:14px">${button(`${ctx.websiteUrl}/api/calendar/${encodeURIComponent(ev.slug || '')}`, 'Add to calendar')}${ctx.practice ? button(ctx.practice.href, 'Plan your visit', false) : ''}</div>`}
</td></tr></table>
</td></tr>`
    : '';

  const steps = ctx.steps
    .map(
      (s, i) => `<tr>
<td valign="top" width="34" style="padding:0 0 12px"><div style="width:26px;height:26px;border-radius:999px;background:#FFF4EA;border:1px solid #FFD6B0;text-align:center;font-family:${FONT};font-size:12px;font-weight:700;line-height:26px;color:${C.orangeDeep}">${i + 1}</div></td>
<td valign="top" style="padding:3px 0 12px;font-family:${FONT};font-size:14px;line-height:1.55;color:${C.body}">${esc(s)}</td>
</tr>`,
    )
    .join('');

  const content = `
<tr><td class="px" style="padding:34px 36px 6px;font-family:${FONT}">
<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${C.ink}">Dear ${esc(name)},</p>
<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:${C.body}">Thank you for submitting your enquiry. <strong style="color:${C.ink}">Our expert team will contact you within 24 hours.</strong></p>
<p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:${C.body}">We appreciate your trust in our services and look forward to engaging with you.</p>
</td></tr>
<tr><td class="px" style="padding:0 36px 24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #FFD6B0;border-left:4px solid ${C.orange};border-radius:12px;background:#FFF8F1"><tr><td style="padding:16px 18px;font-family:${FONT}">
<div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.orangeDeep}">Your enquiry reference</div>
<div style="margin-top:6px;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:22px;font-weight:700;letter-spacing:.06em;color:${C.navy}">${esc(ctx.reference)}</div>
<div style="margin-top:6px;font-size:13px;line-height:1.5;color:${C.muted}">Please quote this reference in any correspondence about your enquiry.</div>
</td></tr></table>
</td></tr>
<tr><td class="px" style="padding:0 36px 8px;font-family:${FONT}">
<h2 style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.navy}">Your enquiry at a glance</h2>
<table role="presentation" class="stack" width="100%" cellpadding="0" cellspacing="0" border="0">
${row('Enquiry type', ctx.enquiryType)}
${row('Area of interest', ctx.area)}
${row('Organisation', lead.company || '—')}
${row('Name', lead.name)}
${row('Email', lead.email)}
${row('Phone', lead.phone || '—')}
${row('Submitted', ctx.submittedAt)}
${row('Your requirements', multiline(lead.message || '—'), true)}
</table>
</td></tr>
${eventBlock}
<tr><td class="px" style="padding:22px 36px 4px;font-family:${FONT}">
<h2 style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.navy}">What happens next</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${steps}</table>
</td></tr>
<tr><td class="px" style="padding:6px 36px 4px;font-family:${FONT}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;background:${C.soft};border:1px solid ${C.line}"><tr><td style="padding:14px 18px;font-size:14px;line-height:1.6;color:${C.body}">
<strong style="color:${C.ink}">Need an urgent response?</strong> Please write to <a href="${esc(urgentHref)}" style="color:${C.orangeDeep};font-weight:700;text-decoration:none">${esc(ctx.salesEmail)}</a>, quoting <strong style="color:${C.ink}">${esc(ctx.reference)}</strong>.
</td></tr></table>
</td></tr>
<tr><td class="px" style="padding:22px 36px 6px">
${ctx.practice && !ev ? button(ctx.practice.href, `Explore ${ctx.practice.label}`) : ''}${button(ctx.websiteUrl, 'Visit linkfields.com', !(ctx.practice && !ev))}
</td></tr>
<tr><td class="px" style="padding:14px 36px 32px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.body}">
Regards,<br><strong style="color:${C.ink}">Linkfields – Sales team</strong><br>
<a href="mailto:${esc(ctx.salesEmail)}" style="color:${C.orangeDeep};text-decoration:none">${esc(ctx.salesEmail)}</a> &nbsp;·&nbsp; <a href="${esc(ctx.websiteUrl)}" style="color:${C.orangeDeep};text-decoration:none">linkfields.com</a>
</td></tr>`;

  const footer = `<strong style="color:${C.ink}">Linkfields</strong> — One strategic partner across your transformation.<br>
${ctx.offices.length ? `${esc(ctx.offices.join(' · '))}<br>` : ''}
You are receiving this email because an enquiry was submitted at linkfields.com using this address. If this wasn’t you, please let us know at <a href="mailto:${esc(ctx.salesEmail)}" style="color:${C.muted}">${esc(ctx.salesEmail)}</a>.
<a href="${esc(`${ctx.websiteUrl}/privacy-policy`)}" style="color:${C.muted}">Privacy Policy</a><br>
© ${new Date().getFullYear()} Linkfields. All Rights Reserved.`;

  const html = shell({
    preheader: `Reference ${ctx.reference}. Our expert team will contact you within 24 hours.`,
    eyebrow: 'Enquiry received',
    content,
    footer,
  });

  const text = [
    `Dear ${name},`,
    '',
    'Thank you for submitting your enquiry. Our expert team will contact you within 24 hours.',
    '',
    'We appreciate your trust in our services and look forward to engaging with you.',
    '',
    `Your enquiry reference: ${ctx.reference}`,
    '(Please quote this reference in any correspondence about your enquiry.)',
    '',
    'YOUR ENQUIRY AT A GLANCE',
    `Enquiry type:      ${ctx.enquiryType}`,
    `Area of interest:  ${ctx.area}`,
    `Organisation:      ${lead.company || '—'}`,
    `Name:              ${lead.name}`,
    `Email:             ${lead.email}`,
    `Phone:             ${lead.phone || '—'}`,
    `Submitted:         ${ctx.submittedAt}`,
    'Your requirements:',
    lead.message || '—',
    '',
    ...(ev
      ? [
          ev.past ? `THANK YOU FOR VISITING US AT ${ev.title.toUpperCase()}` : `LET’S MEET AT ${ev.title.toUpperCase()}`,
          [ev.dateLabel, where].filter(Boolean).join(' · '),
          ev.past ? '' : `Add to calendar: ${ctx.websiteUrl}/api/calendar/${ev.slug || ''}`,
          '',
        ]
      : []),
    'WHAT HAPPENS NEXT',
    ...ctx.steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    `Need an urgent response? Please write to ${ctx.salesEmail}, quoting ${ctx.reference}.`,
    '',
    'Regards,',
    'Linkfields – Sales team',
    `${ctx.salesEmail} · ${ctx.websiteUrl}`,
    '',
    '—',
    'You are receiving this email because an enquiry was submitted at linkfields.com using this address.',
    `If this wasn’t you, please let us know at ${ctx.salesEmail}. Privacy Policy: ${ctx.websiteUrl}/privacy-policy`,
  ]
    .filter((l) => l !== undefined)
    .join('\n');

  return { subject, html, text };
}

export function salesEmail(lead: Lead, ctx: EnquiryContext) {
  const subject = `New enquiry – ${ctx.enquiryType} – ${ctx.reference}${lead.company ? ` – ${lead.company}` : ''}`;
  const content = `
<tr><td class="px" style="padding:30px 36px 8px;font-family:${FONT}">
<div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.orangeDeep}">New website enquiry · ${esc(ctx.reference)}</div>
<h1 style="margin:8px 0 6px;font-size:22px;line-height:1.3;color:${C.navy}">${esc(ctx.enquiryType)}</h1>
<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:${C.body}">${esc(lead.name)}${lead.company ? ` from <strong>${esc(lead.company)}</strong>` : ''} submitted an enquiry. A thank-you email with reference ${esc(ctx.reference)} has been sent to the visitor promising contact <strong>within 24 hours</strong>. Reply to this email to respond directly.</p>
<table role="presentation" class="stack" width="100%" cellpadding="0" cellspacing="0" border="0">
${row('Reference', ctx.reference)}
${row('Area of interest', ctx.area)}
${row('Organisation', lead.company || '—')}
${row('Name', lead.name)}
${row('Email', `<a href="mailto:${esc(lead.email)}" style="color:${C.orangeDeep}">${esc(lead.email)}</a>`, true)}
${row('Phone', lead.phone ? `<a href="tel:${esc(lead.phone.replace(/\s+/g, ''))}" style="color:${C.orangeDeep}">${esc(lead.phone)}</a>` : '—', true)}
${row('Submitted', ctx.submittedAt)}
${row('Page', lead.sourcePath ? `<a href="${esc(ctx.websiteUrl + lead.sourcePath)}" style="color:${C.orangeDeep}">${esc(lead.sourcePath)}</a>` : '—', true)}
${row('Requirements', multiline(lead.message || '—'), true)}
</table>
</td></tr>
<tr><td class="px" style="padding:18px 36px 30px">${ctx.adminUrl ? button(ctx.adminUrl, 'Open in Linkfields CMS') : ''}${button(`mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${ctx.reference} – ${ctx.enquiryType}`)}`, 'Reply to visitor', !ctx.adminUrl)}</td></tr>`;
  const html = shell({
    preheader: `${lead.name}${lead.company ? `, ${lead.company}` : ''} – ${ctx.area}`,
    eyebrow: 'Sales alert',
    content,
    footer: 'Internal notification from the Linkfields website. Leads are stored in Linkfields CMS › Content Manager › Lead.',
  });
  const text = [
    `New website enquiry ${ctx.reference}`,
    `Enquiry type: ${ctx.enquiryType}`,
    `Area of interest: ${ctx.area}`,
    `Organisation: ${lead.company || '—'}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || '—'}`,
    `Submitted: ${ctx.submittedAt}`,
    `Page: ${lead.sourcePath || '—'}`,
    'Requirements:',
    lead.message || '—',
    ctx.adminUrl ? `\nOpen in CMS: ${ctx.adminUrl}` : '',
  ].join('\n');
  return { subject, html, text };
}

/* ---------------------------------------------------------------------------------------------- */
/* Sending                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

let logoCache: Buffer | null = null;
function logoAttachment(strapi: Core.Strapi) {
  const file = path.join(strapi.dirs.app.root, 'email-assets', 'linkfields-logo.png');
  // Inline buffer (the Strapi Nodemailer provider rejects file-path attachments for safety).
  if (!logoCache) logoCache = fs.existsSync(file) ? fs.readFileSync(file) : Buffer.alloc(0);
  return logoCache.length
    ? [{ filename: 'linkfields-logo.png', content: logoCache, contentType: 'image/png', cid: LOGO_CID, contentDisposition: 'inline' as const }]
    : [];
}

const enabled = () => !/^(0|false|off|no)$/i.test(process.env.ENQUIRY_EMAILS_ENABLED || 'true');

/** Sends the thank-you and the sales alert, then records the outcome on the lead. Never throws. */
export async function sendEnquiryEmails(strapi: Core.Strapi, lead: Lead) {
  const record = (data: Record<string, unknown>) =>
    strapi.db
      .query('api::lead.lead')
      .update({ where: { id: lead.id }, data })
      .catch((e: Error) => strapi.log.warn(`[enquiry-email] could not record status for lead ${lead.id}: ${e.message}`));

  if (!enabled()) {
    await record({ emailStatus: 'not-configured' });
    return;
  }
  try {
    const ctx = await buildContext(strapi, lead);
    const attachments = logoAttachment(strapi);
    const mailer = strapi.plugin('email').service('email');
    const customer = customerEmail(lead, ctx);
    await mailer.send({
      to: lead.email,
      replyTo: process.env.EMAIL_REPLY_TO || ctx.salesEmail,
      subject: customer.subject,
      text: customer.text,
      html: customer.html,
      attachments,
      headers: { 'X-Linkfields-Reference': ctx.reference, 'Auto-Submitted': 'auto-replied' },
    });
    const notify = (process.env.ENQUIRY_NOTIFY_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (notify.length) {
      const alert = salesEmail(lead, ctx);
      await mailer
        .send({
          to: notify.join(', '),
          replyTo: `${lead.name.replace(/[<>",]/g, '')} <${lead.email}>`,
          subject: alert.subject,
          text: alert.text,
          html: alert.html,
          attachments,
          headers: { 'X-Linkfields-Reference': ctx.reference },
        })
        .catch((e: Error) => strapi.log.error(`[enquiry-email] sales alert failed for ${ctx.reference}: ${e.message}`));
    }
    await record({ emailStatus: 'sent', emailSentAt: new Date(), emailError: null, enquiryType: ctx.enquiryType });
    strapi.log.info(`[enquiry-email] thank-you sent for ${ctx.reference}`);
  } catch (error) {
    const message = (error as Error)?.message || String(error);
    strapi.log.error(`[enquiry-email] thank-you failed for lead ${lead.id}: ${message}`);
    await record({ emailStatus: 'failed', emailError: message.slice(0, 2000) });
  }
}
