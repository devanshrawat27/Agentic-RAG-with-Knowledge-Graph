"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/* =========================================================================
   TYPES & DATA CONSTANTS
   ========================================================================= */

interface DocumentItem {
  id: string;
  name: string;
  pages: string;
  type: "pdf" | "docx" | "pptx";
  tagColor: string;
}

const DOCUMENTS: DocumentItem[] = [
  { id: "doc-1", name: "Q3 Report.pdf", pages: "128 pages", type: "pdf", tagColor: "#E11D48" },
  { id: "doc-2", name: "Strategy.docx", pages: "42 pages", type: "docx", tagColor: "#2563EB" },
  { id: "doc-3", name: "Roadmap.pptx", pages: "56 pages", type: "pptx", tagColor: "#EA580C" },
  { id: "doc-4", name: "Research.pdf", pages: "94 pages", type: "pdf", tagColor: "#E11D48" },
];

interface AgentItem {
  id: number;
  number: string;
  name: string;
  role: string;
  shortDesc: string;
  iconType: "ingestion" | "extraction" | "reasoning" | "verification";
}

const AGENTS: AgentItem[] = [
  {
    id: 1,
    number: "01",
    name: "Ingestion Agent",
    role: "Ingestion",
    shortDesc: "Reads, parses and understands documents",
    iconType: "ingestion",
  },
  {
    id: 2,
    number: "02",
    name: "Extraction Agent",
    role: "Extraction",
    shortDesc: "Identifies entities, relationships and key insights",
    iconType: "extraction",
  },
  {
    id: 3,
    number: "03",
    name: "Reasoning Agent",
    role: "Reasoning",
    shortDesc: "Connects information across documents",
    iconType: "reasoning",
  },
  {
    id: 4,
    number: "04",
    name: "Verification Agent",
    role: "Verification",
    shortDesc: "Cross-checks answers with trusted sources",
    iconType: "verification",
  },
];

/* =========================================================================
   ICONS (Custom crisp SVGs: Silver / White / Cool Subtle Highlights)
   ========================================================================= */

function DocumentIcon({ type }: { type: "pdf" | "docx" | "pptx" }) {
  if (type === "pdf") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" />
        <text x="8" y="17" fontSize="7" fill="currentColor" fontWeight="bold">PDF</text>
      </svg>
    );
  }
  if (type === "docx") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 13l2 4 1.5-2.5 1.5 2.5 2-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" />
      <rect x="7" y="12" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AgentIcon({ type, isActive }: { type: AgentItem["iconType"]; isActive: boolean }) {
  const strokeClass = isActive ? "text-white" : "text-white/60";

  switch (type) {
    case "ingestion":
      // FileInput / Parsing icon
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 ${strokeClass} transition-colors duration-300`}>
          <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 14h10M9 11l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "extraction":
      // Network / ScanSearch icon
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 ${strokeClass} transition-colors duration-300`}>
          <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 7.5l2.5 7.5M16 7.5l-2.5 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case "reasoning":
      // Brain / Neural Sparkles icon
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 ${strokeClass} transition-colors duration-300`}>
          <path
            d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .76.19 1.48.52 2.11A4.5 4.5 0 0 0 3 12.5a4.5 4.5 0 0 0 3.5 4.4v.1a4.5 4.5 0 0 0 4.5 4.5c.5 0 .98-.08 1.43-.24"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .76-.19 1.48-.52 2.11A4.5 4.5 0 0 1 21 12.5a4.5 4.5 0 0 1-3.5 4.4v.1a4.5 4.5 0 0 1-4.5 4.5c-.5 0-.98-.08-1.43-.24"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M12 4v16" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case "verification":
      // ShieldCheck icon
      return (
        <svg viewBox="0 0 24 24" fill="none" className={`h-5 w-5 ${strokeClass} transition-colors duration-300`}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

/* =========================================================================
   SUBCOMPONENT 1: DocumentInputCard
   ========================================================================= */

export function DocumentInputCard({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative flex flex-col items-start">
      {/* Small Section Header */}
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-white/50 uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        Source Documents
      </div>

      {/* Stacked Document Cards */}
      <div className="relative flex flex-wrap gap-2 sm:flex-nowrap">
        {DOCUMENTS.map((doc, idx) => {
          const isDocActive = isActive && idx === 0; // First doc glows when step 0
          return (
            <motion.div
              key={doc.id}
              animate={
                isDocActive
                  ? {
                      borderColor: "rgba(255, 255, 255, 0.45)",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      y: -2,
                      boxShadow: "0 0 20px -3px rgba(255, 255, 255, 0.18)",
                    }
                  : {
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      backgroundColor: "rgba(12, 14, 20, 0.75)",
                      y: 0,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                    }
              }
              transition={{ duration: 0.4 }}
              className="relative flex items-center gap-2 rounded-lg border px-2.5 py-1.5 backdrop-blur-md"
            >
              {/* Type pill */}
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white"
                style={{ backgroundColor: doc.tagColor }}
              >
                <DocumentIcon type={doc.type} />
              </span>

              {/* Info */}
              <div className="min-w-0 pr-1 text-left">
                <div className="truncate text-[11.5px] font-medium text-white/90">{doc.name}</div>
                <div className="text-[9.5px] text-white/40">{doc.pages}</div>
              </div>

              {/* Active Pulse Pip */}
              {isDocActive && (
                <motion.span
                  layoutId="doc-active-dot"
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   SUBCOMPONENT 2: AgentCard
   ========================================================================= */

interface AgentCardProps {
  agent: AgentItem;
  isActive: boolean;
  stepIndex: number;
}

export function AgentCard({ agent, isActive }: AgentCardProps) {
  return (
    <motion.div
      animate={
        isActive
          ? {
              scale: 1.02,
              borderColor: "rgba(255, 255, 255, 0.35)",
              backgroundColor: "rgba(18, 22, 32, 0.95)",
              boxShadow: "0 0 28px -4px rgba(255, 255, 255, 0.15), inset 0 1px 1px rgba(255,255,255,0.25)",
            }
          : {
              scale: 1,
              borderColor: "rgba(255, 255, 255, 0.07)",
              backgroundColor: "rgba(12, 14, 20, 0.65)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
            }
      }
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group relative flex h-[168px] w-full flex-col justify-between overflow-hidden rounded-xl border p-3.5 text-left backdrop-blur-xl transition-opacity duration-300 ${
        isActive ? "opacity-100" : "opacity-60 hover:opacity-85"
      }`}
    >
      {/* Top ambient highlight on active */}
      {isActive && (
        <motion.div
          layoutId="active-agent-glow"
          className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
        />
      )}

      {/* Card Header: Number + Active Status Dot */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-mono font-semibold tracking-wider ${
            isActive ? "text-white" : "text-white/40"
          }`}
        >
          {agent.number}
        </span>

        {/* Processing Indicator */}
        <div className="flex items-center gap-1.5">
          {isActive ? (
            <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="text-[9px] font-medium tracking-wide text-white/90">PROCESSING</span>
            </div>
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
          )}
        </div>
      </div>

      {/* Middle: Icon with Subtle Container */}
      <div className="my-auto py-1">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 ${
            isActive
              ? "border-white/25 bg-white/10 shadow-[0_0_15px_-2px_rgba(255,255,255,0.2)]"
              : "border-white/5 bg-white/[0.03]"
          }`}
        >
          <AgentIcon type={agent.iconType} isActive={isActive} />
        </div>

        {/* Dynamic Mini-Visualization Inside Active Card */}
        {isActive && agent.iconType === "extraction" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 flex items-center gap-1 text-[9px] text-white/50"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-cyan-400" />
            <span className="truncate">24 entities extracted</span>
          </motion.div>
        )}
        {isActive && agent.iconType === "reasoning" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 flex items-center gap-1 text-[9px] text-white/50"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-blue-400" />
            <span className="truncate">Knowledge graph linked</span>
          </motion.div>
        )}
        {isActive && agent.iconType === "verification" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 flex items-center gap-1 text-[9px] text-emerald-400/80"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-emerald-400" />
            <span className="truncate">100% source grounded</span>
          </motion.div>
        )}
      </div>

      {/* Bottom: Name & Short Description */}
      <div>
        <h4 className="text-[13px] font-semibold text-white tracking-tight">{agent.name}</h4>
        <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-white/50">{agent.shortDesc}</p>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   SUBCOMPONENT 3: FlowConnection (Animated connector with flowing photon)
   ========================================================================= */

export function FlowConnection({ isFlowing }: { isFlowing: boolean }) {
  return (
    <div className="relative hidden h-full w-5 shrink-0 items-center justify-center sm:flex">
      {/* Background Track Line */}
      <div className="h-px w-full bg-white/10" />

      {/* Flowing Particle */}
      {isFlowing && (
        <motion.div
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: "100%", opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, ease: "easeInOut", repeat: 1 }}
          className="absolute h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_#ffffff]"
          style={{ top: "50%" }}
        />
      )}

      {/* Small Arrow Chevrons */}
      <svg
        viewBox="0 0 10 10"
        className="absolute right-0 h-2.5 w-2.5 -translate-y-1/2 text-white/20"
        style={{ top: "50%" }}
      >
        <path d="M2 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* =========================================================================
   SUBCOMPONENT 4: VerifiedAnswerCard
   ========================================================================= */

export function VerifiedAnswerCard({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      animate={
        isActive
          ? {
              scale: 1.01,
              borderColor: "rgba(16, 185, 129, 0.4)",
              backgroundColor: "rgba(10, 14, 18, 0.95)",
              boxShadow: "0 0 35px -6px rgba(16, 185, 129, 0.18), inset 0 1px 1px rgba(255,255,255,0.15)",
            }
          : {
              scale: 1,
              borderColor: "rgba(255, 255, 255, 0.08)",
              backgroundColor: "rgba(10, 12, 16, 0.75)",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
            }
      }
      transition={{ duration: 0.4 }}
      className="relative w-full overflow-hidden rounded-xl border p-4 text-left backdrop-blur-xl"
    >
      {/* Top Edge Glow */}
      {isActive && (
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
      )}

      {/* Header: Verified Answer Tag + Latency Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Subtle Emerald / Green Check Circle */}
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path
                d="M4 8l2.5 2.5L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-[12.5px] font-semibold text-emerald-400 tracking-tight">Verified Answer</span>
        </div>

        {/* Latency badge */}
        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-medium text-white/50">
          2s
        </span>
      </div>

      {/* Answer Paragraph */}
      <p className="mt-2.5 text-[12px] leading-relaxed text-white/80">
        The company&apos;s revenue in Q3 2024 increased by{" "}
        <strong className="font-semibold text-white">32%</strong> compared to Q3 2023, driven by rapid growth in the
        enterprise segment.
      </p>

      {/* Sources Footer */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-2.5">
        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Sources:</span>

        {/* Source Chip 1 */}
        <div className="flex items-center gap-1.5 rounded border border-white/10 bg-white/[0.03] px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span className="text-[10.5px] font-medium text-white/80">Q3 Report.pdf</span>
          <span className="text-[9.5px] text-white/40">Page 12</span>
        </div>

        {/* Source Chip 2 */}
        <div className="flex items-center gap-1.5 rounded border border-white/10 bg-white/[0.03] px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-[10.5px] font-medium text-white/80">Strategy.docx</span>
          <span className="text-[9.5px] text-white/40">Page 5</span>
        </div>

        {/* More Badge */}
        <span className="rounded border border-white/5 bg-white/[0.02] px-1.5 py-0.5 text-[10px] text-white/40">
          +2 sources
        </span>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   MAIN COMPONENT: HeroAgentPipeline
   ========================================================================= */

export function HeroAgentPipeline() {
  /**
   * Sequence Steps:
   * 0 = Documents active (0ms - 800ms)
   * 1 = Agent 01 Ingestion (800ms - 1700ms)
   * 2 = Agent 02 Extraction (1700ms - 2600ms)
   * 3 = Agent 03 Reasoning (2600ms - 3500ms)
   * 4 = Agent 04 Verification (3500ms - 4400ms)
   * 5 = Verified Answer displayed (4400ms - 6400ms) -> restart
   */
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const stepDurations = [800, 900, 900, 900, 900, 2000];

    const timeout = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % stepDurations.length);
    }, stepDurations[activeStep]);

    return () => clearTimeout(timeout);
  }, [activeStep]);

  return (
    <div className="relative w-full max-w-[620px] mx-auto select-none">
      {/* Ambient background light matching page palette */}
      <div
        className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl opacity-30"
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.06), transparent 70%)",
        }}
      />

      <div className="flex flex-col gap-5">
        {/* ── STEP 1: Documents Input Section ── */}
        <div className="relative">
          <DocumentInputCard isActive={activeStep === 0} />

          {/* SVG Connector Down from Document to Ingestion Agent */}
          <div className="relative h-6 w-full pointer-events-none">
            <svg viewBox="0 0 400 24" className="h-full w-full" preserveAspectRatio="none">
              <path
                d="M 50 2 C 50 14, 50 16, 50 24"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                fill="none"
              />
              {activeStep === 0 && (
                <motion.circle
                  r="2.5"
                  fill="#ffffff"
                  initial={{ cx: 50, cy: 2, opacity: 0 }}
                  animate={{ cx: 50, cy: 24, opacity: [0, 1, 0.8] }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                />
              )}
            </svg>
          </div>
        </div>

        {/* ── STEP 2: The 4 Specialized AI Agents in a Sleek Pipeline Row ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-2">
          {AGENTS.map((agent, index) => {
            const isAgentActive = activeStep === index + 1;
            return (
              <React.Fragment key={agent.id}>
                <AgentCard agent={agent} isActive={isAgentActive} stepIndex={index + 1} />
              </React.Fragment>
            );
          })}
        </div>

        {/* SVG Connector Down from Verification Agent to Verified Answer */}
        <div className="relative -my-1 h-5 w-full pointer-events-none">
          <svg viewBox="0 0 400 20" className="h-full w-full" preserveAspectRatio="none">
            <path
              d="M 350 0 C 350 10, 350 12, 350 20"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
              fill="none"
            />
            {activeStep === 4 && (
              <motion.circle
                r="2.5"
                fill="#34d399"
                initial={{ cx: 350, cy: 0, opacity: 0 }}
                animate={{ cx: 350, cy: 20, opacity: [0, 1, 0.8] }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            )}
          </svg>
        </div>

        {/* ── STEP 3: The Verified Answer Payoff ── */}
        <div>
          <VerifiedAnswerCard isActive={activeStep === 5} />
        </div>
      </div>
    </div>
  );
}
