import { createClient } from "@/lib/supabase/server";
import type {
  ArticleWithSection,
  ArticleWithSectionAndAuthor,
} from "@/lib/types";

export async function getPublishedArticles(
  limit = 20
): Promise<ArticleWithSection[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, sections(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ArticleWithSection[];
}

export async function getFeaturedArticle(): Promise<ArticleWithSection | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, sections(*)")
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as ArticleWithSection | null;
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleWithSectionAndAuthor | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data as ArticleWithSectionAndAuthor | null;
}

export async function getArticlesBySection(
  sectionSlug: string,
  limit = 20
): Promise<ArticleWithSection[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, sections!inner(*)")
    .eq("status", "published")
    .eq("sections.slug", sectionSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ArticleWithSection[];
}
