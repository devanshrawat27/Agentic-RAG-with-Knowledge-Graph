"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/* =========================================================================
   COMPACT & PRECISE ICONS (Acrobat PDF, Word W, PPT P, Silver Logo)
   ========================================================================= */

const PdfIcon = ({ className = "w-3.5 h-3.5 text-white" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M17.5 12.2c-.4-.3-1.4-.5-2.2-.4-.8.1-1.5.6-2.2 1.3-.6-.5-1.3-1.3-1.7-2.2-.5-.8-.8-1.8-.9-2.6.5-.5 1.1-1.2 1.1-2.1 0-.8-.4-1.3-1.1-1.3-.6 0-1 .5-1.1 1.1-.2.9.1 2.2.8 3.5-.5 1.4-1.1 2.9-2 4.1-1.2.6-2.1 1.4-2.3 2.1-.2.5 0 .9.4 1.1.3.2.7.3 1.1.3 1 0 2.1-.8 3.2-2.2 1.3-.4 2.7-.6 4.2-.7 1.1.8 2.1 1.2 2.9 1.2.7 0 1.1-.3 1.3-.8.2-.5.1-1-.7-1.4zm-10.4 4c.2-.4.8-.9 1.7-1.4-.8 1-1.4 1.4-1.7 1.4zm3.3-9.5c.1-.3.2-.5.5-.5.2 0 .3.2.3.5 0 .4-.3.8-.7 1.2-.2-.7-.2-1-.1-1.2zm.4 6.5c.4.6.8 1.2 1.3 1.7-1 .1-1.9.2-2.7.5.7-.9 1.1-1.5 1.4-2.2zm5.5.8c.4.2.5.5.4.6-.1.2-.3.3-.5.3-.5 0-1-.2-1.6-.7.8-.1 1.4-.3 1.7-.2z"
      fill="currentColor"
    />
  </svg>
);

const WordIcon = ({ className = "w-3.5 h-3.5 text-white" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M5.5 6L8 18H10.2L12 10.5L13.8 18H16L18.5 6H16.2L14.7 14L13 6H11L9.3 14L7.8 6H5.5Z" />
  </svg>
);

const PptIcon = ({ className = "w-3.5 h-3.5 text-white" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M7 6H13.5C15.4 6 17 7.2 17 9.5C17 11.8 15.4 13 13.5 13H9.8V18H7V6ZM9.8 8.4V10.6H13.2C14 10.6 14.4 10.1 14.4 9.5C14.4 8.9 14 8.4 13.2 8.4H9.8Z" />
  </svg>
);

const TrueDocsSilverLogo = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="silver-top" x1="14" y1="8" x2="50" y2="46" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="60%" stopColor="#D4D4D8" />
        <stop offset="100%" stopColor="#A1A1AA" />
      </linearGradient>
      <linearGradient id="silver-left" x1="6" y1="14" x2="46" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F4F4F5" />
        <stop offset="100%" stopColor="#71717A" />
      </linearGradient>
      <linearGradient id="silver-right" x1="14" y1="20" x2="54" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E4E4E7" />
        <stop offset="100%" stopColor="#3F3F46" />
      </linearGradient>
      <linearGradient id="silver-bottom" x1="6" y1="22" x2="32" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#52525B" />
        <stop offset="100%" stopColor="#18181B" />
      </linearGradient>
    </defs>
    <path d="M32 6 L56 22 L38 38 L32 14 Z" fill="url(#silver-top)" />
    <path d="M32 6 L8 22 L26 38 L32 14 Z" fill="url(#silver-left)" opacity="0.95" />
    <path d="M32 14 L38 38 L26 38 Z" fill="#FFFFFF" opacity="0.9" />
    <path d="M56 22 L38 38 L42 54 Z" fill="url(#silver-right)" />
    <path d="M8 22 L26 38 L22 54 Z" fill="url(#silver-bottom)" />
    <path d="M26 38 L42 54 L22 54 Z" fill="#27272A" />
    <path d="M32 6 L56 22 L42 54 L22 54 L8 22 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
  </svg>
);

const DOCS = [
  {
    id: "doc-1",
    name: "Q3 Report.pdf",
    pages: "128 pages",
    bg: "bg-gradient-to-br from-[#f43f5e] to-[#e11d48]",
    icon: <PdfIcon className="w-3.5 h-3.5 text-white" />,
  },
  {
    id: "doc-2",
    name: "Strategy.docx",
    pages: "42 pages",
    bg: "bg-gradient-to-br from-[#3b82f6] to-[#2563eb]",
    icon: <WordIcon className="w-3.5 h-3.5 text-white" />,
  },
  {
    id: "doc-3",
    name: "Roadmap.pptx",
    pages: "58 pages",
    bg: "bg-gradient-to-br from-[#f97316] to-[#ea580c]",
    icon: <PptIcon className="w-3.5 h-3.5 text-white" />,
  },
  {
    id: "doc-4",
    name: "Research.pdf",
    pages: "96 pages",
    bg: "bg-gradient-to-br from-[#881337] to-[#4c0519] border border-rose-800/40",
    icon: <PdfIcon className="w-3.5 h-3.5 text-white/90" />,
  },
];

const PROCESS_STEPS = [
  { id: 1, text: "Understanding content", highlight: false },
  { id: 2, text: "Finding connections", highlight: false },
  { id: 3, text: "Verifying with sources", highlight: true },
];

export function HeroVisualization() {
  /**
   * Continuous looping animation sequence:
   * 0: Documents Active (0 - 1.5s): Particles stream from Docs -> Central Agent
   * 1: Agent Processing (1.5 - 2.8s): Thin silver agent pulses, streams towards process panel
   * 2: Process Steps (2.8 - 4.2s): Checkmarks turn on sequentially
   * 3: Verified Answer (4.2 - 6.2s): Thin cyan curved arrow fires -> Answer glows
   * 4: Reset Transition (6.2 - 6.8s)
   */
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    const timings = [1500, 1300, 1400, 2000, 600];
    const timer = setTimeout(() => {
      setPhase((prev) => (prev + 1) % timings.length);
    }, timings[phase]);

    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div
      className="relative select-none"
      style={{
        width: "590px",
        height: "330px",
        perspective: "1000px",
      }}
    >
      {/* =====================================================================
          SVG THIN & ELEGANT CONNECTION LINES
         ===================================================================== */}
      <svg
        viewBox="0 0 590 330"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle thin line gradient */}
          <linearGradient id="thin-line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.12)" />
            <stop offset="60%" stopColor="rgba(255, 255, 255, 0.28)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.15)" />
          </linearGradient>

          {/* Thin cyan gradient for the verified answer connection */}
          <linearGradient id="cyan-thin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>

          {/* Delicate arrowhead marker */}
          <marker
            id="subtle-arrow"
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 6 4 L 0 6.5 Z" fill="#22d3ee" />
          </marker>
        </defs>

        {/* ── Thin ambient background filaments ── */}
        <g opacity="0.25">
          <path d="M 235 110 L 275 80 L 330 65" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.6" fill="none" />
          <path d="M 255 210 L 285 250 L 325 275" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.6" fill="none" />
          <path d="M 195 205 L 175 245 L 195 285" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.6" fill="none" />
          {[
            { cx: 275, cy: 80 },
            { cx: 330, cy: 65 },
            { cx: 285, cy: 250 },
            { cx: 175, cy: 245 },
          ].map((pt, i) => (
            <circle key={`dot-${i}`} cx={pt.cx} cy={pt.cy} r="1.5" fill="#ffffff" opacity="0.35" />
          ))}
        </g>

        {/* ── 4 Thin Cables from Document Cards into Central Agent ── */}
        {[
          { d: "M 150 93 C 162 93, 168 135, 178 142", dot: { cx: 164, cy: 115 } },
          { d: "M 150 138 C 160 138, 168 152, 175 155", dot: { cx: 165, cy: 145 } },
          { d: "M 150 183 C 160 183, 168 168, 175 165", dot: { cx: 165, cy: 175 } },
          { d: "M 150 228 C 162 228, 168 185, 178 178", dot: { cx: 164, cy: 205 } },
        ].map((line, idx) => (
          <g key={`cable-in-${idx}`}>
            <path
              d={line.d}
              stroke="url(#thin-line-grad)"
              strokeWidth="0.9"
              fill="none"
              opacity="0.75"
            />
            {/* Small synaptic junction dot */}
            <circle cx={line.dot.cx} cy={line.dot.cy} r="1.5" fill="#ffffff" opacity="0.6" />

            {/* Tiny data photon flowing into Central Agent */}
            {(phase === 0 || phase === 1) && (
              <motion.circle
                r="2"
                fill="#ffffff"
                initial={{ offsetDistance: "0%", opacity: 0 }}
                animate={{
                  offsetDistance: ["0%", "100%"],
                  opacity: [0, 1, 0.8, 0],
                }}
                transition={{
                  duration: 1.0,
                  repeat: Infinity,
                  delay: idx * 0.16,
                  ease: "easeInOut",
                }}
                style={{ offsetPath: `path('${line.d}')` }}
              />
            )}
          </g>
        ))}

        {/* ── Thin Lines from Central Agent to Process Panel (Above-Right) ── */}
        {[
          { d: "M 252 136 C 290 120, 335 80, 375 55", delay: 0 },
          { d: "M 256 148 C 295 135, 340 95, 375 75", delay: 0.2 },
        ].map((cable, idx) => (
          <g key={`cable-out-${idx}`}>
            <path
              d={cable.d}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.8"
              strokeDasharray="2 3"
              fill="none"
            />
            {(phase === 1 || phase === 2) && (
              <motion.circle
                r="1.8"
                fill="#ffffff"
                initial={{ offsetDistance: "0%", opacity: 0 }}
                animate={{
                  offsetDistance: ["0%", "100%"],
                  opacity: [0, 0.9, 0],
                }}
                transition={{
                  duration: 0.85,
                  repeat: Infinity,
                  delay: cable.delay,
                  ease: "easeOut",
                }}
                style={{ offsetPath: `path('${cable.d}')` }}
              />
            )}
          </g>
        ))}

        {/* ── Thin Elegant Curved Arc from Agent into Verified Answer (NO OVERLAP) ── */}
        <g>
          <path
            d="M 256 180 C 275 202, 292 195, 308 172"
            stroke="url(#cyan-thin-grad)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#subtle-arrow)"
            opacity={phase >= 2 ? 0.95 : 0.4}
            className="transition-opacity duration-300"
          />

          {/* Photon pulse into Verified Answer */}
          {phase >= 2 && (
            <motion.circle
              r="2.5"
              fill="#22d3ee"
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{
                offsetDistance: ["0%", "96%"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                offsetPath: "path('M 256 180 C 275 202, 292 195, 308 172')",
              }}
            />
          )}
        </g>
      </svg>

      {/* =====================================================================
          1. 4 DOCUMENT CARDS STACKED VERTICALLY ON THE LEFT
         ===================================================================== */}
      <div
        className="absolute left-0 top-[74px] flex w-[150px] flex-col gap-[7px]"
        style={{
          transform: "rotateY(-10deg) rotateX(2deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {DOCS.map((doc, idx) => {
          const isDocActive = phase === 0;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{
                opacity: 1,
                x: 0,
                y: isDocActive ? [0, -1.5, 0] : 0,
              }}
              transition={{
                duration: 0.4,
                delay: idx * 0.06,
                y: isDocActive
                  ? { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: idx * 0.15 }
                  : undefined,
              }}
              className={`group relative flex h-[38px] items-center gap-2 overflow-hidden rounded-xl border px-2 py-1.5 backdrop-blur-xl transition-all duration-300 ${
                isDocActive
                  ? "border-white/20 bg-[#0e1017]/92 shadow-[0_6px_18px_rgba(0,0,0,0.8)]"
                  : "border-white/[0.08] bg-[#090b10]/85 shadow-[0_4px_14px_rgba(0,0,0,0.6)]"
              }`}
            >
              {/* Subtle top edge highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Icon Box */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg shadow-sm ${doc.bg}`}
              >
                {doc.icon}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-[11px] font-medium text-white/95 tracking-tight leading-tight">
                  {doc.name}
                </div>
                <div className="text-[9px] text-white/40 leading-none mt-0.5">{doc.pages}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* =====================================================================
          2. SMALL CENTRAL TRUEDOCS AGENT (Completely visible, zero overlap, z-20)
         ===================================================================== */}
      <div
        className="absolute left-[175px] top-[116px] z-20"
        style={{
          transform: "translate(0, 0)",
        }}
      >
        <div className="relative flex flex-col items-center justify-center">
          {/* Main Dark Spherical Agent Node - NO large blue orb */}
          <motion.div
            animate={
              phase === 1
                ? {
                    scale: 1.03,
                    boxShadow:
                      "0 0 16px rgba(255, 255, 255, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.35)",
                  }
                : {
                    scale: 1,
                    boxShadow:
                      "0 0 10px rgba(255, 255, 255, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                  }
            }
            transition={{ duration: 0.4 }}
            className="relative flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full border border-white/20 bg-gradient-to-b from-[#141722] via-[#090b10] to-[#040507] backdrop-blur-xl"
          >
            {/* Top Gloss Reflection */}
            <div className="pointer-events-none absolute inset-x-4 top-1.5 h-5 rounded-full bg-gradient-to-b from-white/20 to-transparent blur-[1px]" />

            {/* TrueDocs 3D Silver Logo */}
            <div className="relative z-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <TrueDocsSilverLogo className="h-6 w-6" />
            </div>

            {/* Typography - completely visible and unobstructed */}
            <div className="relative z-10 mt-1 text-center">
              <div className="text-[11px] font-semibold text-white tracking-tight leading-none">
                TrueDocs
              </div>
              <div className="mt-0.5 text-[8.5px] text-white/50 font-medium tracking-wide">
                AI Agent
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =====================================================================
          3. PROCESS / VERIFICATION PANEL (ABOVE-RIGHT of the Agent)
         ===================================================================== */}
      <div
        className="absolute left-[375px] top-[15px] w-[205px] z-10"
        style={{
          transform: "rotateY(6deg) rotateX(1deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#090b11]/90 p-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
        >
          {/* Subtle top edge highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Sparkle Icon */}
          <div className="mb-2 flex items-center">
            <div className="flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-cyan-400">
              <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3">
                <path
                  d="M10 2L11.5 7.5L17 9L11.5 10.5L10 16L8.5 10.5L3 9L8.5 7.5L10 2Z"
                  fill="currentColor"
                />
                <circle cx="16" cy="4" r="1.2" fill="currentColor" opacity="0.8" />
              </svg>
            </div>
          </div>

          {/* 3 Verification Check Steps */}
          <div className="flex flex-col gap-2">
            {PROCESS_STEPS.map((step, idx) => {
              const isChecked = phase >= 2 || (phase === 1 && idx === 0);

              return (
                <div key={step.id} className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-[11px] leading-tight transition-colors duration-300 flex items-center gap-1.5 ${
                      step.highlight ? "text-white/90" : "text-white/70"
                    }`}
                  >
                    <span className="text-white/30 text-[9px]">•</span>
                    {step.highlight ? (
                      <span>
                        Verifying <span className="text-cyan-400 font-medium">with sources</span>
                      </span>
                    ) : (
                      <span>{step.text}</span>
                    )}
                  </span>

                  {/* Circular Cyan Checkmark */}
                  <motion.div
                    animate={
                      isChecked
                        ? { scale: [0.85, 1.15, 1], opacity: 1 }
                        : { scale: 0.9, opacity: 0.3 }
                    }
                    transition={{ duration: 0.25, delay: idx * 0.1 }}
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-cyan-400"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
                      <path
                        d="M5 8.2l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* =====================================================================
          4. VERIFIED ANSWER CARD (BELOW-RIGHT of the Agent, STRICTLY NO OVERLAP)
         ===================================================================== */}
      <div
        className="absolute left-[290px] top-[168px] w-[298px] z-10"
        style={{
          transform: "rotateY(4deg) rotateX(1deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          animate={
            phase === 3
              ? {
                  borderColor: "rgba(34, 211, 238, 0.35)",
                  boxShadow:
                    "0 12px 36px -6px rgba(0, 0, 0, 0.9), 0 0 20px -4px rgba(34, 211, 238, 0.15)",
                }
              : {
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 8px 24px -6px rgba(0, 0, 0, 0.8)",
                }
          }
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-xl border bg-[#080a10]/92 p-3 backdrop-blur-xl text-left"
        >
          {/* Subtle top edge line with green/cyan glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
                  <path
                    d="M4 8l2.5 2.5L12 5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-[12px] font-semibold text-emerald-400 tracking-tight">
                Verified Answer
              </span>
            </div>

            <span className="font-mono text-[10px] text-white/40">2s</span>
          </div>

          {/* Answer Paragraph */}
          <p className="mt-1.5 text-[10.5px] leading-[1.5] text-white/80">
            The company&apos;s revenue in Q3 2024 increased by 32% compared to Q3 2023, driven by
            growth in the enterprise segment.
          </p>

          {/* Citation Chips */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-0.5">
            {/* Q3 Report Citation */}
            <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5">
              <span className="flex h-3 w-3 items-center justify-center rounded bg-rose-600">
                <PdfIcon className="h-2 w-2 text-white" />
              </span>
              <div className="text-[9.5px] font-medium text-white/90">
                Q3 Report.pdf <span className="text-white/40 text-[8.5px]">Page 12</span>
              </div>
            </div>

            {/* Strategy.docx Citation */}
            <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5">
              <span className="flex h-3 w-3 items-center justify-center rounded bg-blue-600">
                <WordIcon className="h-2 w-2 text-white" />
              </span>
              <div className="text-[9.5px] font-medium text-white/90">
                Strategy.docx <span className="text-white/40 text-[8.5px]">Page 5</span>
              </div>
            </div>

            {/* +2 sources */}
            <span className="rounded-md border border-white/5 bg-white/[0.02] px-1.5 py-0.5 text-[9px] text-white/40">
              +2 sources
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}