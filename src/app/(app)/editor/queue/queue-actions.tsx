"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QueueActionsProps {
  articleId: string;
}

export function QueueActions({ articleId }: QueueActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(status: "published" | "archived") {
    setLoading(status === "published" ? "approve" : "reject");

    const res = await fetch(`/api/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      router.refresh();
    }

    setLoading(null);
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`/api/articles/${articleId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-parchment hover:text-parchment"
      >
        View
      </a>
      <button
        onClick={() => handleAction("published")}
        disabled={loading !== null}
        className="rounded bg-garnet px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50"
      >
        {loading === "approve" ? "..." : "Approve"}
      </button>
      <button
        onClick={() => handleAction("archived")}
        disabled={loading !== null}
        className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-garnet-bright hover:text-garnet-bright disabled:opacity-50"
      >
        {loading === "reject" ? "..." : "Reject"}
      </button>
    </div>
  );
}
