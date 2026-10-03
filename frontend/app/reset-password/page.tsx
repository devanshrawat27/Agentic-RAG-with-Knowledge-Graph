"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { resetPassword } from "@/lib/api";
import { resetPasswordSchema, validate, type FieldErrors } from "@/lib/validation";
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

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const pw = useMemo(() => passwordScore(password), [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = validate(resetPasswordSchema, { password, confirm });
    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await resetPassword(token, parsed.data.password);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthShell
        badge="Account recovery"
        title="Invalid reset"
        highlight="link."
        description="This reset link is missing or invalid. Please request a new one."
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 text-center"
        >
          <h2 className="text-[20px] font-semibold tracking-tight text-white">Link invalid or expired</h2>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-[13px] font-semibold text-neutral-900 transition hover:bg-neutral-100"
          >
            Request a new link
          </Link>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Account recovery"
      title="Set a new"
      highlight="password."
      description="Choose a strong new password to secure your TrueDocs workspace."
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-1.5"
      >
        <h2 className="text-[24px] font-semibold tracking-tight text-white">Set a new password</h2>
        <p className="text-[13.5px] text-white/50">Choose a new password for your account.</p>
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
            label="New password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/45">Strength</span>
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
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.56 }}
        >
          <Field
            variant="dark"
            label="Confirm password"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={fieldErrors.confirm}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.64 }}
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
                  Updating...
                </>
              ) : (
                <>
                  Update password
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
          transition={{ duration: 0.5, delay: 0.7 }}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}