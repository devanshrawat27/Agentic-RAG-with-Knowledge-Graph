"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Use Cases", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <div
        className={`mx-auto flex h-[62px] w-full max-w-[1240px] items-center justify-between rounded-2xl border px-5 sm:px-6 transition-all duration-300 ${
          scrolled
            ? "border-white/[0.12] bg-[#07080b]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            : "border-white/[0.08] bg-[#07080b]/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Logo with 3D diamond mark */}
        <a href="#" aria-label="TrueDocs home" className="relative z-10">
          <Logo withWordmark />
        </a>

        {/* Desktop nav links */}
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[14px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right CTA button matching reference */}
        <div className="flex items-center gap-3">
          <a
            href="/signup"
            className="group inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-[13.5px] font-semibold text-neutral-900 transition-all duration-300 hover:bg-neutral-100 hover:shadow-[0_0_24px_-4px_rgba(255,255,255,0.6)] active:scale-95"
          >
            Get Started
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M4 8h16M4 16h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 max-w-[1240px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07080b]/95 p-4 backdrop-blur-2xl md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}