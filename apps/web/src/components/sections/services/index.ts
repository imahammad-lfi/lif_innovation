import type { SectionMap } from "../types";
import { FlowCards } from "./flow-cards";
import { LogoOffering } from "./logo-offering";
import { MediaProcess } from "./media-process";
import { NumberedHelp } from "./numbered-help";
import { ProcessAccordion } from "../lazy"; // code-split (see sections/lazy.tsx)
import { dataOnly } from "../data-only";
import { Superpowers } from "./superpowers";
import { WhatWeOffer } from "./what-we-offer";

/** Sections of the "services" family. Keys are Strapi component UIDs ("services.<name>"). */
export const servicesSections: SectionMap = {
  "services.what-we-offer": WhatWeOffer,
  "services.flow-cards": FlowCards,
  "services.process-accordion": dataOnly(ProcessAccordion),
  "services.superpowers": Superpowers,
  "services.numbered-help": NumberedHelp,
  "services.media-process": MediaProcess,
  "services.logo-offering": LogoOffering,
};
