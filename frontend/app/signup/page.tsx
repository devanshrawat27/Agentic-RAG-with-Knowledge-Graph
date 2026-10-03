"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signup } from "@/lib/api";
import { signupSchema, validate, type FieldErrors } from "@/lib/validation";
import { Banner, Field, authButtonClass } from "@/components/ui";
import { AuthShell } from "@/components/AuthShell";

function passwordScore(p: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  if (!p) return { score: 0, label: "", color: "" };
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return { score: score as 0 | 1, label: "Weak", color: "#ef4444" };
  if (score === 2) return { score: 2, label: "Fair", color: "#f59e0b" };
  if (score === 3) return { score: 3, label: "Good", color: "#38bdf8" };
  return { score: 4, label: "Strong", color: "#34d399" };
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const pw = useMemo(() => passwordScore(password), [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = validate(signupSchema, { name, email, password });
    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await signup(parsed.data.name, parsed.data.email, parsed.data.password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell
        badge="AI-Powered Document Intelligence"
        title="Verify your email"
        highlight="and get started."
        description="We've sent a verification link to your inbox. Click it to activate your TrueDocs account."
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-cyan-900/30 to-black text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.35)]"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </motion.div>
          <h2 className="text-[22px] font-semibold tracking-tight text-white">Check your email</h2>
          <p className="text-[14px] text-white/55">
            We sent a verification link to <span className="font-medium text-white">{email}</span>.
          </p>
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
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="AI-Powered Document Intelligence"
      title="Create your TrueDocs"
      highlight="workspace."
      description="Turn your documents into structured knowledge and get accurate, source-grounded answers."
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-1.5"
      >
        <h2 className="text-[24px] font-semibold tracking-tight text-white">
          Create your account
        </h2>
        <p className="text-[13.5px] text-white/50">
          Join TrueDocs and start exploring your documents.
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
            label="Full name"
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.56 }}
        >
          <Field
            variant="dark"
            label="Email address"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.62 }}
        >
          <Field
            variant="dark"
            label="Password"
            name="password"
            type={showPw ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            hint={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-[11.5px] font-medium text-white/50 transition hover:text-white"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            }
          />

          {/* Password strength meter */}
          <AnimatePresence>
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/45">Password strength</span>
                  <span className="font-medium" style={{ color: pw.color }}>
                    {pw.label}
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(pw.score / 4) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: pw.color, boxShadow: `0 0 8px ${pw.color}` }}
                  />
                </div>
                <ul className="mt-2.5 grid grid-cols-1 gap-1 text-[11px] text-white/40 sm:grid-cols-3">
                  <li className="flex items-center gap-1.5">
                    <Check on={password.length >= 8} />
                    8+ characters
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check on={/\d/.test(password) && /[A-Za-z]/.test(password)} />
                    Letter &amp; number
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check on={/[^A-Za-z0-9]/.test(password)} />
                    Special character
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
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
          transition={{ duration: 0.5, delay: 0.76 }}
          className="pt-1 text-center text-[13px] text-white/45"
        >
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-white transition hover:text-cyan-200">
            Sign in
          </Link>
        </motion.p>
      </form>
    </AuthShell>
  );
}

function Check({ on }: { on: boolean }) {
  return on ? (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#34d399" fillOpacity="0.18" />
      <path d="m8 12 3 3 5-6" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
    </svg>
  );
}