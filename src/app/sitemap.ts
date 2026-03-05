import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://underworldnewsnetwork.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: articles }, { data: sections }] = await Promise.all([
    supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("sections")
      .select("slug")
      .eq("active", true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  const sectionPages: MetadataRoute.Sitemap = (sections ?? []).map((s) => ({
    url: `${BASE_URL}/section/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${BASE_URL}/article/${a.slug}`,
    lastModified: new Date(a.updated_at ?? a.published_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...sectionPages, ...articlePages];
}
