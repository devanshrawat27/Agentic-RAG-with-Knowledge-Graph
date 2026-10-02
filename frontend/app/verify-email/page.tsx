"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/api";
import { Card, pageClass } from "@/components/ui";

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
    <Card
      title={status === "loading" ? "Verifying..." : "Email verification"}
      subtitle={status === "ok" ? message : undefined}
    >
      {isError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {message}
        </p>
      )}
      <p className="text-center text-sm text-neutral-500">
        <Link href="/login" className="font-medium text-neutral-900 hover:underline">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className={pageClass}>
      <Suspense fallback={null}>
        <VerifyInner />
      </Suspense>
    </main>
  );
}
