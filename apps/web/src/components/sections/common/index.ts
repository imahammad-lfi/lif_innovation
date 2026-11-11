import type { SectionMap } from "../types";
import { ContactForm } from "./contact-form";
import { FeaturedInsights } from "./featured-insights";
import { FeatureTiles } from "./feature-tiles";
import { GlobalPresence } from "./global-presence";
import { IndustriesGrid } from "./industries-grid";
import { IndustriesShowcase } from "./industries-showcase";
import { MessageBanner } from "./message-banner";
import { MetricsGrid } from "./metrics-grid";
import { Overview } from "./overview";
import { PageHero } from "./page-hero";
import { EventsList } from "./events-list";
import { OfficeLocations } from "./office-locations";
import { SocialBanner } from "./social-banner";
import { StatsBand } from "./stats-band";
import { ValuePlays } from "./value-plays";
import { WhoWeAre } from "./who-we-are";

/**
 * Sections shared by every family (Strapi category "sections").
 * `sections.rich-text` is rendered by the content family (see sections/content).
 */
export const commonSections: SectionMap = {
  "sections.page-hero": PageHero,
  "sections.overview": Overview,
  "sections.message-banner": MessageBanner,
  "sections.stats-band": StatsBand,
  "sections.industries-grid": IndustriesGrid,
  "sections.industries-showcase": IndustriesShowcase,
  "sections.featured-insights": FeaturedInsights,
  "sections.feature-tiles": FeatureTiles,
  "sections.metrics-grid": MetricsGrid,
  "sections.value-plays": ValuePlays,
  "sections.who-we-are": WhoWeAre,
  "sections.global-presence": GlobalPresence,
  "sections.events-list": EventsList,
  "sections.office-locations": OfficeLocations,
  "sections.contact-form": ContactForm,
  "sections.social-banner": SocialBanner,
};
