"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ArticleData {
  id: string;
  headline: string;
  slug: string;
  dek: string | null;
  body_html: string | null;
  section_id: string;
  section_name: string;
  status: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
}

interface Props {
  article: ArticleData;
  isAdmin: boolean;
}

type Modal = "edit" | "delete" | "image" | null;

export function ArticleRowActions({ article, isAdmin }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [headline, setHeadline] = useState(article.headline);
  const [dek, setDek] = useState(article.dek ?? "");
  const [bodyHtml, setBodyHtml] = useState(article.body_html ?? "");
  const [status, setStatus] = useState(article.status);

  // Image regen state
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(article.featured_image_url);
  const [imageAlt, setImageAlt] = useState<string | null>(article.featured_image_alt);
  const [imageError, setImageError] = useState<string | null>(null);

  function close() {
    setModal(null);
    setError(null);
    setImageError(null);
  }

  async function handleSaveEdit() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        headline: headline.trim(),
        dek: dek.trim() || undefined,
        body_html: bodyHtml.trim() || undefined,
        status,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "Save failed");
      return;
    }
    close();
    router.refresh();
  }

  async function handleDelete() {
    setSaving(true);
    const res = await fetch(`/api/articles/${article.id}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Delete failed");
      return;
    }
    close();
    router.refresh();
  }

  async function handleGenerateImage() {
    setGeneratingImage(true);
    setImageError(null);
    try {
      const supabase = createClient();
      const { data, error: fnError } = await supabase.functions.invoke("generate-image", {
        body: {
          headline: article.headline,
          section_name: article.section_name,
          custom_prompt: imagePrompt.trim() || undefined,
        },
      });
      if (fnError) { setImageError(fnError.message || "Generation failed"); return; }
      if (data?.error) { setImageError(data.error); return; }
      if (data?.image_url) {
        setImagePreview(data.image_url);
        setImageAlt(data.brief ?? null);
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGeneratingImage(false);
    }
  }

  async function handleSaveImage() {
    if (!imagePreview) return;
    setSaving(true);
    setImageError(null);
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        featured_image_url: imagePreview,
        featured_image_alt: imageAlt ?? undefined,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setImageError(json.error ?? "Save failed"); return; }
    close();
    router.refresh();
  }

  async function handleRemoveImage() {
    setSaving(true);
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured_image_url: null, featured_image_alt: null }),
    });
    setSaving(false);
    if (res.ok) { setImagePreview(null); setImageAlt(null); close(); router.refresh(); }
  }

  const btnBase = "font-barlow text-[10px] font-medium uppercase tracking-wider transition-colors";

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setModal("image")}
          className={`${btnBase} text-stone hover:text-parchment`}
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => setModal("edit")}
          className={`${btnBase} text-stone hover:text-parchment`}
        >
          Edit
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setModal("delete")}
            className={`${btnBase} text-garnet hover:text-garnet-bright`}
          >
            Delete
          </button>
        )}
      </div>

      {/* Backdrop */}
      {modal && (
        <div
          className="fixed inset-0 z-[200] bg-void/80 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Edit Modal */}
      {modal === "edit" && (
        <div className="fixed left-1/2 top-1/2 z-[201] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded border border-seam bg-chamber p-6 shadow-xl">
          <h2 className="mb-4 font-cinzel text-lg font-bold text-paper">Edit Article</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
              />
            </div>
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Dek</label>
              <textarea
                value={dek}
                onChange={(e) => setDek(e.target.value)}
                rows={2}
                className="w-full resize-none rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
              />
            </div>
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Body HTML</label>
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={10}
                className="w-full resize-y rounded border border-seam bg-graphite px-3 py-2 font-crimson text-sm text-parchment leading-relaxed outline-none focus:border-garnet"
              />
            </div>
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {error && <p className="font-crimson text-sm text-garnet-bright">{error}</p>}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={close} className={`${btnBase} text-stone hover:text-parchment`}>Cancel</button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={saving}
                className="rounded bg-garnet px-4 py-2 font-barlow text-sm font-semibold uppercase tracking-wider text-paper hover:bg-garnet-bright disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {modal === "image" && (
        <div className="fixed left-1/2 top-1/2 z-[201] w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded border border-seam bg-chamber p-6 shadow-xl">
          <h2 className="mb-4 font-cinzel text-lg font-bold text-paper">Cover Image</h2>
          <div className="space-y-4">
            {/* Current / preview image */}
            {imagePreview ? (
              <div className="relative overflow-hidden rounded border border-seam">
                <img
                  src={imagePreview}
                  alt={imageAlt ?? article.headline}
                  className="w-full object-cover"
                  style={{ maxHeight: "240px" }}
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setImageAlt(null); }}
                  className="absolute right-2 top-2 rounded bg-void/80 px-2 py-1 font-barlow text-[10px] font-medium uppercase tracking-wider text-stone hover:text-parchment"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center rounded border border-dashed border-seam bg-graphite">
                <p className="font-barlow text-[11px] uppercase tracking-wider text-ash">No image</p>
              </div>
            )}

            {/* Custom prompt */}
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                Custom Prompt <span className="normal-case tracking-normal text-ash">(optional — leave blank to auto-generate)</span>
              </label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={3}
                placeholder={`e.g. "a vampire in a grey suit reviewing quarterly reports at a mahogany desk"`}
                className="w-full resize-none rounded border border-seam bg-graphite px-3 py-2 font-crimson text-sm text-parchment placeholder:text-ash outline-none focus:border-garnet"
              />
            </div>

            {imageError && <p className="font-crimson text-sm text-garnet-bright">{imageError}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                  className="flex items-center gap-1.5 rounded border border-seam px-3 py-1.5 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone hover:border-parchment hover:text-parchment disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {generatingImage ? (
                    <>
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border border-stone/30 border-t-stone" />
                      Generating...
                    </>
                  ) : imagePreview ? "Regenerate" : "Generate"}
                </button>
                {article.featured_image_url && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={saving}
                    className="rounded border border-seam px-3 py-1.5 font-barlow text-[11px] font-medium uppercase tracking-wider text-garnet hover:border-garnet hover:text-garnet-bright disabled:opacity-40"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={close} className={`${btnBase} text-stone hover:text-parchment`}>Cancel</button>
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={saving || !imagePreview}
                  className="rounded bg-garnet px-4 py-2 font-barlow text-sm font-semibold uppercase tracking-wider text-paper hover:bg-garnet-bright disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Image"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <div className="fixed left-1/2 top-1/2 z-[201] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded border border-seam bg-chamber p-6 shadow-xl">
          <h2 className="mb-2 font-cinzel text-lg font-bold text-paper">Delete Article</h2>
          <p className="mb-6 font-crimson text-parchment">
            Permanently delete &ldquo;{article.headline}&rdquo;? This cannot be undone.
          </p>
          {error && <p className="mb-4 font-crimson text-sm text-garnet-bright">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={close} className={`${btnBase} text-stone hover:text-parchment`}>Cancel</button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded bg-garnet px-4 py-2 font-barlow text-sm font-semibold uppercase tracking-wider text-paper hover:bg-garnet-bright disabled:opacity-50"
            >
              {saving ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
