"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Ad {
  id: string;
  advertiser: string;
  headline: string;
  body: string;
  tagline: string | null;
  cta_text: string;
  cta_url: string;
  image_url: string | null;
  placement: string;
  active: boolean;
  created_at: string;
}

const PLACEMENTS = ["sidebar", "banner", "inline", "footer"] as const;

function AdFormFields({
  values,
  onChange,
}: {
  values: {
    advertiser: string;
    headline: string;
    body: string;
    tagline: string;
    cta_text: string;
    cta_url: string;
    placement: string;
  };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            Advertiser
          </label>
          <input
            type="text"
            value={values.advertiser}
            onChange={(e) => onChange("advertiser", e.target.value)}
            required
            className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
            placeholder="Company name..."
          />
        </div>
        <div className="w-full sm:w-40">
          <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            Placement
          </label>
          <select
            value={values.placement}
            onChange={(e) => onChange("placement", e.target.value)}
            className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment focus:border-parchment focus:outline-none"
          >
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
          Headline
        </label>
        <input
          type="text"
          value={values.headline}
          onChange={(e) => onChange("headline", e.target.value)}
          required
          className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
          placeholder="Ad headline..."
        />
      </div>
      <div>
        <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
          Body
        </label>
        <textarea
          value={values.body}
          onChange={(e) => onChange("body", e.target.value)}
          required
          rows={2}
          className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
          placeholder="Ad body copy..."
        />
      </div>
      <div>
        <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
          Tagline
        </label>
        <input
          type="text"
          value={values.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
          className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
          placeholder="Optional tagline..."
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            CTA Text
          </label>
          <input
            type="text"
            value={values.cta_text}
            onChange={(e) => onChange("cta_text", e.target.value)}
            required
            className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
            placeholder="Learn More"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
            CTA URL
          </label>
          <input
            type="url"
            value={values.cta_url}
            onChange={(e) => onChange("cta_url", e.target.value)}
            required
            className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash focus:border-parchment focus:outline-none"
            placeholder="https://..."
          />
        </div>
      </div>
    </>
  );
}

export function AddAdForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    advertiser: "",
    headline: "",
    body: "",
    tagline: "",
    cta_text: "",
    cta_url: "",
    placement: "sidebar",
  });

  function handleChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.advertiser.trim() || !values.headline.trim() || !values.body.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("ads").insert({
      advertiser: values.advertiser.trim(),
      headline: values.headline.trim(),
      body: values.body.trim(),
      tagline: values.tagline.trim() || null,
      cta_text: values.cta_text.trim(),
      cta_url: values.cta_url.trim(),
      placement: values.placement,
    });
    setValues({
      advertiser: "",
      headline: "",
      body: "",
      tagline: "",
      cta_text: "",
      cta_url: "",
      placement: "sidebar",
    });
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded border border-seam bg-chamber p-6">
      <h2 className="mb-4 font-cinzel text-lg text-paper">Create New Ad</h2>
      <div className="flex flex-col gap-4">
        <AdFormFields values={values} onChange={handleChange} />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-garnet px-6 py-2 font-barlow text-[11px] font-medium uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Ad"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function AdRow({ item }: { item: Ad }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    advertiser: item.advertiser,
    headline: item.headline,
    body: item.body,
    tagline: item.tagline ?? "",
    cta_text: item.cta_text,
    cta_url: item.cta_url,
    placement: item.placement,
  });

  function handleChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("ads").update({ active: !item.active }).eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("ads")
      .update({
        advertiser: values.advertiser.trim(),
        headline: values.headline.trim(),
        body: values.body.trim(),
        tagline: values.tagline.trim() || null,
        cta_text: values.cta_text.trim(),
        cta_url: values.cta_url.trim(),
        placement: values.placement,
      })
      .eq("id", item.id);
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  if (editing) {
    return (
      <tr className="border-b border-seam bg-chamber last:border-b-0">
        <td colSpan={4} className="px-4 py-4">
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <AdFormFields values={values} onChange={handleChange} />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-garnet px-4 py-1.5 font-barlow text-[11px] font-medium uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setValues({
                    advertiser: item.advertiser,
                    headline: item.headline,
                    body: item.body,
                    tagline: item.tagline ?? "",
                    cta_text: item.cta_text,
                    cta_url: item.cta_url,
                    placement: item.placement,
                  });
                }}
                className="rounded bg-graphite px-4 py-1.5 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:text-parchment"
              >
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-seam bg-chamber last:border-b-0 hover:bg-graphite">
      <td className="px-4 py-3 font-crimson text-parchment">{item.advertiser}</td>
      <td className="px-4 py-3 font-crimson text-stone">{item.headline}</td>
      <td className="px-4 py-3">
        <span className="inline-block rounded bg-graphite px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-stone">
          {item.placement}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
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
            onClick={() => setEditing(true)}
            className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-parchment hover:text-parchment"
          >
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
}

export function AdRowMobile({ item }: { item: Ad }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({
    advertiser: item.advertiser,
    headline: item.headline,
    body: item.body,
    tagline: item.tagline ?? "",
    cta_text: item.cta_text,
    cta_url: item.cta_url,
    placement: item.placement,
  });

  function handleChange(field: string, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function toggleActive() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("ads").update({ active: !item.active }).eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("ads")
      .update({
        advertiser: values.advertiser.trim(),
        headline: values.headline.trim(),
        body: values.body.trim(),
        tagline: values.tagline.trim() || null,
        cta_text: values.cta_text.trim(),
        cta_url: values.cta_url.trim(),
        placement: values.placement,
      })
      .eq("id", item.id);
    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="rounded border border-seam bg-chamber p-4">
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <AdFormFields values={values} onChange={handleChange} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-garnet px-4 py-1.5 font-barlow text-[11px] font-medium uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setValues({
                  advertiser: item.advertiser,
                  headline: item.headline,
                  body: item.body,
                  tagline: item.tagline ?? "",
                  cta_text: item.cta_text,
                  cta_url: item.cta_url,
                  placement: item.placement,
                });
              }}
              className="rounded bg-graphite px-4 py-1.5 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:text-parchment"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded border border-seam bg-chamber p-4">
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-crimson text-lg text-parchment">{item.advertiser}</h3>
        <span className="inline-block rounded bg-graphite px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-stone">
          {item.placement}
        </span>
      </div>
      <p className="mb-3 font-crimson text-sm text-stone">{item.headline}</p>
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
          onClick={() => setEditing(true)}
          className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-parchment hover:text-parchment"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
