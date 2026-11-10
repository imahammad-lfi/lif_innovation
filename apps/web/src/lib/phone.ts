import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/min";

import COUNTRIES from "./countries.json";

export type Country = { code: string; name: string; dial: string };

/** All countries (English names, generated from libphonenumber metadata; see countries.json). */
export const countries = COUNTRIES as Country[];

/** Linkfields office countries, listed first in the country-code picker. */
export const PRIORITY = ["ZA", "IN", "AE", "US", "GB", "AU"];

export const DEFAULT_COUNTRY = "ZA";

const byCode = new Map(countries.map((c) => [c.code, c]));
export const findCountry = (code?: string | null) => (code ? byCode.get(code.toUpperCase()) : undefined);

/** Regional-indicator flag emoji for an ISO 3166-1 alpha-2 code. */
export function flag(code: string) {
  return String.fromCodePoint(...[...code.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

/**
 * Validates a number typed against the selected country. A number that starts with "+" is read as
 * international and may imply a different country, which is returned so the picker can follow it.
 */
export function checkPhone(input: string, country: string) {
  const raw = input.trim();
  if (!raw) return { ok: false as const, empty: true as const };
  const p = parsePhoneNumberFromString(raw, (findCountry(country)?.code as CountryCode | undefined) ?? undefined);
  if (!p || !p.isPossible()) return { ok: false as const, empty: false as const };
  return { ok: true as const, e164: p.number as string, international: p.formatInternational(), country: p.country ?? country };
}
