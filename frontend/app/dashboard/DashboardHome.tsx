"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { listDocuments, type DocumentItem } from "@/lib/api";

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  processed: { label: "Ready", color: "#34d399" },
  pending: { label: "Processing", color: "#f59e0b" },
  processing: { label: "Processing", color: "#f59e0b" },
  failed: { label: "Failed", color: "#ef4444" },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function DashboardHome({ userName }: { userName?: string }) {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentItem[] | null>(null);

  useEffect(() => {
    listDocuments()
      .then(({ documents }) => setDocs(documents))
      .catch((err) => {
        const message = err instanceof Error ? err.message : "";
        if (message.includes("401") || message.toLowerCase().includes("authenticated")) {
          router.replace("/login");
          return;
        }
        setDocs([]);
      });
  }, [router]);

  const recent = (docs ?? []).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-[32px] font-semibold tracking-tight text-white">
          {userName ? `Hi, ${userName}` : "Dashboard"}
        </h1>
        <p className="mt-1.5 text-[14.5px] text-white/55">
          Upload documents, then ask questions across them with verified, source-grounded answers.
        </p>
      </motion.div>

      {/* Quick links to the two real features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <FeatureCard
          href="/documents"
          title="Documents"
          description="Upload PDFs, DOCX, PPT and more to build your knowledge base."
          accent="#38bdf8"
          index={0}
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
        />
        <FeatureCard
          href="/chat"
          title="Chat"
          description="Ask multi-hop questions and get answers cited back to your sources."
          accent="#a78bfa"
          index={1}
          icon={
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
      </motion.div>

      {/* Recent documents — real data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-white">Your Documents</h2>
          <a
            href="/documents"
            className="text-[13px] font-medium text-cyan-300 transition hover:text-cyan-200"
          >
            Manage
          </a>
        </div>

        {docs === null ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-8 text-center">
            <p className="text-[13.5px] text-white/45">Loading documents...</p>
          </div>
        ) : recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2.5">
            {recent.map((doc, i) => (
              <DocumentRow key={doc.id} doc={doc} index={i} />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function FeatureCard({
  href,
  title,
  description,
  icon,
  accent,
  index,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  index: number;
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.08 }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] via-white/[0.015] to-transparent p-6 backdrop-blur-md transition-all duration-300 hover:border-white/[0.16] hover:shadow-[0_18px_50px_-15px_rgba(0,0,0,0.9)]"
    >
      <div
        className="pointer-events-none absolute -inset-2 -z-10 rounded-2xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(320px 160px at 50% 0%, ${accent}22, transparent 70%)` }}
      />
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-black/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
        style={{ color: accent }}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-[15.5px] font-semibold text-white">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">{description}</p>
      <div className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium" style={{ color: accent }}>
        Open
        <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </motion.a>
  );
}

function DocumentRow({ doc, index }: { doc: DocumentItem; index: number }) {
  const status = STATUS_STYLES[doc.status] ?? { label: doc.status, color: "#94a3b8" };
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.25 + index * 0.06 }}
      className="flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-black/40 text-cyan-300/90">
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium text-white">{doc.filename}</p>
        <p className="mt-0.5 text-[11.5px] text-white/45">
          {doc.chunk_count} chunks · {doc.entity_count} entities · {doc.relationship_count} relationships
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
          style={{ borderColor: `${status.color}44`, color: status.color, backgroundColor: `${status.color}12` }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
          {status.label}
        </span>
        <span className="hidden w-14 text-right text-[11px] text-white/35 sm:inline">
          {timeAgo(doc.created_at)}
        </span>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.015] py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-black text-white/40">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-white">No documents yet</h3>
      <p className="mt-1.5 max-w-sm text-[13px] text-white/50">
        Upload your first document to start building your knowledge base.
      </p>
      <a
        href="/documents"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-100"
      >
        Upload documents
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </a>
    </div>
  );
}