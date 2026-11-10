/**
 * Turbopack/webpack CSS loader — makes Tailwind's arbitrary `max-[Npx]:` variants inclusive.
 *
 * Tailwind v4 compiles `max-[1440px]:` to `@media (width < 1440px)` (i.e. "below 1440"), while the original
 * linkfields.com stylesheet (which this site reproduces) uses classic `@media (max-width: 1440px)` (i.e. "1440 and
 * below"). The two only disagree at exactly N px — but 1440, 1560, 1025, 768 … are very common viewport widths,
 * so at those widths the layout would otherwise differ from the original.
 *
 * Only pixel values are rewritten: named breakpoints (`max-sm`, `max-lg`, … in rem) keep Tailwind's semantics.
 * Runs after `@tailwindcss/turbopack` (see `turbopack.rules` in next.config.ts).
 */
const PX = "(\\d+(?:\\.\\d+)?)px";

module.exports = function inclusiveMaxMedia(source) {
  return String(source)
    // Tailwind v4 range syntax: (width < 1440px)  ->  (max-width: 1440px)
    .replace(new RegExp(`\\(\\s*width\\s*<\\s*${PX}\\s*\\)`, "g"), "(max-width: $1px)")
    // Down-levelled forms produced by Lightning CSS: not (min-width: 1440px) / not all and (min-width: 1440px)
    .replace(new RegExp(`not\\s+(?:all\\s+and\\s+)?\\(\\s*min-width\\s*:\\s*${PX}\\s*\\)`, "g"), "(max-width: $1px)");
};
