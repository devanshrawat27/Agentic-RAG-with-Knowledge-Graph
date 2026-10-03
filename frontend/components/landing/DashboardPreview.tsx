"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { id: "chat", label: "New Chat", icon: "plus", active: true },
  { id: "docs", label: "Documents", icon: "doc" },
  { id: "graph", label: "Knowledge Graph", icon: "graph" },
  { id: "collections", label: "Collections", icon: "layers" },
  { id: "settings", label: "Settings", icon: "gear" },
];

const RECENT_CHATS = [
  "Q3 Financial Summary",
  "Product Strategy Analysis",
  "Key Legal Clauses",
  "Research Insights",
];

const EXAMPLE_PROMPTS = [
  {
    id: "summary",
    label: "Summarize this document",
    sub: "in simple terms",
    accentBg: "bg-red-500/10 border-red-500/25 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]",
    glow: "hover:border-red-500/35 hover:shadow-[0_0_25px_-3px_rgba(239,68,68,0.2)]",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    ),
  },
  {
    id: "mentions",
    label: "Find all mentions of",
    sub: "revenue and growth",
    accentBg: "bg-blue-500/10 border-blue-500/25 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]",
    glow: "hover:border-blue-500/35 hover:shadow-[0_0_25px_-3px_rgba(59,130,246,0.2)]",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "connections",
    label: "Show connections between",
    sub: "people and organizations",
    accentBg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    glow: "hover:border-emerald-500/35 hover:shadow-[0_0_25px_-3px_rgba(16,185,129,0.2)]",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

const SOURCES = [
  {
    name: "Q3_Report.pdf",
    page: "Page 12",
    ext: "PDF",
    bg: "from-rose-500 to-red-600",
  },
  {
    name: "Strategy_Doc.docx",
    page: "Page 5",
    ext: "W",
    bg: "from-blue-500 to-indigo-600",
  },
  {
    name: "Research_Paper.pdf",
    page: "Page 18",
    ext: "P",
    bg: "from-amber-500 to-orange-600",
  },
];

function NavIcon({ name }: { name: string }) {
  const stroke = "currentColor";
  const sw = 1.8;
  const cls = "h-4 w-4";
  switch (name) {
    case "plus":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d="M14 3v5h5" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        </svg>
      );
    case "graph":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <circle cx="6" cy="6" r="2.2" stroke={stroke} strokeWidth={sw} />
          <circle cx="18" cy="6" r="2.2" stroke={stroke} strokeWidth={sw} />
          <circle cx="12" cy="18" r="2.2" stroke={stroke} strokeWidth={sw} />
          <path d="M8 6h8M7 8l4 8M17 8l-4 8" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "layers":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 18l9 5 9-5"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth={sw} />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"
            stroke={stroke}
            strokeWidth={sw}
          />
        </svg>
      );
    default:
      return null;
  }
}

export function DashboardPreview() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#070709] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.12)]">
      {/* Top subtle ambient bloom */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-500/[0.04] blur-3xl" />

      {/* Grid container: Sidebar, Main Workspace, Sources */}
      <div className="grid grid-cols-1 md:grid-cols-[210px_1fr] lg:grid-cols-[220px_1fr_240px]">
        {/* ── Left Sidebar ─────────────────────────────────── */}
        <aside className="hidden border-r border-white/[0.06] bg-white/[0.012] p-4 md:flex md:flex-col justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 64 64" className="h-5 w-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" aria-hidden="true">
                  <path d="M32 4 L58 19 L50 53 L14 53 L6 19 Z" fill="#0A0A0A" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                  <path d="M32 4 L58 19 L32 30 Z" fill="#FFFFFF" />
                  <path d="M32 4 L6 19 L32 30 Z" fill="#A1A1AA" />
                </svg>
                <span className="text-[13.5px] font-semibold tracking-tight text-white">TrueDocs</span>
              </div>
              <button aria-label="Collapse sidebar" className="text-white/30 hover:text-white/70 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Nav Menu */}
            <div className="mt-5 space-y-1">
              {NAV_ITEMS.map((n) => (
                <button
                  key={n.id}
                  className={`group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] font-medium transition-all duration-200 ${
                    n.active
                      ? "bg-gradient-to-r from-white/[0.09] to-white/[0.03] text-white border border-white/[0.12] shadow-[0_0_15px_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                      : "text-white/50 hover:bg-white/[0.03] hover:text-white/80"
                  }`}
                >
                  <NavIcon name={n.icon} />
                  <span>{n.label}</span>
                </button>
              ))}
            </div>

            {/* Recent Chats Section */}
            <div className="mt-7">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35">
                  Recent Chats
                </span>
                <button aria-label="Add chat" className="text-white/30 hover:text-white/60 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="space-y-0.5">
                {RECENT_CHATS.map((title) => (
                  <button
                    key={title}
                    onClick={() => setQuery(title)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] text-white/45 transition-all duration-150 hover:bg-white/[0.04] hover:text-white/80"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3 shrink-0 text-white/30">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="truncate">{title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Workspace ───────────────────────────────── */}
        <main className="flex flex-col justify-between p-4 sm:p-5 md:p-6">
          <div>
            {/* Search Input Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="flex items-center gap-2.5 rounded-full border border-white/[0.1] bg-white/[0.025] p-1.5 pl-4 backdrop-blur-xl transition-all duration-300 focus-within:border-white/25 focus-within:bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                  {/* Sparkle AI Icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-white/60">
                    <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />
                  </svg>

                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    className="flex-1 bg-transparent text-[13px] text-white placeholder:text-white/35 outline-none"
                  />

                  {/* Submit Circular Button */}
                  <button
                    aria-label="Submit question"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-950 transition-all duration-200 hover:scale-105 hover:bg-neutral-100 hover:shadow-[0_0_20px_-3px_rgba(255,255,255,0.5)] active:scale-95"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* User Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-[11px] font-bold text-neutral-950 shadow-[0_0_15px_-2px_rgba(245,158,11,0.4)]">
                AK
              </div>
            </div>

            {/* Try These Examples Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[12.5px] font-semibold text-white/85">
                  Try these examples
                </span>
                <button className="text-[11.5px] font-medium text-white/40 hover:text-white/75 transition-colors flex items-center gap-1">
                  View all
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {EXAMPLE_PROMPTS.map((p) => (
                  <motion.button
                    key={p.id}
                    onClick={() => setQuery(`${p.label} ${p.sub}`)}
                    whileHover={{ y: -2 }}
                    className={`group relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-white/[0.005] p-3 text-left backdrop-blur-md transition-all duration-200 hover:bg-white/[0.05] ${p.glow}`}
                  >
                    {/* Top edge sheen */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/25" />

                    <div className="flex items-center justify-between">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-200 ${p.accentBg}`}>
                        {p.icon}
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <div className="mt-3">
                      <div className="text-[12.5px] font-medium text-white/90 group-hover:text-white transition-colors">
                        {p.label}
                      </div>
                      <div className="text-[11px] text-white/45 group-hover:text-white/60 transition-colors">
                        {p.sub}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Knowledge Graph Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[12.5px] font-semibold text-white/85">
                  Knowledge Graph
                </span>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/70 hover:border-white/25 hover:bg-white/[0.06] hover:text-white transition-all">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="6" cy="6" r="2" />
                    <circle cx="18" cy="6" r="2" />
                    <circle cx="12" cy="18" r="2" />
                    <path d="M8 6h8M7 8l4 8M17 8l-4 8" />
                  </svg>
                  Explore Graph
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Graph Visualizer Display - Faithful to the Reference Mockup */}
              <div className="relative h-[230px] md:h-[245px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#040406]">
                {/* Clean Dot Matrix Grid Canvas */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                    maskImage: "radial-gradient(ellipse 85% 80% at 50% 50%, black 40%, transparent 95%)",
                    WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 50% 50%, black 40%, transparent 95%)",
                  }}
                />

                {/* SVG Curves & Flow Connections */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    {/* Gradients for each organic branch */}
                    <linearGradient id="curve-alpha-docs" x1="50%" y1="50%" x2="22%" y2="28%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0.18)" />
                    </linearGradient>
                    <linearGradient id="curve-alpha-tech" x1="50%" y1="50%" x2="22%" y2="74%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
                      <stop offset="100%" stopColor="rgba(168, 85, 247, 0.18)" />
                    </linearGradient>
                    <linearGradient id="curve-alpha-team" x1="50%" y1="50%" x2="78%" y2="28%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
                      <stop offset="100%" stopColor="rgba(16, 185, 129, 0.18)" />
                    </linearGradient>
                    <linearGradient id="curve-alpha-insights" x1="50%" y1="50%" x2="78%" y2="74%">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.35)" />
                      <stop offset="100%" stopColor="rgba(245, 158, 11, 0.18)" />
                    </linearGradient>
                  </defs>

                  {/* Outer subtle orbital / satellite curves */}
                  <path d="M 14 28 C 8 40, 7 60, 9 74" stroke="rgba(255,255,255,0.08)" strokeDasharray="0.6 0.6" strokeWidth="0.25" fill="none" />
                  <path d="M 86 28 C 92 40, 93 60, 91 74" stroke="rgba(255,255,255,0.08)" strokeDasharray="0.6 0.6" strokeWidth="0.25" fill="none" />

                  {/* Main Organic S-Curves connecting nodes with graceful curvature */}
                  {/* Left-top: to Documents */}
                  <path d="M 39 48 C 31 48, 30 28, 22 28" stroke="url(#curve-alpha-docs)" strokeWidth="0.35" fill="none" />
                  {/* Left-bottom: to Technologies */}
                  <path d="M 39 52 C 31 52, 30 74, 22 74" stroke="url(#curve-alpha-tech)" strokeWidth="0.35" fill="none" />
                  {/* Right-top: to Team */}
                  <path d="M 61 48 C 69 48, 70 28, 78 28" stroke="url(#curve-alpha-team)" strokeWidth="0.35" fill="none" />
                  {/* Right-bottom: to Key Insights */}
                  <path d="M 61 52 C 69 52, 70 74, 78 74" stroke="url(#curve-alpha-insights)" strokeWidth="0.35" fill="none" />

                  {/* Secondary subtle cross arcs */}
                  <path d="M 22 28 C 14 42, 14 60, 22 74" stroke="rgba(255,255,255,0.07)" strokeDasharray="0.6 0.6" strokeWidth="0.2" fill="none" />
                  <path d="M 78 28 C 86 42, 86 60, 78 74" stroke="rgba(255,255,255,0.07)" strokeDasharray="0.6 0.6" strokeWidth="0.2" fill="none" />

                  {/* Luminous Glowing Junction Beads (refined) */}
                  <circle cx="31" cy="38" r="0.6" fill="rgba(255,255,255,0.7)" />
                  <circle cx="31" cy="63" r="0.6" fill="rgba(255,255,255,0.7)" />
                  <circle cx="69" cy="38" r="0.6" fill="rgba(255,255,255,0.7)" />
                  <circle cx="69" cy="63" r="0.6" fill="rgba(255,255,255,0.7)" />

                  {/* Outer Satellite Dots */}
                  <circle cx="8" cy="74" r="0.65" fill="#A855F7" opacity="0.7" />
                  <circle cx="11" cy="50" r="0.5" fill="#FFFFFF" opacity="0.4" />
                  <circle cx="92" cy="50" r="0.65" fill="#06B6D4" opacity="0.7" />
                  <circle cx="91" cy="74" r="0.5" fill="#F59E0B" opacity="0.5" />
                </svg>

                {/* Central Primary Node: Project Alpha — refined glass with subtle bloom */}
                <div
                  className="absolute z-10 transition-transform duration-300 hover:scale-[1.04] cursor-pointer"
                  style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                >
                  <div className="pointer-events-none absolute -inset-2 rounded-full bg-cyan-400/10 blur-xl" />

                  <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_12px_rgba(0,0,0,0.5)]">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-300/80 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                    <svg className="h-4 w-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="text-[12.5px] font-semibold text-white tracking-tight">Project Alpha</span>
                  </div>
                </div>

                {/* Node 1: Documents (Top Left) — neutral glass + color dot */}
                <div
                  className="absolute transition-transform duration-300 hover:scale-[1.04] cursor-pointer"
                  style={{ left: "22%", top: "28%", transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                    <span className="text-[11px] font-medium text-white/85">Documents</span>
                  </div>
                </div>

                {/* Node 2: Technologies (Bottom Left) */}
                <div
                  className="absolute transition-transform duration-300 hover:scale-[1.04] cursor-pointer"
                  style={{ left: "22%", top: "74%", transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400/80" />
                    <span className="text-[11px] font-medium text-white/85">Technologies</span>
                  </div>
                </div>

                {/* Node 3: Team (Top Right) */}
                <div
                  className="absolute transition-transform duration-300 hover:scale-[1.04] cursor-pointer"
                  style={{ left: "78%", top: "28%", transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                    <span className="text-[11px] font-medium text-white/85">Team</span>
                  </div>
                </div>

                {/* Node 4: Key Insights (Bottom Right) */}
                <div
                  className="absolute transition-transform duration-300 hover:scale-[1.04] cursor-pointer"
                  style={{ left: "78%", top: "74%", transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
                    <span className="text-[11px] font-medium text-white/85">Key Insights</span>
                  </div>
                </div>

                {/* Zoom & Viewport Mini Controls Pod */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-black/70 px-2 py-1 backdrop-blur-md">
                  <button className="h-5 w-5 text-white/40 hover:text-white transition-colors flex items-center justify-center text-[12px] font-mono">
                    +
                  </button>
                  <span className="text-white/20 text-[10px]">|</span>
                  <button className="h-5 w-5 text-white/40 hover:text-white transition-colors flex items-center justify-center text-[12px] font-mono">
                    −
                  </button>
                  <span className="text-white/20 text-[10px]">|</span>
                  <button className="h-5 w-5 text-white/40 hover:text-white transition-colors flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 3 21 3 21 9" />
                      <polyline points="9 21 3 21 3 15" />
                      <line x1="21" y1="3" x2="14" y2="10" />
                      <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ── Right Sources Panel ──────────────────────────── */}
        <aside className="hidden border-l border-white/[0.06] bg-white/[0.012] p-4 lg:flex lg:flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12.5px] font-semibold text-white/85">Sources</span>
            <button aria-label="Sort or filter sources" className="text-white/35 hover:text-white/70 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="14" y2="12" />
                <line x1="4" y1="18" x2="9" y2="18" />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {SOURCES.map((s) => (
              <motion.div
                key={s.name}
                whileHover={{ x: 2 }}
                className="group relative flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.05] cursor-pointer"
              >
                {/* File Badge */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.bg} text-[10.5px] font-bold text-white shadow-sm`}
                >
                  {s.ext}
                </div>

                {/* File Name & Page */}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-[12px] font-medium text-white/90 group-hover:text-white transition-colors">
                    {s.name}
                  </div>
                  <div className="text-[10.5px] text-white/40">{s.page}</div>
                </div>

                {/* Arrow */}
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all"
                >
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}