import type { SectionMap } from "../types";
import { AcceleratorGrid } from "./accelerator-grid";
import { ProductPortfolio } from "./product-portfolio";

/** Sections of the "products" family (Products & Accelerators). Keys are Strapi component UIDs. */
export const productsSections: SectionMap = {
  "products.product-portfolio": ProductPortfolio,
  "products.accelerator-grid": AcceleratorGrid,
};
