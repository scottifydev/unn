import { getFeaturedArticle, getPublishedArticles, getArticlesBySection } from "./articles";
import { getActiveTickerItems, getActiveAdvisory, getActiveAd, getTrendingItems } from "./sidebar";
import type {
  ArticleWithSection,
  TickerItem,
  CouncilAdvisory,
  Ad,
  TrendingItem,
} from "@/lib/types";

export interface HomepageData {
  hero: ArticleWithSection | null;
  latestArticles: ArticleWithSection[];
  tickerItems: TickerItem[];
  advisory: CouncilAdvisory | null;
  trending: TrendingItem[];
  ad: Ad | null;
  opinionArticles: ArticleWithSection[];
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
    getFeaturedArticle(),
    getPublishedArticles(12),
    getActiveTickerItems(),
    getActiveAdvisory(),
    getTrendingItems(),
    getActiveAd("sidebar"),
    getArticlesBySection("opinion", 4),
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
