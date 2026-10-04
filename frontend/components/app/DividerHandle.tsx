"use client";

/**
 * DividerHandle – a thin draggable divider that sits between two panels.
 * Drop it between two sibling elements; pass the onMouseDown from useResizable.
 */
export function DividerHandle({
  onMouseDown,
  direction = "horizontal",
  className = "",
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  direction?: "horizontal" | "vertical";
  className?: string;
}) {
  const isH = direction === "horizontal";

  return (
    <div
      onMouseDown={onMouseDown}
      role="separator"
      aria-orientation={isH ? "vertical" : "horizontal"}
      className={`group relative z-20 flex flex-shrink-0 items-center justify-center transition-colors ${
        isH
          ? "w-1.5 cursor-col-resize hover:bg-cyan-400/20"
          : "h-1.5 cursor-row-resize hover:bg-cyan-400/20"
      } ${className}`}
    >
      {/* Visible bar */}
      <div
        className={`rounded-full bg-white/[0.06] transition-all group-hover:bg-cyan-400/50 ${
          isH ? "h-12 w-0.5" : "h-0.5 w-12"
        }`}
      />
      {/* Wider invisible hit-area */}
      <div
        className={`absolute inset-0 ${isH ? "-mx-1" : "-my-1"}`}
        aria-hidden="true"
      />
    </div>
  );
}
