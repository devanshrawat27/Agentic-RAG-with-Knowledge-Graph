"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PILLS = [
  {
    label: "Summarize this report",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-blue-400">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    iconBg: "bg-blue-500/15",
  },
  {
    label: "Find key insights",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-purple-400">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    iconBg: "bg-purple-500/15",
  },
  {
    label: "Show connections",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-cyan-400">
        <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 7.5l8 9M8 6.5l8-0.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    iconBg: "bg-cyan-500/15",
  },
];

const PLACEHOLDER_TEXTS = [
  "Ask anything about your documents...",
  "What are the key terms in this contract?",
  "Summarize the financial report...",
  "Find connections between entities...",
];

export function HeroSearch() {
  const [q, setQ] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="w-full"
    >
      {/* Search Input Box */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="group relative flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0c0d13]/85 p-2 backdrop-blur-xl transition-all duration-300 focus-within:border-white/25 focus-within:shadow-[0_0_35px_-10px_rgba(59,130,246,0.3)] shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={PLACEHOLDER_TEXTS[placeholderIdx]}
          className="w-full bg-transparent px-4 py-2.5 text-[14px] text-white placeholder:text-white/35 outline-none"
        />
        <button
          type="submit"
          aria-label="Submit search"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_0_20px_-2px_rgba(255,255,255,0.6)] active:scale-95"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>

      {/* Suggestion Pills */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        {PILLS.map((p) => (
          <motion.button
            key={p.label}
            type="button"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-[#0e1017]/80 px-3.5 py-1.5 text-[12.5px] text-white/70 backdrop-blur-md transition-all duration-200 hover:border-white/18 hover:bg-white/[0.05] hover:text-white"
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${p.iconBg}`}>
              {p.icon}
            </span>
            {p.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}