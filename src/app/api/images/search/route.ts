import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Pexels API not configured" }, { status: 500 });
  }

  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=12&orientation=landscape`;

  const res = await fetch(url, {
    headers: { Authorization: apiKey },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Pexels search failed" }, { status: 502 });
  }

  const data = await res.json();

  const results = (data.photos ?? []).map((p: {
    id: number;
    src: { medium: string; large2x: string };
    photographer: string;
    alt: string;
  }) => ({
    id: p.id,
    thumbnail: p.src.medium,
    fullUrl: p.src.large2x,
    photographer: p.photographer,
    alt: p.alt,
  }));

  return NextResponse.json({ results });
}
