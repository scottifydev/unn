import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StandardCard } from "@/components/cards/standard-card";
import type { Database } from "@/lib/supabase/database.types";

const BASE_URL = "https://underworldnewsnetwork.org";

type SectionRow = Database["public"]["Tables"]["sections"]["Row"];
type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type ArticleWithProfile = ArticleRow & {
  profiles: ProfileRow | null;
};

interface SectionPageProps {
  params: Promise<{ slug: string }>;
}

async function getSection(slug: string): Promise<SectionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  return data;
}

async function getSectionArticles(sectionId: string): Promise<ArticleWithProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*, profiles(*)")
    .eq("section_id", sectionId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(30);
  return (data as ArticleWithProfile[] | null) ?? [];
}

export async function generateMetadata({
  params,
}: SectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = await getSection(slug);

  if (!section) return { title: "Section Not Found" };

  const description =
    section.description ??
    `Latest ${section.name} coverage from the Underworld News Network.`;

  return {
    title: section.name,
    description,
    openGraph: {
      type: "website",
      title: section.name,
      description,
      url: `${BASE_URL}/section/${slug}`,
      siteName: "Underworld News Network",
    },
    twitter: {
      card: "summary",
      title: section.name,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/section/${slug}`,
    },
  };
}

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug } = await params;
  const section = await getSection(slug);

  if (!section) notFound();

  const articles = await getSectionArticles(section.id);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1380px] px-3 sm:px-4">
        {/* Section Header */}
        <header className="mt-6 border-b border-seam pb-4 sm:mt-10">
          <h1
            className="font-cinzel font-bold text-paper"
            style={{ fontSize: "clamp(24px, 4vw, 36px)" }}
          >
            {section.name}
          </h1>
          {section.description && (
            <p className="mt-2 font-crimson text-lg italic text-stone">
              {section.description}
            </p>
          )}
        </header>

        {/* Article Grid */}
        {articles.length > 0 ? (
          <section className="mt-6 sm:mt-8">
            <div className="grid grid-cols-1 gap-px bg-seam sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <StandardCard
                  key={article.id}
                  headline={article.headline}
                  dek={article.dek ?? undefined}
                  sectionName={section.name}
                  sectionColor={section.tag_color}
                  author={article.profiles?.display_name ?? "UNN Staff"}
                  date={formatDate(article.published_at)}
                  slug={article.slug}
                  imageUrl={article.featured_image_url ?? undefined}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-10 text-center">
            <p className="font-crimson text-lg text-stone">
              No published articles in this section yet.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
