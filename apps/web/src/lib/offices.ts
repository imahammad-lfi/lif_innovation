import type { Office } from "@/lib/content/types";

/** Address rows as authored (one per line), trimmed. */
export function officeLines(o: Office): string[] {
  return (o.address ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Search used for the map pin and directions: the editor's map query, else the address on one line. */
export function officeQuery(o: Office): string {
  return o.mapQuery?.trim() || officeLines(o).join(", ");
}

/** Google Maps directions to the office (documented Maps URLs format; opens the app on phones). */
export function directionsUrl(o: Office): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(officeQuery(o))}`;
}

/** Google Maps place search (for "Open in Google Maps"). */
export function mapSearchUrl(o: Office): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeQuery(o))}`;
}

/** Keyless Google Maps embed centred on the office. */
export function mapEmbedUrl(o: Office): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(officeQuery(o))}&z=15&output=embed`;
}

/** Stable id fragment, e.g. "south-africa", "united-kingdom". */
export function officeSlug(o: Office): string {
  return o.country
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
