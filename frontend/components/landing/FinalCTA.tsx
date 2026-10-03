"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "./primitives";

export function FinalCTA() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className="relative px-6 py-24 md:py-32 overflow-hidden">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#070709] px-6 py-20 text-center md:px-12 md:py-28 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.95)]"
        >
          {/* ── Interactive Cursor Spotlight ──────────────────── */}
          <div
            className="pointer-events-none absolute -inset-px rounded-[32px] transition-opacity duration-500"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 40%)`,
            }}
          />

          {/* ── Top Ambient Light Cone ───────────────────────── */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[380px] w-[700px] rounded-full bg-gradient-radial from-white/[0.05] via-blue-500/[0.02] to-transparent blur-3xl" />

          {/* ── Subtle Dot Matrix ────────────────────────────── */}
          <div className="pointer-events-none absolute inset-0 dot-grid-bg opacity-15" />

          {/* ── Cinematic Horizon Arc at Bottom ──────────────── */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
            <div className="relative h-[220px] w-[900px] -bottom-20">
              {/* Soft diffused atmospheric glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-500/20 via-cyan-400/10 to-transparent blur-3xl opacity-75" />

              {/* Crisp glowing curved horizon */}
              <svg viewBox="0 0 900 220" className="w-full h-full" fill="none">
                <defs>
                  <linearGradient id="horizon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(56,189,248,0)" />
                    <stop offset="25%" stopColor="rgba(56,189,248,0.25)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
                    <stop offset="75%" stopColor="rgba(129,140,248,0.25)" />
                    <stop offset="100%" stopColor="rgba(129,140,248,0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 180 Q 450 60 900 180"
                  stroke="url(#horizon-glow)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          {/* ── Content Container ────────────────────────────── */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-[12.5px] font-medium text-white/80 backdrop-blur-xl"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
              Start Building Your Knowledge
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-[54px] md:leading-[1.1]"
            >
              Turn Your Documents{" "}
              <span className="bg-gradient-to-r from-white via-white/95 to-white/50 bg-clip-text text-transparent">
                into Intelligence
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-4 max-w-xl text-[15px] text-white/50 sm:text-base leading-relaxed"
            >
              Join researchers, teams, and organizations using TrueDocs to work
              smarter.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
            >
              {/* Primary White Button */}
              <a
                href="/signup"
                className="group relative inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-semibold text-neutral-950 transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] active:scale-95"
              >
                Get Started Free
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>

              {/* View GitHub Button */}
              <a
                href="https://github.com/devanshrawat27/Agentic-RAG-with-Knowledge-Graph"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.03] px-7 py-3.5 text-[14.5px] font-medium text-white/90 backdrop-blur-xl transition-all duration-300 hover:border-white/25 hover:bg-white/[0.06] hover:text-white active:scale-95"
              >
                View GitHub
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white/80 transition-transform duration-300 group-hover:scale-110">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.36-3.37-1.36-.46-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.07.64-1.32-2.22-.26-4.55-1.13-4.55-5.03 0-1.11.39-2.02 1.03-2.73-.1-.27-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.04.8-.23 1.65-.34 2.5-.34s1.7.11 2.5.34c1.91-1.32 2.75-1.04 2.75-1.04.55 1.41.2 2.44.1 2.71.64.71 1.03 1.62 1.03 2.73 0 3.91-2.34 4.77-4.57 5.02.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
                  />
                </svg>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}