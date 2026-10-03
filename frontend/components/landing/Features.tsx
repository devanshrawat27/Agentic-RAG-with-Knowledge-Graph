"use client";

import { motion } from "framer-motion";
import { Container } from "./primitives";

interface Feature {
  title: string;
  body: string;
  accent: string;
  accentGlow: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: "Agentic RAG",
    body: "AI agents plan, search, and reason across your documents to give accurate answers.",
    accent: "#38bdf8",
    accentGlow: "rgba(56, 189, 248, 0.22)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6L12 2Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <circle cx="5" cy="5" r="1" fill="currentColor" opacity="0.6" />
        <circle cx="19" cy="6" r="1" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: "Knowledge Graph",
    body: "Automatically extract entities and relationships to uncover deeper insights.",
    accent: "#a78bfa",
    accentGlow: "rgba(167, 139, 250, 0.22)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="5" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="19" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 6.5l3.5 3.5M13.5 14l3.5 3.5M17 7l-3.5 3.5M10.5 14L7 17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Source-Grounded Answers",
    body: "Every answer is backed with original sources and citations.",
    accent: "#34d399",
    accentGlow: "rgba(52, 211, 153, 0.22)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M12 3L4 6v5.5c0 5 3.5 9.5 8 10.5 4.5-1 8-5.5 8-10.5V6l-8-3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Multi-Document Support",
    body: "Works with PDFs, Docs, PPTs, CSV, and more.",
    accent: "#60a5fa",
    accentGlow: "rgba(96, 165, 250, 0.22)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect
          x="3"
          y="4"
          width="12"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M7 2h10a2 2 0 0 1 2 2v14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M6 9h6M6 12h4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-[12px] font-medium text-white/85 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
            Everything You Need
          </div>

          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-[52px] md:leading-[1.12]">
            Powerful Features for Smarter Work
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/55 sm:text-base leading-relaxed">
            Built for researchers, teams, and businesses who work with complex documents.
          </p>
        </motion.div>

        <div className="mt-14 md:mt-16 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -3 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] via-white/[0.015] to-transparent p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:border-white/[0.18] hover:bg-gradient-to-b hover:from-white/[0.07] hover:via-white/[0.025] hover:to-transparent hover:shadow-[0_18px_50px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.12)]"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/[0.25] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-2xl -z-10"
                style={{ background: `radial-gradient(420px 160px at 50% 0%, ${f.accentGlow}, transparent 70%)` }}
              />

              <div className="relative">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-black text-white/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18),0_2px_8px_rgba(0,0,0,0.5)] transition-all duration-300"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    className="transition-colors duration-300"
                    style={{ color: f.accent }}
                  >
                    {f.icon}
                  </span>
                </div>
                <div
                  className="absolute left-0 top-0 h-12 w-12 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl pointer-events-none"
                  style={{ backgroundColor: f.accentGlow }}
                />

                <h3 className="mt-5 text-[15.5px] font-semibold tracking-tight text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                  {f.body}
                </p>

                <div
                  className="mt-5 h-[1.5px] w-0 transition-all duration-500 group-hover:w-12"
                  style={{ backgroundColor: f.accent, boxShadow: `0 0 8px ${f.accent}` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}