import Image, { type ImageProps } from "next/image";

import type { Media } from "@/lib/content/types";
import { isSvg, mediaUrl } from "@/lib/media";

type Props = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  media?: Media | null;
  alt?: string;
  /** Override intrinsic size (defaults to the media's own width/height). */
  width?: number;
  height?: number;
};

/**
 * next/image for CMS media. SVGs bypass the optimizer; everything else is resized and served as
 * AVIF/WebP. Use `fill` + `sizes` for background/cover images.
 */
export function CmsImage({ media, alt, width, height, fill, sizes, unoptimized, ...rest }: Props) {
  const src = mediaUrl(media);
  if (!src) return null;
  const altText = alt ?? media?.alternativeText ?? "";
  const skipOptimizer = isSvg(media) || unoptimized;

  if (fill) {
    return <Image src={src} alt={altText} fill sizes={sizes ?? "100vw"} unoptimized={skipOptimizer} {...rest} />;
  }
  return (
    <Image
      src={src}
      alt={altText}
      width={width ?? media?.width ?? 800}
      height={height ?? media?.height ?? 600}
      sizes={sizes}
      unoptimized={skipOptimizer}
      {...rest}
    />
  );
}
