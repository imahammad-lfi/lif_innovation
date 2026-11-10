"use client";

/**
 * Code-split entry points for the heavier interactive sections.
 *
 * Turbopack bundles every client component that a route's server components import into that route's start-up
 * chunks, so with one catch-all CMS route every page used to download every interactive section (the contact form
 * and its phone-number metadata, the Embla carousels, the Markdown renderer, ...). Importing them through these
 * `next/dynamic` wrappers instead turns each one into its own chunk that is only fetched by pages that render it.
 *
 * Server rendering is unchanged: `ssr` stays on and there is no `loading` state, so the HTML (and SEO) are identical
 * and no Suspense fallback is shown. During server rendering Next.js preloads the chunks of the components actually
 * used, so they are ready by the time the page hydrates.
 *
 * Import these from server wrappers / the section registry. Types stay imported from the original modules.
 */
import dynamic from "next/dynamic";

export const ContactFormClient = dynamic(() => import("./common/contact-form-client").then((m) => m.ContactFormClient));
export const OfficeLocationsClient = dynamic(() => import("./common/office-locations-client").then((m) => m.OfficeLocationsClient));
export const EventsListClient = dynamic(() => import("./common/events-list-client").then((m) => m.EventsListClient));
export const HomeCarousel = dynamic(() => import("./home/home-carousel").then((m) => m.HomeCarousel));
export const Journey = dynamic(() => import("./home/journey").then((m) => m.Journey));
export const LocationCarouselClient = dynamic(() => import("./company/location-carousel-client").then((m) => m.LocationCarouselClient));
export const CareerStrip = dynamic(() => import("./company/career-strip").then((m) => m.CareerStrip));
export const BlogListingClient = dynamic(() => import("./content/blog-listing-client").then((m) => m.BlogListingClient));
export const NewsListingClient = dynamic(() => import("./content/news-listing-client").then((m) => m.NewsListingClient));
export const SpecializationList = dynamic(() => import("./industries/specialization-list").then((m) => m.SpecializationList));
export const ProcessAccordion = dynamic(() => import("./services/process-accordion").then((m) => m.ProcessAccordion));
export const AccordionList = dynamic(() => import("./solutions/accordion-list").then((m) => m.AccordionList));
export const SalesforceServices = dynamic(() => import("./solutions/salesforce-services").then((m) => m.SalesforceServices));
