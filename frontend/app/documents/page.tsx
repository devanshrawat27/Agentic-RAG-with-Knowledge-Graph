"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listDocuments,
  uploadDocument,
  type DocumentItem,
  type UploadResult,
} from "@/lib/api";
import { Banner } from "@/components/ui";

export default function DocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
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

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setNotice("");
    setUploading(true);
    try {
      const result: UploadResult = await uploadDocument(files[0]);
      let msg = `"${result.filename}" ingested — ${result.chunks} chunks.`;
      if (result.quota_hit) {
        msg += " LLM quota hit; graph extraction was skipped (embeddings are stored).";
      } else {
        msg += ` ${result.entities} entities, ${result.relationships} relationships.`;
      }
      setNotice(msg);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <a href="/dashboard" className="text-sm font-semibold text-neutral-900">
            Agentic RAG
          </a>
          <a
            href="/chat"
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Chat
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-24 pt-12">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Documents
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Upload PDF, DOCX, or TXT files. They are chunked, embedded into your
          private vector store, and mined for entities.
        </p>

        {error && (
          <div className="mt-6">
            <Banner>{error}</Banner>
          </div>
        )}
        {notice && (
          <div className="mt-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
            dragging
              ? "border-neutral-900 bg-neutral-100"
              : "border-neutral-300 bg-white"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <p className="text-sm text-neutral-600">
            Drag &amp; drop a file here, or
          </p>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="mt-3 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {uploading ? "Ingesting..." : "Choose file"}
          </button>
          <p className="mt-3 text-xs text-neutral-400">PDF, DOCX, TXT, MD · max 20 MB</p>
        </div>

        <section className="mt-12">
          <h2 className="text-base font-semibold text-neutral-900">
            Your documents
          </h2>
          {docs.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-400">No documents yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Filename</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Chunks</th>
                    <th className="px-4 py-3 font-medium">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-t border-neutral-100">
                      <td className="px-4 py-3 text-neutral-900">{d.filename}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            d.status === "ready"
                              ? "bg-emerald-50 text-emerald-700"
                              : d.status === "failed"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500">{d.chunk_count}</td>
                      <td className="px-4 py-3 text-neutral-400">
                        {d.created_at ? new Date(d.created_at).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
