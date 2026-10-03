"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  listDocuments,
  uploadDocument,
  type DocumentItem,
  type UploadResult,
} from "@/lib/api";
import { AppShell } from "@/components/app/AppShell";

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  ready: { label: "Ready", color: "#34d399" },
  processed: { label: "Ready", color: "#34d399" },
  pending: { label: "Processing", color: "#f59e0b" },
  processing: { label: "Processing", color: "#f59e0b" },
  failed: { label: "Failed", color: "#ef4444" },
};

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<DocumentItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const { documents } = await listDocuments();
      setDocs(documents);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load";
      if (message.includes("401") || message.toLowerCase().includes("authenticated")) {
        router.replace("/login");
        return;
      }
      setError(message);
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onChanged = () => refresh();
    window.addEventListener("documents:changed", onChanged);
    window.addEventListener("focus", onChanged);
    return () => {
      window.removeEventListener("documents:changed", onChanged);
      window.removeEventListener("focus", onChanged);
    };
  }, [refresh]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setNotice("");
    setUploading(true);
    try {
      const result: UploadResult = await uploadDocument(files[0]);
      setNotice(`"${result.filename}" — ${result.chunks} chunks embedded. Graph extraction running.`);
      await refresh();
      setTimeout(() => refresh(), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-[30px] font-semibold tracking-tight text-white">Documents</h1>
          <p className="mt-1.5 text-[14px] text-white/55">
            Upload files to build your private knowledge base. They are chunked, embedded, and mined for entities.
          </p>
        </motion.div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-2.5 text-[13px] text-red-300">
            {error}
          </div>
        )}
        {notice && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-2.5 text-[13px] text-emerald-300">
            {notice}
          </div>
        )}

        {/* Upload dropzone */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          className={`mt-7 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all ${
            dragging
              ? "border-cyan-400/60 bg-cyan-500/[0.06]"
              : "border-white/[0.12] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.03]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <motion.div
            animate={dragging ? { scale: 1.08 } : { scale: 1 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.07] to-black/40 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.13)]"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </motion.div>
          <p className="mt-4 text-[14px] text-white/70">Drag &amp; drop a file here, or</p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13.5px] font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                  <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Ingesting...
              </>
            ) : (
              "Choose file"
            )}
          </button>
          <p className="mt-3 text-[12px] text-white/35">PDF, DOCX, TXT, MD · max 20 MB</p>
        </motion.div>

        {/* Document list */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-10"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-white">Your documents</h2>
            <span className="text-[12.5px] text-white/40">{docs.length} total</span>
          </div>

          {docs.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] py-14 text-center">
              <p className="text-[13.5px] text-white/45">No documents yet. Upload your first file above.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {docs.map((d, i) => (
                <DocCard key={d.id} doc={d} index={i} onOpen={() => setSelected(d)} />
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && <DetailDrawer doc={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </AppShell>
  );
}

function DocCard({ doc, index, onOpen }: { doc: DocumentItem; index: number; onOpen: () => void }) {
  const status = STATUS_STYLES[doc.status] ?? { label: doc.status, color: "#94a3b8" };
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:border-white/[0.14] hover:bg-white/[0.04]"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-black/40 text-cyan-300/90">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-white">{doc.filename}</p>
        <p className="mt-0.5 text-[12px] text-white/45">
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
        <span className="hidden w-16 text-right text-[11.5px] text-white/35 sm:inline">{timeAgo(doc.created_at)}</span>
        <svg className="h-4 w-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </motion.button>
  );
}

function DetailDrawer({ doc, onClose }: { doc: DocumentItem; onClose: () => void }) {
  const status = STATUS_STYLES[doc.status] ?? { label: doc.status, color: "#94a3b8" };
  const stats = [
    { label: "Chunks", value: doc.chunk_count },
    { label: "Entities", value: doc.entity_count },
    { label: "Relationships", value: doc.relationship_count },
  ];
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60"
      />
      <motion.div
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        transition={{ type: "tween", duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-white/[0.08] bg-[#0a0b0e]"
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
          <h2 className="text-[15px] font-semibold text-white">Document details</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.06] hover:text-white" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-black/40 text-cyan-300">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="break-words text-[14px] font-medium text-white">{doc.filename}</p>
              <span
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                style={{ borderColor: `${status.color}44`, color: status.color, backgroundColor: `${status.color}12` }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                {status.label}
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <p className="text-[20px] font-semibold text-white">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-white/45">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[12px] font-medium uppercase tracking-wider text-white/40">Uploaded</p>
            <p className="mt-1 text-[13.5px] text-white/85">
              {doc.created_at ? new Date(doc.created_at).toLocaleString() : "—"}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
            <p className="flex items-center gap-2 text-[12.5px] font-medium text-cyan-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Extracted entities &amp; relationships
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
              This document contributed {doc.entity_count} entities and {doc.relationship_count} relationships
              to your knowledge graph.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}