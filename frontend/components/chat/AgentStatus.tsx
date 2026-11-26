"use client";

import type { ReactNode } from "react";
import type { ChatResponse } from "@/lib/api";

const TONES = {
  ok: "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300",
  warn: "border-amber-500/30 bg-amber-500/[0.08] text-amber-300",
  muted: "border-white/[0.08] bg-white/[0.03] text-white/45",
} as const;

type Tone = keyof typeof TONES;

function Chip({ children, tone = "muted" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function AgentStatus({
  loading,
  response,
}: {
  loading?: boolean;
  response?: ChatResponse;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <span className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400/70"
              style={{ animationDelay: `${dot * 0.15}s` }}
            />
          ))}
        </span>
        <span className="text-[12.5px] text-white/45">Thinking…</span>
      </div>
    );
  }

  if (!response || response.mode === "chat") return null;

  const claims = response.claims ?? [];
  const sources = response.citations.length;

  if (response.mode === "baseline") {
    if (sources === 0) return null;
    return (
      <div className="mb-3">
        <Chip>Flat RAG · no verification</Chip>
      </div>
    );
  }

  // The trace only makes sense when a verified run actually produced claims.
  // History messages don't persist claims, so they correctly show nothing.
  if (claims.length === 0) return null;

  const supported = claims.filter((claim) => claim.supported).length;
  const planned = response.sub_questions?.length ?? 0;
  const loops = response.loop_count ?? 0;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {planned > 0 && <Chip>Planned {planned}</Chip>}
      <Chip>Hybrid retrieval</Chip>
      <Chip tone={claims.length > 0 && supported === claims.length ? "ok" : "warn"}>
        Verified {supported}/{claims.length}
      </Chip>
      {loops > 0 && <Chip tone="warn">Extra retrieval {loops}×</Chip>}
      <Chip>
        {sources} source{sources === 1 ? "" : "s"}
      </Chip>
    </div>
  );
}

export function VerificationBadge({ response }: { response: ChatResponse }) {
  if (response.mode === "chat") return null;

  if (response.mode === "baseline") {
    if (response.citations.length === 0) return null;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${TONES.muted}`}
      >
        Baseline
      </span>
    );
  }

  const claims = response.claims ?? [];
  if (claims.length === 0) return null;

  const supported = claims.filter((claim) => claim.supported).length;
  const fullySupported = supported === claims.length;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${
        fullySupported ? TONES.ok : TONES.warn
      }`}
    >
      {fullySupported ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6 9 17l-5-5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      {fullySupported ? "Verified" : `${supported}/${claims.length} verified`}
    </span>
  );
}
