"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { loginSchema, validate, type FieldErrors } from "@/lib/validation";
import { Banner, Card, Field, buttonClass, pageClass } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={pageClass}>
      <form onSubmit={onSubmit} noValidate className="w-full max-w-md [&>div]:max-w-full">
        <Card title="Sign in" subtitle="Welcome back.">
          <Banner>{error}</Banner>

          <div className="space-y-4">
            <Field
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
            <Field
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              hint={
                <Link
                  href="/forgot-password"
                  className="text-sm text-neutral-500 hover:text-neutral-900"
                >
                  Forgot password?
                </Link>
              }
            />
          </div>

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-neutral-900 hover:underline">
              Create account
            </Link>
          </p>
        </Card>
      </form>
    </main>
  );
}
