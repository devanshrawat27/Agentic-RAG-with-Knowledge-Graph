"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/app/AppShell";
import {
  addCollectionDocument,
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  listDocuments,
  removeCollectionDocument,
  updateCollection,
  type CollectionDetail,
  type CollectionItem,
  type DocumentItem,
} from "@/lib/api";

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

function FolderIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionItem[] | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<CollectionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addDocId, setAddDocId] = useState("");

  const handleError = useCallback(
    (err: unknown, fallback: string) => {
      const message = err instanceof Error ? err.message : fallback;
      if (
        message.includes("401") ||
        message.toLowerCase().includes("authenticated")
      ) {
        router.replace("/login");
        return;
      }
      setError(message);
    },
    [router],
  );

  const load = useCallback(async () => {
    try {
      const [cols, docs] = await Promise.all([listCollections(), listDocuments()]);
      setCollections(cols);
      setDocuments(docs.documents);
      setSelectedId((current) => current ?? cols[0]?.id ?? null);
    } catch (err) {
      handleError(err, "Failed to load collections");
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selectedId == null) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    getCollection(selectedId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setEditName(data.name);
        setEditDescription(data.description);
        setEditing(false);
        setConfirmDelete(false);
        setAddDocId("");
      })
      .catch((err) => {
        if (!cancelled) handleError(err, "Failed to load collection");
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, handleError]);

  const availableDocuments = useMemo(() => {
    const inCollection = new Set(detail?.documents.map((d) => d.id) ?? []);
    return documents.filter((doc) => !inCollection.has(doc.id));
  }, [documents, detail]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const created = await createCollection(
        newName.trim(),
        newDescription.trim(),
      );
      setCollections((prev) => [created, ...(prev ?? [])]);
      setSelectedId(created.id);
      setCreating(false);
      setNewName("");
      setNewDescription("");
      setNotice(`"${created.name}" created`);
    } catch (err) {
      handleError(err, "Failed to create collection");
    } finally {
      setBusy(false);
    }
  }

  async function onSaveEdit() {
    if (!selectedId || busy || !editName.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateCollection(selectedId, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setCollections(
        (prev) =>
          prev?.map((item) =>
            item.id === updated.id ? { ...item, ...updated } : item,
          ) ?? null,
      );
      setDetail((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditing(false);
      setNotice("Collection updated");
    } catch (err) {
      handleError(err, "Failed to update collection");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!selectedId || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await deleteCollection(selectedId);
      setCollections(
        (prev) => prev?.filter((item) => item.id !== selectedId) ?? null,
      );
      setSelectedId(null);
      setDetail(null);
      setConfirmDelete(false);
      setNotice("Collection deleted");
    } catch (err) {
      handleError(err, "Failed to delete collection");
    } finally {
      setBusy(false);
    }
  }

  async function onAddDocument() {
    if (!selectedId || !addDocId || busy) return;
    setBusy(true);
    setError("");
    try {
      const updated = await addCollectionDocument(
        selectedId,
        Number(addDocId),
      );
      setDetail(updated);
      setCollections(
        (prev) =>
          prev?.map((item) =>
            item.id === updated.id
              ? {
                  ...item,
                  document_count: updated.document_count,
                  updated_at: updated.updated_at,
                }
              : item,
          ) ?? null,
      );
      setAddDocId("");
    } catch (err) {
      handleError(err, "Failed to add document");
    } finally {
      setBusy(false);
    }
  }

  async function onRemoveDocument(documentId: number) {
    if (!selectedId || busy) return;
    setBusy(true);
    setError("");
    try {
      const updated = await removeCollectionDocument(selectedId, documentId);
      setDetail(updated);
      setCollections(
        (prev) =>
          prev?.map((item) =>
            item.id === updated.id
              ? {
                  ...item,
                  document_count: updated.document_count,
                  updated_at: updated.updated_at,
                }
              : item,
          ) ?? null,
      );
    } catch (err) {
      handleError(err, "Failed to remove document");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-[30px] font-semibold tracking-tight text-white">
              Collections
            </h1>
            <p className="mt-1.5 max-w-xl text-[14px] text-white/55">
              Group related documents into focused sets — like “2024 Contracts”
              or “HR Policies”.
            </p>
          </div>
          <button
            onClick={() => {
              setCreating(true);
              setError("");
              setNotice("");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13.5px] font-semibold text-neutral-900 transition hover:bg-neutral-100"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            New collection
          </button>
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

        <div className="mt-7 grid gap-5 lg:grid-cols-[320px,1fr]">
          <section className="space-y-2.5">
            {creating && (
              <motion.form
                onSubmit={onCreate}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/15 bg-white/[0.03] p-4"
              >
                <p className="text-[13px] font-semibold text-white">
                  New collection
                </p>
                <input
                  autoFocus
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="Collection name"
                  maxLength={120}
                  className="mt-3 w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-white/20"
                />
                <textarea
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="Description (optional)"
                  maxLength={500}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-white/20"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={!newName.trim() || busy}
                    className="rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-semibold text-neutral-900 disabled:opacity-40"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(false);
                      setNewName("");
                      setNewDescription("");
                    }}
                    className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-[12.5px] text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}

            {collections === null ? (
              <div className="flex items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.015] py-14 text-[13px] text-white/40">
                Loading collections…
              </div>
            ) : collections.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/75">
                  <FolderIcon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-[14px] font-medium text-white/80">
                  No collections yet
                </p>
                <p className="mt-1 text-[12.5px] text-white/40">
                  Create one to group your documents.
                </p>
              </div>
            ) : (
              collections.map((collection) => {
                const active = collection.id === selectedId;
                return (
                  <button
                    key={collection.id}
                    onClick={() => setSelectedId(collection.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-white/15 bg-gradient-to-r from-white/[0.06] to-white/[0.02]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2 text-[14px] font-semibold text-white">
                        <FolderIcon
                          className={`h-4 w-4 flex-shrink-0 ${
                            active ? "text-white/75" : "text-white/40"
                          }`}
                        />
                        <span className="truncate">{collection.name}</span>
                      </span>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10.5px] text-white/50">
                        {collection.document_count}
                      </span>
                    </div>
                    {collection.description && (
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] text-white/45">
                        {collection.description}
                      </p>
                    )}
                    <p className="mt-2 text-[11px] text-white/25">
                      updated {timeAgo(collection.updated_at)}
                    </p>
                  </button>
                );
              })
            )}
          </section>

          <section className="min-h-[420px] rounded-2xl border border-white/[0.06] bg-white/[0.015]">
            {!selectedId ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/30">
                  <FolderIcon className="h-6 w-6" />
                </div>
                <p className="mt-3 text-[14px] font-medium text-white/70">
                  Select a collection
                </p>
                <p className="mt-1 max-w-xs text-[12.5px] text-white/40">
                  Pick one from the left, or create a new collection to get
                  started.
                </p>
              </div>
            ) : loadingDetail || !detail ? (
              <div className="flex h-full min-h-[420px] items-center justify-center gap-2.5 text-[13px] text-white/45">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
                Loading collection…
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="border-b border-white/[0.05] p-5">
                  {editing ? (
                    <div>
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        maxLength={120}
                        className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[15px] font-semibold text-white outline-none focus:border-white/20"
                      />
                      <textarea
                        value={editDescription}
                        onChange={(event) =>
                          setEditDescription(event.target.value)
                        }
                        maxLength={500}
                        rows={2}
                        placeholder="Description"
                        className="mt-2 w-full resize-none rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-white/20"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={onSaveEdit}
                          disabled={!editName.trim() || busy}
                          className="rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-semibold text-neutral-900 disabled:opacity-40"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditing(false);
                            setEditName(detail.name);
                            setEditDescription(detail.description);
                          }}
                          className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-[12.5px] text-white/60 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-[18px] font-semibold text-white">
                          {detail.name}
                        </h2>
                        <p className="mt-1 text-[12.5px] text-white/45">
                          {detail.document_count} document
                          {detail.document_count === 1 ? "" : "s"}
                          {detail.description ? ` · ${detail.description}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditing(true)}
                          className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/60 transition hover:text-white"
                        >
                          Edit
                        </button>
                        {confirmDelete ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={onDelete}
                              disabled={busy}
                              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[12px] font-medium text-red-300 disabled:opacity-40"
                            >
                              Confirm delete
                            </button>
                            <button
                              onClick={() => setConfirmDelete(false)}
                              className="text-[12px] text-white/40 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(true)}
                            className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/50 transition hover:border-red-500/30 hover:text-red-300"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto p-5">
                  {detail.documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-[13.5px] text-white/50">
                        No documents in this collection yet.
                      </p>
                      {documents.length === 0 ? (
                        <Link
                          href="/documents"
                          className="mt-3 text-[12.5px] font-medium text-white/75 hover:text-white/90"
                        >
                          Upload documents first →
                        </Link>
                      ) : (
                        <p className="mt-1 text-[12px] text-white/30">
                          Add one from the list below.
                        </p>
                      )}
                    </div>
                  ) : (
                    detail.documents.map((doc) => {
                      const status =
                        STATUS_STYLES[doc.status] ?? {
                          label: doc.status,
                          color: "#94a3b8",
                        };
                      return (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                        >
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/70">
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-white">
                              {doc.filename}
                            </p>
                            <p className="mt-0.5 text-[11.5px] text-white/40">
                              {doc.chunk_count} chunks · {doc.entity_count}{" "}
                              entities · {doc.relationship_count} relationships
                            </p>
                          </div>
                          <span
                            className="inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium"
                            style={{
                              borderColor: `${status.color}44`,
                              color: status.color,
                              backgroundColor: `${status.color}12`,
                            }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: status.color }}
                            />
                            {status.label}
                          </span>
                          <button
                            onClick={() => onRemoveDocument(doc.id)}
                            disabled={busy}
                            className="rounded-lg border border-white/[0.08] px-2 py-1 text-[11.5px] text-white/45 transition hover:border-red-500/30 hover:text-red-300 disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t border-white/[0.05] p-4">
                  {availableDocuments.length === 0 ? (
                    <p className="text-center text-[12px] text-white/30">
                      {documents.length === 0
                        ? "No documents available to add."
                        : "All your documents are already in this collection."}
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={addDocId}
                        onChange={(event) => setAddDocId(event.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[12.5px] text-white outline-none focus:border-white/20"
                      >
                        <option value="" className="bg-[#0a0b0e]">
                          Add a document…
                        </option>
                        {availableDocuments.map((doc) => (
                          <option
                            key={doc.id}
                            value={doc.id}
                            className="bg-[#0a0b0e]"
                          >
                            {doc.filename}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={onAddDocument}
                        disabled={!addDocId || busy}
                        className="rounded-lg bg-white px-3 py-2 text-[12.5px] font-semibold text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
