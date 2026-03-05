"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface TickerItem {
  id: string;
  text: string;
  priority: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function AddTickerForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [priority, setPriority] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("ticker_items").insert({ text: text.trim(), priority });
    setText("");
    setPriority(0);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded border border-seam bg-chamber p-6">
      <h2 className="mb-4 font-cinzel text-lg text-paper">Add Ticker Item</h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            Text
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
            placeholder="Breaking news text..."
          />
        </div>
        <div className="w-full sm:w-28">
          <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            Priority
          </label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment focus:border-parchment focus:outline-none"
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

export function TickerRow({ item }: { item: TickerItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("ticker_items").update({ active: !item.active }).eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("ticker_items").delete().eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-seam bg-chamber last:border-b-0 hover:bg-graphite">
      <td className="px-4 py-3 font-crimson text-parchment">{item.text}</td>
      <td className="px-4 py-3 font-barlow text-xs text-stone">{item.priority}</td>
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
      <td className="px-4 py-3 font-barlow text-xs text-stone">
        {item.expires_at
          ? new Date(item.expires_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Never"}
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

export function TickerRowMobile({ item }: { item: TickerItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("ticker_items").update({ active: !item.active }).eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("ticker_items").delete().eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded border border-seam bg-chamber p-4">
      <p className="mb-2 font-crimson text-parchment">{item.text}</p>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-barlow text-xs text-stone">Priority: {item.priority}</span>
        <span className="text-seam">|</span>
        <span className="font-barlow text-xs text-stone">
          Expires: {item.expires_at
            ? new Date(item.expires_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Never"}
        </span>
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
