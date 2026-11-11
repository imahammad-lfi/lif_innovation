import type { ComponentType } from "react";

import type { SectionProps } from "./types";

/**
 * Registers a client section so that only its own `data` crosses the server → client boundary.
 * Passing the full `context` (Global + the whole page) to a client component serialises ~50 KB into the page's
 * RSC payload for every such section. Client sections must therefore take `{ data }` only.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dataOnly(Client: ComponentType<{ data: any }>) {
  function DataOnlySection({ data }: SectionProps) {
    return <Client data={data} />;
  }
  return DataOnlySection;
}
