"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

export interface AuthFeature {
  icon: ReactNode;
  title: string;
  body: string;
}

const DEFAULT_FEATURES: AuthFeature[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "Upload any document type",
    body: "PDF, DOCX, PPT, CSV and more",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="18" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M8 7l8 0M7.5 8l3 8M16.5 8l-3 8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "AI-powered understanding",
    body: "Extract insights automatically",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M3 7l9-4 9 4-9 4-9-4Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M3 12l9 4 9-4M3 17l9 4 9-4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
    title: "Build your knowledge graph",
    body: "Find connections across your documents",
  },
];

export function AuthShell({
  badge,
  title,
  highlight,
  description,
  showFeatures = true,
  features,
  children,
}: {
  badge: string;
  title: string;
  highlight?: string;
  description: string;
  showFeatures?: boolean;
  features?: AuthFeature[];
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#050505] text-white">
      {/* ── Animated aurora background ─────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 top-1/4 h-[520px] w-[520px] rounded-full bg-cyan-500/[0.08] blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-1/3 h-[600px] w-[600px] rounded-full bg-blue-500/[0.07] blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 60, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 bottom-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-emerald-500/[0.05] blur-3xl"
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)",
          }}
        />

        {/* Noise grain */}
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      {/* ── Tight two-column layout (constrained) ─────────────── */}
      <div className="mx-auto grid w-full max-w-[1180px] flex-1 items-center px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        {/* ── Left brand panel ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="relative hidden flex-col justify-center py-12 lg:flex"
        >
          {/* Logo at top-left */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10 flex items-center gap-3"
          >
            <Image
              src="/Futuristic Folded Ribbon Emblem.png"
              alt="TrueDocs"
              width={44}
              height={44}
              className="h-11 w-11 object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              priority
            />
            <span className="text-[22px] font-semibold tracking-tight">TrueDocs</span>
          </motion.div>

          {/* Center copy */}
          <div className="max-w-[420px]">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-[11.5px] font-medium text-white/80 backdrop-blur-xl shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
              {badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] text-white"
            >
              {title}
              {highlight && (
                <>
                  {" "}
                  <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                    {highlight}
                  </span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="mt-3 max-w-[380px] text-[14px] leading-relaxed text-white/55"
            >
              {description}
            </motion.p>

            {/* Feature list (only when showFeatures) */}
            {showFeatures && (
              <div className="mt-7 space-y-2">
                {(features ?? DEFAULT_FEATURES).map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.55 + i * 0.08 }}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 backdrop-blur-md transition-all hover:border-white/[0.14] hover:bg-white/[0.04]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-gradient-to-br from-white/[0.07] to-black/40 text-cyan-300/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                      {f.icon}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-white/95">{f.title}</div>
                      <div className="text-[11.5px] text-white/45">{f.body}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Right form panel ───────────────────────────── */}
        <div className="relative flex items-center justify-center py-10 lg:py-12">
          {/* Mobile-only compact logo header */}
          <div className="absolute left-6 top-6 flex items-center gap-2.5 lg:hidden">
            <Image
              src="/Futuristic Folded Ribbon Emblem.png"
              alt="TrueDocs"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="text-[19px] font-semibold tracking-tight">TrueDocs</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[440px]"
          >
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl" />

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] via-white/[0.025] to-white/[0.01] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.18)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              {children}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="px-6 pb-5 text-center text-[11px] text-white/30 sm:pb-7"
      >
        © {new Date().getFullYear()} TrueDocs · Powered by Agentic RAG + Knowledge Graphs
      </motion.div>
    </main>
  );
}