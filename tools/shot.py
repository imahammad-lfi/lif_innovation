#!/usr/bin/env python3
"""Screenshot a page of the local clone (or any URL) for visual comparison with the original.

  python3 /home/ubuntu/linkfields/tools/shot.py /services/engineering/devops /tmp/devops.png
  python3 /home/ubuntu/linkfields/tools/shot.py /services/engineering/devops /tmp/devops-m.png --width 390
  python3 /home/ubuntu/linkfields/tools/shot.py https://www.linkfields.com/careers /tmp/orig.png --no-full
  python3 /home/ubuntu/linkfields/tools/shot.py / /tmp/home.png --selector "#overview"   # one element only
  python3 /home/ubuntu/linkfields/tools/shot.py / /tmp/home.png --slice 1400             # also write /tmp/home_0.jpg, _1.jpg ... (720px wide)

Default base URL is http://127.0.0.1:3000 (the shared Next.js dev server). Full-page by default.
Original-site reference screenshots already exist in /home/ubuntu/lf-crawl/shots/<page_key>.jpg
(1440px wide) and /home/ubuntu/lf-crawl/small/<page_key>_<n>.jpg (720px slices).
"""
import argparse
import asyncio

from playwright.async_api import async_playwright


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("out")
    ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--height", type=int, default=900)
    ap.add_argument("--no-full", action="store_true")
    ap.add_argument("--selector")
    ap.add_argument("--base", default="http://127.0.0.1:3000")
    ap.add_argument("--wait", type=int, default=1500, help="ms to wait after load (animations, lazy images)")
    ap.add_argument("--slice", type=int, default=0, help="also split into JPG slices of this many px (scaled to 720 wide)")
    a = ap.parse_args()
    url = a.path if a.path.startswith("http") else a.base.rstrip("/") + a.path
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        # The shared dev server hot-reloads while other work edits components; retry on those interruptions.
        for attempt in range(4):
            pg = await b.new_page(viewport={"width": a.width, "height": a.height})
            try:
                resp = await pg.goto(url, wait_until="networkidle", timeout=120000)
                # scroll through the page so lazy images load
                await pg.evaluate(
                    """async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 250)); } const imgs = [...document.images]; await Promise.race([Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))), new Promise(r => setTimeout(r, 20000))]); window.scrollTo(0, 0); }"""
                )
                await pg.wait_for_timeout(a.wait)
                if a.selector:
                    await pg.locator(a.selector).first.screenshot(path=a.out, timeout=60000)
                else:
                    await pg.screenshot(path=a.out, full_page=not a.no_full, timeout=60000)
                break
            except Exception as e:  # noqa: BLE001
                if attempt == 3:
                    raise
                print(f"retrying after: {str(e).splitlines()[0][:120]}")
                await pg.close()
                await asyncio.sleep(4 + attempt * 4)
        print(f"{resp.status if resp else '?'} {url} -> {a.out}")
        await b.close()
    if a.slice:
        from PIL import Image

        im = Image.open(a.out).convert("RGB")
        w, h = im.size
        base = a.out.rsplit(".", 1)[0]
        n = 0
        for top in range(0, h, a.slice):
            part = im.crop((0, top, w, min(h, top + a.slice)))
            if w > 720:
                part = part.resize((720, round(part.height * 720 / w)))
            part.save(f"{base}_{n}.jpg", quality=80)
            n += 1
        print(f"{n} slices -> {base}_<n>.jpg")


asyncio.run(main())
