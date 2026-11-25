"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "@/lib/api";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export const NODE_COLORS: Record<string, string> = {
  Document: "#e2e8f0",
  Vendor: "#38bdf8",
  Contract: "#60a5fa",
  Clause: "#34d399",
  Revision: "#a78bfa",
  Violation: "#f87171",
  Person: "#f472b6",
  Entity: "#94a3b8",
};

interface GraphApi {
  zoomToFit: (duration?: number, padding?: number) => void;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId?: string;
  onSelect: (node: GraphNode) => void;
}

export function GraphCanvas({
  nodes,
  edges,
  selectedId,
  onSelect,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<GraphApi | undefined>(undefined);
  const fittedRef = useRef(false);
  const [size, setSize] = useState({ width: 800, height: 560 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () =>
      setSize({
        width: Math.max(320, element.clientWidth),
        height: Math.max(360, element.clientHeight),
      });
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(
    () => ({
      nodes: nodes.map((node) => ({ ...node })),
      links: edges.map((edge) => ({ ...edge })),
    }),
    [nodes, edges],
  );

  useEffect(() => {
    fittedRef.current = false;
  }, [graphData]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <ForceGraph2D
        ref={graphRef as never}
        graphData={graphData}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        nodeId="id"
        nodeRelSize={5}
        linkColor={(link) =>
          link.type === "MENTIONS"
            ? "rgba(148,163,184,0.14)"
            : "rgba(56,189,248,0.28)"
        }
        linkWidth={(link) => (link.type === "MENTIONS" ? 0.6 : 1.1)}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkLabel={(link) => String(link.type)}
        nodeCanvasObject={(node, ctx, scale) => {
          const label = String(node.label ?? "Entity");
          const name = String(node.name ?? node.id ?? "");
          const color = NODE_COLORS[label] ?? NODE_COLORS.Entity;
          const selected = node.id === selectedId;
          const radius = selected ? 7 : 5;
          const x = node.x ?? 0;
          const y = node.y ?? 0;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          if (selected) {
            ctx.strokeStyle = "rgba(255,255,255,0.9)";
            ctx.lineWidth = 1.5 / scale;
            ctx.stroke();
          }

          const fontSize = Math.max(10 / scale, 2.5);
          ctx.font = `${fontSize}px Geist, Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          const text = name.length > 30 ? `${name.slice(0, 29)}…` : name;
          ctx.fillText(text, x, y + radius + 1.5);
        }}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, 9, 0, 2 * Math.PI);
          ctx.fill();
        }}
        onNodeClick={(node) => onSelect(node as unknown as GraphNode)}
        cooldownTicks={140}
        warmupTicks={40}
        onEngineStop={() => {
          if (!fittedRef.current) {
            fittedRef.current = true;
            graphRef.current?.zoomToFit(500, 60);
          }
        }}
      />
    </div>
  );
}
