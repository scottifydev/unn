import { createClient } from "@/lib/supabase/server";
import { hasMinRole } from "@/lib/validators/article";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ArticleWithSectionAndAuthor } from "@/lib/types";
import { ArticleRowActions } from "./article-row-actions";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  draft: "text-ash",
  pending: "text-stone",
  published: "text-parchment",
  archived: "text-ash line-through",
};

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
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded border border-seam md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-seam bg-graphite">
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Headline
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Section
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Author
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {all.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-seam bg-chamber last:border-b-0 hover:bg-graphite"
                    >
                      <td className="max-w-xs px-4 py-3">
                        <Link
                          href={`/article/${article.slug}`}
                          className="font-crimson text-parchment hover:text-paper line-clamp-2"
                          target="_blank"
                        >
                          {article.headline}
                        </Link>
                        {article.featured_image_url && (
                          <span className="mt-0.5 block font-barlow text-[10px] uppercase tracking-wider text-ash">
                            has image
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper"
                          style={{ backgroundColor: article.sections?.tag_color ?? "#333" }}
                        >
                          {article.sections?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-barlow text-[11px] uppercase tracking-wider">
                        <span className={STATUS_STYLES[article.status] ?? "text-stone"}>
                          {article.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-crimson text-sm text-stone">
                        {article.profiles?.display_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-barlow text-xs text-stone">
                        {formatDate(article.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ArticleRowActions
                          article={{
                            id: article.id,
                            headline: article.headline,
                            slug: article.slug,
                            dek: article.dek,
                            body_html: article.body_html,
                            section_id: article.section_id,
                            section_name: article.sections?.name ?? "",
                            status: article.status,
                            featured_image_url: article.featured_image_url,
                            featured_image_alt: article.featured_image_alt,
                          }}
                          isAdmin={isAdmin}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {all.map((article) => (
                <div key={article.id} className="rounded border border-seam bg-chamber p-4">
                  <Link
                    href={`/article/${article.slug}`}
                    className="mb-1 block font-crimson text-lg text-parchment hover:text-paper"
                    target="_blank"
                  >
                    {article.headline}
                  </Link>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className="inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper"
                      style={{ backgroundColor: article.sections?.tag_color ?? "#333" }}
                    >
                      {article.sections?.name ?? "—"}
                    </span>
                    <span className={`font-barlow text-[11px] uppercase tracking-wider ${STATUS_STYLES[article.status] ?? "text-stone"}`}>
                      {article.status}
                    </span>
                  </div>
                  <ArticleRowActions
                    article={{
                      id: article.id,
                      headline: article.headline,
                      slug: article.slug,
                      dek: article.dek,
                      body_html: article.body_html,
                      section_id: article.section_id,
                      section_name: article.sections?.name ?? "",
                      status: article.status,
                      featured_image_url: article.featured_image_url,
                      featured_image_alt: article.featured_image_alt,
                    }}
                    isAdmin={isAdmin}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
