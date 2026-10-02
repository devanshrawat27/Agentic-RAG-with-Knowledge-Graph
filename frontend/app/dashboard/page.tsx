"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout, type UserPublic } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => router.push("/login"));
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
    <main className="min-h-screen p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Dashboard{user ? `, ${user.name}` : ""}
        </h1>
        <button
          onClick={onLogout}
          className="border rounded px-3 py-1.5 text-sm hover:bg-neutral-100"
        >
          Log out
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-neutral-600">
        Your documents, chats, and history are private to your account.
      </p>
    </main>
  );
}
