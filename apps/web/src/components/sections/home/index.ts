import type { SectionMap } from "../types";

import { AwardsCarousel } from "./awards-carousel";
import { CareersBanner } from "./careers-banner";
import { HeroSlider } from "./hero-slider";
import { IndustriesCarousel } from "./industries-carousel";
import { Journey } from "../lazy"; // code-split (see sections/lazy.tsx)
import { dataOnly } from "../data-only";
import { ServicesShowcase } from "./services-showcase";
import { SolutionsGrid } from "./solutions-grid";

/** Sections of the "home" family. Keys are Strapi component UIDs ("home.<name>"). */
export const homeSections: SectionMap = {
  "home.hero-slider": HeroSlider,
  "home.solutions-grid": SolutionsGrid,
  "home.services-showcase": ServicesShowcase,
  "home.industries-carousel": IndustriesCarousel,
  "home.journey": dataOnly(Journey),
  "home.awards-carousel": AwardsCarousel,
  "home.careers-banner": CareersBanner,
};
