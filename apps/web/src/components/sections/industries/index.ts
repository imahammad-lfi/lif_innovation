import type { SectionMap } from "../types";

import { BuildingTools } from "./building-tools";
import { SpecializationList } from "../lazy"; // code-split (see sections/lazy.tsx)
import { dataOnly } from "../data-only";

/** Sections of the "industries" family. Keys are Strapi component UIDs ("industries.<name>"). */
export const industriesSections: SectionMap = {
  "industries.building-tools": BuildingTools,
  "industries.specialization-list": dataOnly(SpecializationList),
};
