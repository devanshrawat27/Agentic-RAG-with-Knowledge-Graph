"use client";

import { Container } from "./primitives";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Showcase", href: "#showcase" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "FAQ", href: "#faq" },
      { label: "GitHub", href: "https://github.com/devanshrawat27/Agentic-RAG-with-Knowledge-Graph" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] py-14">
      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

      <Container>
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo withWordmark />
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-white/40">
              TrueDocs turns documents into structured, searchable,
              verifiable knowledge — powered by Agentic AI and Knowledge Graphs.
            </p>
            {/* Social links placeholder */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com/devanshrawat27/Agentic-RAG-with-Knowledge-Graph"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/40 transition-all duration-200 hover:border-white/15 hover:text-white/80"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.36-3.37-1.36-.46-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.07.64-1.32-2.22-.26-4.55-1.13-4.55-5.03 0-1.11.39-2.02 1.03-2.73-.1-.27-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.04.8-.23 1.65-.34 2.5-.34s1.7.11 2.5.34c1.91-1.32 2.75-1.04 2.75-1.04.55 1.41.2 2.44.1 2.71.64.71 1.03 1.62 1.03 2.73 0 3.91-2.34 4.77-4.57 5.02.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {COLUMNS.map((c) => (
              <div key={c.title}>
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-white/45">
                  {c.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[13px] text-white/50 transition-colors duration-200 hover:text-white"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center">
          <p className="text-[12px] text-white/35">
            © {new Date().getFullYear()} TrueDocs. Built with Agentic RAG + Knowledge Graphs.
          </p>
          <p className="text-[12px] text-white/35">
            v0.1 · Agentic RAG with Knowledge Graph
          </p>
        </div>
      </Container>
    </footer>
  );
}