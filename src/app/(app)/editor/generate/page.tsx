"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const SECTIONS = [
  { slug: "underworld-affairs", name: "Underworld Affairs" },
  { slug: "ether-and-veil", name: "Ether & Veil" },
  { slug: "occult-markets", name: "Occult Markets" },
  { slug: "creature-profile", name: "Creature Profile" },
  { slug: "ask-astra", name: "Ask Astra" },
  { slug: "weather-and-omens", name: "Weather & Omens" },
  { slug: "opinion", name: "Opinion" },
  { slug: "human-affairs", name: "Human Affairs Desk" },
  { slug: "labor", name: "Labor Desk" },
  { slug: "health", name: "Health Desk" },
  { slug: "culture", name: "Cultural & Entertainment Desk" },
  { slug: "the-crypt", name: "The Crypt Desk" },
] as const;

type ArticleStyle = "feature" | "brief" | "breaking";

interface GeneratedArticle {
  id: string;
  headline: string;
  slug: string;
  dek: string | null;
  body_html: string | null;
  status: string;
}

export default function GenerateArticlePage() {
  const [sectionSlug, setSectionSlug] = useState<string>(SECTIONS[0].slug);
  const [topicHint, setTopicHint] = useState("");
  const [style, setStyle] = useState<ArticleStyle>("feature");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setArticle(null);

    try {
      const supabase = createClient();
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-article",
        {
          body: {
            section_slug: sectionSlug,
            topic_hint: topicHint || undefined,
            style,
          },
        }
      );

      if (fnError) {
        setError(fnError.message || "Failed to invoke generation function");
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.article) {
        setArticle(data.article);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function getFirstParagraph(html: string | null): string {
    if (!html) return "";
    const match = html.match(/<p>([\s\S]*?)<\/p>/);
    return match ? match[1] : "";
  }

  return (
    <main className="min-h-screen bg-void">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <h1 className="font-cinzel text-2xl font-bold text-paper sm:text-3xl">
            Generate Article
          </h1>
          <Link
            href="/editor/queue"
            className="rounded border border-seam px-3 py-1.5 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-parchment hover:text-parchment"
          >
            Editorial Queue
          </Link>
        </div>

        <div className="rounded border border-seam bg-chamber p-6 sm:p-8">
          {/* Section selector */}
          <div className="mb-6">
            <label
              htmlFor="section"
              className="mb-2 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone"
            >
              Section
            </label>
            <select
              id="section"
              value={sectionSlug}
              onChange={(e) => setSectionSlug(e.target.value)}
              disabled={loading}
              className="w-full rounded border border-seam bg-graphite px-3 py-2.5 font-crimson text-parchment transition-colors focus:border-parchment focus:outline-none disabled:opacity-50"
            >
              {SECTIONS.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic hint */}
          <div className="mb-6">
            <label
              htmlFor="topic"
              className="mb-2 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone"
            >
              Topic Hint{" "}
              <span className="normal-case tracking-normal text-ash">(optional)</span>
            </label>
            <textarea
              id="topic"
              value={topicHint}
              onChange={(e) => setTopicHint(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="e.g., New microplastic regulations affecting blood supply chain..."
              className="w-full resize-none rounded border border-seam bg-graphite px-3 py-2.5 font-crimson text-parchment placeholder:text-ash transition-colors focus:border-parchment focus:outline-none disabled:opacity-50"
            />
          </div>

          {/* Style selector */}
          <div className="mb-8">
            <span className="mb-3 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
              Style
            </span>
            <div className="flex flex-wrap gap-3">
              {(
                [
                  { value: "feature", label: "Feature", desc: "4-5 paragraphs, detailed" },
                  { value: "brief", label: "Brief", desc: "3 paragraphs, wire-service" },
                  { value: "breaking", label: "Breaking", desc: "3-4 paragraphs, urgent" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col rounded border px-4 py-3 transition-colors ${
                    style === opt.value
                      ? "border-garnet bg-garnet/10 text-paper"
                      : "border-seam bg-graphite text-stone hover:border-parchment/40"
                  } ${loading ? "pointer-events-none opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    name="style"
                    value={opt.value}
                    checked={style === opt.value}
                    onChange={() => setStyle(opt.value)}
                    disabled={loading}
                    className="sr-only"
                  />
                  <span className="font-barlow text-[11px] font-medium uppercase tracking-wider">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 font-crimson text-sm text-ash">
                    {opt.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded bg-garnet px-6 py-3 font-barlow text-sm font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
                Generating...
              </span>
            ) : (
              "Generate Article"
            )}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-6 rounded border border-garnet/50 bg-garnet/10 p-4">
            <p className="font-barlow text-[11px] font-medium uppercase tracking-wider text-garnet-bright">
              Error
            </p>
            <p className="mt-1 font-crimson text-parchment">{error}</p>
          </div>
        )}

        {/* Generated article preview */}
        {article && (
          <div className="mt-6 rounded border border-seam bg-chamber p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded bg-garnet/20 px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-garnet-bright">
                Draft
              </span>
              <span className="font-barlow text-[11px] uppercase tracking-wider text-stone">
                AI Generated
              </span>
            </div>

            <h2 className="mb-2 font-cinzel text-xl font-bold text-paper sm:text-2xl">
              {article.headline}
            </h2>

            {article.dek && (
              <p className="mb-4 font-crimson text-lg text-parchment/80">
                {article.dek}
              </p>
            )}

            <div
              className="mb-6 font-crimson text-body leading-relaxed text-parchment/70 [&>p]:mb-3"
              dangerouslySetInnerHTML={{
                __html: getFirstParagraph(article.body_html),
              }}
            />

            <p className="mb-6 font-crimson text-sm italic text-ash">
              Showing first paragraph only. Open the full draft to review and edit.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/editor/queue`}
                className="rounded bg-garnet px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright"
              >
                View in Queue
              </Link>
              <button
                onClick={() => {
                  setArticle(null);
                  setError(null);
                }}
                className="rounded border border-seam px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-parchment hover:text-parchment"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
