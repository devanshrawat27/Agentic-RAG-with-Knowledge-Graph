"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/lib/api";
import { signupSchema, validate, type FieldErrors } from "@/lib/validation";
import { Banner, Card, Field, buttonClass, pageClass } from "@/components/ui";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <main className={pageClass}>
        <Card title="Check your email">
          <p className="text-sm text-neutral-500">
            We sent a verification link to{" "}
            <span className="font-medium text-neutral-900">{email}</span>.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-neutral-500 hover:text-neutral-900"
          >
            Back to sign in
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className={pageClass}>
      <form onSubmit={onSubmit} noValidate className="w-full max-w-md [&>div]:max-w-full">
        <Card title="Create account" subtitle="Get started in a few seconds.">
          <Banner>{error}</Banner>

          <div className="space-y-4">
            <Field
              label="Name"
              name="name"
              required
              maxLength={120}
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
            />
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
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />
          </div>

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <p className="text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-neutral-900 hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </form>
    </main>
  );
}
