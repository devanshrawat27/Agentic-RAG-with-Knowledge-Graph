"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { forgotPassword } from "@/lib/api";
import { forgotPasswordSchema, validate, type FieldErrors } from "@/lib/validation";
import { Banner, Field, authButtonClass } from "@/components/ui";
import { AuthShell, type AuthFeature } from "@/components/AuthShell";

const SENT_FEATURES: AuthFeature[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: "Check your inbox",
    body: "Open the email and click the reset link.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Link expires in 1 hour",
    body: "For your security, the link is valid for 1 hour.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="1" fill="currentColor" />
      </svg>
    ),
    title: "Still not received?",
    body: "Check your spam folder or request a new link.",
  },
];

const RECOVERY_FEATURES: AuthFeature[] = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M12 3 4 6v5.5c0 4.5 3.5 8.5 8 9.5 4.5-1 8-5 8-9.5V6l-8-3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Secure & Private",
    body: "Your data and documents remain safe.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: "Quick & Easy",
    body: "Get back to your workspace in minutes.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "Continue Your Work",
    body: "Access all your chats, documents and insights.",
  },
];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = validate(forgotPasswordSchema, { email });
    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await forgotPassword(parsed.data.email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        badge="Account recovery"
        title="You're one step"
        highlight="closer"
        description={`We've sent a password reset link to ${email}`}
        features={SENT_FEATURES}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 220, damping: 18 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/40 bg-gradient-to-br from-emerald-500/20 via-emerald-900/30 to-black text-emerald-300 shadow-[0_0_40px_rgba(16,185,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.18)]"
          >
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.path
                d="m5 12 5 5L20 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            </motion.svg>
          </motion.div>

          <h2 className="text-[24px] font-semibold tracking-tight text-white">Reset link sent!</h2>
          <p className="mt-2 text-[13.5px] text-white/55">
            We&apos;ve sent a password reset link to
          </p>
          <p className="mt-1 text-[14px] font-medium text-white">{email}.</p>
          <p className="mt-3 max-w-sm text-[13px] text-white/55">
            Please check your inbox and click the link to set a new password.
          </p>

          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onClick={() => window.open("https://mail.google.com", "_blank", "noopener")}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-[13.5px] font-semibold text-neutral-900 shadow-[0_8px_24px_-8px_rgba(255,255,255,0.3)] transition hover:bg-neutral-100 active:scale-[0.99]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            Open Gmail
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="relative mt-6 flex w-full items-center justify-center"
          >
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <span className="relative bg-gradient-to-b from-white/[0.06] via-white/[0.025] to-white/[0.01] px-3 text-[11.5px] uppercase tracking-[0.18em] text-white/40">
              or
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.78 }}
            className="mt-5"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to sign in
            </Link>
          </motion.div>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Account recovery"
      title="Reset your"
      highlight="password"
      description="Enter your email address and we'll send you a link to reset your password."
      features={RECOVERY_FEATURES}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-1.5"
      >
        <h2 className="text-[24px] font-semibold tracking-tight text-white">Reset password</h2>
        <p className="text-[13.5px] text-white/50">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </motion.div>

      <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
        <Banner variant="dark">{error}</Banner>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Field
            variant="dark"
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.58 }}
          className="pt-2"
        >
          <button type="submit" disabled={loading} className={authButtonClass}>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                    <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Send reset link
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.66 }}
          className="pt-1 text-center text-[13px] text-white/45"
        >
          <Link href="/login" className="font-medium text-white transition hover:text-cyan-200">
            Back to sign in
          </Link>
        </motion.p>
      </form>
    </AuthShell>
  );
}