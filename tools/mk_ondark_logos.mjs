// Generate "on-dark" product logos for the dark page hero from the light-background originals.
//   node tools/mk_ondark_logos.mjs        (run from the repo root; uses sharp from apps/web/node_modules)
// seed/assets/custom/logos/<slug>.png  ->  seed/assets/custom/logos/on-dark/<slug>-on-dark.png
// Rules per pixel (alpha kept, so anti-aliased edges stay smooth):
//   - black / navy lettering (lightness < 0.25) and the grey anti-aliasing around it (sat < 0.2) -> white
//   - dark royal blue (hue 205-245, sat > 0.45, l < 0.55) -> same hue, lightness 0.68 (readable on dark)
//   - everything else (orange, yellow, bright blue icons)  -> unchanged
// Review the output by eye; replace with official dark-background artwork when the brand owner supplies it.
import { createRequire } from "node:module";
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
// sharp ships with Next.js (pnpm keeps it next to next), so resolve it through next's own package.
const webRequire = createRequire(path.join(root, "apps/web/package.json"));
const sharp = createRequire(webRequire.resolve("next/package.json"))("sharp");
const src = path.join(root, "seed/assets/custom/logos");
const out = path.join(src, "on-dark");
mkdirSync(out, { recursive: true });

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

for (const file of readdirSync(src).filter((f) => f.endsWith(".png"))) {
  const { data, info } = await sharp(path.join(src, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    let rgb = null;
    if (l < 0.25 || (s < 0.2 && l < 0.8)) rgb = [255, 255, 255];
    else if (h >= 205 && h <= 245 && s > 0.45 && l < 0.55) rgb = hslToRgb(h, s, 0.68);
    if (rgb) [data[i], data[i + 1], data[i + 2]] = rgb;
  }
  const name = file.replace(/\.png$/, "-on-dark.png");
  await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toFile(path.join(out, name));
  console.log("wrote", path.join("seed/assets/custom/logos/on-dark", name));
}
