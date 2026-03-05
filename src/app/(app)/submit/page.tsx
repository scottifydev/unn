"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Section } from "@/lib/types";

export default function SubmitArticlePage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [headline, setHeadline] = useState("");
  const [dek, setDek] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSections() {
      const supabase = createClient();
      const { data } = await supabase
        .from("sections")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (data) {
        setSections(data);
        if (data.length > 0) setSectionId(data[0].id);
      }
    }
    loadSections();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headline,
        dek: dek || undefined,
        section_id: sectionId,
        body_html: body || undefined,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Failed to submit article");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/my-articles"), 1500);
  }

  if (success) {
    return (
      <main className="min-h-screen bg-void">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded border border-seam bg-chamber p-8">
            <h1 className="mb-4 font-cinzel text-2xl font-bold text-paper">
              Article Submitted
            </h1>
            <p className="font-crimson text-parchment">
              Your article has been saved as a draft. Redirecting to your articles...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <h1 className="mb-6 font-cinzel text-2xl font-bold text-paper sm:mb-8 sm:text-3xl">
          Submit Article
        </h1>

        <div className="rounded border border-seam bg-chamber p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
                minLength={5}
                maxLength={200}
                placeholder="Your article headline"
                className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash outline-none focus:border-garnet"
              />
            </div>

            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                Dek
              </label>
              <textarea
                value={dek}
                onChange={(e) => setDek(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="A short summary or subtitle (optional)"
                className="w-full resize-none rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash outline-none focus:border-garnet"
              />
            </div>

            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                Section
              </label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                required
                className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Write your article here..."
                className="w-full resize-y rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment leading-relaxed placeholder:text-ash outline-none focus:border-garnet"
              />
            </div>

            {error && (
              <p className="font-crimson text-sm text-garnet-bright">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-garnet px-4 py-2.5 font-barlow text-sm font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50 sm:w-auto sm:px-8"
            >
              {submitting ? "Submitting..." : "Submit Article"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
