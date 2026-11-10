"use client";

import { useEffect, useRef, useState } from "react";
import { CmsImage } from "@/components/cms/cms-image";
import type { Media } from "@/lib/content/types";

type Props = { images?: (Media | null)[] | null };

/** Automatically advancing, swipeable careers gallery. */
export function CareerStrip({ images }: Props) {
  const source = (images ?? []).filter((image): image is Media => Boolean(image?.url));
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    if (source.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % source.length), 2000);
    return () => window.clearInterval(timer);
  }, [source.length]);

  useEffect(() => {
    const updateStep = () => setStep(window.innerWidth <= 768 ? window.innerWidth : window.innerWidth / 4);
    updateStep();
    window.addEventListener("resize", updateStep);
    return () => window.removeEventListener("resize", updateStep);
  }, []);

  if (!source.length) return null;
  const slides = [...source, ...source];

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    swipeStart.current = event.clientX;
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (start === null || Math.abs(event.clientX - start) < 40 || source.length < 2) return;
    setActive((current) => (event.clientX < start ? (current + 1) % source.length : (current - 1 + source.length) % source.length));
  }

  return (
    <div className="touch-pan-y overflow-hidden" aria-roledescription="carousel" aria-label="Linkfields careers" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <div className="flex items-end transition-transform duration-500 ease-in-out motion-reduce:transition-none" style={{ transform: `translate3d(-${active * step}px, 0, 0)` }}>
        {slides.map((image, index) => {
          const large = index % 2 === 0;
          return (
            <div key={`${image.url}-${index}`} aria-hidden={index >= source.length} className="group relative w-1/4 shrink-0 px-3 3xl:px-4 max-[768px]:w-full max-[768px]:px-5">
              <div className={`relative overflow-hidden rounded-2xl ring-1 ring-white/10 ${large ? "h-[320px] 3xl:h-[380px]" : "h-[260px] 3xl:h-[310px]"} max-[768px]:h-[250px]`}>
                <CmsImage media={image} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
