import type { Accent, Global } from "@/lib/content/types";

/** Portfolio colours from the corporate deck: every page under a portfolio takes that portfolio's accent. */
const PREFIXES: [string, Accent][] = [
  ["/services/digital-transformation", "orange"],
  ["/services/intelligent-enterprise-platforms", "blue"],
  ["/services/data-ai", "purple"],
  ["/services/cyber-security", "teal"],
  ["/services/talent-advisory-gcc", "yellow"],
  ["/solutions/ai-code-assurance", "orange"],
  ["/solutions/modernisation-programme-assurance", "blue"],
  ["/solutions/regulated-cyber-readiness", "teal"],
  ["/solutions/intelligent-operations", "purple"],
  ["/solutions/capability-centres-embedded-ip", "yellow"],
  ["/solutions", "blue"],
];

const norm = (p?: string | null) => (p ?? "").replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";

/** Accent for a page: portfolio prefix first, then the accent of the menu item that links to it (products, industries). */
export function pageAccent(path: string | null | undefined, global: Global | null): Accent | null {
  const here = norm(path);
  for (const [prefix, accent] of PREFIXES) {
    if (here === prefix || here.startsWith(`${prefix}/`)) return accent;
  }
  for (const group of global?.navigation ?? []) {
    for (const item of group.items ?? []) {
      if (!item.accent) continue;
      if (norm(item.href) === here) return item.accent;
      if (item.links?.some((l) => norm(l.href) === here)) return item.accent;
    }
  }
  return null;
}
