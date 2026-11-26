"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  documentFileUrl,
  getChunkContext,
  getDocumentChunks,
  getDocumentMeta,
  type Citation,
  type DocumentMeta,
  type SourceChunk,
  type SourceChunkContext,
} from "@/lib/api";

const STOPWORDS = new Set([
  "the", "and", "for", "that", "with", "this", "from", "was", "were",
  "has", "have", "had", "are", "is", "its", "their", "they", "not", "but",
  "you", "your", "our", "can", "could", "would", "should", "into", "about",
  "which", "what", "who", "when", "where", "why", "how", "than", "then",
  "them", "there", "here", "also", "been", "being", "does", "did", "doing",
  "over", "under", "after", "before", "between", "during", "such", "only",
  "more", "most", "some", "any", "all", "each", "other", "will", "shall",
  "may", "might", "must", "per", "via", "based", "provided", "documents",
]);

function tokenize(text: string): Set<string> {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return new Set(
    words.filter((word) => word.length >= 3 && !STOPWORDS.has(word)),
  );
}

function bestSentence(text: string, target: string): string | null {
  const targetTokens = tokenize(target);
  if (!targetTokens.size) return null;

  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  let best: string | null = null;
  let bestScore = 0;
  for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    if (!tokens.size) continue;
    let overlap = 0;
    for (const token of Array.from(targetTokens)) {
      if (tokens.has(token)) overlap += 1;
    }
    const score = overlap / targetTokens.size;
    if (score > bestScore) {
      bestScore = score;
      best = sentence;
    }
  }
  return bestScore >= 0.2 ? best : null;
}

function Highlighted({
  text,
  highlight,
}: {
  text: string;
  highlight: string | null;
}) {
  if (!highlight) return <>{text}</>;
  const index = text.indexOf(highlight);
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-amber-400/20 px-0.5 text-amber-100">
        {highlight}
      </mark>
      {text.slice(index + highlight.length)}
    </>
  );
}

export function SourceViewer({
  citation,
  claimText,
  onClose,
}: {
  citation: Citation;
  claimText?: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<SourceChunkContext | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<DocumentMeta | null>(null);
  const [showFull, setShowFull] = useState(false);
  const [fullChunks, setFullChunks] = useState<SourceChunk[]>([]);
  const [loadingFull, setLoadingFull] = useState(false);
  const focusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    if (!citation.chunk_id) {
      setError("This citation has no chunk id.");
      setLoading(false);
      return;
    }

    getChunkContext(citation.chunk_id)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load source",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [citation.chunk_id]);

  useEffect(() => {
    if (!citation.doc_id) return;
    let cancelled = false;
    getDocumentMeta(citation.doc_id)
      .then((info) => {
        if (!cancelled) setMeta(info);
      })
      .catch(() => {
        /* metadata is optional */
      });
    return () => {
      cancelled = true;
    };
  }, [citation.doc_id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const displayChunks = showFull ? fullChunks : (data?.chunks ?? []);
  const focusChunk: SourceChunk | null =
    displayChunks.find((chunk) => chunk.chunk_id === citation.chunk_id) ??
    data?.chunks.find((chunk) => chunk.chunk_id === data?.focus) ??
    null;

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [data, showFull, fullChunks]);

  const highlight = useMemo(() => {
    if (!focusChunk) return null;
    return bestSentence(focusChunk.text, claimText || citation.snippet);
  }, [focusChunk, claimText, citation.snippet]);

  async function toggleFull() {
    if (!citation.doc_id) return;
    if (showFull) {
      setShowFull(false);
      return;
    }
    if (fullChunks.length > 0) {
      setShowFull(true);
      return;
    }

    setLoadingFull(true);
    setError("");
    try {
      const result = await getDocumentChunks(citation.doc_id);
      setFullChunks(result.chunks);
      setShowFull(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load full document",
      );
    } finally {
      setLoadingFull(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0b0e] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-white/35">
              Source preview
            </p>
            <h2 className="mt-0.5 truncate text-[15px] font-semibold text-white">
              {citation.filename ?? citation.doc_id ?? "Source"}
            </h2>
            <p className="mt-0.5 font-mono text-[10.5px] text-white/30">
              {citation.chunk_id ?? "chunk id unavailable"}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {meta?.has_file && citation.doc_id && (
              <a
                href={documentFileUrl(citation.doc_id)}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-2.5 py-1.5 text-[11.5px] font-medium text-white/65 transition hover:text-white"
              >
                Open original
              </a>
            )}
            {citation.doc_id && (
              <button
                onClick={toggleFull}
                disabled={loadingFull}
                className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-2.5 py-1.5 text-[11.5px] font-medium text-white/65 transition hover:text-white disabled:opacity-40"
              >
                {loadingFull
                  ? "Loading…"
                  : showFull
                    ? "Chunk view"
                    : "Full document"}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/45 transition hover:text-white"
              aria-label="Close source preview"
            >
              ×
            </button>
          </div>
        </div>

        {claimText && (
          <div className="border-b border-white/[0.05] bg-amber-500/[0.03] px-5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/60">
              Answer claim
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-white/60">
              {claimText}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/[0.08]">
          {loading ? (
            <div className="flex items-center justify-center gap-2.5 py-16 text-[13px] text-white/45">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
              Loading source chunk…
            </div>
          ) : error ? (
            <p className="rounded-xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3 text-[12.5px] text-red-300">
              {error}
            </p>
          ) : (
            <div className="space-y-3">
              {displayChunks.map((chunk) => {
                const isFocus = chunk.chunk_id === citation.chunk_id;
                return (
                  <div
                    key={chunk.chunk_id}
                    ref={isFocus ? focusRef : undefined}
                    className={`rounded-xl border p-4 ${
                      isFocus
                        ? "border-amber-400/25 bg-amber-500/[0.03]"
                        : "border-white/[0.05] bg-white/[0.015] opacity-60"
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Chunk {chunk.chunk_index}
                      {isFocus
                        ? " · matched source"
                        : showFull
                          ? ""
                          : " · context"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-white/80">
                      {isFocus ? (
                        <Highlighted text={chunk.text} highlight={highlight} />
                      ) : (
                        chunk.text
                      )}
                    </p>
                  </div>
                );
              })}
              <p className="pt-1 text-[11px] text-white/30">
                {showFull
                  ? `Showing all ${displayChunks.length} chunks; the matched chunk is highlighted.`
                  : "Showing the ingested source chunk and its neighbours. The highlighted sentence is the best match for the answer claim."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
