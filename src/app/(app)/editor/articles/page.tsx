import { createClient } from "@/lib/supabase/server";
import { hasMinRole } from "@/lib/validators/article";
import { redirect } from "next/navigation";
import type { ArticleWithSectionAndAuthor } from "@/lib/types";
import { ArticleFilters } from "./article-filters";

export default async function ManageArticlesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role: string } | null)?.role;
  if (!role || !hasMinRole(role, "editor")) redirect("/");

  const isAdmin = hasMinRole(role, "admin");

  const { data: articles } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(id, display_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(200);

  const all = (articles ?? []) as unknown as ArticleWithSectionAndAuthor[];

  return (
    <main className="min-h-screen bg-void">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <h1 className="mb-6 font-cinzel text-2xl font-bold text-paper sm:mb-8 sm:text-3xl">
          Manage Articles
        </h1>
        {all.length === 0 ? (
          <div className="rounded border border-seam bg-chamber p-8 text-center">
            <p className="font-crimson text-stone">No articles yet.</p>
          </div>
        ) : (
          <ArticleFilters articles={all} isAdmin={isAdmin} />
        )}
      </div>
    </main>
  );
}
