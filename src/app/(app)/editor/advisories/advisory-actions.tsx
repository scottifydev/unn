"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Advisory {
  id: string;
  level: number;
  title: string;
  body: string;
  active: boolean;
  issued_at: string;
  created_at: string;
}

const LEVEL_LABELS: Record<number, string> = {
  1: "Notice",
  2: "Warning",
  3: "Critical",
};

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-ash",
  2: "bg-garnet",
  3: "bg-garnet-bright",
};

export function AddAdvisoryForm() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("council_advisories").insert({
      level,
      title: title.trim(),
      body: body.trim(),
    });
    setTitle("");
    setBody("");
    setLevel(1);
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded border border-seam bg-chamber p-6">
      <h2 className="mb-4 font-cinzel text-lg text-paper">Issue New Advisory</h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="w-full sm:w-40">
            <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment focus:border-parchment focus:outline-none"
            >
              <option value={1}>1 - Notice</option>
              <option value={2}>2 - Warning</option>
              <option value={3}>3 - Critical</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
              placeholder="Advisory title..."
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={3}
            className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
            placeholder="Advisory details..."
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-garnet px-6 py-2 font-barlow text-[11px] font-medium uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50"
          >
            {submitting ? "Issuing..." : "Issue Advisory"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function AdvisoryRow({ item }: { item: Advisory }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    if (!item.active) {
      await supabase.from("council_advisories").update({ active: false }).eq("active", true);
    }
    await supabase.from("council_advisories").update({ active: !item.active }).eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-seam bg-chamber last:border-b-0 hover:bg-graphite">
      <td className="px-4 py-3">
        <span
          className={`inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper ${LEVEL_COLORS[item.level] ?? "bg-ash"}`}
        >
          {LEVEL_LABELS[item.level] ?? `Level ${item.level}`}
        </span>
      </td>
      <td className="px-4 py-3 font-crimson text-parchment">{item.title}</td>
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
        {new Date(item.issued_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </td>
    </tr>
  );
}

export function AdvisoryRowMobile({ item }: { item: Advisory }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    if (!item.active) {
      await supabase.from("council_advisories").update({ active: false }).eq("active", true);
    }
    await supabase.from("council_advisories").update({ active: !item.active }).eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded border border-seam bg-chamber p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper ${LEVEL_COLORS[item.level] ?? "bg-ash"}`}
        >
          {LEVEL_LABELS[item.level] ?? `Level ${item.level}`}
        </span>
        <span className="font-barlow text-xs text-stone">
          {new Date(item.issued_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      <h3 className="mb-1 font-crimson text-lg text-parchment">{item.title}</h3>
      <p className="mb-3 font-crimson text-sm text-stone">{item.body}</p>
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
    </div>
  );
}
