"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Section } from "@/lib/types";
import Image from "next/image";
import { ImageSearch } from "@/components/editor/image-search";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

export default function SubmitArticlePage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [headline, setHeadline] = useState("");
  const [dek, setDek] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [body, setBody] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [featuredImageAlt, setFeaturedImageAlt] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState<"ai" | "stock">("ai");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
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

  const selectedSection = sections.find((s) => s.id === sectionId);

  async function handleGenerateImage() {
    if (!headline.trim() || !selectedSection) return;
    setGeneratingImage(true);
    setImageError(null);

    try {
      const supabase = createClient();
      const { data, error: fnError } = await supabase.functions.invoke("generate-image", {
        body: {
          headline: headline.trim(),
          section_name: selectedSection.name,
          custom_prompt: imagePrompt.trim() || undefined,
        },
      });

      if (fnError) {
        setImageError(fnError.message || "Image generation failed");
        return;
      }
      if (data?.error) {
        setImageError(data.error);
        return;
      }
      if (data?.image_url) {
        setFeaturedImageUrl(data.image_url);
        setFeaturedImageAlt(data.brief ?? null);
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGeneratingImage(false);
    }
  }

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
        featured_image_url: featuredImageUrl || undefined,
        featured_image_alt: featuredImageAlt || undefined,
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

            {/* Featured Image */}
            <div>
              <label className="mb-2 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                Featured Image
              </label>

              {/* Image preview / placeholder */}
              {featuredImageUrl ? (
                <div className="relative mb-3 overflow-hidden rounded border border-seam">
                  <Image
                    src={featuredImageUrl}
                    alt={featuredImageAlt ?? "Featured image"}
                    width={800}
                    height={600}
                    className="w-full object-cover"
                    style={{ maxHeight: "240px" }}
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => { setFeaturedImageUrl(null); setFeaturedImageAlt(null); }}
                    className="absolute right-2 top-2 rounded bg-void/80 px-2 py-1 font-barlow text-[10px] font-medium uppercase tracking-wider text-stone hover:text-parchment"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              {/* Tabs */}
              <div className="mb-3 flex gap-0 rounded border border-seam overflow-hidden">
                {(["ai", "stock"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setImageTab(tab)}
                    className={`flex-1 py-1.5 font-barlow text-[10px] font-medium uppercase tracking-wider transition-colors ${
                      imageTab === tab
                        ? "bg-graphite text-parchment"
                        : "bg-chamber text-ash hover:text-stone"
                    }`}
                  >
                    {tab === "ai" ? "AI Generate" : "Search Stock"}
                  </button>
                ))}
              </div>

              {imageTab === "ai" ? (
                <div className="space-y-2">
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={2}
                    placeholder="Optional: describe the image you want (e.g. 'a vampire in a pinstripe suit reviewing tax documents in a grey office')"
                    className="w-full resize-none rounded border border-seam bg-graphite px-3 py-2 font-crimson text-sm text-parchment placeholder:text-ash outline-none focus:border-garnet"
                  />
                  {imageError && (
                    <p className="font-crimson text-sm text-garnet-bright">{imageError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={generatingImage || headline.trim().length < 5 || !selectedSection}
                    className="flex items-center gap-1.5 rounded border border-seam px-3 py-1.5 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-parchment hover:text-parchment disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {generatingImage ? (
                      <>
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-stone/30 border-t-stone" />
                        Generating...
                      </>
                    ) : featuredImageUrl ? "Regenerate" : "Generate Image"}
                  </button>
                </div>
              ) : (
                <ImageSearch
                  onSelect={(url, alt) => {
                    setFeaturedImageUrl(url);
                    setFeaturedImageAlt(alt);
                  }}
                />
              )}
            </div>

            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                Body
              </label>
              <RichTextEditor value={body} onChange={setBody} placeholder="Write your article here..." minHeight="320px" />
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
