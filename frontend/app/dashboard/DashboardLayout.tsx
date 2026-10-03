"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  user?: { name?: string; email?: string };
  onLogout?: () => void;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "home", exact: true },
  { href: "/documents", label: "Documents", icon: "documents" },
  { href: "/chat", label: "Chat", icon: "chat" },
];

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function DocumentsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: HomeIcon,
  documents: DocumentsIcon,
  chat: ChatIcon,
};

export function Sidebar({ open, collapsed, onClose, onToggleCollapse, user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  return (
    <>
      {/* Mobile backdrop handled by parent */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-white/[0.02] to-transparent border-r border-white/[0.04] transition-all duration-300 ease-out ${
          collapsed ? "w-16" : "w-64"
        } ${isMobile ? (open ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}`}
        aria-label="Sidebar navigation"
      >
        {/* Logo + toggle */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.04] px-4">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <Image
                src="/Futuristic Folded Ribbon Emblem.png"
                alt="TrueDocs"
                width={40}
                height={40}
                className="h-10 w-10 object-contain drop-shadow-[0_0_14px_rgba(56,189,248,0.35)]"
                priority
              />
              <span className="text-[19px] font-semibold tracking-tight">TrueDocs</span>
            </motion.div>
          )}
          <button
            onClick={onToggleCollapse}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white hover:border-white/[0.14] ${collapsed ? "mx-auto" : "mr-auto"}`}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <path d="M9 5l7 7-7 7" /> : <path d="M15 5l-7 7 7 7" />}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-white/[0.08] to-white/[0.02] text-white border border-white/[0.1] shadow-[0_0_15px_rgba(255,255,255,0.03),inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                    : "text-white/60 hover:bg-white/[0.03] hover:text-white/90"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex h-9 w-9 items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                {!collapsed && (
                  <span className="text-[13.5px] font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User profile */}
        {!collapsed && (
          <div className="border-t border-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/30 to-black text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.35)]">
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name || "User"}</p>
                <p className="text-[11.5px] text-white/45 truncate">{user?.email || "user@example.com"}</p>
              </div>
              <button 
                onClick={onLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.14] transition"
                aria-label="Log out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

interface HeaderProps {
  onMenuClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  user?: { name?: string; email?: string };
}

export function Header({ onMenuClick, collapsed, onToggleCollapse, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-6 lg:pl-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white hover:border-white/[0.14]"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white hover:border-white/[0.14]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? <path d="M9 5l7 7-7 7" /> : <path d="M15 5l-7 7 7 7" />}
          </svg>
        </button>

        {!collapsed && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5">
            <Image
              src="/Futuristic Folded Ribbon Emblem.png"
              alt="TrueDocs"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="text-[19px] font-semibold tracking-tight">TrueDocs</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-[13px] text-white/45">
        {user?.name && (
          <span className="hidden sm:inline">
            Signed in as <span className="font-medium text-white/80">{user.name}</span>
          </span>
        )}
      </div>
    </header>
  );
}

interface UserAvatar {
  name?: string;
  email?: string;
}

interface DashboardShellProps {
  user?: UserAvatar;
  onLogout?: () => void;
  children: React.ReactNode;
}

export function DashboardShell({ user, onLogout, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background ambient */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-1/2 h-[600px] w-[600px] rounded-full bg-cyan-500/[0.03] blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.025] blur-3xl" />
      </div>

      <Sidebar 
        open={sidebarOpen} 
        collapsed={collapsed} 
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        user={user}
        onLogout={onLogout}
      />

      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          user={user}
        />
        
        <MainContent>
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </MainContent>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">{children}</div>
    </main>
  );
}