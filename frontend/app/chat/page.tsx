"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { askQuestion, uploadDocument, type ChatResponse, type Citation } from "@/lib/api";
import { AppShell } from "@/components/app/AppShell";
import { useResizable } from "@/components/app/useResizable";
import { DividerHandle } from "@/components/app/DividerHandle";

interface Turn {
  question: string;
  response?: ChatResponse;
  error?: string;
  loading?: boolean;
}

interface Attachment {
  name: string;
  status: "uploading" | "ready" | "error";
  chunks?: number;
  error?: string;
}

const ACCEPT_TYPES = ".pdf,.docx,.pptx,.txt,.md";

const EXAMPLES = [
  {
    title: "Summarize a document",
    query: "Summarize the key terms and obligations in the main agreement.",
    accent: "#38bdf8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    title: "Find connections",
    query: "What is the relationship between the vendor and the liability cap?",
    accent: "#a78bfa",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M8.5 7.5l7 7M16.5 7.5l-7 7" />
      </svg>
    ),
  },
  {
    title: "Check compliance",
    query: "Does the termination clause comply with our current liability policy?",
    accent: "#34d399",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: "Compare documents",
    query: "Compare the liability limits across all uploaded contracts.",
    accent: "#60a5fa",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="12" height="14" rx="2" />
        <path d="M7 2h10a2 2 0 0 1 2 2v14" />
      </svg>
    ),
  },
];

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { size: sourcesWidth, onMouseDown: onSourcesDrag } = useResizable({
    initial: 320,
    min: 200,
    max: 560,
    inverted: true,
    storageKey: "truedocs:sourcesWidth",
  });

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const name = file.name;
      setAttachments((prev) => [...prev, { name, status: "uploading" }]);
      try {
        const result = await uploadDocument(file);
        setAttachments((prev) =>
          prev.map((a) => (a.name === name ? { ...a, status: "ready", chunks: result.chunks } : a)),
        );
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("documents:changed"));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setAttachments((prev) =>
          prev.map((a) => (a.name === name ? { ...a, status: "error", error: message } : a)),
        );
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(name: string) {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
  }

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuestion("");
    setActiveCitations([]);
    const index = turns.length;
    setTurns((prev) => [...prev, { question: trimmed, loading: true }]);
    try {
      const response = await askQuestion(trimmed);
      setTurns((prev) => prev.map((t, i) => (i === index ? { question: trimmed, response } : t)));
      setActiveCitations(response.citations);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      setTurns((prev) => prev.map((t, i) => (i === index ? { question: trimmed, error: message } : t)));
    } finally {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    ask(question);
  }

  const hasTurns = turns.length > 0;
  const uploading = attachments.some((a) => a.status === "uploading");

  const attachInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept={ACCEPT_TYPES}
      multiple
      className="hidden"
      onChange={(e) => handleFiles(e.target.files)}
    />
  );

  return (
    <AppShell>
      {/* Three-panel layout: sidebar (in AppShell) | main chat | divider | sources */}
      <div className="flex h-screen overflow-hidden">
        {/* Main column — grows to fill remaining space */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.08]">
            <div className="mx-auto w-full max-w-3xl">
              {!hasTurns ? (
                <HeroInput
                  question={question}
                  setQuestion={setQuestion}
                  onSubmit={onSubmit}
                  onExample={ask}
                  attachments={attachments}
                  uploading={uploading}
                  onAttachClick={() => fileInputRef.current?.click()}
                  onRemoveAttachment={removeAttachment}
                />
              ) : (
                <div className="space-y-8 pb-40">
                  {turns.map((turn, i) => (
                    <TurnView key={i} turn={turn} />
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </div>

          {hasTurns && (
            <form
              onSubmit={onSubmit}
              className="w-full border-t border-white/[0.06] bg-[#050505]/90 backdrop-blur-xl"
            >
              <div className="mx-auto w-full max-w-3xl px-5 py-4 sm:px-8">
                {attachments.length > 0 && (
                  <AttachmentChips
                    attachments={attachments}
                    onRemove={removeAttachment}
                    className="mb-3"
                  />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.03] text-white/60 transition hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white"
                    aria-label="Attach a document"
                    title="Attach a document"
                  >
                    <PaperclipIcon />
                  </button>
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[14px] text-white placeholder:text-white/30 outline-none transition focus:border-white/[0.22] focus:bg-white/[0.05]"
                  />
                  <button
                    type="submit"
                    disabled={!question.trim() || uploading}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
                    aria-label="Ask"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Drag divider between main and sources */}
        <DividerHandle
          onMouseDown={onSourcesDrag}
          className="hidden xl:flex"
        />

        {/* Right sources panel — resizable */}
        <aside
          className="hidden h-screen flex-shrink-0 border-l border-white/[0.05] bg-white/[0.012] xl:block"
          style={{ width: sourcesWidth }}
        >
          <SourcesPanel citations={activeCitations} hasTurns={hasTurns} />
        </aside>
      </div>
      {attachInput}
    </AppShell>
  );
}


function PaperclipIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function AttachmentChips({
  attachments,
  onRemove,
  className = "",
}: {
  attachments: Attachment[];
  onRemove: (name: string) => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <AnimatePresence>
        {attachments.map((a) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] ${
              a.status === "error"
                ? "border-red-500/40 bg-red-500/[0.08] text-red-300"
                : "border-white/[0.12] bg-white/[0.05] text-white/85"
            }`}
            title={a.error}
          >
            {a.status === "uploading" ? (
              <svg className="h-3.5 w-3.5 animate-spin text-cyan-300" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : a.status === "ready" ? (
              <svg className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            )}
            <span className="max-w-[220px] truncate">{a.name}</span>
            {a.status === "ready" && typeof a.chunks === "number" && (
              <span className="text-[11px] text-white/40">{a.chunks} chunks</span>
            )}
            <button
              type="button"
              onClick={() => onRemove(a.name)}
              className="flex h-4 w-4 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
              aria-label={`Remove ${a.name}`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function HeroInput({
  question,
  setQuestion,
  onSubmit,
  onExample,
  attachments,
  uploading,
  onAttachClick,
  onRemoveAttachment,
}: {
  question: string;
  setQuestion: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onExample: (q: string) => void;
  attachments: Attachment[];
  uploading: boolean;
  onAttachClick: () => void;
  onRemoveAttachment: (name: string) => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/15 via-cyan-900/20 to-black text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
          <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6L12 2Z" />
          </svg>
        </div>
        <h1 className="text-[30px] font-semibold tracking-tight text-white sm:text-[36px]">
          Ask your documents
        </h1>
        <p className="mx-auto mt-2.5 max-w-md text-[14px] text-white/55">
          Multi-hop questions answered across your documents, with every claim cited back to its source.
        </p>
      </motion.div>

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mt-8 w-full max-w-2xl"
      >
        <div className="group relative flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.03] p-2 backdrop-blur-xl transition focus-within:border-white/[0.22] focus-within:shadow-[0_0_40px_-10px_rgba(56,189,248,0.4)]">
          <button
            type="button"
            onClick={onAttachClick}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Attach a document"
            title="Attach a document"
          >
            <PaperclipIcon />
          </button>
          <svg className="h-5 w-5 flex-shrink-0 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input
            autoFocus
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 bg-transparent py-3 text-[15px] text-white placeholder:text-white/30 outline-none"
          />
          <button
            type="submit"
            disabled={!question.trim() || uploading}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
            aria-label="Ask"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {attachments.length > 0 && (
          <AttachmentChips
            attachments={attachments}
            onRemove={onRemoveAttachment}
            className="mt-3 justify-center"
          />
        )}
      </motion.form>

      {/* Example cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.28 }}
        className="mt-10 w-full max-w-2xl"
      >
        <p className="mb-3 text-left text-[12px] font-medium uppercase tracking-wider text-white/40">
          Try these examples
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {EXAMPLES.map((ex, i) => (
            <motion.button
              key={ex.title}
              onClick={() => onExample(ex.query)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.32 + i * 0.06 }}
              whileHover={{ y: -2 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-4 text-left transition-all hover:border-white/[0.16]"
            >
              <div
                className="pointer-events-none absolute -inset-2 -z-10 rounded-2xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(240px 120px at 50% 0%, ${ex.accent}22, transparent 70%)` }}
              />
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-black/40"
                  style={{ color: ex.accent }}
                >
                  {ex.icon}
                </span>
                <span className="text-[13.5px] font-semibold text-white">{ex.title}</span>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-white/50">{ex.query}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function TurnView({ turn }: { turn: Turn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* User question */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-[14px] text-white/95">
          {turn.question}
        </div>
      </div>

      {/* Assistant answer */}
      <div className="flex gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/15 to-black text-cyan-300">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.4l-6.4 4.8 2.4-7.2-6-4.8h7.6L12 2Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          {turn.loading && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.2 }}
                  className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                />
              ))}
              <span className="text-[13px] text-white/50">Retrieving and verifying…</span>
            </div>
          )}

          {turn.error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-[13px] text-red-300">
              {turn.error}
            </div>
          )}

          {turn.response && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] px-2.5 py-1 text-[10.5px] font-semibold text-emerald-300">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Verified
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/35">
                  {turn.response.mode}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-white/90">
                {turn.response.answer}
              </p>

              {turn.response.citations.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                    Sources
                  </p>
                  {turn.response.citations.map((c) => (
                    <CitationRow key={c.index} citation={c} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CitationRow({ citation }: { citation: Citation }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white/90">
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded bg-cyan-500/15 text-[10px] font-mono font-bold text-cyan-300">
            {citation.index}
          </span>
          {citation.filename ?? citation.doc_id ?? "Source"}
        </span>
        {typeof citation.score === "number" && (
          <span className="text-[10.5px] font-mono text-white/40">
            {(citation.score * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-white/55">
        {citation.snippet}
      </p>
    </div>
  );
}

function SourcesPanel({ citations, hasTurns }: { citations: Citation[]; hasTurns: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/[0.05] px-5">
        <h2 className="text-[13.5px] font-semibold text-white">Sources</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.08] hover:[&::-webkit-scrollbar-thumb]:bg-white/[0.15]">
        {!hasTurns ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/30">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="mt-3 text-[12.5px] text-white/40">
              Sources used in an answer will appear here.
            </p>
          </div>
        ) : citations.length === 0 ? (
          <p className="text-[12.5px] text-white/40">No sources returned for the latest answer.</p>
        ) : (
          <div className="space-y-2.5">
            {citations.map((c) => (
              <CitationRow key={c.index} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}