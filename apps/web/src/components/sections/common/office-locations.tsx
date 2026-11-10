import { DeckHeader, DeckStage } from "@/components/primitives/deck";
import type { SectionProps } from "../types";

import { OfficeLocationsClient } from "../lazy"; // code-split (see sections/lazy.tsx)

type Data = {
  anchorId?: string | null;
  eyebrow?: string | null;
  heading?: string | null;
  description?: string | null;
  showMap?: boolean | null;
};

/** `sections.office-locations`: office addresses from Global › Offices with an interactive map. */
export function OfficeLocations({ data, context }: SectionProps<Data>) {
  const offices = (context.global?.offices ?? []).filter((o) => o?.country && o.address);
  if (!offices.length) return null;
  return (
    <DeckStage id={data.anchorId || "our-offices"}>
      <DeckHeader eyebrow={data.eyebrow} heading={data.heading} description={data.description} />
      <OfficeLocationsClient offices={offices} showMap={data.showMap !== false} />
    </DeckStage>
  );
}
