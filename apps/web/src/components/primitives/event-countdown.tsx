"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { countdownState, sastDay, sastTime, splitDuration, type EventSchedule } from "@/lib/events";
import { cn } from "@/lib/utils";

/* Second-resolution clock; 0 while server rendering / hydrating (renders a stable placeholder). */
const subscribe = (cb: () => void) => {
  const t = window.setInterval(cb, 1000);
  return () => window.clearInterval(t);
};
const snapshot = () => Math.floor(Date.now() / 1000) * 1000;
const useSecondClock = () => useSyncExternalStore(subscribe, snapshot, () => 0);

const pad = (n: number) => String(n).padStart(2, "0");
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

type Variant = "tiles" | "inline";

/**
 * Live event countdown driven by the event's dates and daily hours (SAST).
 * - before the event: "Doors open in" + days / hours / minutes / seconds
 * - during the event, inside opening hours: "Open now · Day 2 of 3 · until 18:00 SAST"
 * - during the event, overnight: "Day 2 opens in" + hours / minutes / seconds
 * - after the event: nothing (the pop-up switches to its follow-up message)
 * `inline` is a one-line version for the reminder pill.
 */
export function EventCountdown({
  schedule,
  variant = "tiles",
  className,
  fallback = null,
}: {
  schedule: EventSchedule;
  variant?: Variant;
  className?: string;
  /** Rendered when there is nothing to count (hydrating, or the event is over). */
  fallback?: ReactNode;
}) {
  const now = useSecondClock();
  if (!now) return variant === "tiles" ? <div aria-hidden className={cn("h-[92px]", className)} /> : <>{fallback}</>;
  const s = countdownState(schedule, now);
  if (s.kind === "over") return <>{fallback}</>;

  if (s.kind === "open") {
    const until = s.timed ? `until ${sastTime(s.closes)} SAST` : "today";
    if (variant === "inline")
      return (
        <span className={cn("inline-flex items-center gap-1.5 text-[#4ade80]", className)} title={`Open now · Day ${s.day} of ${s.days}`}>
          <LiveDot />
          Open now · Day {s.day}
        </span>
      );
    return (
      <div className={cn("flex items-center gap-3 rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/[0.08] px-4 py-3.5", className)} role="status">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/15 ring-1 ring-[#22c55e]/40">
          <LiveDot />
        </span>
        <span className="flex flex-col">
          <span className="font-heading text-[15px] font-semibold text-white">
            Open now · Day {s.day} of {s.days}
          </span>
          <span className="font-sans text-[12.5px] text-white/60">Come and see us {until}</span>
        </span>
      </div>
    );
  }

  const d = splitDuration(s.target - now);
  const lead = s.kind === "before" ? (s.timed ? "Doors open in" : "Starts in") : `Day ${s.day} opens in`;
  const when = `${sastDay(s.target)}${s.kind === "between" || s.timed ? ` · ${sastTime(s.target)} SAST` : ""}`;
  const spoken = [d.days ? plural(d.days, "day") : "", plural(d.hours, "hour"), plural(d.minutes, "minute")].filter(Boolean).join(", ");

  if (variant === "inline") {
    const short = d.days ? `${d.days}d ${d.hours}h ${pad(d.minutes)}m` : `${d.hours}h ${pad(d.minutes)}m ${pad(d.seconds)}s`;
    return (
      <span className={cn("tabular-nums", className)} role="timer" aria-label={`${lead} ${spoken}`}>
        {s.kind === "before" ? "Opens" : `Day ${s.day} opens`} in {short}
      </span>
    );
  }

  const units = [
    ...(d.days || s.kind === "before" ? [{ v: d.days, l: d.days === 1 ? "Day" : "Days" }] : []),
    { v: d.hours, l: "Hours" },
    { v: d.minutes, l: "Mins" },
    { v: d.seconds, l: "Secs" },
  ];
  return (
    <div className={cn("rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-0.5">
        <span className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
          <span aria-hidden className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/70 motion-reduce:hidden" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          {lead}
        </span>
        <span className="font-sans text-[11.5px] text-white/50 max-[380px]:hidden">{when}</span>
      </div>
      <div role="timer" aria-label={`${lead} ${spoken}`} className={cn("mt-2.5 grid gap-2", units.length === 4 ? "grid-cols-4" : "grid-cols-3")}>
        {units.map((u) => (
          <div key={u.l} aria-hidden className="flex flex-col items-center rounded-xl bg-[#0b1430] py-2 ring-1 ring-white/[0.07]">
            <span className="font-heading text-[24px] font-bold leading-none tracking-[-0.02em] text-white tabular-nums sm:text-[26px]">
              {u.l === "Days" || u.l === "Day" ? u.v : pad(u.v)}
            </span>
            <span className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{u.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveDot() {
  return (
    <span aria-hidden className="relative flex size-2">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#4ade80]/80 motion-reduce:hidden" />
      <span className="relative inline-flex size-2 rounded-full bg-[#4ade80]" />
    </span>
  );
}
