import type { Database } from "@/lib/supabase/database.types";

export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type TickerItem = Database["public"]["Tables"]["ticker_items"]["Row"];
export type CouncilAdvisory = Database["public"]["Tables"]["council_advisories"]["Row"];
export type Ad = Database["public"]["Tables"]["ads"]["Row"];
export type TrendingItem = Database["public"]["Tables"]["trending"]["Row"];

export type ArticleWithSection = Article & {
  sections: Section | null;
};

export type ArticleWithSectionAndAuthor = Article & {
  sections: Section | null;
  profiles: Profile | null;
};
