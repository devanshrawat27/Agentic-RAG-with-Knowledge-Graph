"use client";

import { AppShell } from "@/components/app/AppShell";
import { ComingSoon } from "@/components/app/ComingSoon";

export default function GraphPage() {
  return (
    <AppShell>
      <ComingSoon
        title="Knowledge Graph"
        accent="#a78bfa"
        description="Explore the full entity-relationship graph extracted from your documents — an interactive, zoomable, draggable view of how everything connects."
        icon={
          <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="6" r="2.5" />
            <circle cx="6" cy="18" r="2.5" />
            <circle cx="18" cy="18" r="2.5" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M8 7.5l2.5 3M13.5 10.5l3-3M8 16.5l2.5-3M13.5 13.5l3 3" />
          </svg>
        }
        points={[
          "Interactive canvas — zoom, pan, and drag nodes",
          "Click any node to inspect its properties and neighbours",
          "Entity types from the locked v1 schema (Vendor, Contract, Clause, Policy, …)",
          "Filter by document or relationship type",
        ]}
      />
    </AppShell>
  );
}