import { contentClock, getEvents, getGlobal } from "@/lib/content";

import type { FormEvent } from "@/components/sections/common/contact-form-client";
import { ContactDialog } from "./contact-dialog";

/** Server wrapper: the dialog uses the same copy and options as every page form (Strapi › Global › Contact form). */
export async function ContactDialogHost() {
  const [global, allEvents, serverNow] = await Promise.all([getGlobal(), getEvents(), contentClock()]);
  const d = global?.contactForm ?? {};
  const events: FormEvent[] = allEvents.map((e) => ({ slug: e.slug, title: e.title, startDate: e.startDate, endDate: e.endDate, stand: e.stand }));
  return (
    <ContactDialog
      heading={d.heading || "Let\u2019s connect"}
      subheading={d.subheading || "Tell us about your business requirements"}
      nextStepsTitle={d.nextStepsTitle || ""}
      nextSteps={(d.nextSteps ?? []).map((s) => s.title).filter(Boolean) as string[]}
      options={d.serviceOptions ?? []}
      events={events}
      serverNow={serverNow}
      submitLabel={d.submitLabel || "Send enquiry"}
      successMessage={d.successMessage || "Thank you for submitting your enquiry. Our expert consultants will be in touch."}
      salesEmail={global?.salesEmail || "sales@linkfields.com"}
    />
  );
}
