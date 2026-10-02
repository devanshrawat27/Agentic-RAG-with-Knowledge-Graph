import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">
          Agentic RAG with Knowledge Graph
        </h1>
        <p className="text-neutral-500 max-w-md">
          Verified multi-agent retrieval over your enterprise documents. Sign in
          to access your private workspace, chats, and history.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="border rounded px-4 py-2 text-sm hover:bg-neutral-100"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="bg-black text-white rounded px-4 py-2 text-sm hover:opacity-90"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}
