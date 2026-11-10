"""Second-pass editor: adjudicates each review suggestion against strict rules before anything is applied.

Input: /tmp/r15/review/candidates.json (guard-filtered suggestions). Output: /tmp/r15/review/editor/<page>.json
"""
import concurrent.futures as cf
import glob
import json
import os
import sys
import time

from openai import OpenAI

sys.path.insert(0, "/tmp/r15")
import llm_review as lr  # noqa: E402  (reuses SITE_CONTEXT / model)
from check_reviews import docs, field  # noqa: E402

OUT = "/tmp/r15/review/editor"
os.makedirs(OUT, exist_ok=True)
client = OpenAI()

valid = {}
for f in glob.glob("/home/ubuntu/linkfields/seed/data/pages/*.json"):
    d = json.load(open(f))
    valid[d["path"]] = sorted({s.get("anchorId") for s in d["sections"] if s.get("anchorId")} | {"get-in-touch"})
posts = json.load(open("/home/ubuntu/linkfields/seed/data/blog-posts.json"))
for p in posts:
    valid[f"/company/blog/{p['slug']}"] = []
VALID = "\n".join(f"{p}  #{' #'.join(a)}" if a else p for p, a in sorted(valid.items()))

CTX = lr.SITE_CONTEXT.replace("Great Place To Work certified; ", "")

SYSTEM = f"""You are the final copy editor for the Linkfields corporate website. A reviewer proposed edits; you decide, for
each one, whether it ships. Be conservative: an edit ships only if it clearly improves professionalism, clarity, value,
flow, SEO or correctness WITHOUT adding risk.

{CTX}

CURRENT COMPLIANCE NOTES (override anything above): the Great Place To Work certification on record (India, Sep 2023 –
Sep 2024) has EXPIRED — never present Linkfields as currently Great Place To Work certified. Do not mention FT/Statista
logos; the #35 2026 ranking itself is approved.

DECISION RULES
- "accept": the proposed text is correct and better. "modify": the idea is right but the wording needs a fix — give the
  corrected final_text. "reject": style-only, no clear gain, or any rule below is broken.
- Reject anything that adds a fact, number, client, outcome, certification, partnership, location, date or superlative
  not present in the current field or the approved sources.
- Never alter: "One strategic partner across your transformation", "Let's connect"/"Let’s connect" CTA labels, product and
  IP names, event facts, email addresses, legal substance of legal pages.
- Keep *asterisk* highlight markup (exactly one highlighted phrase in headings that had one), markdown links and line
  breaks. Links may only point to VALID PATHS / anchors listed below.
- Length: titles/headings/labels within ±25% of the original; body text within ±35%.
- British English, supportive partnership tone ("business requirements"), no hype ("cutting-edge", "world-class",
  "revolutionary", "seamless", "unlock", "leverage" as a verb).
- If two suggestions on the same page edit the same text, accept at most one.
- final_text must be the full replacement for current_text (not the whole field) and must be plain text/markdown.

VALID PATHS (with section anchors)
{VALID}
"""

SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["decisions"],
    "properties": {"decisions": {"type": "array", "items": {
        "type": "object", "additionalProperties": False,
        "required": ["id", "decision", "final_text", "reason"],
        "properties": {"id": {"type": "string"}, "decision": {"type": "string", "enum": ["accept", "modify", "reject"]},
                       "final_text": {"type": "string"}, "reason": {"type": "string"}}}}},
}


def run(page, items):
    out = os.path.join(OUT, page + ".json")
    if os.path.exists(out):
        return page, "cached"
    d = docs[page]
    payload = []
    for x in items:
        payload.append({"id": x["id"], "category": x["category"], "severity": x["severity"],
                        "section": f"{x['sec']} {x['comp']} #{x['anchor']}", "field": x["field_path"],
                        "full_field_value": (field(d, x["sec"], x["field_path"]) or "")[:3000],
                        "current_text": x["current_text"], "proposed_text": x["proposed_text"], "reviewer_rationale": x["rationale"]})
    user = f"PAGE {d.get('path') or d.get('slug')} — {d.get('title', '')}\n\nSUGGESTIONS\n" + json.dumps(payload, ensure_ascii=False, indent=1)
    for attempt in range(3):
        try:
            t = time.time()
            r = client.chat.completions.create(
                model=lr.MODEL, messages=[{"role": "system", "content": SYSTEM}, {"role": "user", "content": user}],
                response_format={"type": "json_schema", "json_schema": {"name": "editor", "strict": True, "schema": SCHEMA}},
                max_completion_tokens=12000, extra_body={"reasoning": {"effort": "medium"}})
            res = json.loads(r.choices[0].message.content)
            json.dump(res, open(out, "w"), indent=1, ensure_ascii=False)
            n = {k: sum(1 for z in res["decisions"] if z["decision"] == k) for k in ("accept", "modify", "reject")}
            return page, f"ok {n} {int(time.time() - t)}s"
        except Exception as e:  # noqa: BLE001
            err = e
            time.sleep(5 * (attempt + 1))
    return page, f"FAILED {err}"


if __name__ == "__main__":
    cands = json.load(open("/tmp/r15/review/candidates.json"))
    by = {}
    for x in cands:
        by.setdefault(x["page"], []).append(x)
    with cf.ThreadPoolExecutor(6) as ex:
        for i, (page, msg) in enumerate(ex.map(lambda kv: run(*kv), by.items()), 1):
            print(f"[{i}/{len(by)}] {page}: {msg}", flush=True)
