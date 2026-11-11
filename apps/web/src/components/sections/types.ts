import type { Global, Page, SectionData } from "@/lib/content/types";

export type SectionContext = {
  global: Global | null;
  page: Page;
  /** Position of the section on the page (0 = first). Useful for image priority. */
  index: number;
};

export type SectionProps<T = Record<string, unknown>> = {
  data: SectionData & T;
  context: SectionContext;
};

/** A section renderer: a (possibly async) server component, or a code-split client component (see sections/lazy.tsx). */
export type SectionComponent =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ((props: SectionProps<any>) => React.ReactNode | Promise<React.ReactNode>)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | React.ComponentType<SectionProps<any>>;

/** Maps a Strapi component UID (e.g. "home.hero-slider") to the React component that renders it. */
export type SectionMap = Record<string, SectionComponent>;
