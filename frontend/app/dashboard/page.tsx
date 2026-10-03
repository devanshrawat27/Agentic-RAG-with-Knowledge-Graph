"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getMe, logout, type UserPublic } from "@/lib/api";
import { DashboardShell } from "./DashboardLayout";
import { DashboardHome } from "./DashboardHome";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.replace("/login");
      });
  }, [router]);

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/30 to-black text-cyan-300 animate-spin"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </motion.div>
            <p className="text-[14px] text-white/55">Loading dashboard...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      <DashboardHome userName={user.name} />
    </DashboardShell>
  );
}