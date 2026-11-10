/** Liveness probe for the load balancer / container orchestrator. Deliberately does not call the CMS. */
export function GET() {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
