"use client";

import { ChevronDown } from "lucide-react";

import { PRIORITY, checkPhone, countries, findCountry, flag } from "@/lib/phone";
import { cn } from "@/lib/utils";

const priority = PRIORITY.map((c) => findCountry(c)).filter((c): c is NonNullable<typeof c> => Boolean(c));

/**
 * Phone number with a country-code picker. The native <select> (accessible, native picker on mobile)
 * sits invisibly over a compact "flag +code" chip; the number input holds the national number.
 */
export function PhoneField({
  id,
  country,
  value,
  onCountry,
  onValue,
  fieldClass,
  dark,
  invalid,
  describedBy,
}: {
  id: string;
  country: string;
  value: string;
  onCountry: (code: string) => void;
  onValue: (v: string) => void;
  fieldClass: string;
  dark: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const current = findCountry(country);
  const optionClass = dark ? "bg-black text-cloud" : "bg-white text-coal";

  // "+44 20 7946 0958" pasted into the number box: follow the implied country and keep the national part.
  const onBlur = () => {
    if (!value.trim().startsWith("+")) return;
    const r = checkPhone(value, country);
    if (r.ok && r.country && findCountry(r.country)) {
      onCountry(r.country);
      onValue(r.international.replace(/^\+\d+\s*/, ""));
    }
  };

  return (
    <div className="flex">
      <div className="relative shrink-0">
        <select
          id={`${id}-country`}
          aria-label="Country code"
          value={country}
          onChange={(e) => onCountry(e.target.value)}
          className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
        >
          <optgroup label="Linkfields offices" className={optionClass}>
            {priority.map((c) => (
              <option key={`p-${c.code}`} value={c.code} className={optionClass}>
                {c.name} (+{c.dial})
              </option>
            ))}
          </optgroup>
          <optgroup label="All countries" className={optionClass}>
            {countries.map((c) => (
              <option key={c.code} value={c.code} className={optionClass}>
                {c.name} (+{c.dial})
              </option>
            ))}
          </optgroup>
        </select>
        <span
          aria-hidden
          className={cn(
            fieldClass,
            "flex w-[104px] items-center gap-1.5 rounded-r-none pr-2 pl-3 peer-hover:border-white/25 peer-focus-visible:border-brand peer-focus-visible:ring-4 peer-focus-visible:ring-brand/15 3xl:w-[116px]",
            !dark && "peer-hover:border-black/25",
            invalid && "border-red-400/70",
          )}
        >
          <span className="text-[15.5px] leading-none">{current ? flag(current.code) : "🌐"}</span>
          <span className="tabular-nums">+{current?.dial ?? ""}</span>
          <ChevronDown className="ml-auto size-3.5 opacity-50" />
        </span>
      </div>
      <input
        id={id}
        className={cn(fieldClass, "-ml-px min-w-0 flex-1 rounded-l-none", invalid && "border-red-400/70")}
        name="phoneNo"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="Phone number"
        value={value}
        onChange={(e) => onValue(e.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
    </div>
  );
}
