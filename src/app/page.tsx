import { BreakingTicker } from "@/components/ticker/breaking-ticker";
import { HeroCard } from "@/components/cards/hero-card";
import { StandardCard } from "@/components/cards/standard-card";
import { Trending } from "@/components/sidebar/trending";
import { CouncilAdvisory } from "@/components/sidebar/council-advisory";
import { AdUnit } from "@/components/sidebar/ad-unit";
import { OpinionStrip } from "@/components/opinion/opinion-strip";
import { getHomepageData } from "@/lib/queries/homepage";
import type { ArticleWithSectionAndAuthor } from "@/lib/types";

interface MappedArticle {
  headline: string;
  dek?: string;
  sectionName: string;
  sectionColor?: string;
  author: string;
  date: string;
  slug: string;
  imageUrl?: string;
}

interface AdvisoryProps {
  level: 1 | 2 | 3;
  title: string;
  body: string;
  issuedAt: string;
}

interface AdProps {
  advertiser: string;
  headline: string;
  body: string;
  tagline?: string;
  ctaText: string;
  ctaUrl: string;
}

const FALLBACK_TICKER_ITEMS = [
  { id: "1", text: "VAMPIRE COUNCIL EXTENDS DAYLIGHT SAVINGS EXEMPTION THROUGH 2027" },
  { id: "2", text: "BREAKING: Source of All Evil files Chapter 11 — restructuring expected to take millennia" },
  { id: "3", text: "Were-Local 17 ratifies new moonlight overtime provisions" },
  { id: "4", text: "FCC Ethereal Spectrum Division issues new bandwidth allocations for spectral communications" },
  { id: "5", text: "Grimoire futures up 3.2% on strong Q4 enchantment demand" },
];

const FALLBACK_TRENDING_ITEMS = [
  { id: "1", headline: "GLP-1 Drugs Threaten Zombie Food Supply Chain" },
  { id: "2", headline: "Microplastics Found in High-End Vampire Blood Products" },
  { id: "3", headline: "Source of All Evil Files Chapter 11 Bankruptcy" },
  { id: "4", headline: "Were-Local 17 Strikes Over Lunar Accommodation" },
  { id: "5", headline: "5G Towers Disrupting Spectral Communications, FCC Investigates" },
];

const FALLBACK_OPINION_ITEMS = [
  { id: "1", author: "Lord Ashworth III", bio: "Vampire Council, Emeritus", headline: "The Blood Supply Crisis Is a Governance Failure", slug: "blood-supply-governance" },
  { id: "2", author: "Dr. Marla Bonesworth", bio: "Undead Health Correspondent", headline: "We Must Rethink Reanimation Standards", slug: "reanimation-standards" },
  { id: "3", author: "Councilor Vex", bio: "Infernal Affairs Desk", headline: "Chapter 11 Was Inevitable — And Overdue", slug: "chapter-11-inevitable" },
  { id: "4", author: "Luna Packrunner", bio: "Were-Local 17, Shop Steward", headline: "Moonlight Overtime Is a Worker Rights Issue", slug: "moonlight-overtime-rights" },
];

const FALLBACK_ARTICLES = [
  { headline: "GLP-1 Weight Loss Drugs Devastate Zombie Food Supply, Industry in Crisis", dek: "The booming weight-loss drug market has triggered an unprecedented shortage in the zombie food supply chain.", sectionName: "Undead Health", sectionColor: "#4a7c59", author: "Dr. Marla Bonesworth", date: "March 5, 2026", slug: "glp1-zombie-food-crisis" },
  { headline: "Microplastics Detected in Premium Vampire Blood Products", dek: "The Vampire Council's Bureau of Hemoglobin Standards confirms contamination in Northeast Corridor blood banks.", sectionName: "Vampire Affairs", sectionColor: "#8b1a1a", author: "Cassandra Duskwell", date: "March 4, 2026", slug: "microplastics-vampire-blood" },
  { headline: "Source of All Evil Files Chapter 11 Bankruptcy", dek: "The metaphysical entity announces restructuring amid declining market share and regulatory pressure.", sectionName: "Demon Politics", sectionColor: "#6b2fa0", author: "Abraxas Inkwell", date: "March 3, 2026", slug: "source-evil-chapter-11" },
  { headline: "Were-Local 17 Ratifies Landmark Moonlight Overtime Provisions", dek: "The historic agreement guarantees lunar accommodation and transformation breaks for all registered lycanthropes.", sectionName: "Werewolf Rights", sectionColor: "#8b6914", author: "Luna Packrunner", date: "March 2, 2026", slug: "were-local-17-overtime" },
  { headline: "5G Tower Expansion Disrupts Spectral Communications Nationwide", dek: "FCC Ethereal Spectrum Division launches investigation as ghost-to-ghost calls drop by 40%.", sectionName: "Spirit World", sectionColor: "#5a5a8b", author: "Ephemera Voss", date: "March 1, 2026", slug: "5g-spectral-disruption" },
  { headline: "Grimoire NFT Market Collapses as Enchantment Verification Fails", dek: "Investors burned after on-chain spell authentication proved unreliable across planar boundaries.", sectionName: "Occult Markets", sectionColor: "#2a6a8b", author: "Hexworth Analytics", date: "Feb 28, 2026", slug: "grimoire-nft-collapse" },
];

const FALLBACK_ADVISORY = {
  level: 2 as const,
  title: "Elevated Advisory: Microplastics Detected in Regional Blood Supply",
  body: "The Vampire Council has issued an Elevated Advisory following confirmation of microplastic contamination in commercially distributed blood products across the Northeast Corridor.",
  issuedAt: "March 5, 2026",
};

const FALLBACK_AD = {
  advertiser: "Hexblood Organics",
  headline: "Your Blood Supply, Perfected.",
  body: "Premium microplastic-free blood, ethically sourced from verified off-grid donors.",
  tagline: "Cold-pressed. Small-batch. Certified pre-industrial.",
  ctaText: "Shop Now",
  ctaUrl: "#",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function mapArticle(article: ArticleWithSectionAndAuthor) {
  return {
    headline: article.headline,
    dek: article.dek ?? undefined,
    sectionName: article.sections?.name ?? "News",
    sectionColor: article.sections?.tag_color,
    author: article.profiles?.display_name ?? "Staff",
    date: formatDate(article.published_at),
    slug: article.slug,
    imageUrl: article.featured_image_url ?? undefined,
  };
}

export default async function Home() {
  let tickerItems = FALLBACK_TICKER_ITEMS;
  let trendingItems = FALLBACK_TRENDING_ITEMS;
  let opinionItems = FALLBACK_OPINION_ITEMS;
  let articles: MappedArticle[] = FALLBACK_ARTICLES;
  let advisoryProps: AdvisoryProps = FALLBACK_ADVISORY;
  let adProps: AdProps | null = FALLBACK_AD;
  let heroArticle: MappedArticle = FALLBACK_ARTICLES[0];
  let sidebarArticles: MappedArticle[] = FALLBACK_ARTICLES.slice(1, 4);
  let leadArticle: MappedArticle = FALLBACK_ARTICLES[0];

  try {
    const data = await getHomepageData();

    if (data.tickerItems.length > 0) {
      tickerItems = data.tickerItems.map((t) => ({ id: t.id, text: t.text }));
    }

    if (data.trending.length > 0) {
      trendingItems = data.trending.map((t) => ({ id: t.id, headline: t.headline }));
    }

    if (data.opinionArticles.length > 0) {
      opinionItems = data.opinionArticles.map((a) => ({
        id: a.id,
        author: a.profiles?.display_name ?? "Staff",
        bio: a.profiles?.bio ?? "",
        headline: a.headline,
        slug: a.slug,
      }));
    }

    if (data.latestArticles.length > 0) {
      articles = data.latestArticles.map(mapArticle);
    }

    const heroSource = data.hero ?? data.latestArticles[0];
    if (heroSource) {
      heroArticle = mapArticle(heroSource);
    }

    if (data.latestArticles.length > 1) {
      sidebarArticles = data.latestArticles
        .filter((a) => a.id !== (data.hero?.id ?? data.latestArticles[0]?.id))
        .slice(0, 3)
        .map(mapArticle);
    }

    if (heroSource) {
      leadArticle = mapArticle(heroSource);
    }

    if (data.advisory) {
      advisoryProps = {
        level: (data.advisory.level as 1 | 2 | 3),
        title: data.advisory.title,
        body: data.advisory.body,
        issuedAt: formatDate(data.advisory.issued_at),
      };
    }

    if (data.ad) {
      adProps = {
        advertiser: data.ad.advertiser,
        headline: data.ad.headline,
        body: data.ad.body,
        tagline: data.ad.tagline ?? undefined,
        ctaText: data.ad.cta_text,
        ctaUrl: data.ad.cta_url,
      };
    }
  } catch (error) {
    console.error("Failed to fetch homepage data from Supabase, using fallbacks:", error);
  }

  return (
    <main className="min-h-screen">
      <BreakingTicker items={tickerItems} />

      <div className="mx-auto max-w-[1380px] px-3 sm:px-4">
        {/* Hero + Sidebar Teasers */}
        <section className="mt-4 grid grid-cols-1 gap-px bg-seam sm:mt-6 lg:grid-cols-[1fr_340px]">
          <HeroCard
            headline={heroArticle.headline}
            dek={heroArticle.dek}
            sectionName={heroArticle.sectionName}
            sectionColor={heroArticle.sectionColor}
            author={heroArticle.author}
            date={heroArticle.date}
            slug={heroArticle.slug}
            imageUrl={"imageUrl" in heroArticle ? (heroArticle.imageUrl as string | undefined) : undefined}
          />
          <div className="flex flex-col gap-px bg-seam">
            {sidebarArticles.map((article) => (
              <StandardCard key={article.slug} {...article} />
            ))}
          </div>
        </section>

        {/* Latest Section */}
        <section className="mt-6 sm:mt-10">
          <h2 className="mb-3 border-b border-seam pb-2 font-cinzel text-lg font-bold text-paper sm:mb-4 sm:text-xl">
            Latest
          </h2>
          <div className="grid grid-cols-1 gap-px bg-seam sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <StandardCard key={article.slug} {...article} />
            ))}
          </div>
        </section>

        {/* Opinion Strip */}
        <section className="mt-6 sm:mt-10">
          <h2 className="mb-3 border-b border-seam pb-2 font-cinzel text-lg font-bold text-paper sm:mb-4 sm:text-xl">
            Opinion
          </h2>
          <OpinionStrip items={opinionItems} />
        </section>

        {/* Content + Sidebar */}
        <section className="mt-6 grid grid-cols-1 gap-6 sm:mt-10 sm:gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <h2 className="mb-3 border-b border-seam pb-2 font-cinzel text-lg font-bold text-paper sm:mb-4 sm:text-xl">
              Lead Story
            </h2>
            <article className="font-crimson text-body leading-[1.78] text-parchment">
              <h3 className="mb-2 font-cinzel text-2xl font-bold text-paper">
                {leadArticle.headline}
              </h3>
              <p className="mb-4 font-crimson italic text-stone">
                {leadArticle.dek}
              </p>
              <p>
                The emerging crisis in the zombie food supply chain represents one of the most significant disruptions
                to undead nutrition since the Great Preservative Shortage of 1847. Industry analysts at Necronomic
                Advisory Group estimate that continued GLP-1 adoption among the living population could reduce available
                biomass by up to 34% within the next fiscal quarter, forcing a fundamental rethinking of zombie
                dietary infrastructure.
              </p>
            </article>
          </div>

          <aside className="space-y-6">
            <CouncilAdvisory
              level={advisoryProps.level}
              title={advisoryProps.title}
              body={advisoryProps.body}
              issuedAt={advisoryProps.issuedAt}
            />
            <Trending items={trendingItems} />
            {adProps && (
              <AdUnit
                advertiser={adProps.advertiser}
                headline={adProps.headline}
                body={adProps.body}
                tagline={adProps.tagline}
                ctaText={adProps.ctaText}
                ctaUrl={adProps.ctaUrl}
              />
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
