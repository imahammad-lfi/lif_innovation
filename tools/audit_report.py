#!/usr/bin/env python3
"""Turn one or more tools/site_audit.py JSON results into a Markdown fidelity table.
usage: audit_report.py <audit.json> [more.json ...] [--tol 4] > report.md
For every page and width: original vs rebuilt page height, the difference, the share of text anchors whose
position (top/left) agrees within the tolerance, and the number of anchors with a font mismatch.
"""
import argparse
import json


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--tol", type=int, default=4)
    a = ap.parse_args()

    results = []
    for f in a.files:
        results.extend(json.load(open(f)))
    results.sort(key=lambda r: (r["width"], r["path"]))

    for width in sorted({r["width"] for r in results}):
        rows = [r for r in results if r["width"] == width]
        print(f"\n### {width}px viewport\n")
        print("| Page | Original height | Rebuild height | Difference | Text anchors positioned within ±%dpx | Font mismatches |" % a.tol)
        print("| --- | ---: | ---: | ---: | ---: | ---: |")
        exact = 0
        for r in rows:
            anchors = [x for x in r.get("rows", []) if "delta" in x]
            ok = sum(1 for x in anchors if abs(x["delta"].get("top", 0)) <= a.tol and abs(x["delta"].get("left", 0)) <= a.tol)
            fonts = sum(1 for x in anchors if x.get("font"))
            ho, hu = r.get("heightOrig"), r.get("heightOurs")
            diff = (hu - ho) if (ho is not None and hu is not None) else None
            if diff is not None and abs(diff) <= a.tol:
                exact += 1
            pct = f"{100 * ok / len(anchors):.0f}% ({ok}/{len(anchors)})" if anchors else "–"
            show = lambda v: "–" if v is None else v
            print(f"| `{r['path']}` | {show(ho)} | {show(hu)} | {'–' if diff is None else f'{diff:+d}'} | {pct} | {fonts} |")
        print(f"\n{exact} of {len(rows)} pages are within ±{a.tol}px of the original's total height at {width}px.")


if __name__ == "__main__":
    main()
