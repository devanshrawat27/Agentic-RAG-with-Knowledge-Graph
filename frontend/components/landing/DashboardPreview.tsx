"use client";

import { motion } from "framer-motion";

const NAV_ITEMS = [
  { label: "New Chat", icon: "plus", active: true },
  { label: "Documents", icon: "doc" },
  { label: "Knowledge Graph", icon: "graph" },
  { label: "Collections", icon: "layers" },
  { label: "Settings", icon: "gear" },
];

const RECENT = [
  "Q3 Financial Summary",
  "Product Strategy Analysis",
  "Key Legal Clauses",
  "Research Insights",
];

const PROMPTS = [
  { color: "#EF4444", label: "Summarize this document", sub: "in simple terms" },
  { color: "#3B82F6", label: "Find all mentions of", sub: "revenue and growth" },
  { color: "#10B981", label: "Show connections between", sub: "people and organizations" },
];

const GRAPH_NODES = [
  { label: "Documents", x: 18, y: 30, color: "#3F6BFF" },
  { label: "Project Alpha", x: 38, y: 55, color: "#06B6D4" },
  { label: "Technologies", x: 18, y: 75, color: "#3F6BFF" },
  { label: "Team", x: 78, y: 28, color: "#10B981" },
  { label: "Key Insights", x: 82, y: 70, color: "#F59E0B" },
];

const GRAPH_EDGES = [
  [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 4],
];

const SOURCES = [
  { name: "Q3_Report.pdf", page: "Page 12", color: "#3F6BFF" },
  { name: "Strategy_Doc.docx", page: "Page 5", color: "#8B5CF6" },
  { name: "Research_Paper.pdf", page: "Page 18", color: "#EF4444" },
];

function Icon({ name }: { name: string }) {
  const stroke = "currentColor";
  const sw = 1.6;
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
          <circle cx="6" cy="6" r="2" stroke={stroke} strokeWidth={sw} />
          <circle cx="18" cy="6" r="2" stroke={stroke} strokeWidth={sw} />
          <circle cx="12" cy="18" r="2" stroke={stroke} strokeWidth={sw} />
          <path d="M8 6h8M6 8c0 4 4 8 6 10M18 8c0 4-4 8-6 10" stroke={stroke} strokeWidth={sw} />
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
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0B] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      {/* Top glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.06) 0%, transparent 50%)",
        }}
      />
      {/* Right-side glow */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 80% 30%, rgba(63,107,255,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative grid grid-cols-1 gap-0 md:grid-cols-[200px_1fr_240px] lg:grid-cols-[220px_1fr_260px]">
        {/* Sidebar */}
        <aside className="hidden md:block border-r border-white/[0.06] bg-white/[0.01] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 64 64" className="h-5 w-5" aria-hidden="true">
                <path d="M32 4 L58 19 L50 53 L14 53 L6 19 Z" fill="#0A0A0A" stroke="rgba(255,255,255,0.25)" />
                <path d="M32 4 L58 19 L32 30 Z" fill="#FFFFFF" />
                <path d="M32 4 L6 19 L32 30 Z" fill="#A1A1AA" />
              </svg>
              <span className="text-[14px] font-semibold text-white">TrueDocs</span>
            </div>
            <button aria-label="Collapse sidebar" className="text-white/30 hover:text-white/60 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mt-6 space-y-0.5">
            {NAV_ITEMS.map((n) => (
              <button
                key={n.label}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-200 ${
                  n.active
                    ? "bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                    : "text-white/50 hover:bg-white/[0.03] hover:text-white/75"
                }`}
              >
                <Icon name={n.icon} />
                {n.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/35">
                Recent Chats
              </span>
              <button aria-label="Add chat" className="text-white/25 hover:text-white/50 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="space-y-0.5">
              {RECENT.map((r) => (
                <button
                  key={r}
                  className="block w-full truncate rounded-md px-2.5 py-1.5 text-left text-[12.5px] text-white/45 transition-all duration-200 hover:bg-white/[0.03] hover:text-white/70"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-h-[420px] md:min-h-[460px] p-5 md:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] p-1.5 transition-all duration-300 focus-within:border-white/15"
              >
                <input
                  placeholder="Ask a question about your documents..."
                  className="flex-1 bg-transparent px-4 py-2 text-[13px] text-white placeholder:text-white/30 outline-none"
                />
                <button
                  aria-label="Ask"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900 transition-all duration-300 hover:bg-neutral-200 hover:shadow-[0_0_20px_-4px_rgba(255,255,255,0.4)]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </div>
            <div className="ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-amber-500 text-[12px] font-semibold text-neutral-900 shadow-[0_0_20px_-4px_rgba(251,191,36,0.3)]">
              AK
            </div>
          </div>

          <h3 className="mt-8 text-[13px] font-medium text-white/75">Try these examples</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {PROMPTS.map((p) => (
              <motion.button
                key={p.label}
                whileHover={{ y: -2, scale: 1.01 }}
                className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 text-left transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.03]"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${p.color}20` }}
                >
                  <div className="h-3 w-3 rounded-full" style={{ background: p.color }} />
                </div>
                <div className="mt-3 text-[13px] font-medium text-white">{p.label}</div>
                <div className="text-[12px] text-white/45">{p.sub}</div>
              </motion.button>
            ))}
          </div>

          <h3 className="mt-8 text-[13px] font-medium text-white/75">Knowledge Graph</h3>

          <div className="relative mt-4 h-[180px] md:h-[200px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#070708]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <radialGradient id="kg-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(63,107,255,0.06)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#kg-glow)" />
              {GRAPH_EDGES.map(([ai, bi], i) => {
                const a = GRAPH_NODES[ai];
                const b = GRAPH_NODES[bi];
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.15"
                    strokeDasharray="0.5 0.5"
                  />
                );
              })}
              {/* Background dots */}
              {[...Array(18)].map((_, i) => {
                const x = (i * 13.7) % 100;
                const y = (i * 19.3 + 7) % 100;
                return <circle key={i} cx={x} cy={y} r="0.2" fill="rgba(255,255,255,0.15)" />;
              })}
            </svg>
            {GRAPH_NODES.map((n) => (
              <div
                key={n.label}
                className="absolute transition-transform duration-300 hover:scale-110"
                style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 backdrop-blur-xl">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: n.color, boxShadow: `0 0 8px ${n.color}40` }}
                  />
                  <span className="text-[10px] font-medium text-white/80">{n.label}</span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Sources panel */}
        <aside className="hidden md:block border-l border-white/[0.06] bg-white/[0.01] p-4">
          <h3 className="text-[13px] font-medium text-white">Sources</h3>
          <div className="mt-3 space-y-2">
            {SOURCES.map((s) => (
              <motion.div
                key={s.name}
                whileHover={{ x: 2 }}
                className="flex items-center gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] p-2.5 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.03] cursor-pointer"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold text-white"
                  style={{ background: `${s.color}25`, border: `1px solid ${s.color}30` }}
                >
                  {s.name.endsWith(".pdf") ? "P" : "D"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-[12.5px] font-medium text-white">{s.name}</div>
                  <div className="text-[11px] text-white/35">{s.page}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/25">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}