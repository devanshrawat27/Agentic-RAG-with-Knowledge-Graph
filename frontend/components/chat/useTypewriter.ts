"use client";

import { useEffect, useState } from "react";

export function useTypewriter(
  text: string,
  enabled: boolean,
  charsPerTick = 2,
  intervalMs = 16,
) {
  const [index, setIndex] = useState(enabled ? 0 : text.length);

  useEffect(() => {
    if (!enabled) {
      setIndex(text.length);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setIndex(text.length);
      return;
    }

    setIndex(0);
    let current = 0;
    const timer = window.setInterval(() => {
      current = Math.min(text.length, current + charsPerTick);
      setIndex(current);
      if (current >= text.length) window.clearInterval(timer);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [text, enabled, charsPerTick, intervalMs]);

  return { displayed: text.slice(0, index), done: index >= text.length };
}
