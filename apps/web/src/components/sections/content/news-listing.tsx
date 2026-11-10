import { getNewsArticles } from "@/lib/content";
import type { SectionProps } from "../types";
import { NewsListingClient } from "../lazy"; // code-split (see sections/lazy.tsx)

type Data = { heading?: string | null };

/** Original /company/news-and-articles press-card grid. */
export async function NewsListing({ data }: SectionProps<Data>) {
  const articles = await getNewsArticles();
  return <NewsListingClient heading={data.heading} articles={articles} />;
}
