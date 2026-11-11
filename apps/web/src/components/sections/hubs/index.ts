import type { SectionMap } from "../types";
import { WhatWeOffer } from "./what-we-offer";

/** Sections of the "hubs" family. Keys are Strapi component UIDs ("hubs.<name>"). */
export const hubsSections: SectionMap = {
  "hubs.what-we-offer": WhatWeOffer,
};
