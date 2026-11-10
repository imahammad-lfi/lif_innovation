/** RFC 5545 text escaping (backslash, semicolon, comma, newline). */
function esc(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold lines longer than 75 octets as required by RFC 5545. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

const day = (iso: string) => iso.slice(0, 10).replace(/-/g, "");

/** Exclusive all-day end date (the day after the last event day). */
function dayAfter(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export type IcsEvent = {
  uid: string;
  title: string;
  start: string;
  end?: string | null;
  location?: string | null;
  description?: string | null;
  url?: string | null;
};

/** All-day calendar invitation. */
export function eventIcs(ev: IcsEvent): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Linkfields//Website//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${ev.uid}@linkfields.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day(ev.start)}`,
    `DTEND;VALUE=DATE:${dayAfter(ev.end || ev.start)}`,
    `SUMMARY:${esc(ev.title)}`,
    ev.location ? `LOCATION:${esc(ev.location)}` : "",
    ev.description ? `DESCRIPTION:${esc(ev.description)}` : "",
    ev.url ? `URL:${ev.url}` : "",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  return lines.map(fold).join("\r\n") + "\r\n";
}
