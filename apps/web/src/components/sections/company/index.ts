import type { SectionMap } from "../types";
import { CareerCta } from "./career-cta";
import { CompanyCardGrid } from "./company-card-grid";
import { CareerSlider } from "./career-slider";
import { ContactBanner } from "./contact-banner";
import { ExplorationGrid } from "./exploration-grid";
import { LocationCarousel } from "./location-carousel";
import { MediaStory } from "./media-story";
import { OfficePresence } from "./office-presence";
import { VisionList } from "./vision-list";

/** Sections of the "company" family. Keys are Strapi component UIDs ("company.<name>"). */
export const companySections: SectionMap = {
  "company.vision-list": VisionList,
  "company.card-grid": CompanyCardGrid,
  "company.exploration-grid": ExplorationGrid,
  "company.career-slider": CareerSlider,
  "company.media-story": MediaStory,
  "company.location-carousel": LocationCarousel,
  "company.career-cta": CareerCta,
  "company.office-presence": OfficePresence,
  "company.contact-banner": ContactBanner,
};
