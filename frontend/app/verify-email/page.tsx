"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/api";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
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

  return (
    <div className="max-w-sm text-center space-y-3">
      <h1 className="text-2xl font-semibold">Email verification</h1>
      {status === "loading" && <p className="text-neutral-600">Verifying...</p>}
      {status !== "loading" && <p className="text-neutral-600">{message}</p>}
      <Link href="/login" className="text-sm hover:underline">
        Back to sign in
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Suspense fallback={<p>Loading...</p>}>
        <VerifyInner />
      </Suspense>
    </main>
  );
}
