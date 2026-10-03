"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container, SectionHeading } from "./primitives";

/* -------------------------------------------------------------------------- */
/*  Steps — the 4 agents of our pipeline (with cycling active state)          */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    n: "01",
    title: "Planner",
    desc: "Deconstructs query",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
        <path
          d="M3 7h6M3 12h6m-6 5h12M14 7h7M14 12h7m-7 5h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Retriever",
    desc: "Vector + Graph search",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Verifier",
    desc: "Cross-checks evidence",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
        <path
          d="m5 12 5 5L20 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Answerer",
    desc: "Synthesizes citations",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
        <path
          d="M4 5h16v11H7l-3 3V5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M8 9h8M8 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

const STEP_INTERVAL = 2200;

function StepCard({
  step,
  index,
  activeIndex,
  setActiveIndex,
}: {
  step: (typeof STEPS)[number];
  index: number;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
}) {
  const active = index === activeIndex;
  return (
    <motion.button
      type="button"
      onClick={() => setActiveIndex(index)}
      whileHover={{ y: -2 }}
      animate={{ scale: active ? 1.015 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={`relative w-full rounded-xl border p-5 text-left transition-colors ${
        active
          ? "border-white/[0.12] bg-white/[0.04]"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.03]"
      }`}
      style={{ transition: "border-color 200ms, background-color 200ms" }}
      aria-pressed={active}
    >
      {/* Top accent line that slides between cards */}
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="step-accent"
            className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
      </AnimatePresence>
      {!active && <div className="absolute inset-x-0 -top-px h-px bg-white/[0.06]" />}

      <div className="flex items-start justify-between">
        <span
          className={`text-[11px] font-medium tracking-wider transition-colors ${
            active ? "text-cyan-300" : "text-white/45"
          }`}
        >
          {step.n}
        </span>
        <motion.span
          animate={
            active
              ? {
                  boxShadow: [
                    "0 0 0 0 rgba(34,211,238,0)",
                    "0 0 8px 2px rgba(34,211,238,0.45)",
                    "0 0 0 0 rgba(34,211,238,0)",
                  ],
                }
              : { boxShadow: "0 0 0 0 rgba(34,211,238,0)" }
          }
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className={`block h-1.5 w-1.5 rounded-full ${
            active ? "bg-cyan-400" : "bg-white/30"
          }`}
        />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors ${
            active
              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
              : "border-white/[0.07] bg-white/[0.03] text-white/65"
          }`}
        >
          {step.icon}
        </span>
        <h3 className="text-[15px] font-semibold tracking-tight text-white">
          {step.title}
        </h3>
      </div>

      <p className="mt-2 text-[12.5px] leading-relaxed text-white/50">
        {step.desc}
      </p>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Planner Agent Demo Panel (interactive with active step)                  */
/* -------------------------------------------------------------------------- */

const SUB_QUESTIONS = [
  {
    n: 1,
    target: "CONTRACTS / ATTICUS CUAD",
    kind: "Vector Chunk Search",
    text: "Extract termination notification period & penalty triggers for Vendor X.",
  },
  {
    n: 2,
    target: "CORPORATE POLICY / SEC 14",
    kind: "Vector Chunk Search",
    text: "Retrieve aggregate liability cap amount and exceptions under 2024 guidelines.",
  },
  {
    n: 3,
    target: "NEO4J KNOWLEDGE GRAPH",
    kind: "Graph Entity Traversal",
    text: "Traverse relationship path: (Vendor_X)-[GOVERNED_BY]->(Liability_Limit).",
  },
];

const STEP_LABEL = ["Planner", "Retriever", "Verifier", "Answerer"];

function StepPanelIcon({ step }: { step: number }) {
  switch (step) {
    case 0: // Planner — file icon
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case 1: // Retriever — magnifier
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 2: // Verifier — check
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path
            d="m5 12 5 5L20 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 3: // Answerer — chat
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path
            d="M4 5h16v11H7l-3 3V5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M8 9h8M8 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function PlannerPanel({ activeStep }: { activeStep: number }) {
  // activeStep 0 (Planner)  -> sub-q just deconstructed (subtle processing pulse)
  // activeStep 1 (Retriever) -> sub-q being searched (cyan pulse + bar)
  // activeStep 2 (Verifier)  -> sub-q being cross-checked (cyan pulse)
  // activeStep 3 (Answerer)  -> sub-q verified (emerald check)
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08090d]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <div className="grid gap-px md:grid-cols-2">
        {/* Left: Incoming Question */}
        <div className="relative p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={`icon-${activeStep}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3 }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                >
                  <StepPanelIcon step={activeStep} />
                </motion.span>
              </AnimatePresence>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-mono font-medium text-white">
                    0{activeStep + 1}
                  </span>
                  <span className="text-[13px] font-semibold text-white">
                    · {STEP_LABEL[activeStep]} Agent
                  </span>
                </div>
                <div className="text-[11.5px] text-white/45">
                  Multi-hop query deconstruction & planning
                </div>
              </div>
            </div>

            {/* Status pill (top-right of left panel) */}
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10.5px] font-medium text-white/70">
              <motion.span
                animate={
                  activeStep === 0
                    ? {
                        backgroundColor: ["#22d3ee", "#22d3ee", "#22d3ee"],
                        boxShadow: [
                          "0 0 0 0 rgba(34,211,238,0)",
                          "0 0 6px 1px rgba(34,211,238,0.7)",
                          "0 0 0 0 rgba(34,211,238,0)",
                        ],
                      }
                    : { backgroundColor: "#22d3ee" }
                }
                transition={{ duration: 1.4, repeat: activeStep === 0 ? Infinity : 0 }}
                className="block h-1.5 w-1.5 rounded-full"
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={`status-${activeStep}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  {activeStep === 0 && "Planning Strategy"}
                  {activeStep === 1 && "Searching Evidence"}
                  {activeStep === 2 && "Cross-checking Claims"}
                  {activeStep === 3 && "Synthesizing Response"}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/40">
              Incoming complex question
            </div>

            <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-center gap-2 text-[10.5px] uppercase tracking-wider text-white/45">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5">
                  User Query
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5">
                  Master Agreement 2024
                </span>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-white/85">
                <span className="text-white/55">“</span>
                Does Vendor X&apos;s termination cause in the 2024 Agreement comply
                with our updated liability limits in Section 14?
                <span className="text-white/55">”</span>
              </p>
              <div className="mt-3 flex items-center gap-2 border-t border-white/[0.05] pt-3 text-[12px] text-cyan-300/90">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" />
                <span>
                  Requires <span className="font-mono">2 document traversals</span> +
                  <span className="font-mono"> 1 compliance cross-check</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Decomposed Sub-questions */}
        <div className="relative border-t border-white/[0.05] bg-white/[0.012] p-6 md:border-l md:border-t-0 md:p-7">
          <div className="flex items-center justify-between">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-white/45">
              Decomposed sub-questions
            </div>
            <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wider text-white/55">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>(Executed in parallel)</span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {SUB_QUESTIONS.map((q) => {
              const done = activeStep >= 3;
              const processing = activeStep === 1 || activeStep === 2;
              return (
                <motion.div
                  key={q.n}
                  animate={{
                    borderColor: done
                      ? "rgba(16,185,129,0.3)"
                      : processing
                        ? "rgba(34,211,238,0.35)"
                        : "rgba(255,255,255,0.07)",
                    backgroundColor: done
                      ? "rgba(16,185,129,0.04)"
                      : processing
                        ? "rgba(34,211,238,0.04)"
                        : "rgba(255,255,255,0.02)",
                  }}
                  transition={{ duration: 0.4 }}
                  className="rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] font-semibold transition-colors ${
                          done
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                            : processing
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                              : "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                        }`}
                      >
                        {done ? (
                          <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          q.n
                        )}
                      </span>
                      <span className="text-white/55">Target:</span>
                      <span className="font-mono text-white/75">{q.target}</span>
                    </div>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/55">
                      {q.kind}
                    </span>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-white/75">
                    {q.text}
                  </p>
                  {processing && (
                    <motion.div
                      className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/[0.06]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through the 4 steps; pause briefly at each
  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, STEP_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <Container>
        <SectionHeading
          badge="Simple. Powerful. Effective."
          title={
            <>
              How TrueDocs{" "}
              <span className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
                Works
              </span>
            </>
          }
          description="Four agents collaborate to turn complex questions into verified, sourced answers."
        />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <StepCard
              key={s.n}
              step={s}
              index={i}
              activeIndex={activeStep}
              setActiveIndex={setActiveStep}
            />
          ))}
        </div>

        <div className="mt-8">
          <PlannerPanel activeStep={activeStep} />
        </div>
      </Container>
    </section>
  );
}