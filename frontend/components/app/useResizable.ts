"use client";

import { useCallback, useRef, useState } from "react";

interface UseResizableOptions {
  initial: number;
  min: number;
  max: number;
  direction?: "horizontal" | "vertical";
  /** When true, moving the handle right/down *shrinks* the panel (use for right-anchored panels). */
  inverted?: boolean;
  storageKey?: string;
}

export function useResizable({
  initial,
  min,
  max,
  direction = "horizontal",
  inverted = false,
  storageKey,
}: UseResizableOptions) {
  const stored =
    storageKey && typeof window !== "undefined"
      ? parseFloat(localStorage.getItem(storageKey) ?? "") || initial
      : initial;

  const [size, setSize] = useState<number>(stored);
  const dragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startPos.current = direction === "horizontal" ? e.clientX : e.clientY;
      startSize.current = size;

      const onMove = (mv: MouseEvent) => {
        if (!dragging.current) return;
        const raw =
          direction === "horizontal"
            ? mv.clientX - startPos.current
            : mv.clientY - startPos.current;
        const delta = inverted ? -raw : raw;
        const next = Math.min(max, Math.max(min, startSize.current + delta));
        setSize(next);
        if (storageKey) localStorage.setItem(storageKey, String(next));
      };

      const onUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor =
        direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [size, min, max, direction, inverted, storageKey],
  );

  return { size, onMouseDown };
}
