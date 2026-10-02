"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/api";
import { forgotPasswordSchema, validate, type FieldErrors } from "@/lib/validation";
import { Banner, Card, Field, buttonClass, pageClass } from "@/components/ui";

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
      <main className={pageClass}>
        <Card title="Check your email" subtitle="Reset link sent.">
          <p className="text-sm text-neutral-500">
            If <span className="font-medium text-neutral-900">{email}</span> is
            registered, a reset link has been sent.
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
      <form onSubmit={onSubmit} noValidate>
        <Card
          title="Reset password"
          subtitle="Enter your email and we'll send you a reset link."
        >
          <Banner>{error}</Banner>

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

          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <p className="text-center text-sm text-neutral-500">
            <Link href="/login" className="font-medium text-neutral-900 hover:underline">
              Back to sign in
            </Link>
          </p>
        </Card>
      </form>
    </main>
  );
}
