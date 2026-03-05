"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TrendingItem {
  id: string;
  headline: string;
  article_id: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export function AddTrendingForm({ nextOrder }: { nextOrder: number }) {
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!headline.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("trending").insert({
      headline: headline.trim(),
      sort_order: nextOrder,
    });
    setHeadline("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded border border-seam bg-chamber p-6">
      <h2 className="mb-4 font-cinzel text-lg text-paper">Add Trending Item</h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
            className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
            placeholder="Trending headline..."
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-garnet px-6 py-2 font-barlow text-[11px] font-medium uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}

export function TrendingRow({ item }: { item: TrendingItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [sortOrder, setSortOrder] = useState(item.sort_order);

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("trending").update({ active: !item.active }).eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("trending").delete().eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function saveSortOrder() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("trending").update({ sort_order: sortOrder }).eq("id", item.id);
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  async function moveUp() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("trending")
      .update({ sort_order: item.sort_order - 1 })
      .eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function moveDown() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("trending")
      .update({ sort_order: item.sort_order + 1 })
      .eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-seam bg-chamber last:border-b-0 hover:bg-graphite">
      <td className="px-4 py-3 font-crimson text-parchment">{item.headline}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-16 rounded border border-seam bg-graphite px-2 py-1 font-barlow text-xs text-parchment focus:border-parchment focus:outline-none"
              />
              <button
                onClick={saveSortOrder}
                disabled={loading}
                className="rounded bg-garnet px-2 py-1 font-barlow text-[10px] font-medium uppercase text-paper hover:bg-garnet-bright disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setSortOrder(item.sort_order);
                }}
                className="rounded bg-graphite px-2 py-1 font-barlow text-[10px] font-medium uppercase text-stone hover:text-parchment"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={moveUp}
                disabled={loading}
                className="rounded bg-graphite px-1.5 py-0.5 font-barlow text-xs text-stone hover:text-parchment disabled:opacity-50"
                title="Move up"
              >
                &#9650;
              </button>
              <button
                onClick={() => setEditing(true)}
                className="min-w-[2rem] rounded bg-graphite px-2 py-0.5 text-center font-barlow text-xs text-stone hover:text-parchment"
              >
                {item.sort_order}
              </button>
              <button
                onClick={moveDown}
                disabled={loading}
                className="rounded bg-graphite px-1.5 py-0.5 font-barlow text-xs text-stone hover:text-parchment disabled:opacity-50"
                title="Move down"
              >
                &#9660;
              </button>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`rounded px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider transition-colors disabled:opacity-50 ${
            item.active
              ? "bg-garnet-bright text-paper"
              : "bg-ash text-paper"
          }`}
        >
          {item.active ? "Active" : "Inactive"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-garnet-bright hover:text-garnet-bright disabled:opacity-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export function TrendingRowMobile({ item }: { item: TrendingItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("trending").update({ active: !item.active }).eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("trending").delete().eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function moveUp() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("trending")
      .update({ sort_order: item.sort_order - 1 })
      .eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function moveDown() {
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("trending")
      .update({ sort_order: item.sort_order + 1 })
      .eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded border border-seam bg-chamber p-4">
      <h3 className="mb-2 font-crimson text-lg text-parchment">{item.headline}</h3>
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={moveUp}
          disabled={loading}
          className="rounded bg-graphite px-1.5 py-0.5 font-barlow text-xs text-stone hover:text-parchment disabled:opacity-50"
        >
          &#9650;
        </button>
        <span className="font-barlow text-xs text-stone">#{item.sort_order}</span>
        <button
          onClick={moveDown}
          disabled={loading}
          className="rounded bg-graphite px-1.5 py-0.5 font-barlow text-xs text-stone hover:text-parchment disabled:opacity-50"
        >
          &#9660;
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`rounded px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider transition-colors disabled:opacity-50 ${
            item.active
              ? "bg-garnet-bright text-paper"
              : "bg-ash text-paper"
          }`}
        >
          {item.active ? "Active" : "Inactive"}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-garnet-bright hover:text-garnet-bright disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
