"use client";

import { motion } from "framer-motion";
import { Container, SectionHeading } from "./primitives";

/* -------------------------------------------------------------------------- */
/*  Steps (the 4 agents of our pipeline)                                      */
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
    active: true,
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

function StepCard({ step }: { step: (typeof STEPS)[number] }) {
  return (
    <div
      className={`relative rounded-xl border bg-white/[0.02] p-5 transition-colors ${
        step.active
          ? "border-white/[0.08]"
          : "border-white/[0.06] hover:border-white/[0.1]"
      }`}
    >
      {/* Top accent line */}
      {step.active ? (
        <motion.div
          layoutId="step-accent"
          className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400 to-cyan-400/0"
        />
      ) : (
        <div className="absolute inset-x-0 -top-px h-px bg-white/[0.06]" />
      )}

      <div className="flex items-start justify-between">
        <span className="text-[11px] font-medium tracking-wider text-white/45">
          {step.n}
        </span>
        <span
          className={`flex h-1.5 w-1.5 rounded-full ${
            step.active ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.7)]" : "bg-white/30"
          }`}
        />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
            step.active
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
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Planner Agent Demo Panel                                                  */
/* -------------------------------------------------------------------------- */

const SUB_QUESTIONS = [
  {
    n: "Q1",
    target: "CONTRACTS / ATTICUS CUAD",
    kind: "Vector Chunk Search",
    text: "Extract termination notification period & penalty triggers for Vendor X.",
  },
  {
    n: "Q2",
    target: "CORPORATE POLICY / SEC 14",
    kind: "Vector Chunk Search",
    text: "Retrieve aggregate liability cap amount and exceptions under 2024 guidelines.",
  },
  {
    n: "Q3",
    target: "NEO4J KNOWLEDGE GRAPH",
    kind: "Graph Entity Traversal",
    text: "Traverse relationship path: (Vendor_X)-[GOVERNED_BY]->(Liability_Limit).",
  },
];

function PlannerPanel() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08090d]">
      {/* Top edge subtle line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <div className="grid gap-px md:grid-cols-2">
        {/* Left: Incoming Question */}
        <div className="relative p-6 md:p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <div className="text-[13px] font-semibold text-white">
                  01 · Planner Agent
                </div>
                <div className="text-[11.5px] text-white/45">
                  Multi-hop query deconstruction & planning
                </div>
              </div>
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
            {SUB_QUESTIONS.map((q) => (
              <div
                key={q.n}
                className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.12] hover:bg-white/[0.035]"
              >
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-400/10 text-[10px] font-semibold text-cyan-300">
                      {q.n.replace("Q", "")}
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
              </div>
            ))}
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

        {/* 4 step cards */}
        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <StepCard key={s.n} step={s} />
          ))}
        </div>

        {/* Planner demo panel */}
        <div className="mt-8">
          <PlannerPanel />
        </div>
      </Container>
    </section>
  );
}