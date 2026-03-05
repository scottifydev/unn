"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  articleId: string;
}

export function DeleteButton({ articleId }: DeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const res = await fetch(`/api/articles/${articleId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }

    setLoading(false);
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded bg-garnet-bright px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-paper transition-colors hover:bg-garnet disabled:opacity-50"
        >
          {loading ? "..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:text-parchment"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-garnet-bright hover:text-garnet-bright"
    >
      Delete
    </button>
  );
}
