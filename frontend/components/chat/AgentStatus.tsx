"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ChatResponse } from "@/lib/api";

const STEPS = ["Planning", "Retrieving", "Verifying", "Answering"] as const;

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
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    setStep(0);
    const timer = setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }, 1600);
    return () => clearInterval(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((label, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${
                  done
                    ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300"
                    : active
                      ? "border-cyan-400/30 bg-cyan-500/[0.08] text-cyan-200"
                      : "border-white/[0.06] bg-white/[0.02] text-white/30"
                }`}
              >
                <span className={active ? "animate-pulse" : ""}>
                  {done ? "✓" : active ? "●" : "○"}
                </span>
                {label}
              </span>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-white/35">
          Running the verified pipeline…
        </p>
      </div>
    );
  }

  if (!response || response.mode === "chat") return null;

  if (response.mode === "baseline") {
    return (
      <div className="mb-3">
        <Chip>Flat RAG · no verification</Chip>
      </div>
    );
  }

  const claims = response.claims ?? [];
  const supported = claims.filter((claim) => claim.supported).length;
  const planned = response.sub_questions?.length ?? 0;
  const loops = response.loop_count ?? 0;
  const sources = response.citations.length;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      <Chip>Planned {planned}</Chip>
      <Chip>Hybrid retrieval</Chip>
      <Chip
        tone={claims.length > 0 && supported === claims.length ? "ok" : "warn"}
      >
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
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${TONES.muted}`}
      >
        Baseline
      </span>
    );
  }

  const claims = response.claims ?? [];
  const supported = claims.filter((claim) => claim.supported).length;

  if (claims.length === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${TONES.muted}`}
      >
        No verified claims
      </span>
    );
  }

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
