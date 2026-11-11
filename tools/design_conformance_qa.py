"""Design-system conformance QA (docs/DESIGN-SYSTEM.md).

Per page and viewport, measures the rendered site against the written guidelines:
  - type scale by role (home display, page h1, section h2, card h3, lead/body/small text, uppercase labels, big numbers,
    menu items) and the minimum-size rule (no text < 12px except uppercase labels >= 10.5px)
  - horizontal gutters: menu bar (px-gutter-nav) and full-width content blocks (px-gutter), incl. the centred 1920 frame
  - header height at the top of the page and compact after scrolling
  - section vertical padding (distribution)
  - home hero: height (clamp), globe offset, CMS autoplay duration and measured slide-change intervals
usage: python3 tools/design_conformance_qa.py BASE OUTDIR [--pages /,/services] [--only "FHD monitor,..."] [--jobs 3]
Writes OUTDIR/conformance.json (raw) and OUTDIR/summary.md.
"""
import argparse, asyncio, json, os, time
from collections import defaultdict
from playwright.async_api import async_playwright

VIEWPORTS = [
    ("Phone 390", 390, 844, True),
    ("XGA projector", 1024, 768, False),
    ("HD projector", 1280, 720, False),
    ("WXGA projector", 1280, 800, False),
    ("Laptop 1366", 1366, 657, False),
    ("Laptop 1536 (FHD 125%)", 1536, 740, False),
    ("FHD monitor", 1920, 960, False),
    ("FHD TV / projector fullscreen", 1920, 1080, False),
    ("WUXGA projector", 1920, 1200, False),
    ("UW-FHD 2560x1080", 2560, 960, False),
    ("QHD monitor", 2560, 1320, False),
    ("UWQHD 3440x1440", 3440, 1320, False),
    ("4K monitor 100%", 3840, 2040, False),
    ("4K TV fullscreen", 3840, 2160, False),
    ("Super-ultrawide 5120x1440", 5120, 1320, False),
]
PAGES = [
    "/", "/services", "/services/digital-transformation", "/services/digital-transformation/app-modernisation",
    "/solutions", "/solutions/ai-code-assurance", "/products-and-accelerators", "/products-and-accelerators/linkworks",
    "/industries", "/industries/telecom", "/company/about-us", "/contact-us", "/events",
    "/events/africa-tech-festival-2026", "/careers", "/company/blog", "/privacy-policy",
]
TIMING_SIZES = ["HD projector", "FHD TV / projector fullscreen", "4K TV fullscreen", "Phone 390"]
QUIET = "try{sessionStorage.setItem('lf-promo-v2:atf-2026','closed')}catch(e){}"

# ---- guidelines (DESIGN-SYSTEM.md "Type scale" / "Type ramp" (11 Nov 2026), "Spacing", 10 Nov 23:42 round) ----------
RAMP = [10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15.5, 16, 16.5, 18, 20, 21.5, 24, 27.5, 34.5, 40, 41.5, 46, 48, 55]
EXACT = {  # role: (desktop 1026-1560, wide >=1561, mobile <=768)
    "pageH1": (34.5, 41.5, 24),
    "menu": (13, 13.5, None),
}
RANGES = {  # role: {column: (lo, hi)}; tablet = union of mobile and desktop
    "h2": {"desktop": (27.5, 40), "wide": (27.5, 46), "mobile": (21.5, 27.5)},      # section title / statement
    "h3": {"desktop": (14, 24), "wide": (14.5, 24), "mobile": (13.5, 21.5)},        # card / item / feature title
    "h4": {"desktop": (12.5, 16.5), "wide": (12.5, 18), "mobile": (12.5, 16.5)},
    "text": {"desktop": (12, 16.5), "wide": (12, 18), "mobile": (12, 16)},          # small / body / lead (16 = form fields)
    "footerText": {"desktop": (12, 14.5), "wide": (12, 14.5), "mobile": (12, 14.5)},
    "button": {"desktop": (12, 16), "wide": (12, 16.5), "mobile": (12, 16)},
    "number": {"desktop": (18, 55), "wide": (18, 55), "mobile": (16.5, 41.5)},
    "label": {"desktop": (10.5, 13.5), "wide": (10.5, 13.5), "mobile": (10.5, 12.5)},  # uppercase / letter-spaced
    "chip": {"desktop": (11, 13.5), "wide": (11, 13.5), "mobile": (11, 13.5)},       # pills, tags, badges, pill tabs
    "band": {"desktop": (18, 24), "wide": (18, 27.5), "mobile": (16.5, 21.5)},      # compact band headings (data-type-role="band")
}
TOL = 0.3


def column(w):
    return "mobile" if w <= 768 else "tablet" if w <= 1025 else "desktop" if w < 1561 else "wide"


def short(w, h):
    return w >= 769 and h <= 760


def expected_type(role, w, h):
    """Allowed sizes (set) or (lo, hi) range."""
    col = column(w)
    if role == "display":  # home hero h1/h2: 40 / 46 / 27.5; 34.5 at <=1180px wide or on short screens
        if col == "mobile": return {27.5}
        if col == "wide": return {34.5} if short(w, h) else {46}
        return {34.5} if (w <= 1180 or short(w, h)) else {40}
    if role in EXACT:
        d, wd, m = EXACT[role]
        if col == "desktop": return {d}
        if col == "wide": return {wd}
        if col == "mobile": return {m} if m else None
        if role == "menu": return {12.5, 13}  # 1024-1025px: full menu compacted to fit
        return (min(x for x in (m, d) if x), max(d, m or d))
    if role in RANGES:
        r = RANGES[role]
        if col == "tablet": return (min(r["mobile"][0], r["desktop"][0]), max(r["mobile"][1], r["desktop"][1]))
        return r[col]
    return None


def on_scale(size, exp):
    if exp is None: return True
    if isinstance(exp, tuple): return exp[0] - TOL <= size <= exp[1] + TOL
    return any(abs(size - e) <= TOL for e in exp)


def on_ramp(size):
    return any(abs(size - r) <= 0.05 for r in RAMP)


def gutter_content(w, base):
    if w < 640: return 20
    if w < 1025: return 40
    if w < 1281: return 96
    if w < 1561: return 128
    return max(144, (base - 1920) / 2 + 144)


def gutter_nav(w, base):
    if w < 640: return 20
    if w < 1561: return 40
    return max(48, (base - 1920) / 2 + 48)


def header_expected(w):  # (top, compact) incl. 1px bottom border
    if w < 640: return (65, 57)
    if w < 1561: return (73, 61)
    return (85, 65)


def hero_height_expected(w, h):
    if w <= 768: return 960
    lo, hi = (720, 1000) if w >= 1561 else (650, 860)
    return max(lo, min(h, hi))


def globe_right_expected(w):
    if w <= 768: return None
    if w < 1180: return 48
    if w < 1281: return 72
    if w < 1561: return 104
    return max(120, w / 2 - 840)


COLLECT = r"""
() => {
  const vw = document.documentElement.clientWidth;
  const hero = document.querySelector('section[aria-label="Linkfields highlights"]');
  const bar = document.querySelector('header [class*="px-gutter-nav"]');
  const out = { texts: {}, minViol: [], gutters: [], sections: [], vw, menuPad: null, menuSizes: [] };
  const sig = (el) => {
    const c = (typeof el.className === 'string' ? el.className : '').split(/\s+/).filter(t => /(^|:)text-\[|(^|:)text-(xs|sm|base|lg|[2-9]?xl)\b/.test(t));
    return el.tagName.toLowerCase() + (c.length ? '.' + c.slice(0, 4).join('.') : '');
  };
  const add = (role, size, el, txt) => {
    const k = role + '|' + size;
    const e = out.texts[k] || (out.texts[k] = { role, size, n: 0, chars: 0, sigs: {} });
    e.n++; e.chars += txt.length;
    const s = sig(el); if (!e.sigs[s]) e.sigs[s] = txt.slice(0, 48);
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const t = walker.currentNode; const txt = t.textContent.replace(/\s+/g, ' ').trim();
    if (txt.length < 2) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    // .sr-only text (e.g. the product name kept in a logo banner's h1) is never drawn, so it has no type size to audit
    if (el.closest('script,style,noscript,svg,.sr-only,[aria-hidden="true"] [data-marquee-copy],[data-marquee-copy]')) continue;
    if (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: false })) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el);
    const size = Math.round(parseFloat(cs.fontSize) * 100) / 100;
    const upper = cs.textTransform === 'uppercase';
    const ls = parseFloat(cs.letterSpacing) || 0;
    const heading = el.closest('h1,h2,h3,h4,h5,h6');
    const inHeader = !!el.closest('header'), inFooter = !!el.closest('footer'), inHero = hero && hero.contains(el);
    const headingFont = /jakarta/i.test(cs.fontFamily);
    let role;
    const forced = el.closest('[data-type-role]');
    if (forced) role = forced.getAttribute('data-type-role');
    else if (inHeader) {
      const nav = el.closest('nav'); const link = el.closest('a,button');
      if (nav && link && !el.closest('[role="menu"],[data-mega],[id*="mega"]') && r.top < 120) role = 'menu';
      else role = 'header';
    } else if (heading) {
      const tag = heading.tagName;
      if (inHero && (tag === 'H1' || tag === 'H2')) role = 'display';
      else if (tag === 'H1') role = 'pageH1';
      else if (tag === 'H2') role = 'h2';
      else if (tag === 'H3') role = 'h3';
      else role = 'h4';
    } else if ((upper || txt === txt.toUpperCase() && /[A-Z]{3}/.test(txt)) && ls > 0.5) role = 'label';
    else if (el.closest('[data-chip]') && size <= 13.5) role = 'chip';  // explicit chips stay chips when a long label wraps
    else if ((el.closest('[class~="rounded-full"]') && el.closest('[class~="rounded-full"]').contains(el) && size <= 13.5 &&
              el.closest('[class~="rounded-full"]').getBoundingClientRect().height <= 40)) role = 'chip';
    else if (headingFont && (size >= 18 || (innerWidth < 768 && size >= 16.5 && txt.length <= 8))) role = 'number';  // stats and strip values: 20+, ISO, Level 1
    else if (inFooter) role = 'footerText';
    else if (el.closest('button,[class*="btn-"]')) role = 'button';
    else role = 'text';
    add(role, size, el, txt);
    const small = role === 'label' || role === 'chip';
    if ((!small && size < 11.95) || (small && size < 10.45)) out.minViol.push({ size, sig: sig(el), txt: txt.slice(0, 48), role });
  }
  if (bar) out.menuPad = parseFloat(getComputedStyle(bar).paddingLeft);
  for (const el of document.querySelectorAll('main [class~="px-gutter"]')) {
    const r = el.getBoundingClientRect(); if (r.width < vw * 0.98 || r.height < 1) continue;
    out.gutters.push({ pad: parseFloat(getComputedStyle(el).paddingLeft), base: r.width, sig: sig(el) });
  }
  const tops = [...document.querySelectorAll('main section')].filter(s => !s.parentElement.closest('main section'));
  for (const s of tops) {
    if (hero && s === hero) continue;
    const r = s.getBoundingClientRect(); if (r.height < 40) continue;
    let cs = getComputedStyle(s); let pt = parseFloat(cs.paddingTop), pb = parseFloat(cs.paddingBottom);
    if (pt === 0 && pb === 0 && s.firstElementChild) { cs = getComputedStyle(s.firstElementChild); pt = parseFloat(cs.paddingTop); pb = parseFloat(cs.paddingBottom); }
    out.sections.push({ pt, pb, label: (s.getAttribute('aria-label') || s.id || (s.querySelector('h2')?.textContent || '')).slice(0, 40) });
  }
  if (hero) {
    const g = [...hero.querySelectorAll(':scope > div[aria-hidden]')].find(d => /aspect-square/.test(d.className));
    const gr = g ? g.getBoundingClientRect() : null;
    const dot = hero.querySelector('.hero-progress');
    out.hero = {
      height: Math.round(hero.getBoundingClientRect().height),
      globeRight: g ? parseFloat(getComputedStyle(g).right) : null,
      globeW: gr ? Math.round(gr.width) : null,
      autoplay: hero.querySelector('[data-autoplay]')?.getAttribute('data-autoplay') || null,
      progressDuration: dot ? getComputedStyle(dot).animationDuration : null,
    };
  }
  return out;
}
"""

HDR_H = "() => Math.round(document.querySelector('header').getBoundingClientRect().height)"


async def measure(browser, vp, path, base):
    name, w, h, mob = vp
    ctx = await browser.new_context(viewport={"width": w, "height": h}, is_mobile=mob, has_touch=mob,
                                    device_scale_factor=1)
    await ctx.add_init_script(QUIET)
    pg = await ctx.new_page()
    rec = {"viewport": name, "w": w, "h": h, "page": path}
    try:
        await pg.goto(base + path, wait_until="load", timeout=90000)
        await pg.wait_for_timeout(900)
        await pg.mouse.move(w - 4, 4)
        rec.update(await pg.evaluate(COLLECT))
        rec["hdrTop"] = await pg.evaluate(HDR_H)
        await pg.evaluate("window.scrollTo({top: 900, behavior: 'instant'})")
        try:  # the scroll handler can run late on heavy 4K+ renders; wait for the compact state before timing the height
            await pg.wait_for_function("document.documentElement.getAttribute('data-hdr') === 'compact'", timeout=5000)
        except Exception:  # noqa: BLE001 - recorded below as hdrState
            pass
        await pg.wait_for_timeout(500)
        last = None
        for _ in range(20):  # wait until the height transition has finished (slow to paint on 4K+ test screens)
            cur = await pg.evaluate(HDR_H)
            if cur == last: break
            last = cur; await pg.wait_for_timeout(250)
        rec["hdrCompact"] = last
        rec["hdrState"] = await pg.evaluate("document.documentElement.getAttribute('data-hdr')")
    except Exception as e:  # noqa: BLE001
        rec["err"] = str(e)[:200]
    await ctx.close()
    return rec


TIMING = r"""
async (ms) => {
  const hero = document.querySelector('section[aria-label="Linkfields highlights"]');
  if (!hero) return null;
  const idx = () => [...hero.querySelectorAll('[aria-label^="Go to slide"]')].findIndex(b => b.getAttribute('aria-current') === 'true');
  const changes = []; let last = idx();
  const t0 = performance.now();
  await new Promise((res) => {
    const iv = setInterval(() => {
      const i = idx();
      if (i !== last) { changes.push([Math.round(performance.now() - t0), i]); last = i; }
      if (performance.now() - t0 > ms) { clearInterval(iv); res(); }
    }, 20);
  });
  return changes;
}
"""


async def timing(browser, vp, base):
    name, w, h, mob = vp
    ctx = await browser.new_context(viewport={"width": w, "height": h}, is_mobile=mob, has_touch=mob)
    await ctx.add_init_script(QUIET)
    pg = await ctx.new_page()
    await pg.goto(base + "/", wait_until="load", timeout=90000)
    await pg.wait_for_timeout(500)
    if not mob:
        await pg.mouse.move(w - 6, h // 2)  # over the globe side, not the slide copy
    ch = await pg.evaluate(TIMING, 17500)
    dur = await pg.evaluate("getComputedStyle(document.querySelector('.hero-progress')).animationDuration")
    await ctx.close()
    iv = [b[0] - a[0] for a, b in zip(ch, ch[1:])]
    return {"viewport": name, "changes": ch, "intervals": iv, "progressDuration": dur}


def summarise(rows, timings, out):
    lines = ["# Design-system conformance - production", ""]
    by_vp = defaultdict(list)
    for r in rows: by_vp[r["viewport"]].append(r)
    errs = [r for r in rows if r.get("err")]
    lines.append(f"Renders: {len(rows)} ({len(by_vp)} sizes x {len(rows) // max(1, len(by_vp))} pages), errors: {len(errs)}")
    lines.append("")
    lines.append("| Size | Col | On ramp | Role rules met | Off-scale roles | Min-size violations | Menu inset (exp) | Content gutter mismatches | Header top/compact (exp) | Hero h (exp) | Globe right (exp) |")
    lines.append("|---|---|---|---|---|---|---|---|---|---|---|")
    off_detail = defaultdict(lambda: defaultdict(lambda: {"n": 0, "pages": set(), "sigs": {}}))
    minv_all = defaultdict(lambda: {"n": 0, "pages": set(), "txt": ""})
    for name, w, h, mob in VIEWPORTS:
        rs = [r for r in by_vp.get(name, []) if not r.get("err")]
        if not rs: continue
        tot = ok = 0; off_roles = defaultdict(int); minv = 0; gm = 0; rt = rok = 0; offramp = defaultdict(int)
        for r in rs:
            for e in r["texts"].values():
                rt += e["n"]
                if on_ramp(e["size"]): rok += e["n"]
                else: offramp[e["size"]] += e["n"]
                if e["role"] in ("header",): continue
                exp = expected_type(e["role"], w, h)
                if exp is None: continue
                tot += e["n"]
                if on_scale(e["size"], exp): ok += e["n"]
                else:
                    off_roles[e["role"]] += e["n"]
                    d = off_detail[(name, column(w))][(e["role"], e["size"])]
                    d["n"] += e["n"]; d["pages"].add(r["page"]); d["sigs"].update(e["sigs"])
            for m in r["minViol"]:
                minv += 1; k = (m["sig"], m["size"]); minv_all[k]["n"] += 1; minv_all[k]["pages"].add(r["page"]); minv_all[k]["txt"] = m["txt"]
            for g in r["gutters"]:
                if abs(g["pad"] - gutter_content(w, g["base"])) > 1: gm += 1
        mp = sorted({round(r["menuPad"] or 0, 1) for r in rs if r.get("menuPad") is not None})
        hdr = sorted({(r["hdrTop"], r["hdrCompact"]) for r in rs})
        home = next((r for r in rs if r["page"] == "/" and r.get("hero")), None)
        he = f'{home["hero"]["height"]} ({hero_height_expected(w, h)})' if home else "-"
        gr = globe_right_expected(w)
        ge = f'{home["hero"]["globeRight"]:.0f} ({gr:.0f})' if home and gr is not None and home["hero"]["globeRight"] is not None else "n/a (phone)"
        pct = 100 * ok / max(tot, 1)
        rp = 100 * rok / max(rt, 1)
        ramp_note = f" off: {dict(sorted(offramp.items()))}" if offramp else ""
        lines.append(f"| {name} {w}x{h} | {column(w)} | {rp:.1f}%{ramp_note} | {pct:.1f}% ({ok}/{tot}) | {', '.join(f'{k} {v}' for k, v in sorted(off_roles.items())) or '-'} | {minv} | {mp} ({gutter_nav(w, w if w < 1925 else w):.0f}) | {gm} | {hdr} ({header_expected(w)}) | {he} | {ge} |")
    lines += ["", "## Off-scale type (by size column)", ""]
    for (name, col), d in off_detail.items():
        for (role, size), v in sorted(d.items(), key=lambda kv: -kv[1]["n"]):
            sig, txt = next(iter(v["sigs"].items()))
            lines.append(f"- {name} [{col}] {role} {size}px x{v['n']} on {len(v['pages'])} pages - e.g. `{sig}` \"{txt}\"")
    lines += ["", "## Minimum-size violations (non-label text < 12px, labels < 10.5px)", ""]
    for (sig, size), v in sorted(minv_all.items(), key=lambda kv: -kv[1]["n"])[:40]:
        lines.append(f"- {size}px x{v['n']} on {len(v['pages'])} pages - `{sig}` \"{v['txt']}\"")
    lines += ["", "## Section vertical padding (top/bottom px, all pages)", ""]
    for name, w, h, mob in VIEWPORTS:
        rs = [r for r in by_vp.get(name, []) if not r.get("err")]
        c = defaultdict(int)
        for r in rs:
            for s in r["sections"]: c[(s["pt"], s["pb"])] += 1
        top = sorted(c.items(), key=lambda kv: -kv[1])[:6]
        lines.append(f"- {name}: " + ", ".join(f"{int(a)}/{int(b)} x{n}" for (a, b), n in top))
    lines += ["", "## Hero autoplay (home)", ""]
    for t in timings:
        lines.append(f"- {t['viewport']}: progress animation {t['progressDuration']}; slide changes at {[c[0] for c in t['changes']]} ms -> intervals {t['intervals']} ms")
    open(os.path.join(out, "summary.md"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines))


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base"); ap.add_argument("out")
    ap.add_argument("--pages", default=""); ap.add_argument("--only", default="")
    ap.add_argument("--jobs", type=int, default=3); ap.add_argument("--no-timing", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    pages = [p for p in a.pages.split(",") if p] or PAGES
    vps = [v for v in VIEWPORTS if not a.only or v[0] in a.only.split(",")]
    t0 = time.time()
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium")
        sem = asyncio.Semaphore(a.jobs); rows = []

        async def one(vp, path):
            async with sem:
                r = await measure(b, vp, path, a.base); rows.append(r)
                print(json.dumps({"vp": r["viewport"], "page": path, "err": r.get("err"), "hdr": [r.get("hdrTop"), r.get("hdrCompact")]}), flush=True)

        await asyncio.gather(*(one(vp, pth) for vp in vps for pth in pages))
        timings = []
        if not a.no_timing:
            for vp in vps:
                if vp[0] in TIMING_SIZES:
                    timings.append(await timing(b, vp, a.base))
        await b.close()
    json.dump({"rows": rows, "timings": timings}, open(os.path.join(a.out, "conformance.json"), "w"))
    summarise(rows, timings, a.out)
    print(f"done in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    asyncio.run(main())
