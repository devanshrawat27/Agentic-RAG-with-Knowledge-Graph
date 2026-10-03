"use client";

import { AppShell } from "@/components/app/AppShell";
import { ComingSoon } from "@/components/app/ComingSoon";

export default function CollectionsPage() {
  return (
    <AppShell>
      <ComingSoon
        title="Collections"
        accent="#34d399"
        description="Organize your documents into focused groups — like “2024 Contracts” or “HR Policies” — and scope your questions to just the collection that matters."
        icon={
          <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7l9-4 9 4-9 4-9-4Z" />
            <path d="M3 12l9 4 9-4M3 17l9 4 9-4" />
          </svg>
        }
        points={[
          "Create named collections and add documents to them",
          "Ask questions scoped to a single collection",
          "Per-collection graph and citation filtering",
          "Share or archive collections as a unit",
        ]}
      />
    </AppShell>
  );
}