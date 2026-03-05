import { createClient } from "@/lib/supabase/server";
import type { Section } from "@/lib/types";

export async function getSections(): Promise<Section[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getSectionBySlug(
  slug: string
): Promise<Section | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
