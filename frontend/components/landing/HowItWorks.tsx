"use client";

import { motion } from "framer-motion";
import { Container } from "./primitives";

const STEPS = [
  {
    n: "1",
    title: "Upload",
    body: "Add your documents\n(PDF, DOCX, PPT, etc.)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
        <path
          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 8l-5-5-5 5M12 3v12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    n: "2",
    title: "Build Knowledge Graph",
    body: "We extract entities, relationships\nand context automatically.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
        <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="19" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="5" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="19" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M7 6.5l3.5 3.5M13.5 14l3.5 3.5M17 7l-3.5 3.5M10.5 14L7 17.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    n: "3",
    title: "Ask & Explore",
    body: "Get accurate, source-backed\nanswers and discover insights.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
        <rect
          x="3"
          y="4"
          width="18"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 18l-3 3v-3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 8.5h6M7 12h10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

function ArrowDivider() {
  return (
    <div className="hidden md:flex items-center justify-center pt-8 text-white/30">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[12px] font-medium text-white/70 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Simple. Powerful. Effective.
          </div>

          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            How TrueDocs Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/50">
            Turn your documents into a connected knowledge graph in three simple steps.
          </p>
        </motion.div>

        {/* 3 Step columns with arrows between */}
        <div className="mt-16 flex flex-col items-center justify-center gap-10 md:flex-row md:items-start md:gap-8 lg:gap-14">
          {STEPS.map((s, i) => (
            <div key={s.n} className="contents">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group flex flex-col items-center text-center max-w-[280px]"
              >
                {/* Glossy dark squircle icon box with bevel effect */}
                <motion.div
                  whileHover={{ y: -4, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.12] bg-gradient-to-b from-white/[0.08] to-white/[0.02] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl transition-all duration-300 group-hover:border-white/[0.25] group-hover:shadow-[0_12px_40px_-10px_rgba(59,130,246,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)]"
                >
                  {/* Subtle top edge glow */}
                  <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  {s.icon}
                </motion.div>

                {/* Step title */}
                <h3 className="mt-6 text-[19px] font-semibold text-white">
                  {s.n}. {s.title}
                </h3>

                {/* Step description */}
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/50 whitespace-pre-line">
                  {s.body}
                </p>
              </motion.div>

              {i < STEPS.length - 1 && <ArrowDivider />}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}