"use client";

import { motion } from "framer-motion";
import { HeroVisualization } from "./HeroVisualization";
import { Badge, Container, GhostButton, PrimaryButton } from "./primitives";

const STATS = [
  { value: "10x", label: "Faster Insights" },
  { value: "99%+", label: "Answer Accuracy" },
  { value: "All", label: "Document Types" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-[115px] pb-16 sm:pt-[130px] md:pb-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[650px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-radial from-white/[0.04] to-transparent blur-3xl" />
        <div className="absolute inset-0 dot-grid-bg opacity-30" />
        <div className="absolute -left-40 top-20 h-[400px] w-[400px] rounded-full bg-gradient-radial from-blue-500/[0.02] to-transparent blur-3xl" />
      </div>

      <Container>
        {/* Main Hero Grid: Left content & Stats + Right compact Visual cluster */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left Column: Heading, Copy, Buttons, Stats */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge>AI-Powered Document Intelligence</Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-balance text-5xl font-semibold tracking-[-0.02em] text-white sm:text-6xl md:text-[72px] md:leading-[1.04]"
            >
              From Documents
              <br />
              <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                to Real Knowledge
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/55 sm:text-base"
            >
              TrueDocs uses Agentic AI and Knowledge Graphs to turn your
              documents into structured, searchable, and verifiable knowledge.
              Find answers, uncover connections, and work 10x faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3.5"
            >
              <PrimaryButton href="/signup">
                Get Started Free
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </PrimaryButton>
              <GhostButton>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Demo
              </GhostButton>
            </motion.div>

            {/* Left: 3 Stats matching reference image */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex items-center gap-6 sm:gap-8 pt-2"
            >
              {STATS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-6 sm:gap-8">
                  <div>
                    <div className="text-2xl font-semibold tracking-tight text-white sm:text-[26px]">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[13px] leading-tight text-white/45">
                      {s.label}
                    </div>
                  </div>
                  {i < STATS.length - 1 && (
                    <div className="h-9 w-px bg-white/[0.1]" aria-hidden="true" />
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Compact Visual Cluster matching reference image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-end w-full"
          >
            <div className="w-full max-w-[660px] flex justify-center lg:justify-end">
              <HeroVisualization />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}