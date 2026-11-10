"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Current year, resolved in the browser so prerendered pages never show a stale year.
 * The server snapshot uses the build year.
 */
export function CopyrightYear() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => BUILD_YEAR,
  );
  return <>{year}</>;
}

const BUILD_YEAR = 2026;
