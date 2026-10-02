"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, type UserPublic } from "@/lib/api";
import { Banner } from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [router]);

  async function onLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-sm font-semibold text-neutral-900">
            Agentic RAG
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-24 pt-16">
        {!user ? (
          <p className="text-sm text-neutral-400">Loading...</p>
        ) : (
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Hi, {user.name}
            </h1>
            <p className="mt-2 text-neutral-500">
              Your documents, chats, and history are private to your account.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-500">
              <span>{user.email}</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${user.is_verified
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                  }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${user.is_verified ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                />
                {user.is_verified ? "Verified" : "Not verified"}
              </span>
            </div>

            {error && (
              <div className="mt-6">
                <Banner>{error}</Banner>
              </div>
            )}

            <div className="mt-16 grid gap-10 sm:grid-cols-2">
              <section className="border-t border-neutral-200 pt-6">
                <h2 className="text-base font-semibold text-neutral-900">
                  Documents
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Upload files to build your knowledge base.
                </p>
                <p className="mt-4 text-xs text-neutral-400">Coming soon</p>
              </section>

              <section className="border-t border-neutral-200 pt-6">
                <h2 className="text-base font-semibold text-neutral-900">
                  Chats
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Ask questions across your documents.
                </p>
                <p className="mt-4 text-xs text-neutral-400">Coming soon</p>
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}