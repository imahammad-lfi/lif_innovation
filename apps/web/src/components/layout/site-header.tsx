import { getGlobal } from "@/lib/content";

import { HeaderClient } from "./header-client";

/** Fixed top navigation. Content (menu, CTA, logo) is managed in Strapi › Global. */
export async function SiteHeader() {
  const global = await getGlobal();
  return (
    <HeaderClient
      logo={global?.logo ?? null}
      navigation={global?.navigation ?? []}
      cta={global?.headerCta ?? { label: "Let's connect", href: "/contact-us" }}
    />
  );
}
