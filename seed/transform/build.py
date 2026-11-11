#!/usr/bin/env python3
"""Build Strapi seed JSON from the crawled site.

    python3 seed/transform/build.py              # everything (core + all families)
    python3 seed/transform/build.py services     # only the given families (and core)

Output (seed/data):
    global.json, blog-posts.json, news-articles.json  <- core.py
    pages/<slug>.json                                 <- families/<family>.py  (one file per page)

Each families/<family>.py module must expose ``build() -> list[dict]`` returning page dicts
created with ``lib.page(...)``. It may also expose ``extra() -> {filename: data}`` for collection
files (e.g. blog-posts.json, news-articles.json).
"""
import importlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import lib  # noqa: E402

OUT = os.path.join(lib.ROOT, "seed", "data")


def page_file(path: str) -> str:
    return "index" if path == "/" else path.strip("/").replace("/", "__")


def write(name, data):
    os.makedirs(os.path.dirname(os.path.join(OUT, name)), exist_ok=True)
    with open(os.path.join(OUT, name), "w") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)


def main(argv):
    wanted = set(argv)
    fam_dir = os.path.join(HERE, "families")
    families = sorted(f[:-3] for f in os.listdir(fam_dir) if f.endswith(".py") and not f.startswith("_"))

    core = importlib.import_module("core")
    for name, data in core.build().items():
        write(name, data)
        print(f"core  -> {name}")

    seen = {}
    for fam in families:
        if wanted and fam not in wanted:
            continue
        mod = importlib.import_module(f"families.{fam}")
        pages = mod.build()
        for p in pages:
            if p["path"] in seen:
                raise SystemExit(f"duplicate path {p['path']} in {fam} and {seen[p['path']]}")
            seen[p["path"]] = fam
            write(f"pages/{page_file(p['path'])}.json", p)
        print(f"{fam:<11} -> {len(pages)} pages: {', '.join(p['path'] for p in pages)}")
        if hasattr(mod, "extra"):
            for name, data in mod.extra().items():
                write(name, data)
                print(f"{fam:<11} -> {name}")


    # Portfolio overlay (5-service structure, hand-authored pages, redirects): always last.
    sys.path.insert(0, os.path.join(lib.ROOT, "seed", "custom"))
    import apply as portfolio_apply  # noqa: E402

    portfolio_apply.main([])


if __name__ == "__main__":
    main(sys.argv[1:])
