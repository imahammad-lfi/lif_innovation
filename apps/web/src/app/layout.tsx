import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { ContactDialogHost } from "@/components/layout/contact-dialog-host";
import { EventPromo } from "@/components/layout/event-promo";
import { HashLanding } from "@/components/layout/hash-landing";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { SiteHeader } from "@/components/layout/site-header";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { Toaster } from "@/components/ui/sonner";
import { getGlobal } from "@/lib/content";
import { mediaUrl } from "@/lib/media";

import "./globals.css";

/*
 * Typography — both families are licensed under the SIL Open Font License 1.1: free for commercial
 * use, no attribution or licence fees. next/font downloads them at build time and serves them from
 * our own domain (no Google requests at runtime, GDPR friendly).
 *   Plus Jakarta Sans – headings, navigation, buttons (modern geometric sans)
 *   Inter             – body copy, cards, forms (highly legible at small sizes)
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-jakarta",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--ff-inter",
  display: "swap",
});

// "||" not "??": an empty build argument must fall back too, or new URL("") breaks the build.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.linkfields.com";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobal();
  const seo = global?.defaultSeo;
  const og = mediaUrl(seo?.ogImage);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: seo?.metaTitle ?? "Linkfields", template: "%s" },
    description: seo?.metaDescription ?? undefined,
    keywords: seo?.keywords ?? undefined,
    applicationName: global?.siteName ?? "Linkfields",
    openGraph: {
      type: "website",
      siteName: global?.siteName ?? "Linkfields",
      locale: "en_GB",
      images: og ? [{ url: og }] : undefined,
    },
    twitter: { card: "summary_large_image", site: "@LinkfieldsI" },
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${jakarta.variable} ${inter.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-black font-body text-mist antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <OrganizationJsonLd />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <EventPromo />
        <ContactDialogHost />
        <ScrollToTop />
        <HashLanding />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
