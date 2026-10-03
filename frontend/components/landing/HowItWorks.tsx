"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container, SectionHeading } from "./primitives";

/* -------------------------------------------------------------------------- */
/*  Scene 1 — Upload                                                          */
/* -------------------------------------------------------------------------- */

function UploadScene() {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-[120px] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
      {/* Faint dashed grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.18]" aria-hidden="true">
        <defs>
          <pattern id="scn-grid-1" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scn-grid-1)" />
      </svg>

      {/* Platform / tray */}
      <div className="absolute bottom-4 left-1/2 h-2 w-40 -translate-x-1/2 rounded-full bg-gradient-to-r from-white/5 via-white/15 to-white/5 shadow-[0_0_18px_rgba(255,255,255,0.08)]" />

      {/* Incoming documents */}
      {[
        { delay: 0, x: "calc(50% - 50px)" },
        { delay: 0.6, x: "calc(50% - 10px)" },
        { delay: 1.2, x: "calc(50% + 30px)" },
      ].map((d, i) => (
        <motion.div
          key={i}
          className="absolute top-0 -translate-x-1/2"
          style={{ left: d.x }}
          initial={{ y: -20, opacity: 0 }}
          animate={
            reduce
              ? { y: 0, opacity: 1 }
              : {
                  y: [-20, 50, 50],
                  opacity: [0, 1, 0],
                }
          }
          transition={{
            duration: 2.4,
            repeat: Infinity,
            repeatDelay: 1,
            delay: d.delay,
            ease: "easeInOut",
          }}
        >
          <DocMini kind={i} />
        </motion.div>
      ))}
    </div>
  );
}

function DocMini({ kind }: { kind: number }) {
  const colors = ["#3B82F6", "#10B981", "#F59E0B"];
  const letters = ["P", "W", "P"];
  return (
    <div
      className="flex h-8 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] shadow-md backdrop-blur"
      style={{ borderColor: colors[kind] + "55" }}
    >
      <span
        className="text-[10px] font-bold text-white"
        style={{ color: colors[kind] }}
      >
        {letters[kind]}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene 2 — Build Knowledge Graph                                          */
/* -------------------------------------------------------------------------- */

function GraphScene() {
  const reduce = useReducedMotion();
  // 5 nodes around a central node
  const nodes = [
    { id: "doc", x: 18, y: 22, color: "#60A5FA" },
    { id: "person", x: 82, y: 20, color: "#34D399" },
    { id: "contract", x: 14, y: 78, color: "#C084FC" },
    { id: "event", x: 86, y: 80, color: "#FBBF24" },
    { id: "clause", x: 50, y: 12, color: "#F87171" },
  ];
  const center = { x: 50, y: 50 };

  const edges: Array<[number, number]> = [
    [0, 4], [1, 4], [2, 4], [3, 4], // outer -> top
  ];

  return (
    <div className="relative h-[120px] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
      {/* Faint dot grid */}
      <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
        <defs>
          <pattern id="scn-grid-2" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.4" fill="rgba(255,255,255,0.2)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scn-grid-2)" />
      </svg>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="scn-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="url(#scn-edge)"
            strokeWidth="0.25"
            strokeDasharray="1 1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.8, 0.4] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Outer nodes */}
      {nodes.map((n, i) => (
        <motion.div
          key={n.id}
          className="absolute"
          style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)" }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={
            reduce
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: [0.3, 1, 1, 0.6],
                }
          }
          transition={{
            duration: 3.2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeInOut",
          }}
        >
          <div className="flex h-3 w-3 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: n.color, boxShadow: `0 0 6px ${n.color}55` }}
            />
          </div>
        </motion.div>
      ))}

      {/* Center node */}
      <motion.div
        className="absolute"
        style={{ left: `${center.x}%`, top: `${center.y}%`, transform: "translate(-50%, -50%)" }}
        animate={
          reduce
            ? undefined
            : { scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-cyan-400/15 blur-md" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] backdrop-blur shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/85" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene 3 — Ask & Explore                                                   */
/* -------------------------------------------------------------------------- */

function AskScene() {
  const reduce = useReducedMotion();
  return (
    <div className="relative h-[120px] w-full overflow-hidden rounded-xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent">
      {/* Faint dashed grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.18]" aria-hidden="true">
        <defs>
          <pattern id="scn-grid-3" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#scn-grid-3)" />
      </svg>

      {/* Query bubble */}
      <motion.div
        className="absolute left-1/2 top-3 -translate-x-1/2"
        initial={{ opacity: 0, y: -4 }}
        animate={reduce ? { opacity: 1, y: 0 } : { opacity: [0, 1, 1], y: [-4, 0, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-medium text-white/85">Ask anything...</span>
        </div>
      </motion.div>

      {/* Connector arrow */}
      <motion.div
        className="absolute left-1/2 top-12 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, delay: 0.4 }}
      >
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" aria-hidden="true">
          <line x1="6" y1="0" x2="6" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" strokeDasharray="1.2 1.2" />
          <path d="m2 8 4 4 4-4" stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" fill="none" />
        </svg>
      </motion.div>

      {/* Answer card */}
      <motion.div
        className="absolute left-1/2 bottom-2 -translate-x-1/2 w-[78%] max-w-[200px]"
        animate={reduce ? undefined : { y: [4, 0, 0], opacity: [0, 1, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, delay: 0.8, ease: "easeOut" }}
      >
        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 backdrop-blur shadow-[0_4px_18px_-6px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-1.5">
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="h-1 flex-1 rounded-full bg-white/15" />
            <div className="h-1 w-6 rounded-full bg-white/10" />
          </div>
          <div className="mt-1.5 flex gap-1">
            <div className="h-1 flex-1 rounded-full bg-white/10" />
            <div className="h-1 w-1/3 rounded-full bg-white/10" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    n: "01",
    title: "Upload",
    desc: "Drop your documents — any format.",
    Scene: UploadScene,
  },
  {
    n: "02",
    title: "Build Graph",
    desc: "Entities and context connect themselves.",
    Scene: GraphScene,
  },
  {
    n: "03",
    title: "Ask Anything",
    desc: "Get sourced answers in seconds.",
    Scene: AskScene,
  },
];

function Arrow() {
  return (
    <div className="hidden h-[120px] items-center md:flex">
      <svg width="90" height="16" viewBox="0 0 90 16" fill="none" aria-hidden="true">
        <line x1="0" y1="8" x2="78" y2="8" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" strokeDasharray="1.5 2" />
        <path d="m74 3 10 5-10 5" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" fill="none" />
      </svg>
    </div>
  );
}

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
          description="Three steps from your documents to verified knowledge."
        />

        <div className="mt-14 grid items-stretch gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="contents">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col"
              >
                <s.Scene />
                <div className="mt-5 text-[12px] font-medium tracking-wider text-white/40">
                  {s.n}
                </div>
                <h3 className="mt-1 text-[18px] font-semibold tracking-tight text-white">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">
                  {s.desc}
                </p>
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex items-start justify-center pt-[52px]">
                  <Arrow />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}