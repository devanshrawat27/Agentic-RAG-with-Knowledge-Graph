"use client";

import { motion } from "framer-motion";
import { Container, SectionHeading } from "./primitives";

const STEPS = [
  {
    n: "01",
    title: "Upload",
    body: "Add your documents (PDF, DOCX, PPT, etc.).",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Build Knowledge Graph",
    body: "We extract entities, relationships and context automatically.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 6h8M8 18h8M6 8v8M18 8v8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Ask & Explore",
    body: "Get accurate, source-backed answers and discover insights.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function Arrow() {
  return (
    <div className="hidden h-12 items-center md:flex">
      <svg width="100" height="20" viewBox="0 0 100 20" fill="none" aria-hidden="true">
        <line x1="0" y1="10" x2="92" y2="10" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 3" />
        <path d="m86 5 10 5-10 5" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
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
          description="Turn your documents into a connected knowledge graph in three simple steps."
        />

        <div className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-0">
          {STEPS.map((s, i) => (
            <div key={s.n} className="contents">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/80">
                  {s.icon}
                </div>
                <div className="mt-5 text-[12px] font-medium tracking-wider text-white/40">
                  {s.n}
                </div>
                <h3 className="mt-1 text-[18px] font-semibold text-white">
                  {s.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">
                  {s.body}
                </p>
              </motion.div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-3">
                  <Arrow />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile vertical arrows */}
        <div className="mt-4 flex flex-col items-center gap-2 md:hidden">
          {[1, 2].map((i) => (
            <svg key={i} width="20" height="32" viewBox="0 0 20 32" fill="none" aria-hidden="true">
              <line x1="10" y1="0" x2="10" y2="26" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 3" />
              <path d="m5 22 5 8 5-8" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
            </svg>
          ))}
        </div>
      </Container>
    </section>
  );
}