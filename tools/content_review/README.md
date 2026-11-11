# Content review pipeline (round 2026-11-09g)

1. `python3 tools/content_audit.py --out /tmp/r15/review` — page outlines plus deterministic duplicate, gap and SEO checks.
2. `llm_review.py` — per-page structured review (tone, flow, links, duplicates, SEO) against the corporate-deck facts.
3. `triage.py` — exports all suggestions with automatic guards (unknown links, invented facts, length limits).
4. `editor_pass.py` — strict second pass: accept / modify / reject each suggestion.
5. Manual review of every accepted edit → `docs/review/content-review-2026-11/manual_decisions.json`.
6. `build_fixes.py` — writes `seed/custom/content_fixes.json`; `seed/custom/apply.py` applies it last and reports
   any edit whose original text is no longer found.

The scripts were run from `/tmp/r15`; paths inside them point there. They need `OPENAI_API_KEY`/`OPENAI_API_BASE`.
Decision records and the reviewed change list are in `docs/review/content-review-2026-11/`.
