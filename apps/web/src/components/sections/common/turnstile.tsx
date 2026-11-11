"use client";

import Script from "next/script";
import { useCallback, useEffect, useImperativeHandle, useRef } from "react";

type TurnstileApi = {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Public site key (Cloudflare dashboard → Turnstile). When empty the widget is not rendered at all. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export type TurnstileHandle = { reset(): void };

/**
 * Cloudflare Turnstile bot protection for the contact form, rendered explicitly in `interaction-only` mode:
 * most visitors never see anything (keeping the original form design intact); a challenge only appears
 * when Cloudflare is unsure. The token is verified server-side in /api/contact (TURNSTILE_SECRET_KEY).
 */
export function Turnstile({
  onToken,
  theme = "dark",
  ref,
}: {
  onToken: (token: string) => void;
  theme?: "dark" | "light";
  ref?: React.Ref<TurnstileHandle>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const tokenCb = useRef(onToken);
  useEffect(() => {
    tokenCb.current = onToken;
  }, [onToken]);

  const render = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: TURNSTILE_SITE_KEY,
      appearance: "interaction-only",
      theme,
      action: "contact",
      callback: (token: string) => tokenCb.current(token),
      "expired-callback": () => tokenCb.current(""),
      "error-callback": () => tokenCb.current(""),
    });
  }, [theme]);

  useImperativeHandle(ref, () => ({
    reset() {
      tokenCb.current("");
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  }));

  useEffect(() => {
    render();
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [render]);

  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={render} />
      <div ref={container} />
    </>
  );
}
