import { createClient } from "@/lib/supabase/server";
import type { TickerItem, CouncilAdvisory, Ad, TrendingItem } from "@/lib/types";

export async function getActiveTickerItems(): Promise<TickerItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ticker_items")
    .select("*")
    .eq("active", true)
    .order("priority", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getActiveAdvisory(): Promise<CouncilAdvisory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("council_advisories")
    .select("*")
    .eq("active", true)
    .order("issued_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getActiveAd(
  placement?: string
): Promise<Ad | null> {
  const supabase = await createClient();

  let query = supabase
    .from("ads")
    .select("*")
    .eq("active", true);

  if (placement) {
    query = query.eq("placement", placement);
  }

  const { data, error } = await query.limit(1).maybeSingle();

  if (error) throw error;
  return data;
}

export async function getTrendingItems(): Promise<TrendingItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trending")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}
