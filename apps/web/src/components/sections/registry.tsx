import { companySections } from "./company";
import { commonSections } from "./common";
import { contentSections } from "./content";
import { homeSections } from "./home";
import { hubsSections } from "./hubs";
import { industriesSections } from "./industries";
import { productsSections } from "./products";
import { servicesSections } from "./services";
import { solutionsSections } from "./solutions";
import type { SectionContext, SectionMap } from "./types";
import type { Global, Page } from "@/lib/content/types";
import { accentVars } from "@/lib/accent";
import { pageAccent } from "@/lib/page-accent";

/** Strapi component UID -> React component. Each family owns its own map. */
export const sectionRegistry: SectionMap = {
  ...commonSections,
  ...homeSections,
  ...companySections,
  ...hubsSections,
  ...servicesSections,
  ...industriesSections,
  ...solutionsSections,
  ...productsSections,
  ...contentSections,
};

/** Renders a page's dynamic zone top-to-bottom. Unknown components are skipped (flagged in dev). */
export function RenderSections({ page, global }: { page: Page; global: Global | null }) {
  const sections = page.sections ?? [];
  const accent = pageAccent(page.path, global);
  return (
    // A real box (not display:contents): Next.js scrolls a new page to the top only when the first
    // element of the page has a layout box above the viewport; a box-less wrapper reads as "in view"
    // and the visitor would arrive at the old scroll position (often the footer).
    <div data-page-sections="" style={accent ? accentVars(accent) : undefined}>
      {sections.map((section, index) => {
        const Component = sectionRegistry[section.__component];
        const key = `${section.__component}-${section.id ?? index}`;
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            return (
              <div key={key} className="bg-red-950 p-6 font-mono text-sm text-red-200">
                Missing renderer for <b>{section.__component}</b>
              </div>
            );
          }
          return null;
        }
        const context: SectionContext = { global, page, index };
        return <Component key={key} data={section} context={context} />;
      })}
    </div>
  );
}
