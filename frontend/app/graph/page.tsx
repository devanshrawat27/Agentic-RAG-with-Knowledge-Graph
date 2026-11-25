"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/app/AppShell";
import { GraphCanvas, NODE_COLORS } from "@/components/graph/GraphCanvas";
import {
  getGraph,
  type GraphEdge,
  type GraphNode,
  type GraphResponse,
} from "@/lib/api";

export default function GraphPage() {
  const router = useRouter();
  const [data, setData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [includeMentions, setIncludeMentions] = useState(false);
  const [query, setQuery] = useState("");
  const [hiddenLabels, setHiddenLabels] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const graph = await getGraph({ limit: 400, includeMentions });
      setData(graph);
      setSelected((current) =>
        current ? graph.nodes.find((node) => node.id === current.id) ?? null : null,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load graph";
      if (
        message.includes("401") ||
        message.toLowerCase().includes("authenticated")
      ) {
        router.replace("/login");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [includeMentions, router]);

  useEffect(() => {
    load();
  }, [load]);

  const nodes = useMemo(() => data?.nodes ?? [], [data]);
  const edges = useMemo(() => data?.edges ?? [], [data]);

  const labels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of nodes) {
      counts.set(node.label, (counts.get(node.label) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    const term = query.trim().toLowerCase();
    return nodes.filter(
      (node) =>
        !hiddenLabels.has(node.label) &&
        (!term ||
          node.name.toLowerCase().includes(term) ||
          node.number.toLowerCase().includes(term)),
    );
  }, [nodes, hiddenLabels, query]);

  const filteredEdges = useMemo(() => {
    const ids = new Set(filteredNodes.map((node) => node.id));
    return edges.filter(
      (edge) => ids.has(edge.source) && ids.has(edge.target),
    );
  }, [edges, filteredNodes]);

  useEffect(() => {
    if (selected && !filteredNodes.some((node) => node.id === selected.id)) {
      setSelected(null);
    }
  }, [filteredNodes, selected]);

  const neighbors = useMemo(() => {
    if (!selected) return [] as { edge: GraphEdge; node: GraphNode }[];
    return edges
      .filter(
        (edge) => edge.source === selected.id || edge.target === selected.id,
      )
      .map((edge) => {
        const otherId = edge.source === selected.id ? edge.target : edge.source;
        return { edge, node: nodes.find((node) => node.id === otherId) };
      })
      .filter(
        (item): item is { edge: GraphEdge; node: GraphNode } =>
          Boolean(item.node),
      );
  }, [edges, nodes, selected]);

  function toggleLabel(label: string) {
    setHiddenLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  const counts = data?.counts;

  return (
    <AppShell>
      <div className="flex h-screen flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-white/[0.05] px-5 py-4 lg:px-8">
          <div className="mr-auto">
            <h1 className="text-[20px] font-semibold tracking-tight">
              Knowledge Graph
            </h1>
            <p className="mt-0.5 text-[12.5px] text-white/40">
              {counts
                ? `${counts.nodes} nodes · ${counts.edges} edges`
                : "Loading graph…"}
              <span className="text-white/25"> · locked v1 schema</span>
            </p>
          </div>

          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search nodes…"
              className="h-9 w-52 rounded-lg border border-white/[0.08] bg-white/[0.03] pl-9 pr-3 text-[12.5px] text-white/85 outline-none transition placeholder:text-white/30 focus:border-cyan-400/40"
            />
          </div>

          <button
            onClick={() => setIncludeMentions((value) => !value)}
            className={`h-9 rounded-lg border px-3 text-[12px] font-medium transition ${
              includeMentions
                ? "border-cyan-400/40 bg-cyan-500/[0.08] text-cyan-200"
                : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80"
            }`}
            title="Show provenance MENTIONS edges"
          >
            Mentions
          </button>

          <button
            onClick={load}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[12px] font-medium text-white/60 transition hover:text-white disabled:opacity-40"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            Refresh
          </button>
        </header>

        {labels.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.05] px-5 py-2.5 lg:px-8">
            {labels.map(([label, count]) => {
              const hidden = hiddenLabels.has(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    hidden
                      ? "border-white/[0.06] bg-white/[0.01] text-white/25"
                      : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:text-white/90"
                  }`}
                  title={hidden ? `Show ${label}` : `Hide ${label}`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: hidden
                        ? "rgba(148,163,184,0.3)"
                        : NODE_COLORS[label] ?? NODE_COLORS.Entity,
                    }}
                  />
                  {label}
                  <span className="text-white/30">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="relative flex min-h-0 flex-1">
          <div className="relative min-w-0 flex-1">
            {!loading && !error && nodes.length > 0 && (
              <GraphCanvas
                nodes={filteredNodes}
                edges={filteredEdges}
                selectedId={selected?.id}
                onSelect={setSelected}
              />
            )}

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/15 border-t-cyan-400" />
                <p className="text-[13px] text-white/45">Loading graph…</p>
              </div>
            )}

            {!loading && error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.05] px-5 py-4">
                  <p className="text-[13.5px] text-red-200">{error}</p>
                  <button
                    onClick={load}
                    className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-200 transition hover:bg-red-500/15"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="max-w-md rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-6 w-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="6" cy="6" r="2.5" />
                      <circle cx="18" cy="6" r="2.5" />
                      <circle cx="6" cy="18" r="2.5" />
                      <circle cx="18" cy="18" r="2.5" />
                      <path d="M8.5 7.5l7 7M16.5 7.5l-7 7" />
                    </svg>
                  </div>
                  <h2 className="mt-4 text-[16px] font-semibold">
                    No graph data yet
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/45">
                    Upload a contract or policy. Entities and relationships are
                    extracted after embedding and will appear here.
                  </p>
                  <Link
                    href="/documents"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-100"
                  >
                    Upload documents
                  </Link>
                </div>
              </div>
            )}

            {!loading &&
              !error &&
              nodes.length > 0 &&
              filteredNodes.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <p className="rounded-xl border border-white/[0.07] bg-[#0a0b0e]/80 px-4 py-2 text-[12.5px] text-white/50">
                    No nodes match the current filters
                  </p>
                </div>
              )}
          </div>

          <AnimatePresence>
            {selected && (
              <motion.aside
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "tween", duration: 0.2 }}
                className="absolute inset-y-0 right-0 z-20 flex w-[300px] flex-col border-l border-white/[0.06] bg-[#0a0b0e] lg:static lg:bg-white/[0.015]"
              >
                <div className="flex items-start justify-between border-b border-white/[0.05] px-4 py-3">
                  <div className="min-w-0">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-2 py-0.5 text-[10.5px] font-medium"
                      style={{
                        color: NODE_COLORS[selected.label] ?? NODE_COLORS.Entity,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            NODE_COLORS[selected.label] ?? NODE_COLORS.Entity,
                        }}
                      />
                      {selected.label}
                    </span>
                    <h2 className="mt-2 break-words text-[15px] font-semibold leading-snug">
                      {selected.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 transition hover:text-white"
                    aria-label="Close details"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.08]">
                  <dl className="space-y-2 text-[12.5px]">
                    {selected.number && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-white/35">Number</dt>
                        <dd className="text-right text-white/80">
                          {selected.number}
                        </dd>
                      </div>
                    )}
                    {selected.date && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-white/35">Date</dt>
                        <dd className="text-right text-white/80">
                          {selected.date}
                        </dd>
                      </div>
                    )}
                    {selected.summary && (
                      <div>
                        <dt className="text-white/35">Summary</dt>
                        <dd className="mt-1 leading-relaxed text-white/75">
                          {selected.summary}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35">
                      Connections ({neighbors.length})
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {neighbors.length === 0 && (
                        <p className="text-[12px] text-white/30">
                          No connections
                        </p>
                      )}
                      {neighbors.map(({ edge, node }) => {
                        const outgoing = edge.source === selected.id;
                        return (
                          <button
                            key={`${edge.id}-${node.id}`}
                            onClick={() => setSelected(node)}
                            className="w-full rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2 text-left transition hover:border-white/[0.12] hover:bg-white/[0.04]"
                          >
                            <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-300/70">
                              {outgoing ? "→" : "←"} {edge.type}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-white/80">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    NODE_COLORS[node.label] ?? NODE_COLORS.Entity,
                                }}
                              />
                              <span className="truncate">{node.name}</span>
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
