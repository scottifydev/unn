import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ArticleWithSectionAndAuthor } from "@/lib/types";
import type { ArticleStatus } from "@/lib/supabase/database.types";
import { DeleteButton } from "./delete-button";

const STATUS_STYLES: Record<ArticleStatus, string> = {
  draft: "bg-stone/20 text-stone",
  pending: "bg-parchment/20 text-parchment",
  published: "bg-garnet-bright/20 text-garnet-bright",
  archived: "bg-ash/20 text-ash",
};

export default async function MyArticlesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: articles } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(id, display_name, avatar_url)")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const all = (articles ?? []) as unknown as ArticleWithSectionAndAuthor[];

  const grouped: Record<ArticleStatus, ArticleWithSectionAndAuthor[]> = {
    draft: [],
    pending: [],
    published: [],
    archived: [],
  };

  for (const article of all) {
    grouped[article.status].push(article);
  }

  const statusOrder: ArticleStatus[] = ["draft", "pending", "published", "archived"];

  return (
    <main className="min-h-screen bg-void">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-cinzel text-2xl font-bold text-paper sm:text-3xl">
            My Articles
          </h1>
          <Link
            href="/submit"
            className="inline-block rounded bg-garnet px-5 py-2 text-center font-barlow text-sm font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright"
          >
            New Article
          </Link>
        </div>

        {all.length === 0 ? (
          <div className="rounded border border-seam bg-chamber p-8 text-center">
            <h2 className="font-cinzel text-lg text-paper">No Articles Yet</h2>
            <p className="mt-2 font-crimson text-stone">
              Start writing by submitting your first article.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {statusOrder.map((status) => {
              const items = grouped[status];
              if (items.length === 0) return null;

              return (
                <section key={status}>
                  <h2 className="mb-3 flex items-center gap-3 border-b border-seam pb-2">
                    <span className="font-cinzel text-lg font-bold capitalize text-paper">
                      {status}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider ${STATUS_STYLES[status]}`}
                    >
                      {items.length}
                    </span>
                  </h2>

                  <div className="space-y-2">
                    {items.map((article) => (
                      <div
                        key={article.id}
                        className="flex flex-col gap-3 rounded border border-seam bg-chamber p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-crimson text-lg text-parchment">
                            {article.headline}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                            {article.sections && (
                              <span
                                className="inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper"
                                style={{
                                  backgroundColor: article.sections.tag_color,
                                }}
                              >
                                {article.sections.name}
                              </span>
                            )}
                            <span className="font-barlow text-xs text-stone">
                              {new Date(article.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {article.status === "published" && (
                            <Link
                              href={`/article/${article.slug}`}
                              className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-parchment hover:text-parchment"
                            >
                              View
                            </Link>
                          )}
                          {article.status === "draft" && (
                            <>
                              <Link
                                href={`/submit?edit=${article.id}`}
                                className="rounded border border-seam px-3 py-1 font-barlow text-[11px] font-medium uppercase tracking-wider text-stone transition-colors hover:border-parchment hover:text-parchment"
                              >
                                Edit
                              </Link>
                              <DeleteButton articleId={article.id} />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
