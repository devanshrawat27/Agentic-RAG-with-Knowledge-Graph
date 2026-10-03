"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getMe, logout, type UserPublic } from "@/lib/api";

const NAV_ITEMS = [
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    href: "/graph",
    label: "Knowledge Graph",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M8.5 7.5l7 7M16.5 7.5l-7 7" />
      </svg>
    ),
  },
  {
    href: "/collections",
    label: "Collections",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l9-4 9 4-9 4-9-4Z" />
        <path d="M3 12l9 4 9-4M3 17l9 4 9-4" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentChats] = useState<string[]>([]);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function onLogout() {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  }

  const sidebar = (
    <SidebarInner
      pathname={pathname}
      user={user}
      recentChats={recentChats}
      onLogout={onLogout}
    />
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-1/3 h-[600px] w-[600px] rounded-full bg-cyan-500/[0.03] blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.025] blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/[0.05] bg-white/[0.015] lg:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.06] bg-[#0a0b0e] lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.05] bg-[#050505]/80 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <Image src="/Futuristic Folded Ribbon Emblem.png" alt="TrueDocs" width={34} height={34} className="h-[34px] w-[34px] object-contain" />
            <span className="text-[18px] font-semibold tracking-tight">TrueDocs</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function SidebarInner({
  pathname,
  user,
  recentChats,
  onLogout,
}: {
  pathname: string;
  user: UserPublic | null;
  recentChats: string[];
  onLogout: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex h-[68px] items-center gap-3 px-5">
        <Link href="/chat" className="flex items-center gap-3">
          <Image
            src="/Futuristic Folded Ribbon Emblem.png"
            alt="TrueDocs"
            width={40}
            height={40}
            className="h-10 w-10 object-contain drop-shadow-[0_0_14px_rgba(56,189,248,0.35)]"
            priority
          />
          <span className="text-[20px] font-semibold tracking-tight">TrueDocs</span>
        </Link>
      </div>

      {/* New Chat */}
      <div className="px-3 pb-2">
        <Link
          href="/chat"
          className="group flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13.5px] font-semibold text-neutral-900 shadow-[0_6px_20px_-8px_rgba(255,255,255,0.25)] transition hover:bg-neutral-100"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Chat
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all ${
                  active
                    ? "border border-white/[0.1] bg-gradient-to-r from-white/[0.08] to-white/[0.02] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                    : "border border-transparent text-white/60 hover:bg-white/[0.03] hover:text-white/90"
                }`}
              >
                <span className="text-current">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Recent chats */}
        <div className="mt-6">
          <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/35">
            Recent Chats
          </div>
          <div className="mt-2 space-y-0.5">
            {recentChats.length === 0 ? (
              <p className="px-3 py-2 text-[12.5px] text-white/30">No recent chats yet</p>
            ) : (
              recentChats.map((c, i) => (
                <button
                  key={i}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] text-white/60 transition hover:bg-white/[0.03] hover:text-white/90"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="truncate">{c}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/[0.05] p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/30 to-black text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.3)]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{user?.name ?? "…"}</p>
            <p className="truncate text-[11.5px] text-white/45">{user?.email ?? ""}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/50 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
            aria-label="Log out"
            title="Log out"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}