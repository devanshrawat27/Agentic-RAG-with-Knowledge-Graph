"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function ComingSoon({
  title,
  description,
  icon,
  accent = "#38bdf8",
  points = [],
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent?: string;
  points?: string[];
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[720px] flex-col items-center justify-center px-6 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 180, damping: 18 }}
        className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.1] bg-gradient-to-br from-white/[0.07] to-black/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14)]"
        style={{ color: accent }}
      >
        <div
          className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl blur-2xl"
          style={{ background: `radial-gradient(closest-side, ${accent}33, transparent)` }}
        />
        {icon}
      </motion.div>

      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-[11.5px] font-medium text-white/70"
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />
        Coming Soon
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-5 text-[30px] font-semibold tracking-tight text-white sm:text-[34px]"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.28 }}
        className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-white/55"
      >
        {description}
      </motion.p>

      {points.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="mt-8 w-full max-w-md space-y-2 text-left"
        >
          {points.map((p) => (
            <li
              key={p}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-[13.5px] text-white/75"
            >
              <span
                className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${accent}22`, color: accent }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {p}
            </li>
          ))}
        </motion.ul>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13.5px] font-semibold text-neutral-900 transition hover:bg-neutral-100"
        >
          Go to Chat
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="/documents"
          className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-5 py-2.5 text-[13.5px] font-medium text-white/85 transition hover:bg-white/[0.06]"
        >
          Manage Documents
        </Link>
      </motion.div>
    </div>
  );
}