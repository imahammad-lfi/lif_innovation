"""Build seed/custom/content_fixes.json from the reviewed LLM edits, manual decisions and SEO changes."""
import json
import re
import sys

sys.path.insert(0, "/tmp/r15")
from check_reviews import docs  # noqa: E402

R = "/tmp/r15/review"
A = json.load(open(f"{R}/approved.json"))
M = json.load(open(f"{R}/manual_decisions.json"))
SEO = json.load(open(f"{R}/seo_changes.json"))
reject = set(M["reject"])
override = M["override"]

CURLY = re.compile(r"(?<=[A-Za-z])'(?=[A-Za-z])")


def curly(text):
    """Word-internal straight apostrophes -> typographic, leaving markdown link targets untouched."""
    out, pos = [], 0
    for m in re.finditer(r"\]\([^)]*\)", text):
        out.append(CURLY.sub("’", text[pos:m.start()]))
        out.append(m.group(0))
        pos = m.end()
    out.append(CURLY.sub("’", text[pos:]))
    return "".join(out)


fixes = {"pages": {}, "posts": {}}
for grp in ("pages", "posts"):
    for key, spec in SEO.get(grp, {}).items():
        slot = key if grp == "pages" else key.rsplit("/", 1)[-1]
        fixes[grp].setdefault(slot, {})["seo"] = spec["seo"]

count = 0
for x in A["ok"] + A["flagged"]:
    if x["id"] in reject:
        continue
    new = override.get(x["id"], x["final"])
    new = curly(new)
    if new == x["current_text"]:
        continue
    d = docs[x["page"]]
    if x["path"] and x["path"].startswith("/company/blog/"):
        grp, slot, edit = "posts", x["path"].rsplit("/", 1)[-1], {"field": x["field_path"]}
    else:
        grp, slot = "pages", d["path"]
        sec = d["sections"][x["sec"]]
        edit = {"section": sec.get("anchorId") or str(x["sec"]), "field": x["field_path"]}
    edit.update({"find": x["current_text"], "replace": new, "_why": f"{x['category']} ({x['id']})"})
    fixes[grp].setdefault(slot, {}).setdefault("edits", []).append(edit)
    count += 1

for path in ("/products-and-accelerators/ai-governance", "/products-and-accelerators/edupilot",
             "/products-and-accelerators/finsight", "/products-and-accelerators/textiq"):
    fixes["pages"].setdefault(path, {}).setdefault("edits", []).append(
        {"section": "overview", "field": "eyebrow", "find": "Problem and fit", "replace": "Requirements and fit",
         "_why": "consistent supportive eyebrow across product pages"})
    count += 1

# Blog posts carry a /company/blog/<slug> path in the review docs; the fix layer keys posts by slug.
for key in [k for k in fixes["pages"] if k.startswith("/company/blog/")]:
    spec = fixes["pages"].pop(key)
    slot = fixes["posts"].setdefault(key.rsplit("/", 1)[-1], {})
    if "seo" in spec:
        slot["seo"] = spec["seo"]
    slot.setdefault("edits", []).extend(spec.get("edits", []))

out = "/home/ubuntu/linkfields/seed/custom/content_fixes.json"
json.dump(fixes, open(out, "w"), indent=1, ensure_ascii=False)
print(f"{count} edits, {sum(1 for g in fixes.values() for v in g.values() if 'seo' in v)} SEO blocks -> {out}")
