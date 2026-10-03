"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "./primitives";

interface StepTab {
  id: number;
  number: string;
  name: string;
  subtitle: string;
  statusBadge: string;
  tag: string;
}

const TABS: StepTab[] = [
  {
    id: 0,
    number: "01",
    name: "Planner",
    subtitle: "Query Decomposition",
    statusBadge: "3 Sub-queries",
    tag: "PLAN",
  },
  {
    id: 1,
    number: "02",
    name: "Retriever",
    subtitle: "Hybrid Vector + Graph",
    statusBadge: "Qdrant + Neo4j",
    tag: "RETRIEVE",
  },
  {
    id: 2,
    number: "03",
    name: "Verifier",
    subtitle: "Anti-Hallucination Guard",
    statusBadge: "Loopback Check",
    tag: "VERIFY",
  },
  {
    id: 3,
    number: "04",
    name: "Answerer",
    subtitle: "Cited Multi-Hop Synthesis",
    statusBadge: "100% Grounded",
    tag: "SYNTHESIZE",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const handleSelectTab = (idx: number) => {
    setActiveStep(idx);
  };

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      {/* Top section divider line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <Container className="max-w-[1240px]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-1.5 text-[12px] font-medium text-white/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
            Simple. Powerful. Effective.
          </div>

          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-[52px] md:leading-[1.12]">
            How TrueDocs Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/60 sm:text-base leading-relaxed">
            Turn your documents into a connected knowledge graph in three simple steps.
          </p>
        </motion.div>

        {/* ── 4 Step Tabs (Top Timeline) ───────────────────────── */}
        <div className="mt-12 md:mt-16">
          {/* 4 Interactive Tab Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-3.5">
            {TABS.map((tab, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelectTab(idx)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 sm:p-5 text-left transition-all duration-300 ${
                    isActive
                      ? "border-cyan-400/30 bg-gradient-to-b from-cyan-500/[0.08] via-white/[0.03] to-black/40 shadow-[0_16px_44px_-12px_rgba(0,0,0,0.9),0_0_0_1px_rgba(56,189,248,0.08),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      : "border-white/[0.07] bg-[#090b10]/70 hover:border-white/[0.14] hover:bg-white/[0.035]"
                  }`}
                >
                  {/* Active card ambient bloom */}
                  {isActive && (
                    <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-cyan-500/[0.07] blur-2xl" />
                  )}

                  {/* Subtle top edge specular sheen */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-top-sheen"
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px]"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 0%, rgba(125,211,252,0.9) 50%, transparent 100%)",
                        boxShadow: "0 0 14px rgba(56,189,248,0.55)",
                      }}
                    />
                  )}

                  {/* Header: Step Number & Dot indicator */}
                  <div className="flex w-full items-center justify-between mb-3">
                    <span
                      className={`font-mono text-[11px] font-bold tracking-wider px-2 py-0.5 rounded transition-colors ${
                        isActive
                          ? "bg-cyan-400/10 text-cyan-200 border border-cyan-400/30"
                          : "text-white/35 group-hover:text-white/65"
                      }`}
                    >
                      {tab.number}
                    </span>
                    <span
                      className={`flex h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-cyan-300 shadow-[0_0_12px_3px_rgba(56,189,248,0.6)]"
                          : "bg-white/30 group-hover:bg-white/50"
                      }`}
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <div className="text-[16px] font-semibold text-white tracking-tight flex items-center gap-1.5">
                      <span>{tab.name}</span>
                    </div>
                    <div className="text-[12px] text-white/45 mt-1 transition-colors group-hover:text-white/70 line-clamp-1">
                      {tab.subtitle}
                    </div>
                  </div>

                  {/* Micro Pill Badge */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center w-full">
                    <span
                      className={`text-[10px] font-mono tracking-wider font-semibold transition-colors ${
                        isActive ? "text-cyan-200/90" : "text-white/35"
                      }`}
                    >
                      {tab.statusBadge}
                    </span>
                  </div>

                  {/* Bottom accent line on active card */}
                  <div
                    className={`absolute inset-x-0 bottom-0 h-[2px] transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(125,211,252,0.95) 50%, transparent 100%)",
                      boxShadow: "0 0 12px rgba(56,189,248,0.6)",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* ── Main Interactive Showcase Panel (The Hero Piece) ── */}
          <div className="relative mt-5 overflow-hidden rounded-3xl border border-white/[0.1] bg-gradient-to-b from-[#0a0c12]/95 to-[#06070a]/95 p-5 sm:p-7 md:p-9 shadow-[0_40px_120px_-30px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.14)] backdrop-blur-2xl">
            {/* Top glass edge specular highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.22] to-transparent" />

            {/* Corner ambient glows */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/[0.05] blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-white/[0.02] blur-3xl" />

            {/* Subtle dot matrix grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.25) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
                maskImage:
                  "radial-gradient(ellipse 90% 80% at 50% 0%, black 30%, transparent 90%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 90% 80% at 50% 0%, black 30%, transparent 90%)",
              }}
            />

            {/* Content Switcher with Framer Motion */}
            <AnimatePresence mode="wait">
              {activeStep === 0 && <PlannerPanel key="panel-planner" />}
              {activeStep === 1 && <RetrieverPanel key="panel-retriever" />}
              {activeStep === 2 && <VerifierPanel key="panel-verifier" />}
              {activeStep === 3 && <AnswererPanel key="panel-answerer" />}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* =========================================================================
   PANEL 1: PLANNER
   Deconstructs complex multi-hop enterprise query with dynamic SVG branching
   ========================================================================= */
function PlannerPanel() {
  const [hoveredSub, setHoveredSub] = useState<number | null>(null);

  const subQueries = [
    {
      id: 0,
      num: "Q1",
      thread: "THREAD-01",
      target: "CONTRACTS / ATTICUS CUAD",
      query: "Extract termination notification period & penalty triggers for Vendor X.",
      scope: "Vector Chunk Search",
      latency: "140ms",
      badgeColor: "border-white/[0.12] text-white bg-white/[0.05]",
      statusText: "EXECUTING · 24 CHUNKS",
      progress: "88%",
    },
    {
      id: 1,
      num: "Q2",
      thread: "THREAD-02",
      target: "CORPORATE POLICY / SEC 14",
      query: "Retrieve aggregate liability cap amount and exceptions under 2024 guidelines.",
      scope: "Vector Chunk Search",
      latency: "185ms",
      badgeColor: "border-white/[0.12] text-white bg-white/[0.05]",
      statusText: "INDEX SCAN · 16 CHUNKS",
      progress: "94%",
    },
    {
      id: 2,
      num: "Q3",
      thread: "THREAD-03",
      target: "NEO4J KNOWLEDGE GRAPH",
      query: "Traverse relationship path: (Vendor_X)-[:GOVERNED_BY]->(Liability_Limit).",
      scope: "Graph Entity Traversal",
      latency: "210ms",
      badgeColor: "border-white/[0.12] text-white bg-white/[0.05]",
      statusText: "CYPHER QUERY · 2 HOPS",
      progress: "100%",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex flex-col gap-6"
    >
      {/* Panel Top Meta Bar with Terminal Dots & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
          </div>
          {/* Premium Multi-Layer Planner Icon */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/25 to-black text-cyan-300 shadow-[0_0_18px_rgba(56,189,248,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-white tracking-tight flex items-center gap-2">
              <span>01 · Planner Agent</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-200 border border-cyan-400/25">
                Gemini 2.0 Flash
              </span>
            </div>
            <div className="text-[11.5px] text-white/50">Multi-hop query deconstruction &amp; parallel execution planning</div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/[0.07] px-3.5 py-1 text-[11px] font-medium text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
          </span>
          Decomposition Engine Active · Plan Verified
        </div>
      </div>

      {/* Main Grid: Input Question ➔ Animated Branching ➔ 3 Sub-Tasks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Left: Input Question (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Incoming User Question
            </span>
            <span className="text-white/40">Multi-Hop Query</span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.05] via-white/[0.03] to-white/[0.015] p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255, 255, 255, 0.2)] group transition-all hover:border-white/[0.14]">
            {/* Live scanning line */}
            <motion.div
              animate={{ y: ["-100%", "240%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent -z-0"
            />

            <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="flex h-5 px-2.5 items-center rounded-md bg-white/[0.08] border border-white/[0.12] text-[10px] font-mono font-bold text-white">
                  RAW INTENT
                </span>
                <span className="text-[11px] text-white/50 font-mono">CUAD Enterprise Corpus</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                STREAMING
              </span>
            </div>

            <p className="text-[14.5px] font-medium leading-relaxed text-white/95 relative z-10">
              &ldquo;Does <span className="text-white font-semibold underline decoration-white/40 underline-offset-4">Vendor X&apos;s termination clause</span> in the 2024 Agreement comply with our updated <span className="text-white font-semibold underline decoration-white/40 underline-offset-4">liability limits in Section 14</span>?&rdquo;
            </p>

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-col gap-1.5 text-[11px] text-white/60 font-mono relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-white flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Planner Action:
                </span>
                <span className="text-white/40">Decomposed into 3 nodes</span>
              </div>
              <div className="text-[10.5px] text-white/45">
                Splits into 2 vector chunk searches + 1 Neo4j knowledge graph traversal
              </div>
            </div>
          </div>
        </div>

        {/* Center: Animated SVG Branching Bus (1 col) */}
        <div className="hidden lg:flex lg:col-span-1 justify-center items-center relative h-full min-h-[220px]">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 60 220" fill="none">
            <defs>
              <linearGradient id="bus-flow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(125,211,252,0)" />
                <stop offset="50%" stopColor="rgba(125,211,252,0.9)" />
                <stop offset="100%" stopColor="rgba(125,211,252,0)" />
              </linearGradient>
            </defs>

            {/* Bus Lines with animated gradient flow */}
            <path
              id="bus-path-0"
              d="M 5 110 C 30 110, 30 35, 55 35"
              stroke={hoveredSub === 0 ? "#7dd3fc" : "rgba(255, 255, 255, 0.28)"}
              strokeWidth={hoveredSub === 0 ? "2.5" : "1.6"}
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />
            <path
              id="bus-path-1"
              d="M 5 110 L 55 110"
              stroke={hoveredSub === 1 ? "#7dd3fc" : "rgba(255, 255, 255, 0.38)"}
              strokeWidth={hoveredSub === 1 ? "2.5" : "1.6"}
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />
            <path
              id="bus-path-2"
              d="M 5 110 C 30 110, 30 185, 55 185"
              stroke={hoveredSub === 2 ? "#7dd3fc" : "rgba(255, 255, 255, 0.28)"}
              strokeWidth={hoveredSub === 2 ? "2.5" : "1.6"}
              strokeDasharray="4 3"
              className="transition-all duration-300"
            />

            {/* Flowing energy beads down each branch */}
            {["bus-path-0", "bus-path-1", "bus-path-2"].map((pid, i) => (
              <circle key={pid} r="2" fill="url(#bus-flow)">
                <animateMotion dur="2.6s" begin={`${i * 0.7}s`} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${pid}`} />
                </animateMotion>
              </circle>
            ))}

            {/* Origin Node with pulse */}
            <circle cx="5" cy="110" r="4.5" fill="#7dd3fc" />
            <circle cx="5" cy="110" r="4.5" fill="none" stroke="#7dd3fc" strokeWidth="1" opacity="0.6">
              <animate attributeName="r" values="4.5;9;4.5" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>

            {/* Target Nodes */}
            <circle cx="55" cy="35" r="3.5" fill="#ffffff" />
            <circle cx="55" cy="110" r="3.5" fill="#ffffff" />
            <circle cx="55" cy="185" r="3.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Right: 3 Parallel Sub-Tasks (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-white/45 mb-0.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
              Decomposed Sub-Questions (Parallel LangGraph Dispatch)
            </span>
            <span className="text-cyan-300 font-bold font-mono">3 Tasks Active</span>
          </div>

          {subQueries.map((sub, i) => (
            <motion.div
              key={sub.num}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              onMouseEnter={() => setHoveredSub(sub.id)}
              onMouseLeave={() => setHoveredSub(null)}
              className={`relative overflow-hidden flex flex-col gap-2 rounded-xl border p-3.5 backdrop-blur-md transition-all duration-300 ${
                hoveredSub === sub.id
                  ? "border-cyan-400/30 bg-cyan-500/[0.05] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)]"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.035]"
              }`}
            >
              {/* Left accent bar on active */}
              <div
                className={`absolute inset-y-0 left-0 w-[2px] transition-opacity duration-300 ${
                  hoveredSub === sub.id ? "opacity-100" : "opacity-0"
                }`}
                style={{ background: "linear-gradient(180deg, transparent, #7dd3fc, transparent)" }}
              />

              <div className="flex items-start gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-bold transition-colors ${
                    hoveredSub === sub.id
                      ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
                      : "border-white/[0.12] bg-white/[0.04] text-white/70"
                  }`}
                >
                  {sub.num}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      {sub.target}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-white/60 border border-white/[0.08]">
                        {sub.scope}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300/90 font-medium">
                        {sub.latency}
                      </span>
                    </div>
                  </div>
                  <div className="text-[13px] text-white/95 leading-snug font-medium">
                    {sub.query}
                  </div>
                </div>
              </div>

              {/* Real-time telemetry strip inside sub-card */}
              <div className="mt-1 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[9.5px] font-mono text-white/40">
                <span className="flex items-center gap-1.5 text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  {sub.thread}: {sub.statusText}
                </span>
                <span className="text-white/45">{sub.progress} DONE</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   PANEL 2: RETRIEVER
   Executes Qdrant semantic search + Neo4j graph traversal for evidence
   ========================================================================= */
function RetrieverPanel() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex flex-col gap-6"
    >
      {/* Panel Top Meta Bar with Terminal Dots & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
          </div>
          {/* Premium Multi-Layer Retriever Icon */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/25 to-black text-cyan-300 shadow-[0_0_18px_rgba(56,189,248,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
              <path d="M11 8v6M8 11h6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-white tracking-tight flex items-center gap-2">
              <span>02 · Hybrid Retriever Agent</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-200 border border-cyan-400/25">
                Vector + Knowledge Graph
              </span>
            </div>
            <div className="text-[11.5px] text-white/50">
              Parallel Qdrant vector semantic search + Neo4j multi-hop graph traversal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/[0.07] px-3.5 py-1 text-[11px] font-medium text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
          </span>
          Hybrid Evidence Pool Ready (4 chunks retrieved)
        </div>
      </div>

      {/* Main Grid: Vector Chunks (Left) & Knowledge Graph Path (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Qdrant Vector Semantic Search */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-white/60">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
              Qdrant Vector Database
            </div>
            <span className="font-mono text-[10.5px] text-white font-semibold">
              Cosine Sim &gt; 0.90
            </span>
          </div>

          <div className="space-y-3">
            {/* Chunk 1 */}
            <div className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.07] p-4 backdrop-blur-md hover:border-white/[0.14] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              {/* Subtle sweeping scanner beam */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -z-0"
              />

              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11.5px] text-white font-semibold">
                    Master_Agreement.pdf
                  </span>
                  <span className="text-[10px] font-mono text-white/40">Clause 9.2 · p. 14</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.08] text-white border border-white/[0.12] font-bold">
                  Match 94.2%
                </span>
              </div>
              <p className="text-[13px] text-white/90 leading-relaxed font-sans relative z-10">
                &ldquo;Section 9.2 (Termination). Either party may terminate this Master Agreement upon{" "}
                <mark className="bg-white/30 text-white px-1 py-0.5 rounded border border-white/[0.12]">
                  thirty (30) days prior written notice
                </mark>{" "}
                without penalty or early termination fees...&rdquo;
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-white/40 border-t border-white/[0.06] pt-2 relative z-10">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Chunk ID: #chk-412
                </span>
                <span>Embedding: text-embedding-004 · 768-dim</span>
              </div>
            </div>

            {/* Chunk 2 */}
            <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-md hover:border-white/[0.1] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11.5px] text-white font-semibold">
                    Liability_Policy.docx
                  </span>
                  <span className="text-[10px] font-mono text-white/40">Section 14.1 · p. 5</span>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.07] text-white border border-white/[0.1] font-bold">
                  Match 91.8%
                </span>
              </div>
              <p className="text-[13px] text-white/90 leading-relaxed font-sans">
                &ldquo;Section 14.1 (Liability Cap). Aggregate liability arising out of or related to this contract shall{" "}
                <mark className="bg-white/30 text-white px-1 py-0.5 rounded border border-white/[0.12]">
                  not exceed $1,000,000 USD
                </mark>
                , except in cases of gross negligence...&rdquo;
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-white/40 border-t border-white/[0.06] pt-2">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Chunk ID: #chk-108
                </span>
                <span>Embedding: text-embedding-004 · 768-dim</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Neo4j Knowledge Graph Multi-Hop Traversal */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-white/60">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
              Neo4j Knowledge Graph Engine
            </div>
            <span className="font-mono text-[10.5px] text-white font-semibold">
              Multi-Hop Path Validated
            </span>
          </div>

          <div className="relative flex flex-col justify-between rounded-xl border border-white/[0.1] bg-[#050609] p-4 min-h-[220px]">
            {/* Cypher statement */}
            <div className="rounded-lg bg-black/60 p-2.5 font-mono text-[11px] text-white/60 border border-white/[0.06]">
              <span className="text-white font-bold">MATCH</span> (v:Vendor{" "}
              <span className="text-white">{`{name: "Vendor X"}`}</span>)-[r:SIGNS*1..3]-&gt;(c:Clause)
              <br />
              <span className="text-white font-bold">RETURN</span> v.name, r.type, c.liability_cap
            </div>

            {/* Visual Connected Nodes Flow */}
            <div className="my-auto py-5 flex items-center justify-around gap-2 relative">
              {/* Connecting glowing laser beam background */}
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-white/40 via-white/40 to-white/40 -z-0" />

              {/* Node 1: Vendor X */}
              <button
                onClick={() => setActiveNode(activeNode === "vx" ? null : "vx")}
                className={`relative z-10 flex flex-col items-center group transition-transform ${
                  activeNode === "vx" ? "scale-105" : "hover:scale-105"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.14] bg-[#0a0b10] text-[12px] font-bold text-white shadow-[0_0_20px_rgba(255, 255, 255, 0.4)]">
                  VX
                </div>
                <span className="text-[11px] text-white/80 mt-1.5 font-mono font-medium">Vendor X</span>
                <span className="text-[9px] text-white font-mono">:Vendor</span>
              </button>

              <div className="relative z-10 flex items-center px-1">
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-white/80 text-white border border-white/[0.12] font-semibold shadow-sm">
                  [:SIGNS]
                </span>
              </div>

              {/* Node 2: Master 2024 */}
              <button
                onClick={() => setActiveNode(activeNode === "ma" ? null : "ma")}
                className={`relative z-10 flex flex-col items-center group transition-transform ${
                  activeNode === "ma" ? "scale-105" : "hover:scale-105"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.14] bg-[#0a0b10] text-[12px] font-bold text-white shadow-[0_0_20px_rgba(255, 255, 255, 0.4)]">
                  MA
                </div>
                <span className="text-[11px] text-white/80 mt-1.5 font-mono font-medium">Master 2024</span>
                <span className="text-[9px] text-white font-mono">:Contract</span>
              </button>

              <div className="relative z-10 flex items-center px-1">
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-white/80 text-white border border-white/[0.12] font-semibold shadow-sm">
                  [:GOVERNS]
                </span>
              </div>

              {/* Node 3: Section 14 */}
              <button
                onClick={() => setActiveNode(activeNode === "s14" ? null : "s14")}
                className={`relative z-10 flex flex-col items-center group transition-transform ${
                  activeNode === "s14" ? "scale-105" : "hover:scale-105"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.14] bg-[#0a0b10] text-[12px] font-bold text-white shadow-[0_0_20px_rgba(255, 255, 255, 0.4)]">
                  S14
                </div>
                <span className="text-[11px] text-white/80 mt-1.5 font-mono font-medium">Section 14</span>
                <span className="text-[9px] text-white font-mono">:Policy</span>
              </button>
            </div>

            <div className="text-[11px] text-white/55 flex items-center justify-between pt-2.5 border-t border-white/[0.06] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Cross-document link confirmed
              </span>
              <span className="text-white font-semibold">0 Hops Orphaned · 18ms</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   PANEL 3: VERIFIER (CORE DIFFERENTIATOR)
   Cross-checks each claim against retrieved evidence, looping back if ungrounded
   ========================================================================= */
function VerifierPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex flex-col gap-6"
    >
      {/* Panel Top Meta Bar with Terminal Dots & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
          </div>
          {/* Premium Multi-Layer Verifier Shield Icon */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/25 to-black text-cyan-300 shadow-[0_0_18px_rgba(56,189,248,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
              <polyline points="9 12 11 14 15 10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-white tracking-tight flex items-center gap-2">
              <span>03 · Verifier Agent</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-200 border border-cyan-400/25 font-semibold">
                Core Contribution
              </span>
            </div>
            <div className="text-[11.5px] text-white/50">
              Claim-level validation against source evidence with automated LangGraph retry loop
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/[0.07] px-3.5 py-1 text-[11px] font-medium text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
          </span>
          Zero-Hallucination Guard Active · 3 Claims Audited
        </div>
      </div>

      {/* Main Grid: Claims Verification Breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Claim 1: Verified */}
        <div className="relative overflow-hidden flex flex-col justify-between rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] via-white/[0.06] to-[#07080c] p-4 sm:p-5 backdrop-blur-md hover:border-white/60 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
          {/* Continuous real-time scanning beam */}
          <motion.div
            animate={{ y: ["-100%", "260%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-white/15 to-transparent -z-0"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] text-white/60 font-bold tracking-wider">
                  CLAIM 01
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] border border-white/[0.12] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm font-mono">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                VERIFIED (99.4%)
              </span>
            </div>

            <div className="text-[13.5px] font-semibold text-white leading-snug">
              &ldquo;Termination requires <span className="text-white font-bold underline decoration-white/40 underline-offset-2">30 days prior written notice</span> without penalty fee.&rdquo;
            </div>

            {/* Real-time confidence gauge bar */}
            <div className="mt-3.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/80">
                <span>NLI Entailment Confidence</span>
                <span className="font-bold text-white">0.994</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.08]">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "99.4%" }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-white to-white rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-col gap-1.5 text-[11px] text-white/90 font-mono relative z-10">
            <div className="flex items-center justify-between text-[10px] text-white/40 uppercase">
              <span>Grounding Evidence:</span>
              <span className="text-white">Match 100%</span>
            </div>
            <div className="text-[11.5px] text-white/90 font-sans font-medium">
              Master_Agreement.pdf · Clause 9.2 (chk-412)
            </div>
          </div>
        </div>

        {/* Claim 2: Verified */}
        <div className="relative overflow-hidden flex flex-col justify-between rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] via-white/[0.06] to-[#07080c] p-4 sm:p-5 backdrop-blur-md hover:border-white/60 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
          {/* Continuous real-time scanning beam */}
          <motion.div
            animate={{ y: ["-100%", "260%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 0.6 }}
            className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-white/15 to-transparent -z-0"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] text-white/60 font-bold tracking-wider">
                  CLAIM 02
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] border border-white/[0.12] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm font-mono">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                VERIFIED (98.7%)
              </span>
            </div>

            <div className="text-[13.5px] font-semibold text-white leading-snug">
              &ldquo;Aggregate liability ceiling is <span className="text-white font-bold underline decoration-white/40 underline-offset-2">strictly capped at $1,000,000</span> under Section 14.&rdquo;
            </div>

            {/* Real-time confidence gauge bar */}
            <div className="mt-3.5 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-white/80">
                <span>NLI Entailment Confidence</span>
                <span className="font-bold text-white">0.987</span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.08]">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "98.7%" }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-white to-white rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-col gap-1.5 text-[11px] text-white/90 font-mono relative z-10">
            <div className="flex items-center justify-between text-[10px] text-white/40 uppercase">
              <span>Grounding Evidence:</span>
              <span className="text-white">Match 100%</span>
            </div>
            <div className="text-[11.5px] text-white/90 font-sans font-medium">
              Liability_Policy.docx · Section 14.1 (chk-108)
            </div>
          </div>
        </div>

        {/* Claim 3: Loop Trigger / Re-checking */}
        <div className="relative overflow-hidden flex flex-col justify-between rounded-xl border border-white/[0.12] bg-gradient-to-b from-white/[0.06] via-white/[0.06] to-[#07080c] p-4 sm:p-5 backdrop-blur-md hover:border-white/60 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.6)] group">
          {/* Continuous real-time scanning beam in amber */}
          <motion.div
            animate={{ y: ["-100%", "260%"] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "linear", delay: 1.2 }}
            className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-white/15 to-transparent -z-0"
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10.5px] text-white/60 font-bold tracking-wider">
                  CLAIM 03
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] border border-white/[0.12] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm font-mono">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                LOOPBACK RESOLVED
              </span>
            </div>

            <div className="text-[13.5px] font-semibold text-white leading-snug">
              &ldquo;Cross-checked for unstated <span className="text-white font-bold underline decoration-white/40 underline-offset-2">early exit surcharges</span> or conflicting addenda.&rdquo;
            </div>

            {/* 3-Step Live LangGraph Loopback Tracker */}
            <div className="mt-3.5 space-y-1.5 text-[10px] font-mono bg-black/40 p-2.5 rounded-lg border border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="text-white font-bold">1.</span> Initial Chunk: ambiguous rider status
              </div>
              <div className="flex items-center gap-1.5 text-white">
                <span className="text-white font-bold">2.</span> Loopback Edge: re-queried Neo4j Graph
              </div>
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <span className="text-white font-bold">3.</span> Confirmed: 0 overriding surcharge riders
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-col gap-1 text-[11px] text-white/90 font-mono relative z-10">
            <div className="text-white/40 text-[10px] uppercase">Automated LangGraph Feedback:</div>
            <div className="text-[11.5px] text-white/90 font-sans">
              Feedback loop completed in 120ms · Hallucination averted
            </div>
          </div>
        </div>
      </div>

      {/* Real-time telemetry ticker console at bottom */}
      <div className="rounded-xl border border-white/[0.08] bg-black/50 p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-white/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-white">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
            NLI Model: Gemini 2.0 Flash
          </span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline text-white/50">Latency: 284ms</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden md:inline text-white/50">Hallucination Risk: 0.00% (Enforced)</span>
        </div>
        <div className="text-white/90 font-semibold">
          Audit Status: 3/3 Claims Entailed
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   PANEL 4: ANSWERER
   Final citation-grounded synthesis with clickable source links
   ========================================================================= */
function AnswererPanel() {
  const [selectedCitation, setSelectedCitation] = useState<number | null>(1);

  const CITATION_DETAILS = [
    {
      id: 1,
      tag: "C1",
      source: "Master_Agreement_2024.pdf (Clause 9.2, Page 14)",
      excerpt:
        "Section 9.2: Either party may terminate this Master Agreement upon thirty (30) days prior written notice without cause and without early termination fees.",
      score: "94.2% match",
    },
    {
      id: 2,
      tag: "C2",
      source: "Liability_Policy_Update.docx (Section 14.1, Page 5)",
      excerpt:
        "Section 14.1: The maximum aggregate liability ceiling for third-party commercial contracts shall remain capped at $1,000,000 USD.",
      score: "91.8% match",
    },
    {
      id: 3,
      tag: "C3",
      source: "Neo4j Knowledge Graph (Vendor_X entity path #892)",
      excerpt:
        "Graph Traversal: (Vendor_X:Vendor) -[:SIGNATORY_TO]-> (Master_Agreement) -[:COMPLIANT_WITH]-> (Corporate_Liability_Policy). Confirmed no conflicting addenda exist.",
      score: "Multi-Hop Verified",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 flex flex-col gap-6"
    >
      {/* Panel Top Meta Bar with Terminal Dots & Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
          </div>
          {/* Premium Multi-Layer Answerer Icon */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/25 to-black text-cyan-300 shadow-[0_0_18px_rgba(56,189,248,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="9" x2="15" y2="9" strokeLinecap="round" />
              <line x1="9" y1="13" x2="13" y2="13" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-[14px] font-semibold text-white tracking-tight flex items-center gap-2">
              <span>04 · Answerer Agent</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-200 border border-cyan-400/25 font-semibold">
                Audited Response
              </span>
            </div>
            <div className="text-[11.5px] text-white/50">
              Source-grounded synthesis with verified evidence citations and zero hallucinations
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/[0.07] px-3.5 py-1 text-[11px] font-medium text-cyan-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
          </span>
          Final Verified Answer Ready
        </div>
      </div>

      {/* Answer Output Showcase */}
      <div className="rounded-2xl border border-white/[0.12] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-5 sm:p-7 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-3.5 pb-3 border-b border-white/[0.08]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/50 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
            Synthesized Enterprise Response
          </span>
          <span className="text-[10.5px] font-mono text-white font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.1]">
            100% Grounded · 0 Hallucinations
          </span>
        </div>

        <p className="text-[15.5px] leading-relaxed text-white/95 font-normal">
          Yes. Under{" "}
          <span className="text-white font-medium bg-white/40 px-1.5 py-0.5 rounded border border-white/[0.1]">
            Section 9.2
          </span>{" "}
          of the 2024 Master Agreement, Vendor X may terminate upon 30 days prior written notice without cause and without early termination penalties{" "}
          <button
            onClick={() => setSelectedCitation(selectedCitation === 1 ? null : 1)}
            className={`inline-flex items-center justify-center h-4.5 px-1.5 rounded text-[10px] font-mono font-bold transition-all ${
              selectedCitation === 1
                ? "bg-white text-black shadow-[0_0_10px_#ffffff]"
                : "bg-white/[0.08] text-white border border-white/[0.12] hover:bg-white/40"
            }`}
          >
            [1]
          </button>
          . This clause complies fully with our Section 14 guidelines, which establish a strict aggregate liability ceiling of $1,000,000 USD{" "}
          <button
            onClick={() => setSelectedCitation(selectedCitation === 2 ? null : 2)}
            className={`inline-flex items-center justify-center h-4.5 px-1.5 rounded text-[10px] font-mono font-bold transition-all ${
              selectedCitation === 2
                ? "bg-white text-black shadow-[0_0_10px_#ffffff]"
                : "bg-white/[0.08] text-white border border-white/[0.12] hover:bg-white/40"
            }`}
          >
            [2]
          </button>
          . Knowledge graph traversal confirms no conflicting addenda supersede or modify these terms{" "}
          <button
            onClick={() => setSelectedCitation(selectedCitation === 3 ? null : 3)}
            className={`inline-flex items-center justify-center h-4.5 px-1.5 rounded text-[10px] font-mono font-bold transition-all ${
              selectedCitation === 3
                ? "bg-white text-black shadow-[0_0_10px_#ffffff]"
                : "bg-white/[0.08] text-white border border-white/[0.12] hover:bg-white/40"
            }`}
          >
            [3]
          </button>
          <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-white animate-pulse" />
        </p>

        {/* Dynamic Citation Inspector (opens when clicked) */}
        {selectedCitation && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="mt-5 p-4 rounded-xl border border-white/[0.1] bg-[#0a0b10]/90 text-[12.5px] text-white/90 shadow-lg"
          >
            <div className="flex items-center justify-between font-mono text-[11px] text-white font-bold mb-1.5 pb-1.5 border-b border-white/[0.08]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                PROVENANCE EVIDENCE [{selectedCitation}]: {CITATION_DETAILS[selectedCitation - 1].source}
              </span>
              <span className="text-[10px] font-normal text-white/80">
                {CITATION_DETAILS[selectedCitation - 1].score}
              </span>
            </div>
            <div className="font-sans text-white/90 leading-relaxed italic">
              &ldquo;{CITATION_DETAILS[selectedCitation - 1].excerpt}&rdquo;
            </div>
          </motion.div>
        )}

        {/* Source Citations Selector Buttons */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap gap-2.5 items-center">
          <span className="text-[11px] font-mono text-white/45 uppercase">Inspect Evidence:</span>
          {CITATION_DETAILS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCitation(selectedCitation === c.id ? null : c.id)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11.5px] transition-all font-mono ${
                selectedCitation === c.id
                  ? "border-white bg-white/[0.08] text-white shadow-[0_0_14px_rgba(255, 255, 255, 0.35)]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/75 hover:border-white/[0.08] hover:text-white"
              }`}
            >
              <span className="font-bold text-white">[{c.id}]</span>
              <span>{c.source.split(" (")[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}