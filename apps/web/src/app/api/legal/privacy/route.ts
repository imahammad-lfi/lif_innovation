import { getPage } from "@/lib/content";

/**
 * GET /api/legal/privacy → the published Privacy Policy (Strapi › Pages › /privacy-policy) as JSON, for the pop-up that
 * opens from the enquiry form's "Privacy Policy" link. Only the legal text sections are returned; the page itself stays
 * the source of truth, so editors change the policy in one place.
 */
export async function GET() {
  const page = await getPage("/privacy-policy");
  const sections = (page?.sections ?? [])
    .filter((s) => s.__component === "sections.rich-text" && typeof s.body === "string" && s.body.trim())
    .map((s) => ({ heading: typeof s.heading === "string" ? s.heading : null, body: s.body as string }));
  if (!page || !sections.length) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(
    { title: page.title || "Privacy Policy", path: "/privacy-policy", updatedAt: page.updatedAt ?? null, sections },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
  );
}
