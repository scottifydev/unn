import { BreakingTicker } from "@/components/ticker/breaking-ticker";
import { HeroCard } from "@/components/cards/hero-card";
import { StandardCard } from "@/components/cards/standard-card";
import { Trending } from "@/components/sidebar/trending";
import { CouncilAdvisory } from "@/components/sidebar/council-advisory";
import { AdUnit } from "@/components/sidebar/ad-unit";
import { OpinionStrip } from "@/components/opinion/opinion-strip";

const TICKER_ITEMS = [
  { id: "1", text: "VAMPIRE COUNCIL EXTENDS DAYLIGHT SAVINGS EXEMPTION THROUGH 2027" },
  { id: "2", text: "BREAKING: Source of All Evil files Chapter 11 — restructuring expected to take millennia" },
  { id: "3", text: "Were-Local 17 ratifies new moonlight overtime provisions" },
  { id: "4", text: "FCC Ethereal Spectrum Division issues new bandwidth allocations for spectral communications" },
  { id: "5", text: "Grimoire futures up 3.2% on strong Q4 enchantment demand" },
];

const TRENDING_ITEMS = [
  { id: "1", headline: "GLP-1 Drugs Threaten Zombie Food Supply Chain" },
  { id: "2", headline: "Microplastics Found in High-End Vampire Blood Products" },
  { id: "3", headline: "Source of All Evil Files Chapter 11 Bankruptcy" },
  { id: "4", headline: "Were-Local 17 Strikes Over Lunar Accommodation" },
  { id: "5", headline: "5G Towers Disrupting Spectral Communications, FCC Investigates" },
];

const OPINION_ITEMS = [
  { id: "1", author: "Lord Ashworth III", bio: "Vampire Council, Emeritus", headline: "The Blood Supply Crisis Is a Governance Failure", slug: "blood-supply-governance" },
  { id: "2", author: "Dr. Marla Bonesworth", bio: "Undead Health Correspondent", headline: "We Must Rethink Reanimation Standards", slug: "reanimation-standards" },
  { id: "3", author: "Councilor Vex", bio: "Infernal Affairs Desk", headline: "Chapter 11 Was Inevitable — And Overdue", slug: "chapter-11-inevitable" },
  { id: "4", author: "Luna Packrunner", bio: "Were-Local 17, Shop Steward", headline: "Moonlight Overtime Is a Worker Rights Issue", slug: "moonlight-overtime-rights" },
];

const SAMPLE_ARTICLES = [
  { headline: "GLP-1 Weight Loss Drugs Devastate Zombie Food Supply, Industry in Crisis", dek: "The booming weight-loss drug market has triggered an unprecedented shortage in the zombie food supply chain.", sectionName: "Undead Health", sectionColor: "#4a7c59", author: "Dr. Marla Bonesworth", date: "March 5, 2026", slug: "glp1-zombie-food-crisis" },
  { headline: "Microplastics Detected in Premium Vampire Blood Products", dek: "The Vampire Council's Bureau of Hemoglobin Standards confirms contamination in Northeast Corridor blood banks.", sectionName: "Vampire Affairs", sectionColor: "#8b1a1a", author: "Cassandra Duskwell", date: "March 4, 2026", slug: "microplastics-vampire-blood" },
  { headline: "Source of All Evil Files Chapter 11 Bankruptcy", dek: "The metaphysical entity announces restructuring amid declining market share and regulatory pressure.", sectionName: "Demon Politics", sectionColor: "#6b2fa0", author: "Abraxas Inkwell", date: "March 3, 2026", slug: "source-evil-chapter-11" },
  { headline: "Were-Local 17 Ratifies Landmark Moonlight Overtime Provisions", dek: "The historic agreement guarantees lunar accommodation and transformation breaks for all registered lycanthropes.", sectionName: "Werewolf Rights", sectionColor: "#8b6914", author: "Luna Packrunner", date: "March 2, 2026", slug: "were-local-17-overtime" },
  { headline: "5G Tower Expansion Disrupts Spectral Communications Nationwide", dek: "FCC Ethereal Spectrum Division launches investigation as ghost-to-ghost calls drop by 40%.", sectionName: "Spirit World", sectionColor: "#5a5a8b", author: "Ephemera Voss", date: "March 1, 2026", slug: "5g-spectral-disruption" },
  { headline: "Grimoire NFT Market Collapses as Enchantment Verification Fails", dek: "Investors burned after on-chain spell authentication proved unreliable across planar boundaries.", sectionName: "Occult Markets", sectionColor: "#2a6a8b", author: "Hexworth Analytics", date: "Feb 28, 2026", slug: "grimoire-nft-collapse" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <BreakingTicker items={TICKER_ITEMS} />

      <div className="mx-auto max-w-[1380px] px-4">
        {/* Hero + Sidebar Teasers */}
        <section className="mt-6 grid grid-cols-1 gap-px bg-seam lg:grid-cols-[1fr_340px]">
          <HeroCard
            headline={SAMPLE_ARTICLES[0].headline}
            dek={SAMPLE_ARTICLES[0].dek}
            sectionName={SAMPLE_ARTICLES[0].sectionName}
            sectionColor={SAMPLE_ARTICLES[0].sectionColor}
            author={SAMPLE_ARTICLES[0].author}
            date={SAMPLE_ARTICLES[0].date}
            slug={SAMPLE_ARTICLES[0].slug}
          />
          <div className="flex flex-col gap-px bg-seam">
            {SAMPLE_ARTICLES.slice(1, 4).map((article) => (
              <StandardCard key={article.slug} {...article} />
            ))}
          </div>
        </section>

        {/* Latest Section */}
        <section className="mt-10">
          <h2 className="mb-4 border-b border-seam pb-2 font-cinzel text-xl font-bold text-paper">
            Latest
          </h2>
          <div className="grid grid-cols-1 gap-px bg-seam md:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_ARTICLES.map((article) => (
              <StandardCard key={article.slug} {...article} />
            ))}
          </div>
        </section>

        {/* Opinion Strip */}
        <section className="mt-10">
          <h2 className="mb-4 border-b border-seam pb-2 font-cinzel text-xl font-bold text-paper">
            Opinion
          </h2>
          <OpinionStrip items={OPINION_ITEMS} />
        </section>

        {/* Content + Sidebar */}
        <section className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <h2 className="mb-4 border-b border-seam pb-2 font-cinzel text-xl font-bold text-paper">
              Lead Story
            </h2>
            <article className="font-crimson text-body leading-[1.78] text-parchment">
              <h3 className="mb-2 font-cinzel text-2xl font-bold text-paper">
                {SAMPLE_ARTICLES[0].headline}
              </h3>
              <p className="mb-4 font-crimson italic text-stone">
                {SAMPLE_ARTICLES[0].dek}
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
              level={2}
              title="Elevated Advisory: Microplastics Detected in Regional Blood Supply"
              body="The Vampire Council has issued an Elevated Advisory following confirmation of microplastic contamination in commercially distributed blood products across the Northeast Corridor."
              issuedAt="March 5, 2026"
            />
            <Trending items={TRENDING_ITEMS} />
            <AdUnit
              advertiser="Hexblood Organics"
              headline="Your Blood Supply, Perfected."
              body="Premium microplastic-free blood, ethically sourced from verified off-grid donors."
              tagline="Cold-pressed. Small-batch. Certified pre-industrial."
              ctaText="Shop Now"
              ctaUrl="#"
            />
          </aside>
        </section>
      </div>
    </main>
  );
}
