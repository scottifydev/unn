import { createClient } from "@/lib/supabase/server";
import { getActiveTickerItems, getActiveAdvisory, getActiveAd, getTrendingItems } from "./sidebar";
import type {
  ArticleWithSectionAndAuthor,
  TickerItem,
  CouncilAdvisory,
  Ad,
  TrendingItem,
} from "@/lib/types";

export interface HomepageData {
  hero: ArticleWithSectionAndAuthor | null;
  latestArticles: ArticleWithSectionAndAuthor[];
  tickerItems: TickerItem[];
  advisory: CouncilAdvisory | null;
  trending: TrendingItem[];
  ad: Ad | null;
  opinionArticles: ArticleWithSectionAndAuthor[];
}

async function getFeaturedArticleWithAuthor(): Promise<ArticleWithSectionAndAuthor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(*)")
    .eq("status", "published")
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as ArticleWithSectionAndAuthor | null;
}

async function getPublishedArticlesWithAuthor(limit = 12): Promise<ArticleWithSectionAndAuthor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ArticleWithSectionAndAuthor[];
}

async function getOpinionArticlesWithAuthor(limit = 4): Promise<ArticleWithSectionAndAuthor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*, sections!inner(*), profiles(*)")
    .eq("status", "published")
    .eq("sections.slug", "opinion")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ArticleWithSectionAndAuthor[];
}

export async function getHomepageData(): Promise<HomepageData> {
  const [
    hero,
    latestArticles,
    tickerItems,
    advisory,
    trending,
    ad,
    opinionArticles,
  ] = await Promise.all([
    getFeaturedArticleWithAuthor(),
    getPublishedArticlesWithAuthor(12),
    getActiveTickerItems(),
    getActiveAdvisory(),
    getTrendingItems(),
    getActiveAd("sidebar"),
    getOpinionArticlesWithAuthor(4),
  ]);

  return {
    hero,
    latestArticles,
    tickerItems,
    advisory,
    trending,
    ad,
    opinionArticles,
  };
}
