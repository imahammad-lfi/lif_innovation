"use client";

import { ArrowRight, Check, Copy, Loader2, RotateCcw } from "lucide-react";
import { PrivacyPolicyLink } from "@/components/legal/privacy-dialog";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import type { Option } from "@/lib/content/types";
import { eventEnd, eventInterestValue, eventStandLabel, followUpEnd } from "@/lib/events";
import { byId } from "@/lib/dom";
import { cancelLanding, landingOffset } from "@/lib/landing";
import { DEFAULT_COUNTRY, checkPhone } from "@/lib/phone";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { PhoneField } from "./phone-field";
import { TURNSTILE_SITE_KEY, Turnstile, type TurnstileHandle } from "./turnstile";

type Values = {
  name: string;
  email: string;
  company: string;
  country: string;
  phoneNo: string;
  service: string;
  message: string;
  company_website: string;
};
type Errors = Partial<Record<keyof Values, string>>;

/** Minimal event facts the form needs to offer "Meet us at …" / "Follow-up from …" options. */
export type FormEvent = { slug: string; title: string; startDate: string; endDate?: string | null; stand?: string | null };

const EMPTY: Values = { name: "", email: "", company: "", country: DEFAULT_COUNTRY, phoneNo: "", service: "", message: "", company_website: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please enter your name";
  if (!EMAIL.test(v.email.trim())) e.email = "Please enter a valid business email address";
  if (!v.company.trim()) e.company = "Please enter your organisation name";
  const phone = checkPhone(v.phoneNo, v.country);
  if (!phone.ok) e.phoneNo = phone.empty ? "Please enter your phone number" : "Please enter a valid phone number for the selected country";
  if (!v.service) e.service = "Please choose an area of interest";
  if (!v.message.trim()) e.message = "Please tell us briefly about your business requirements";
  else if (v.message.trim().length < 10) e.message = "Please add a little more detail (at least 10 characters)";
  return e;
}

const slug = (v: string) =>
  v
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const ACCELERATORS = new Set([
  "predictive-analytics-suite",
  "digital-twin-suite",
  "intelligent-workflow-automation",
  "power-bi-ai-ml",
  "delivery-accelerators",
]);
const STOP = new Set(["and", "with", "the", "of", "for"]);
const tokens = (v: string) => slug(v).split("-").filter((t) => t && !STOP.has(t));

/** Pre-select the interest that matches the page the visitor is on (sub-service, platform, product, accelerator or solution). */
function interestFor(pathname: string | null, options: Option[]) {
  if (!pathname) return "";
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  const value = (o: Option) => o.value ?? o.label;
  const find = (test: (o: Option) => boolean) => {
    const o = options.find(test);
    return o ? value(o) : "";
  };
  if (parts[0] === "products-and-accelerators") {
    if (parts.length === 1) return "";
    if (ACCELERATORS.has(last)) return find((o) => /accelerator/i.test(o.label));
    return find((o) => /demonstration/i.test(o.label));
  }
  if (parts[0] === "events" && parts.length > 1) return find((o) => slug(value(o)).endsWith(last));
  if (parts.length < 2) return "";
  const compact = last.replace(/-/g, "");
  const want = tokens(last);
  return (
    find((o) => slug(o.label) === last || slug(value(o)) === last) ||
    find((o) => slug(o.label).replace(/-/g, "") === compact) ||
    find((o) => {
      const have = new Set(tokens(o.label));
      return want.length > 1 && want.every((t) => have.has(t));
    })
  );
}

/** Upcoming events (and the day after one ends) become selectable meeting / follow-up options. */
function eventOptions(events: FormEvent[], now: number): Option[] {
  return events
    .filter((e) => now <= followUpEnd(e))
    .map((e) => {
      const stand = eventStandLabel(e);
      const label = now > eventEnd(e) ? `Follow-up from ${e.title}` : `Meet us at ${e.title}${stand ? ` (${stand})` : ""}`;
      return { label, value: eventInterestValue(e), group: "Events" };
    });
}

export function ContactFormClient({
  options: baseOptions,
  events = [],
  serverNow,
  dark,
  submitLabel,
  successMessage,
  idPrefix: prefix = "cf",
  initialInterest,
  onSuccess,
  salesEmail = "sales@linkfields.com",
}: {
  options: Option[];
  events?: FormEvent[];
  serverNow: number;
  dark: boolean;
  submitLabel: string;
  successMessage: string;
  /** Prefix for element ids (made unique per form with useId, so the page form, the dialog form and forms on
   *  pages Next.js keeps alive in the background never share an id). */
  idPrefix?: string;
  /** Area of interest to preselect (e.g. from a campaign link); falls back to `?interest=` on the URL. */
  initialInterest?: string | null;
  /** Called after a successful submission (the receipt panel replaces the form). */
  onSuccess?: () => void;
  /** Address offered for urgent follow-up on the receipt (Strapi › Global › Sales email). */
  salesEmail?: string;
}) {
  const pathname = usePathname();
  const idPrefix = `${prefix}-${useId().replace(/[^A-Za-z0-9_-]/g, "")}`;
  const now = useNow(serverNow);
  const evOpts = eventOptions(events, now);
  const evKey = evOpts.map((o) => o.label).join("|");
  // Recompute only when the set of event options changes (not every clock tick).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const options = useMemo(() => [...baseOptions.filter((o) => o.group !== "Events"), ...evOpts], [baseOptions, evKey]);

  const [values, setValues] = useState<Values>(() => ({ ...EMPTY, service: interestFor(pathname, options) }));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [receipt, setReceipt] = useState<{ reference: string | null; email: string; stored: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = receiptRef.current;
    if (!receipt || !el) return;
    el.focus({ preventScroll: true });
    // The receipt is much shorter than the form it replaces, so on small screens its heading and reference can end up
    // above the viewport. Bring its top just below the fixed chrome (page) or to the top of the pop-up's scroll area.
    const frame = requestAnimationFrame(() => {
      const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      const dialog = el.closest('[role="dialog"]');
      if (dialog) {
        let box: HTMLElement | null = el.parentElement;
        while (box && box !== dialog.parentElement) {
          const oy = getComputedStyle(box).overflowY;
          if ((oy === "auto" || oy === "scroll") && box.scrollHeight > box.clientHeight) break;
          box = box.parentElement;
        }
        if (!box || box === dialog.parentElement) return;
        const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top;
        if (top < 0 || top > box.clientHeight * 0.5) box.scrollTo({ top: box.scrollTop + top - 16, behavior });
        return;
      }
      const offset = landingOffset() + 16;
      const top = el.getBoundingClientRect().top;
      if (top < offset || top > window.innerHeight * 0.55) {
        cancelLanding();
        window.scrollTo({ top: Math.max(0, window.scrollY + top - offset), behavior });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [receipt]);
  const preselected = useRef(false);

  // Campaign links can preselect the area of interest, e.g. /contact-us?interest=africa-tech-festival-2026
  useEffect(() => {
    if (preselected.current) return;
    const want = initialInterest || new URLSearchParams(window.location.search).get("interest");
    if (!want) return;
    const key = slug(want);
    const hit = options.find((o) => slug(o.value ?? o.label).includes(key) || slug(o.label).includes(key));
    if (!hit) return;
    const id = window.setTimeout(() => {
      preselected.current = true;
      setValues((v) => ({ ...v, service: hit.value ?? hit.label }));
    }, 0);
    return () => window.clearTimeout(id);
  }, [options, initialInterest]);

  // The dialling code always starts on South Africa (+27, DEFAULT_COUNTRY); visitors change it in the picker.

  const [serverError, setServerError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstile = useRef<TurnstileHandle>(null);

  const update = (k: keyof Values, value: string) => {
    setValues((v) => ({ ...v, [k]: value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };
  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => update(k, e.target.value);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      byId(first === "phoneNo" ? `${idPrefix}-phone` : `${idPrefix}-${first}`)?.focus();
      return;
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setServerError("Please complete the security check and try again.");
      return;
    }
    setStatus("sending");
    setServerError("");
    const phone = checkPhone(values.phoneNo, values.country);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          phoneNo: phone.ok ? phone.international : values.phoneNo,
          phoneCountry: phone.ok ? phone.country : values.country,
          sourcePath: pathname,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Errors; reference?: string | null; stored?: boolean };
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        throw new Error(json.error || "We couldn't submit your enquiry. Please try again.");
      }
      setStatus("idle");
      setReceipt({ reference: json.reference ?? null, email: values.email.trim(), stored: Boolean(json.stored) });
      setValues((v) => ({ ...EMPTY, country: v.country, service: interestFor(pathname, options) }));
      onSuccess?.();
    } catch (err) {
      setStatus("idle");
      setServerError(err instanceof Error ? err.message : "We couldn't reach the server. Please check your connection and try again.");
    } finally {
      // Turnstile tokens are single-use.
      turnstile.current?.reset();
    }
  }

  const field = cn(
    "h-12 w-full rounded-xl border px-4 font-sans text-[13.5px] outline-none transition-[border-color,box-shadow,background-color] duration-200 3xl:h-14 3xl:text-[14.5px] max-sm:text-[16px]",
    "focus:border-brand focus:ring-4 focus:ring-brand/15 aria-[invalid=true]:border-red-400/70",
    dark
      ? "border-white/12 bg-white/[0.04] text-white placeholder:text-white/45 hover:border-white/25"
      : "border-black/12 bg-white text-[#0b0b0b] placeholder:text-[#6b7177] hover:border-black/25",
  );
  const err = (k: keyof Values) =>
    errors[k] ? (
      <span id={`${idPrefix}-${k}-error`} role="alert" className="mt-1.5 pl-1 font-sans text-[12px] text-red-400">
        {errors[k]}
      </span>
    ) : null;
  const a11y = (k: keyof Values) => ({
    "aria-invalid": Boolean(errors[k]) || undefined,
    "aria-describedby": errors[k] ? `${idPrefix}-${k}-error` : undefined,
    "aria-required": true,
  });

  const groups: { label: string | null; items: Option[] }[] = [];
  for (const o of options) {
    const g = o.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.label === g) last.items.push(o);
    else groups.push({ label: g, items: [o] });
  }
  const label = cn("mb-1.5 pl-1 font-sans text-[12px] font-medium tracking-[0.01em]", dark ? "text-white/70" : "text-[#4b5157]");
  const req = <span aria-hidden className="text-brand"> *</span>;
  const optionEl = (o: Option) => (
    <option key={`${o.group ?? ""}-${o.value ?? o.label}`} value={o.value ?? o.label} className={dark ? "bg-black text-cloud" : "bg-white text-coal"}>
      {o.label}
    </option>
  );

  if (receipt) {
    // "Thank you for submitting your enquiry. Our expert consultants will be in touch." → heading + line.
    const [headline, ...rest] = (successMessage || "Thank you for submitting your enquiry. Our expert consultants will be in touch.").split(/(?<=[.!?])\s+/);
    const urgent = `mailto:${salesEmail}?subject=${encodeURIComponent(`Urgent: ${receipt.reference ?? "website enquiry"}`)}`;
    const copy = async () => {
      if (!receipt.reference) return;
      try {
        await navigator.clipboard.writeText(receipt.reference);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        /* clipboard unavailable – the reference stays visible and selectable */
      }
    };
    return (
      <div
        ref={receiptRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        data-testid="enquiry-receipt"
        className="flex flex-col items-start gap-6 outline-none animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
      >
        <span className="relative grid size-14 place-items-center rounded-full bg-brand-gradient text-white shadow-[0_14px_34px_-12px_rgba(255,120,0,0.9)]">
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-brand/30 [animation-iteration-count:2]" />
          <Check aria-hidden className="relative size-7 stroke-[2.5]" />
        </span>
        <div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Enquiry received</p>
          <h3 className={cn("mt-2 text-balance font-display text-[21.5px] font-semibold leading-[1.2] tracking-[-0.01em] md:text-[24px]", dark ? "text-white" : "text-[#0b0b0b]")}>
            {headline.replace(/[.!]$/, "")}
          </h3>
          {rest.length ? (
            <p className={cn("mt-2 font-sans text-[14.5px] leading-[1.6]", dark ? "text-white/75" : "text-[#4b5157]")}>{rest.join(" ")}</p>
          ) : null}
        </div>
        {receipt.reference ? (
          <div
            className={cn(
              "flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4",
              dark ? "border-brand/35 bg-brand/[0.08]" : "border-brand/30 bg-[#fff7ef]",
            )}
          >
            <div>
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">Your reference</p>
              <p className={cn("mt-1 select-all font-mono text-[18px] font-bold tracking-[0.06em]", dark ? "text-white" : "text-[#0b1020]")}>{receipt.reference}</p>
            </div>
            <button
              type="button"
              onClick={copy}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border px-4 font-sans text-[12.5px] font-semibold transition-[transform,background-color,border-color,color] duration-200 hover:-translate-y-px hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
                dark ? "border-white/20 bg-white/[0.06] text-white hover:border-brand/60 hover:bg-brand/20" : "border-black/15 bg-white text-[#0b1020] hover:border-brand/60 hover:bg-[#fff1e3]",
              )}
            >
              {copied ? <Check aria-hidden className="size-4 text-brand" /> : <Copy aria-hidden className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        ) : null}
        <p className={cn("font-sans text-[13px] leading-[1.65]", dark ? "text-white/65" : "text-[#5b6167]")}>
          {receipt.stored ? (
            <>
              A confirmation email with your reference is on its way to <strong className={dark ? "text-white" : "text-[#0b0b0b]"}>{receipt.email}</strong>.{" "}
            </>
          ) : null}
          Please quote your reference in any correspondence. For an urgent response, write to{" "}
          <a href={urgent} className="font-semibold text-brand underline-offset-2 hover:underline">
            {salesEmail}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => {
            setReceipt(null);
            setCopied(false);
          }}
          className={cn(
            "inline-flex items-center gap-2 font-sans text-[13px] font-semibold transition-[color,transform] duration-200 hover:translate-x-0.5",
            dark ? "text-white/80 hover:text-white" : "text-[#0b1020] hover:text-brand",
          )}
        >
          <RotateCcw aria-hidden className="size-4" />
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 xl:gap-7">
      <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 3xl:gap-5">
        <div className="flex flex-col">
          <label htmlFor={`${idPrefix}-name`} className={label}>
            Full name{req}
          </label>
          <input id={`${idPrefix}-name`} className={field} name="name" autoComplete="name" placeholder="Your full name" value={values.name} onChange={set("name")} {...a11y("name")} />
          {err("name")}
        </div>
        <div className="flex flex-col">
          <label htmlFor={`${idPrefix}-email`} className={label}>
            Business email{req}
          </label>
          <input
            id={`${idPrefix}-email`}
            className={field}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={values.email}
            onChange={set("email")}
            {...a11y("email")}
          />
          {err("email")}
        </div>
        <div className="flex flex-col">
          <label htmlFor={`${idPrefix}-company`} className={label}>
            Organisation name{req}
          </label>
          <input
            id={`${idPrefix}-company`}
            className={field}
            name="company"
            autoComplete="organization"
            placeholder="Company or organisation"
            value={values.company}
            onChange={set("company")}
            {...a11y("company")}
          />
          {err("company")}
        </div>
        <div className="flex flex-col">
          <label htmlFor={`${idPrefix}-phone`} className={label}>
            Phone number{req}
          </label>
          <PhoneField
            id={`${idPrefix}-phone`}
            country={values.country}
            value={values.phoneNo}
            onCountry={(c) => {
              update("country", c);
              if (errors.phoneNo) setErrors((x) => ({ ...x, phoneNo: undefined }));
            }}
            onValue={(v) => update("phoneNo", v)}
            fieldClass={field}
            dark={dark}
            invalid={Boolean(errors.phoneNo)}
            describedBy={errors.phoneNo ? `${idPrefix}-phoneNo-error` : undefined}
          />
          {err("phoneNo")}
        </div>
        <div className="col-span-full flex flex-col">
          <label htmlFor={`${idPrefix}-service`} className={label}>
            Area of interest{req}
          </label>
          <div className="relative">
            <select
              id={`${idPrefix}-service`}
              className={cn(field, "cursor-pointer appearance-none pr-10", !values.service && (dark ? "text-white/45" : "text-[#6b7177]"))}
              name="service"
              value={values.service}
              onChange={set("service")}
              {...a11y("service")}
            >
              <option value="" disabled className="bg-black text-stone">
                Choose a portfolio, solution, product or event
              </option>
              {groups.map((g, i) =>
                g.label ? (
                  <optgroup key={`${g.label}-${i}`} label={g.label} className={dark ? "bg-black text-white/60" : "bg-white text-[#4b5157]"}>
                    {g.items.map(optionEl)}
                  </optgroup>
                ) : (
                  g.items.map(optionEl)
                ),
              )}
            </select>
            <svg aria-hidden viewBox="0 0 12 9" className="pointer-events-none absolute right-4 top-1/2 size-3 -translate-y-1/2 fill-current opacity-50">
              <path d="M6 9 0 0h12z" />
            </svg>
          </div>
          {err("service")}
        </div>
        <div className="col-span-full flex flex-col">
          <label htmlFor={`${idPrefix}-message`} className={label}>
            Your requirements{req}
          </label>
          <textarea
            id={`${idPrefix}-message`}
            className={cn(field, "h-auto min-h-[132px] resize-y py-3 leading-[1.55] 3xl:h-auto")}
            name="message"
            rows={5}
            placeholder="What would you like to modernise, operate, analyse, secure or scale?"
            value={values.message}
            onChange={set("message")}
            {...a11y("message")}
          />
          {err("message")}
        </div>
        {/* honeypot – humans never see or fill this */}
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={values.company_website}
          onChange={set("company_website")}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden
        />
      </div>
      {serverError ? (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-sans text-[12.5px] text-red-300">
          {serverError}
        </p>
      ) : null}
      <p className={cn("-mt-1 font-sans text-[12px] leading-[1.6]", dark ? "text-white/55" : "text-[#5b6167]")}>
        <span aria-hidden className="text-brand">*</span> Required. We use your details only to respond to your enquiry. See our{" "}
        <PrivacyPolicyLink className={cn("underline underline-offset-2", dark ? "text-white/80 hover:text-white" : "text-[#0b0b0b]")} />
        .
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Turnstile ref={turnstile} onToken={setTurnstileToken} theme={dark ? "dark" : "light"} />
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-primary group max-[768px]:h-11 max-[768px]:w-full max-[768px]:px-6 max-[768px]:text-[13.5px]"
        >
          <span>{status === "sending" ? "Sending…" : status === "sent" ? "Sent" : submitLabel}</span>
          {status === "sending" ? (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          ) : status === "sent" ? (
            <Check aria-hidden className="size-4" />
          ) : (
            <ArrowRight aria-hidden className="size-4 stroke-[2.25] transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>
      </div>
    </form>
  );
}
