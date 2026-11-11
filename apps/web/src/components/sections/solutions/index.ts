import type { SectionMap } from "../types";

import { AccordionStack, CardGrid, NumberedList, SplitAccordion } from "./accordion-sections";
import { HowCanWeHelp } from "./how-can-we-help";
import { ProcessGrid } from "./process-grid";
import { SalesforceServices } from "../lazy"; // code-split (see sections/lazy.tsx)
import { dataOnly } from "../data-only";
import { TechnologyDetails } from "./technology-details";
import { WhyChooseUs } from "./why-choose-us";

/** Sections of the "solutions" family. Keys are Strapi component UIDs ("solutions.<name>"). */
export const solutionsSections: SectionMap = {
  "solutions.how-can-we-help": HowCanWeHelp,
  "solutions.technology-details": TechnologyDetails,
  "solutions.card-grid": CardGrid,
  "solutions.split-accordion": SplitAccordion,
  "solutions.accordion-stack": AccordionStack,
  "solutions.numbered-list": NumberedList,
  "solutions.process-grid": ProcessGrid,
  "solutions.salesforce-services": dataOnly(SalesforceServices),
  "solutions.why-choose-us": WhyChooseUs,
};
