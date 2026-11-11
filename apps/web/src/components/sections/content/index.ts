import type { SectionMap } from "../types";
import { BlogListing } from "./blog-listing";
import { EmptyHub } from "./empty-hub";
import { NewsListing } from "./news-listing";
import { RichText } from "./rich-text";

/** Sections of the "content" family. Keys are Strapi component UIDs. */
export const contentSections: SectionMap = {
  "content.blog-listing": BlogListing,
  "content.empty-hub": EmptyHub,
  "content.news-listing": NewsListing,
  "sections.rich-text": RichText,
};
