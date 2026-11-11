#!/usr/bin/env python3
"""Typography refresh codemod (design refresh, 2 Nov 2026).

Rewrites Tailwind classes in apps/web/src (except components/ui, which is stock shadcn):
  * text-[Npx]     -> compact type scale (FS_MAP), every variant prefix (max-[1560px]:, 2xl:, …) kept
  * leading-[Npx]  -> unitless ratio paired with the font size that has the same prefix in the same
                      class string, clamped by text role (display / heading / body) so line-heights
                      scale with the new sizes; un-paired values are scaled by 0.9 and kept in px
  * headings (strings containing font-heading): font-medium -> font-semibold, font-normal -> font-medium
  * font-light -> font-normal (Inter 300 is too thin for grey copy on dark backgrounds)

usage: python3 tools/type_codemod.py [--apply] [--root apps/web/src]
"""
import argparse, os, re, sys
from collections import Counter

FS_MAP = {10: 10, 11: 11, 12: 12, 13: 12, 14: 13, 15: 14, 16: 15, 17: 16, 18: 16, 20: 18, 21: 18, 22: 19,
          24: 20, 26: 22, 28: 24, 30: 26, 31: 26, 32: 28, 36: 32, 38: 32, 40: 34, 44: 38, 48: 40, 56: 48,
          64: 52, 76: 60, 96: 72, 100: 72}

TOKEN_FS = re.compile(r'(?<![\w-])((?:[^\s"\'`:{}]+:)*!?)text-\[(\d+(?:\.\d+)?)px\](!?)')
STRING = re.compile(r'"[^"\n]*"|`[^`]*`|\'[^\'\n]*\'')
LEAD = re.compile(r'^((?:[^\s:]+:)*)(!?)leading-\[(\d+(?:\.\d+)?)px\](!?)$')
LEAD_REL = re.compile(r'^((?:[^\s:]+:)*)(!?)leading-\[(\d+(?:\.\d+)?)(%?)\](!?)$')
FS_TOK = re.compile(r'^((?:[^\s:]+:)*)!?text-\[(\d+(?:\.\d+)?)px\]!?$')


def map_fs(v: float) -> float:
    iv = round(v)
    if iv in FS_MAP:
        return FS_MAP[iv]
    # interpolate for anything unexpected
    keys = sorted(FS_MAP)
    lo = max([k for k in keys if k <= iv], default=keys[0]); hi = min([k for k in keys if k >= iv], default=keys[-1])
    if hi == lo:
        return FS_MAP[lo]
    t = (iv - lo) / (hi - lo)
    return round(FS_MAP[lo] + t * (FS_MAP[hi] - FS_MAP[lo]))


def map_fs_ctx(v: float, is_heading: bool) -> float:
    """Body copy (strings without font-heading) of 22-30px is a wide-desktop size in the original: cap it."""
    n = map_fs(v)
    if not is_heading and 22 <= v <= 30:
        n = min(n, 18 if v <= 24 else 20)
    return n


def clamp_ratio(r: float, fs_new: float) -> float:
    if fs_new >= 40:
        lo, hi = 1.05, 1.15
    elif fs_new >= 24:
        lo, hi = 1.15, 1.25
    elif fs_new >= 18:
        lo, hi = 1.3, 1.45
    else:
        lo, hi = 1.5, 1.7
    return round(min(max(r, lo), hi), 2)


def fmt(x: float) -> str:
    s = f"{x:.2f}".rstrip("0").rstrip(".")
    return s


def rewrite_string(s: str, stats: Counter) -> str:
    """s is the string literal including quotes."""
    q = s[0]; body = s[1:-1]
    if "px]" not in body and "font-" not in body:
        return s
    toks = re.split(r'(\s+)', body)
    # font sizes by prefix (old values, before mapping)
    fs_by_pre = {}
    for t in toks:
        m = FS_TOK.match(t)
        if m:
            fs_by_pre.setdefault(m.group(1), float(m.group(2)))
    is_heading = any(t.endswith("font-heading") or t == "font-heading" for t in toks)
    out = []
    for t in toks:
        m = LEAD.match(t)
        if m:
            pre, imp1, n, imp2 = m.group(1), m.group(2), float(m.group(3)), m.group(4)
            fs_old = fs_by_pre.get(pre)
            if fs_old is None and pre:
                fs_old = fs_by_pre.get("")
            if fs_old:
                fs_new = map_fs_ctx(fs_old, is_heading)
                r = clamp_ratio(n / fs_old, fs_new)
                t = f"{pre}{imp1}leading-[{fmt(r)}]{imp2}"; stats["leading->ratio"] += 1
            else:
                t = f"{pre}{imp1}leading-[{fmt(round(n * 0.9))}px]{imp2}"; stats["leading-scaled"] += 1
        elif LEAD_REL.match(t) and (fs_by_pre.get(LEAD_REL.match(t).group(1)) or fs_by_pre.get("")):
            m2 = LEAD_REL.match(t); pre = m2.group(1)
            fs_old = fs_by_pre.get(pre) or fs_by_pre.get("")
            r = float(m2.group(3)) / (100 if m2.group(4) else 1)
            if r < 3:  # ratio / percent, not an absolute number
                r2 = clamp_ratio(r, map_fs_ctx(fs_old, is_heading))
                t = f"{pre}{m2.group(2)}leading-[{fmt(r2)}]{m2.group(5)}"; stats["leading rel clamped"] += 1
        elif is_heading and re.fullmatch(r'((?:[^\s:]+:)*)font-medium', t):
            t = t[: -len("font-medium")] + "font-semibold"; stats["heading medium->semibold"] += 1
        elif is_heading and re.fullmatch(r'((?:[^\s:]+:)*)font-normal', t):
            t = t[: -len("font-normal")] + "font-medium"; stats["heading normal->medium"] += 1
        elif re.fullmatch(r'((?:[^\s:]+:)*)font-light', t):
            t = t[: -len("font-light")] + "font-normal"; stats["light->normal"] += 1
        out.append(t)
    body = "".join(out)
    body = TOKEN_FS.sub(lambda m: f"{m.group(1)}text-[{fmt(map_fs_ctx(float(m.group(2)), is_heading))}px]{m.group(3)}", body)
    return q + body + q


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--root", default=os.path.join(os.path.dirname(__file__), "..", "apps", "web", "src"))
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    total = Counter(); changed = 0
    for dp, dn, fn in os.walk(root):
        if os.sep + os.path.join("components", "ui") in dp:
            continue
        for f in fn:
            if not f.endswith(".tsx"):
                continue
            p = os.path.join(dp, f); src = open(p).read()
            stats = Counter()
            new = STRING.sub(lambda m: rewrite_string(m.group(0), stats), src)
            stats["fs"] = len(TOKEN_FS.findall(src))
            if new != src:
                changed += 1; total.update(stats)
                if a.apply:
                    open(p, "w").write(new)
                print(f"{os.path.relpath(p, root)}: " + ", ".join(f"{k} {v}" for k, v in stats.items() if v))
    print(f"\nfiles changed: {changed}  totals: {dict(total)}  ({'APPLIED' if a.apply else 'dry run'})")


if __name__ == "__main__":
    sys.exit(main())
