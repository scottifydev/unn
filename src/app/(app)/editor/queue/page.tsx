import { createClient } from "@/lib/supabase/server";
import { hasMinRole } from "@/lib/validators/article";
import { redirect } from "next/navigation";
import type { ArticleWithSectionAndAuthor } from "@/lib/types";
import { QueueActions } from "./queue-actions";

export default async function EditorialQueuePage() {
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
  if (!role || !hasMinRole(role, "editor")) {
    redirect("/");
  }

  const { data: articles } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(id, display_name, avatar_url)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const pending = (articles ?? []) as unknown as ArticleWithSectionAndAuthor[];

  return (
    <main className="min-h-screen bg-void">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <h1 className="mb-6 font-cinzel text-2xl font-bold text-paper sm:mb-8 sm:text-3xl">
          Editorial Queue
        </h1>

        {pending.length === 0 ? (
          <div className="rounded border border-seam bg-chamber p-8 text-center">
            <h2 className="font-cinzel text-lg text-paper">No Pending Articles</h2>
            <p className="mt-2 font-crimson text-stone">
              All submissions have been reviewed.
            </p>
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
                      Author
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Section
                    </th>
                    <th className="px-4 py-3 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-right font-barlow text-[11px] font-medium uppercase tracking-[0.14em] text-stone">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-seam bg-chamber last:border-b-0 hover:bg-graphite"
                    >
                      <td className="px-4 py-3 font-crimson text-parchment">
                        {article.headline}
                      </td>
                      <td className="px-4 py-3 font-crimson text-stone">
                        {article.profiles?.display_name ?? "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper"
                          style={{
                            backgroundColor: article.sections?.tag_color ?? "#333",
                          }}
                        >
                          {article.sections?.name ?? "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-barlow text-xs text-stone">
                        {new Date(article.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <QueueActions articleId={article.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="space-y-3 md:hidden">
              {pending.map((article) => (
                <div
                  key={article.id}
                  className="rounded border border-seam bg-chamber p-4"
                >
                  <h3 className="mb-1 font-crimson text-lg text-parchment">
                    {article.headline}
                  </h3>
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-crimson text-stone">
                      {article.profiles?.display_name ?? "Unknown"}
                    </span>
                    <span className="text-seam">|</span>
                    <span
                      className="inline-block rounded px-2 py-0.5 font-barlow text-[10px] font-medium uppercase tracking-wider text-paper"
                      style={{
                        backgroundColor: article.sections?.tag_color ?? "#333",
                      }}
                    >
                      {article.sections?.name ?? "Uncategorized"}
                    </span>
                    <span className="text-seam">|</span>
                    <span className="font-barlow text-xs text-stone">
                      {new Date(article.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <QueueActions articleId={article.id} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
