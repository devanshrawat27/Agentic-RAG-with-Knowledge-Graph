"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { login } from "@/lib/api";
import { loginSchema, validate, type FieldErrors } from "@/lib/validation";
import { Banner, Field, authButtonClass, OAuthButton, Divider } from "@/components/ui";
import { AuthShell } from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = validate(loginSchema, { email, password });
    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      badge="AI-Powered Document Intelligence"
      title="Turn Your"
      highlight="Documents into Real Knowledge"
      description="Join researchers, teams, and organizations using TrueDocs to extract insights, uncover connections, and work 10x faster."
      showFeatures={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center"
      >
        <h2 className="text-[26px] font-semibold tracking-tight text-white">Welcome back</h2>
        <p className="mt-1.5 text-[13.5px] text-white/55">Sign in to your TrueDocs account</p>
      </motion.div>

      <div className="mt-7 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.48 }}
          className="space-y-2.5"
        >
          <OAuthButton provider="google" onClick={() => alert("OAuth not configured yet — coming soon")}>
            Continue with Google
          </OAuthButton>
          <OAuthButton provider="github" onClick={() => alert("OAuth not configured yet — coming soon")}>
            Continue with GitHub
          </OAuthButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.54 }}
        >
          <Divider>or</Divider>
        </motion.div>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Banner variant="dark">{error}</Banner>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
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
            transition={{ duration: 0.5, delay: 0.66 }}
          >
            <Field
              variant="dark"
              label="Password"
              name="password"
              type={showPw ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              hint={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="flex h-6 w-6 items-center justify-center rounded text-white/40 transition hover:text-white"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3l18 18" />
                      <path d="M10.7 6.2A11 11 0 0 1 12 6c5 0 9 4 10 6a11 11 0 0 1-3.4 4.3M6.6 6.6C4.1 8.3 2.3 11 2 12c1 2 5 6 10 6a10 10 0 0 0 5.4-1.6" />
                      <path d="M9.9 9.9a3 3 0 1 0 4.2 4.2" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.72 }}
            className="flex items-center justify-between"
          >
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-white/65 select-none">
              <span className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded-[5px] border border-white/[0.18] bg-white/[0.03] transition checked:border-cyan-400/60 checked:bg-cyan-400/90 hover:border-white/[0.32]"
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="pointer-events-none absolute left-0 h-4 w-4 text-neutral-900 opacity-0 transition peer-checked:opacity-100"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-[12.5px] font-medium text-cyan-300/90 transition hover:text-cyan-200"
            >
              Forgot password?
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.78 }}
          >
            <button type="submit" disabled={loading} className={authButtonClass}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                      <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white to-neutral-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </motion.div>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.84 }}
          className="pt-1 text-center text-[13px] text-white/55"
        >
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-cyan-300 transition hover:text-cyan-200">
            Create one
          </Link>
        </motion.p>
      </div>
    </AuthShell>
  );
}