import { getBlogPosts } from "@/lib/content";
import type { SectionProps } from "../types";
import type { FilterGroup } from "./blog-listing-client";
import { BlogListingClient } from "../lazy"; // code-split (see sections/lazy.tsx)

type Data = {
  heading?: string | null;
  discoverHeading?: string | null;
  categoryGroups?: FilterGroup[] | null;
};

/** Original /company/blog category controls, feature card, and discover-card collection. */
export async function BlogListing({ data }: SectionProps<Data>) {
  const posts = await getBlogPosts();
  return (
    <section className="mt-[72px] bg-black px-gutter py-24 3xl:py-28 max-[768px]:mt-16 max-[768px]:py-16">
      <BlogListingClient
        heading={data.heading}
        discoverHeading={data.discoverHeading}
        categoryGroups={data.categoryGroups ?? []}
        posts={posts}
      />
    </section>
  );
}
