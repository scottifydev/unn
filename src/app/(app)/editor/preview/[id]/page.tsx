import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasMinRole } from "@/lib/validators/article";
import { ArticleBody } from "@/components/article/article-body";
import { CouncilAdvisory } from "@/components/sidebar/council-advisory";
import { Trending } from "@/components/sidebar/trending";
import { AdUnit } from "@/components/sidebar/ad-unit";
import type { Database, AdvisoryLevel } from "@/lib/supabase/database.types";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type SectionRow = Database["public"]["Tables"]["sections"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TrendingRow = Database["public"]["Tables"]["trending"]["Row"];
type AdvisoryRow = Database["public"]["Tables"]["council_advisories"]["Row"];
type AdRow = Database["public"]["Tables"]["ads"]["Row"];

type ArticleWithRelations = ArticleRow & {
  sections: SectionRow | null;
  profiles: ProfileRow | null;
};

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

async function getArticleById(id: string): Promise<ArticleWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(*)")
    .eq("id", id)
    .single();
  return data as ArticleWithRelations | null;
}

async function getSidebarData() {
  const supabase = await createClient();
  const [{ data: trending }, { data: advisory }, { data: ad }] = await Promise.all([
    supabase.from("trending").select("*").eq("active", true).order("sort_order").limit(5),
    supabase.from("council_advisories").select("*").eq("active", true).order("created_at", { ascending: false }).limit(1).single(),
    supabase.from("ads").select("*").eq("active", true).eq("placement", "sidebar").limit(1).single(),
  ]);
  return {
    trending: trending as TrendingRow[] | null,
    advisory: advisory as AdvisoryRow | null,
    ad: ad as AdRow | null,
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role: string } | null)?.role;
  if (!role || !hasMinRole(role, "editor")) redirect("/");

  const [article, sidebar] = await Promise.all([
    getArticleById(id),
    getSidebarData(),
  ]);

  if (!article) redirect("/editor/articles");

  const section = article.sections;
  const author = article.profiles;

  return (
    <>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-seam bg-graphite px-4 py-2">
        <span className="font-barlow text-[11px] uppercase tracking-[0.14em] text-ash">
          Preview — {article.status}
        </span>
        <Link
          href="/editor/articles"
          className="font-barlow text-[10px] uppercase tracking-wider text-stone hover:text-parchment"
        >
          ← Back to Articles
        </Link>
      </div>

      <main className="min-h-screen">
        <div className="mx-auto max-w-[1380px] px-3 sm:px-4">
          <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-10 sm:gap-10 lg:grid-cols-[minmax(0,680px)_300px] lg:justify-center">
            {/* Article column */}
            <article>
              <header className="mb-8">
                {section && (
                  <span
                    className="mb-3 inline-block font-barlow text-tag font-semibold uppercase tracking-[0.18em]"
                    style={{ color: section.tag_color }}
                  >
                    {section.name}
                  </span>
                )}
                <h1
                  className="font-cinzel font-bold text-paper"
                  style={{ fontSize: "clamp(24px, 4vw, 38px)" }}
                >
                  {article.headline}
                </h1>
                {article.dek && (
                  <p className="mt-3 font-crimson text-xl italic text-stone">
                    {article.dek}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2 font-barlow text-[11px] uppercase tracking-wide text-ash">
                  {author && <span>{author.display_name}</span>}
                  {author && article.published_at && <span className="text-seam">&middot;</span>}
                  {article.published_at && <time>{formatDate(article.published_at)}</time>}
                </div>
                <div className="mt-4 border-b border-seam" />
              </header>

              {article.featured_image_url && (
                <div className="mb-8 overflow-hidden rounded border border-seam">
                  <img
                    src={article.featured_image_url}
                    alt={article.featured_image_alt ?? article.headline}
                    className="w-full object-cover"
                    style={{ maxHeight: "480px" }}
                  />
                </div>
              )}

              {article.body_html ? (
                <ArticleBody dropCap>
                  <div dangerouslySetInnerHTML={{ __html: article.body_html }} />
                </ArticleBody>
              ) : (
                <ArticleBody dropCap>
                  <p className="text-stone italic">No body content yet.</p>
                </ArticleBody>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {sidebar.advisory && (
                <CouncilAdvisory
                  level={sidebar.advisory.level as AdvisoryLevel}
                  title={sidebar.advisory.title}
                  body={sidebar.advisory.body}
                  issuedAt={formatDate(sidebar.advisory.issued_at)}
                />
              )}
              {sidebar.trending && sidebar.trending.length > 0 && (
                <Trending
                  items={sidebar.trending.map((t) => ({ id: t.id, headline: t.headline }))}
                />
              )}
              {sidebar.ad && (
                <AdUnit
                  advertiser={sidebar.ad.advertiser}
                  headline={sidebar.ad.headline}
                  body={sidebar.ad.body}
                  tagline={sidebar.ad.tagline ?? undefined}
                  ctaText={sidebar.ad.cta_text}
                  ctaUrl={sidebar.ad.cta_url}
                />
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
