"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { askQuestion, type ChatResponse } from "@/lib/api";
import { Banner } from "@/components/ui";

interface Turn {
  question: string;
  response?: ChatResponse;
  error?: string;
  loading?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setError("");
    setQuestion("");
    setTurns((prev) => [...prev, { question: q, loading: true }]);
    const index = turns.length;
    try {
      const response = await askQuestion(q);
      setTurns((prev) =>
        prev.map((t, i) => (i === index ? { question: q, response } : t)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      if (message.includes("401") || message.toLowerCase().includes("authenticated")) {
        router.replace("/login");
        return;
      }
      setTurns((prev) =>
        prev.map((t, i) => (i === index ? { question: q, error: message } : t)),
      );
    } finally {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <a href="/dashboard" className="text-sm font-semibold text-neutral-900">
            Agentic RAG
          </a>
          <div className="flex gap-2">
            <a
              href="/documents"
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Documents
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-40 pt-10">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Ask your documents
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Baseline retrieval over your uploaded documents, with citations.
        </p>

        {error && (
          <div className="mt-6">
            <Banner>{error}</Banner>
          </div>
        )}

        <div className="mt-8 space-y-8">
          {turns.length === 0 && (
            <p className="text-sm text-neutral-400">
              Ask a question to get started.
            </p>
          )}
          {turns.map((turn, i) => (
            <div key={i} className="space-y-3">
              <p className="text-sm font-medium text-neutral-900">
                {turn.question}
              </p>
              {turn.loading && (
                <p className="text-sm text-neutral-400">Thinking…</p>
              )}
              {turn.error && <Banner>{turn.error}</Banner>}
              {turn.response && (
                <div className="rounded-xl border border-neutral-200 bg-white p-5">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800">
                    {turn.response.answer}
                  </p>
                  {turn.response.citations.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Sources
                      </p>
                      {turn.response.citations.map((c) => (
                        <div key={c.index} className="text-xs text-neutral-600">
                          <span className="font-medium text-neutral-900">
                            [{c.index}] {c.filename ?? c.doc_id}
                          </span>
                          {typeof c.score === "number" && (
                            <span className="ml-2 text-neutral-400">
                              score {c.score.toFixed(3)}
                            </span>
                          )}
                          <p className="mt-0.5 line-clamp-2 text-neutral-500">
                            {c.snippet}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white"
      >
        <div className="mx-auto flex max-w-3xl gap-3 px-6 py-4">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 rounded-lg border border-neutral-200 px-3.5 py-3 text-sm outline-none focus:border-neutral-400 focus:ring-4 focus:ring-neutral-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Ask
          </button>
        </div>
      </form>
    </main>
  );
}
