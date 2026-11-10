"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const t = window.setInterval(cb, 60_000);
  return () => window.clearInterval(t);
};
const snapshot = () => Math.floor(Date.now() / 60_000) * 60_000;

/** Minute-resolution clock: `serverNow` while hydrating, then the visitor's clock (re-evaluated every minute). */
export function useNow(serverNow: number) {
  return useSyncExternalStore(subscribe, snapshot, () => serverNow);
}
