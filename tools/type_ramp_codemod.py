"""Snap every arbitrary px font size to the design-system type ramp and enforce the 12px minimum for non-label text.
usage: python3 tools/type_ramp_codemod.py [--dry]   (run from the repo root)
Rules (docs/DESIGN-SYSTEM.md "Type ramp", 11 Nov 2026):
  - every `text-[Npx]` (any variant prefix) must be a ramp step; other values move to the nearest step, ties go down
  - text below 12px becomes 12px, except labels (uppercase or letter-spaced, 10.5-11.5px) and chips/badges
    (pill `rounded-full` elements, 11-11.5px)
"""
import os, re, sys
from collections import Counter

RAMP = [10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15.5, 16, 16.5, 18, 20, 21.5, 24, 27.5, 34.5, 40, 41.5, 46, 48, 55]
ROOT = "apps/web/src"
TOK = re.compile(r'(?<![\w\[\-])((?:[a-z0-9\-\[\]\(\)=<>:./]+:)*)text-\[([0-9.]+)px\]')
STR = re.compile(r'"[^"\n]*"|`[^`]*`|\'[^\'\n]*\'')


def snap(v):
    best = min(RAMP, key=lambda r: (abs(r - v), r))  # nearest, ties -> smaller
    return best


def fmt(v):
    return f"{v:g}"


def main():
    dry = "--dry" in sys.argv
    changes = Counter(); files = 0; examples = {}
    for root, _, fs in os.walk(ROOT):
        for f in fs:
            if not f.endswith((".tsx", ".ts")): continue
            p = os.path.join(root, f); s = open(p).read()

            def fix_string(m):
                lit = m.group(0)
                if "text-[" not in lit: return lit
                upper = re.search(r'(?<![\w-])(uppercase|rounded-full)(?![\w-])|tracking-\[0?\.(0[5-9]|[1-9])', lit) is not None

                def fix_tok(t):
                    pre, val = t.group(1), float(t.group(2))
                    # `max-sm:text-[16px]` keeps form fields at 16px on phones (no iOS zoom) - leave as is
                    if val == 16 and "max-sm:" in pre: return t.group(0)
                    new = snap(val)
                    if new < 12 and not upper: new = 12
                    if new != val:
                        key = f"{pre}{fmt(val)} -> {fmt(new)}" + (" (label/chip)" if upper else "")
                        changes[key] += 1; examples.setdefault(key, p.replace(ROOT + "/", ""))
                        return f"{pre}text-[{fmt(new)}px]"
                    return t.group(0)
                return TOK.sub(fix_tok, lit)
            n = STR.sub(fix_string, s)
            if n != s:
                files += 1
                if not dry: open(p, "w").write(n)
    for k, v in sorted(changes.items(), key=lambda kv: -kv[1]):
        print(f"{v:4}  {k:40}  e.g. {examples[k]}")
    print(f"{sum(changes.values())} class changes in {files} files{' (dry run)' if dry else ''}")


if __name__ == "__main__":
    main()
