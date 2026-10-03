"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { verifyEmail } from "@/lib/api";
import { AuthShell } from "@/components/AuthShell";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing or invalid.");
      return;
    }
    verifyEmail(token)
      .then((r) => {
        setStatus("ok");
        setMessage(r.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token]);

  const isError = status === "error";

  return (
    <AuthShell
      badge="Account verification"
      title={
        status === "loading"
          ? "Verifying your"
          : isError
            ? "Verification"
            : "Email"
      }
      highlight={
        status === "loading"
          ? "email."
          : isError
            ? "failed."
            : "verified."
      }
      description={
        status === "ok"
          ? message || "Your email is verified. You can now sign in to TrueDocs."
          : isError
            ? message
            : "Hold on while we confirm your email and activate your account."
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center"
      >
        {status === "loading" && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/30 to-black text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.35)]"
          >
            <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" opacity="0.25" />
              <path
                d="M21 12a9 9 0 0 1-9 9"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        )}
        {status === "ok" && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 220 }}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-emerald-900/30 to-black text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
              <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        )}
        {isError && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-500/20 via-red-900/30 to-black text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.35)]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}

        <h2 className="text-[22px] font-semibold tracking-tight text-white">
          {status === "loading"
            ? "Verifying..."
            : status === "ok"
              ? "Email verified"
              : "Verification failed"}
        </h2>

        {status === "ok" && (
          <p className="mt-3 text-[14px] text-white/55 max-w-sm">
            {message || "Your email is verified. You can now sign in to TrueDocs."}
          </p>
        )}
        {isError && <p className="mt-3 text-[14px] text-red-300/90">{message}</p>}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-7"
        >
          {status === "ok" ? (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-100"
            >
              Continue to sign in
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to sign in
            </Link>
          )}
        </motion.div>
      </motion.div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}