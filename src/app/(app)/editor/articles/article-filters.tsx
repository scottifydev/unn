"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ArticleWithSectionAndAuthor } from "@/lib/types";
import { ArticleRowActions } from "./article-row-actions";

interface ArticleFiltersProps {
  articles: ArticleWithSectionAndAuthor[];
  isAdmin: boolean;
}

const STATUSES = ["all", "draft", "pending", "published", "archived"] as const;

const STATUS_STYLES: Record<string, string> = {
  draft: "text-ash",
  pending: "text-stone",
  published: "text-parchment",
  archived: "text-ash line-through",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ArticleFilters({ articles, isAdmin }: ArticleFiltersProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [sortMode, setSortMode] = useState<"newest" | "oldest" | "az">("newest");

  const sections = useMemo(() => {
    const seen = new Set<string>();
    return articles
      .filter((a) => a.sections && !seen.has(a.sections.id) && seen.add(a.sections.id))
      .map((a) => ({ id: a.sections!.id, name: a.sections!.name }));
  }, [articles]);

  const filtered = useMemo(() => {
    let result = articles;
    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);
    if (sectionFilter !== "all") result = result.filter((a) => a.section_id === sectionFilter);
    if (sortMode === "oldest") return [...result].sort((a, b) => a.created_at.localeCompare(b.created_at));
    if (sortMode === "az") return [...result].sort((a, b) => a.headline.localeCompare(b.headline));
    return result;
  }, [articles, statusFilter, sectionFilter, sortMode]);

  const selectClass = "rounded border border-seam bg-graphite px-2 py-1 font-barlow text-[11px] uppercase tracking-wider text-stone outline-none focus:border-garnet";

  return (
    <>
      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded px-3 py-1 font-barlow text-[10px] font-medium uppercase tracking-wider transition-colors ${
                statusFilter === s
                  ? "bg-graphite text-parchment"
                  : "text-ash hover:text-stone"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} className={selectClass}>
            <option value="all">All sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value as typeof sortMode)} className={selectClass}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="az">A–Z</option>
          </select>
        </div>
      </div>

      <p className="mb-3 font-barlow text-[11px] uppercase tracking-wider text-ash">
        {filtered.length} of {articles.length} articles
      </p>

      {filtered.length === 0 ? (
        <div className="rounded border border-seam bg-chamber p-8 text-center">
          <p className="font-crimson text-stone">No articles match the current filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded border border-seam md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-seam bg-graphite">
                  <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Headline</th>
                  <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Section</th>
                  <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Status</th>
                  <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Author</th>
                  <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Date</th>
                  <th className="px-4 py-3 text-right font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article) => (
                  <tr key={article.id} className="border-b border-seam bg-chamber last:border-b-0 hover:bg-graphite">
                    <td className="max-w-xs px-4 py-3">
                      <Link
                        href={`/article/${article.slug}`}
                        className="line-clamp-2 font-crimson text-parchment hover:text-paper"
                        target="_blank"
                      >
                        {article.headline}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2">
                        {article.featured_image_url && (
                          <span className="font-barlow text-[10px] uppercase tracking-wider text-ash">has image</span>
                        )}
                        {article.sort_order != null && (
                          <span className="font-barlow text-[10px] uppercase tracking-wider text-garnet">#{article.sort_order}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper"
                        style={{ backgroundColor: article.sections?.tag_color ?? "#333" }}
                      >
                        {article.sections?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-barlow text-[11px] uppercase tracking-wider">
                      <span className={STATUS_STYLES[article.status] ?? "text-stone"}>{article.status}</span>
                    </td>
                    <td className="px-4 py-3 font-crimson text-sm text-stone">
                      {article.profiles?.display_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-barlow text-xs text-stone">
                      {formatDate(article.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ArticleRowActions
                        article={{
                          id: article.id,
                          headline: article.headline,
                          slug: article.slug,
                          dek: article.dek,
                          body_html: article.body_html,
                          section_id: article.section_id,
                          section_name: article.sections?.name ?? "",
                          status: article.status,
                          featured: article.featured,
                          sort_order: article.sort_order,
                          featured_image_url: article.featured_image_url,
                          featured_image_alt: article.featured_image_alt,
                        }}
                        isAdmin={isAdmin}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((article) => (
              <div key={article.id} className="rounded border border-seam bg-chamber p-4">
                <Link
                  href={`/article/${article.slug}`}
                  className="mb-1 block font-crimson text-lg text-parchment hover:text-paper"
                  target="_blank"
                >
                  {article.headline}
                </Link>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className="inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper"
                    style={{ backgroundColor: article.sections?.tag_color ?? "#333" }}
                  >
                    {article.sections?.name ?? "—"}
                  </span>
                  <span className={`font-barlow text-[11px] uppercase tracking-wider ${STATUS_STYLES[article.status] ?? "text-stone"}`}>
                    {article.status}
                  </span>
                  {article.sort_order != null && (
                    <span className="font-barlow text-[10px] uppercase tracking-wider text-garnet">#{article.sort_order}</span>
                  )}
                </div>
                <ArticleRowActions
                  article={{
                    id: article.id,
                    headline: article.headline,
                    slug: article.slug,
                    dek: article.dek,
                    body_html: article.body_html,
                    section_id: article.section_id,
                    section_name: article.sections?.name ?? "",
                    status: article.status,
                    featured: article.featured,
                    sort_order: article.sort_order,
                    featured_image_url: article.featured_image_url,
                    featured_image_alt: article.featured_image_alt,
                  }}
                  isAdmin={isAdmin}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
