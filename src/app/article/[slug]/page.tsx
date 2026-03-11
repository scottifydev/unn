import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArticleBody } from "@/components/article/article-body";
import { ArticleJsonLd } from "@/components/seo/json-ld";
import { CouncilAdvisory } from "@/components/sidebar/council-advisory";
import { Trending } from "@/components/sidebar/trending";
import { AdUnit } from "@/components/sidebar/ad-unit";
import type { Database, AdvisoryLevel } from "@/lib/supabase/database.types";

const BASE_URL = "https://underworldnewsnetwork.org";

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

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<ArticleWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*, sections(*), profiles(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return data as ArticleWithRelations | null;
}

async function getSidebarData() {
  const supabase = await createClient();

  const [{ data: trending }, { data: advisory }, { data: ad }] =
    await Promise.all([
      supabase
        .from("trending")
        .select("*")
        .eq("active", true)
        .order("sort_order")
        .limit(5),
      supabase
        .from("council_advisories")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("ads")
        .select("*")
        .eq("active", true)
        .eq("placement", "sidebar")
        .limit(1)
        .single(),
    ]);

  return {
    trending: trending as TrendingRow[] | null,
    advisory: advisory as AdvisoryRow | null,
    ad: ad as AdRow | null,
  };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Article Not Found" };

  const section = article.sections;

  return {
    title: article.headline,
    description: article.dek ?? undefined,
    openGraph: {
      type: "article",
      title: article.headline,
      description: article.dek ?? undefined,
      url: `${BASE_URL}/article/${slug}`,
      siteName: "Underworld News Network",
      ...(section && { section: section.name }),
      ...(article.published_at && {
        publishedTime: article.published_at,
      }),
      ...(article.updated_at && {
        modifiedTime: article.updated_at,
      }),
      ...(article.featured_image_url && {
        images: [{ url: article.featured_image_url }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.headline,
      description: article.dek ?? undefined,
    },
    alternates: {
      canonical: `${BASE_URL}/article/${slug}`,
    },
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const [article, sidebar] = await Promise.all([
    getArticle(slug),
    getSidebarData(),
  ]);

  if (!article) notFound();

  const section = article.sections;
  const author = article.profiles;

  return (
    <main className="min-h-screen">
      <ArticleJsonLd
        headline={article.headline}
        description={article.dek ?? undefined}
        slug={article.slug}
        authorName={author?.display_name ?? "UNN Staff"}
        sectionName={section?.name ?? "News"}
        publishedAt={article.published_at}
        updatedAt={article.updated_at}
        imageUrl={article.featured_image_url ?? undefined}
      />
      <div className="mx-auto max-w-[1380px] px-3 sm:px-4">
        <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-10 sm:gap-10 lg:grid-cols-[minmax(0,680px)_300px] lg:justify-center">
          {/* Article Column */}
          <article>
            {/* Header */}
            <header className="mb-8">
              {section && (
                <Link
                  href={`/section/${section.slug}`}
                  className="mb-3 inline-block font-barlow text-tag font-semibold uppercase tracking-[0.18em] transition-colors hover:brightness-125"
                  style={{ color: section.tag_color }}
                >
                  {section.name}
                </Link>
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
                {author && article.published_at && (
                  <span className="text-seam">&middot;</span>
                )}
                {article.published_at && (
                  <time>{formatDate(article.published_at)}</time>
                )}
              </div>
              <div className="mt-4 border-b border-seam" />
            </header>

            {/* Featured Image */}
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

            {/* Body */}
            {article.body_html ? (
              <ArticleBody dropCap>
                <div dangerouslySetInnerHTML={{ __html: article.body_html }} />
              </ArticleBody>
            ) : (
              <ArticleBody dropCap>
                <p className="text-stone italic">
                  This article&apos;s full text is not yet available. Check back
                  soon for the complete story.
                </p>
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
                items={sidebar.trending.map((t) => ({
                  id: t.id,
                  headline: t.headline,
                }))}
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
  );
}
