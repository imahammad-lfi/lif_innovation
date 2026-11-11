#!/usr/bin/env python3
"""Site-wide link audit (HTTP level, no browser).

    python3 tools/link_audit.py [BASE] [--out /tmp/link_audit.json] [--external] [--jobs 8]

1. Page list = sitemap.xml of BASE + every `path` in seed/data/pages (+ insights / events from the sitemap).
2. Every page is fetched; all <a href> values and all element ids are collected from the server HTML.
3. Links that only render on interaction (mega menu, drawer, dialogs, CTAs) are added from seed/data JSON
   (any string value of an href/url-like key), attributed to the page that holds them (global = all pages).
4. Each internal target is requested (redirects followed): must end 200. A `#fragment` must exist as an id on the
   final page (same-page `#x` resolves to the page itself). Redirect chains are reported, not failed.
   An error page served with 200 (Next.js "soft 404" on a path's first request) counts as broken.
5. --external also probes external http(s) links (HEAD then GET); 401/403/429/999 are reported as "guarded"
   (bot protection, e.g. LinkedIn) rather than broken.
Exit code 1 if any internal link or fragment is broken.
"""
import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "seed" / "data"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36 LinkfieldsLinkAudit"
URL_KEYS = re.compile(r"(href|url|link|path)$", re.I)
SKIP_SCHEMES = ("mailto:", "tel:", "javascript:", "data:", "blob:")


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hrefs, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "a" and a.get("href") is not None:
            self.hrefs.append(a["href"])


def fetch(url, method="GET", timeout=60):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA, "Accept": "text/html,*/*"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = (r.read() if method == "GET" else b"").decode("utf-8", "ignore")
            status = r.status
            # Next.js can stream the not-found/error page with 200 on a path's first request ("soft 404").
            if status == 200 and ('id="__next_error__"' in body or "<title>Page not found" in body):
                status = "soft-404"
            return status, r.geturl(), body
    except urllib.error.HTTPError as e:
        return e.code, e.geturl() if hasattr(e, "geturl") else url, ""
    except Exception as e:  # noqa: BLE001
        return f"ERR {type(e).__name__}: {e}"[:160], url, ""


def data_links(obj, out):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, str) and URL_KEYS.search(k) and (v.startswith("/") or v.startswith("http") or v.startswith("#")):
                if k.lower() == "path" and not v.startswith("/"):
                    continue
                out.add(v)
            else:
                data_links(v, out)
    elif isinstance(obj, list):
        for v in obj:
            data_links(v, out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base", nargs="?", default="http://127.0.0.1:3001")
    ap.add_argument("--out", default="/tmp/link_audit.json")
    ap.add_argument("--external", action="store_true")
    ap.add_argument("--jobs", type=int, default=8)
    a = ap.parse_args()
    base = a.base.rstrip("/")
    host = urlsplit(base).netloc

    # 1. Pages
    pages = set()
    st, _, xml = fetch(base + "/sitemap.xml")
    for loc in re.findall(r"<loc>([^<]+)</loc>", xml):
        pages.add(urlsplit(loc).path or "/")
    page_data = {}
    for f in sorted((DATA / "pages").glob("*.json")):
        d = json.loads(f.read_text())
        if d.get("path"):
            pages.add(d["path"])
            page_data[d["path"]] = d
    print(f"sitemap {st}; pages to crawl: {len(pages)}")

    # 2. Crawl pages
    def crawl(p):
        st, final, html = fetch(base + p)
        c = Collector()
        if html:
            c.feed(html)
        return p, st, urlsplit(final).path, c.hrefs, c.ids

    crawled = {}
    with ThreadPoolExecutor(a.jobs) as ex:
        for p, st, final, hrefs, ids in ex.map(crawl, sorted(pages)):
            crawled[p] = {"status": st, "final": final, "hrefs": hrefs, "ids": ids}
    bad_pages = {p: v["status"] for p, v in crawled.items() if v["status"] != 200}
    print(f"crawled {len(crawled)}; non-200 pages: {bad_pages or 'none'}")

    # 3. Links per source page (HTML + data)
    global_links = set()
    data_links(json.loads((DATA / "global.json").read_text()), global_links)
    sources = {}  # link -> set(source pages)

    def add(link, src):
        sources.setdefault(link.strip(), set()).add(src)

    for p, v in crawled.items():
        for h in v["hrefs"]:
            add(h, p)
    for p, d in page_data.items():
        s = set()
        data_links(d.get("sections") or [], s)
        for h in s:
            add(h, p + " (cms)")
    for h in global_links:
        add(h, "global (menu/footer/dialogs)")
    for f in sorted(DATA.glob("*.json")):
        if f.name in ("global.json",):
            continue
        s = set()
        try:
            data_links(json.loads(f.read_text()), s)
        except Exception:  # noqa: BLE001
            continue
        for h in s:
            add(h, f.name + " (cms)")

    # 4. Classify
    internal, external, other = {}, {}, {}
    for link, srcs in sources.items():
        if not link or link.startswith(SKIP_SCHEMES):
            other[link] = sorted(srcs)
            continue
        if link.startswith("#"):
            for s in srcs:
                page = s.split(" ")[0]
                if page.startswith("/"):
                    internal.setdefault(page + link, set()).add(s)
            continue
        u = urlsplit(link)
        if u.scheme in ("http", "https") and u.netloc and u.netloc not in (host, "www.linkfields.com", "linkfields.com"):
            external.setdefault(link, set()).update(srcs)
            continue
        if u.scheme in ("http", "https") and u.netloc in ("www.linkfields.com", "linkfields.com"):
            # Absolute links to the brand domain: check the same path on this build.
            link = urlunsplit(("", "", u.path or "/", u.query, u.fragment))
        internal.setdefault(urljoin("/", link), set()).update(srcs)

    targets = {}
    for link in internal:
        u = urlsplit(link)
        targets.setdefault(urlunsplit(("", "", u.path or "/", u.query, "")), None)

    def check(t):
        p = urlsplit(t).path
        if p in crawled and not urlsplit(t).query:
            v = crawled[p]
            return t, v["status"], v["final"], v["ids"]
        st, final, html = fetch(base + t)
        c = Collector()
        if html:
            c.feed(html)
        return t, st, urlsplit(final).path, c.ids

    with ThreadPoolExecutor(a.jobs) as ex:
        for t, st, final, ids in ex.map(check, sorted(targets)):
            targets[t] = {"status": st, "final": final, "ids": ids}

    broken, redirects, missing_frag = [], [], []
    for link, srcs in sorted(internal.items()):
        u = urlsplit(link)
        t = urlunsplit(("", "", u.path or "/", u.query, ""))
        r = targets[t]
        if r["status"] != 200:
            broken.append({"link": link, "status": r["status"], "from": sorted(srcs)[:6]})
            continue
        if r["final"] != (u.path or "/"):
            redirects.append({"link": link, "to": r["final"], "from": sorted(srcs)[:4]})
        if u.fragment and u.fragment not in r["ids"]:
            missing_frag.append({"link": link, "final": r["final"], "from": sorted(srcs)[:6]})

    ext = []
    if a.external and external:
        def probe(link):
            st, final, _ = fetch(link, "HEAD", 25)
            if not isinstance(st, int) or st >= 400:
                st, final, _ = fetch(link, "GET", 25)
            return link, st, final

        with ThreadPoolExecutor(a.jobs) as ex:
            for link, st, final in ex.map(probe, sorted(external)):
                kind = "ok" if isinstance(st, int) and st < 400 else ("guarded" if st in (401, 403, 429, 999) else "broken")
                ext.append({"link": link, "status": st, "final": final, "kind": kind, "from": sorted(external[link])[:4]})

    report = {
        "base": base,
        "pages": len(crawled),
        "internal_links": len(internal),
        "internal_targets": len(targets),
        "broken": broken,
        "missing_fragments": missing_frag,
        "redirects": redirects,
        "external": ext,
        "external_count": len(external),
        "mail_tel": sorted(k for k in other if k),
    }
    Path(a.out).write_text(json.dumps(report, indent=2, default=list))
    print(f"internal links {len(internal)} -> {len(targets)} targets; broken {len(broken)}; missing #fragments {len(missing_frag)}; redirects {len(redirects)}")
    for b in broken:
        print("  BROKEN", b["status"], b["link"], "from", b["from"][:3])
    for m in missing_frag:
        print("  NO-ID ", m["link"], "->", m["final"], "from", m["from"][:3])
    for r in redirects:
        print("  REDIR ", r["link"], "->", r["to"])
    if ext:
        bad = [e for e in ext if e["kind"] == "broken"]
        g = [e for e in ext if e["kind"] == "guarded"]
        print(f"external {len(ext)}: ok {len(ext) - len(bad) - len(g)}, guarded {len(g)}, broken {len(bad)}")
        for e in bad + g:
            print("  EXT", e["kind"], e["status"], e["link"], "from", e["from"][:2])
    print("mail/tel:", report["mail_tel"])
    sys.exit(1 if broken or missing_frag else 0)


if __name__ == "__main__":
    main()
