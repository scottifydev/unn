"use client";

import { useEffect, useRef, useState } from "react";

interface SearchResult {
  id: number;
  thumbnail: string;
  fullUrl: string;
  photographer: string;
  alt: string;
}

interface ImageSearchProps {
  onSelect: (url: string, alt: string) => void;
}

const DEFAULT_QUERIES = ["dark corporate", "noir photography", "moody architecture", "desaturated portrait"];

export function ImageSearch({ onSelect }: ImageSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function search(q: string) {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Search failed"); return; }
      setResults(data.results ?? []);
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  async function handleUse() {
    if (!selected) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch("/api/images/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: selected.fullUrl, alt: selected.alt }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Download failed"); return; }
      onSelect(data.image_url, data.alt);
    } catch {
      setError("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search photos…"
        className="w-full rounded border border-seam bg-graphite px-3 py-2 font-crimson text-parchment placeholder:text-ash outline-none focus:border-garnet"
      />

      {/* Quick searches */}
      {!query && (
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuery(q)}
              className="rounded border border-seam px-2 py-0.5 font-barlow text-[10px] uppercase tracking-wider text-ash hover:border-stone hover:text-stone"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {error && <p className="font-crimson text-sm text-garnet-bright">{error}</p>}

      {loading && (
        <div className="flex h-24 items-center justify-center">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border border-stone/30 border-t-stone" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r)}
                className={`group relative aspect-video overflow-hidden rounded border-2 transition-colors ${
                  selected?.id === r.id ? "border-garnet" : "border-transparent hover:border-seam"
                }`}
              >
                <img
                  src={r.thumbnail}
                  alt={r.alt}
                  className="h-full w-full object-cover"
                  style={{ filter: "grayscale(30%) brightness(0.85) contrast(1.1)" }}
                />
                {selected?.id === r.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-void/40">
                    <span className="text-lg text-paper">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>

          {selected && (
            <div className="flex items-center justify-between gap-3">
              <p className="font-barlow text-[10px] uppercase tracking-wider text-ash">
                Photo by {selected.photographer}
              </p>
              <button
                type="button"
                onClick={handleUse}
                disabled={downloading}
                className="rounded bg-garnet px-4 py-1.5 font-barlow text-[11px] font-semibold uppercase tracking-wider text-paper hover:bg-garnet-bright disabled:opacity-50"
              >
                {downloading ? "Saving..." : "Use this image"}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && results.length === 0 && query.trim() && (
        <div className="flex h-16 items-center justify-center">
          <p className="font-barlow text-[11px] uppercase tracking-wider text-ash">No results</p>
        </div>
      )}
    </div>
  );
}
