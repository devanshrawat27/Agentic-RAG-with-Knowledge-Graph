"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api";
import { resetPasswordSchema, validate, type FieldErrors } from "@/lib/validation";
import { Banner, Card, Field, buttonClass, pageClass } from "@/components/ui";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

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
      <Card title="Set a new password">
        <Banner>This reset link is missing or invalid.</Banner>
        <p className="text-center text-sm text-neutral-500">
          <Link href="/forgot-password" className="font-medium text-neutral-900 hover:underline">
            Request a new link
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-md [&>div]:max-w-full">
      <Card title="Set a new password" subtitle="Choose a new password.">
        <Banner>{error}</Banner>

        <div className="space-y-4">
          <Field
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
          <Field
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
        </div>

        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? "Updating..." : "Update password"}
        </button>

        <p className="text-center text-sm text-neutral-500">
          <Link href="/login" className="font-medium text-neutral-900 hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className={pageClass}>
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
