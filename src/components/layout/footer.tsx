import Link from "next/link";

const SECTIONS = [
  { label: "Underworld Affairs", slug: "underworld-affairs" },
  { label: "Ether & Veil", slug: "ether-and-veil" },
  { label: "Occult Markets", slug: "occult-markets" },
  { label: "Creature Profile", slug: "creature-profile" },
  { label: "Ask Astra", slug: "ask-astra" },
  { label: "Weather & Omens", slug: "weather-and-omens" },
  { label: "Opinion", slug: "opinion" },
  { label: "Human Affairs Desk", slug: "human-affairs" },
  { label: "Labor Desk", slug: "labor" },
  { label: "Health Desk", slug: "health" },
  { label: "Cultural & Entertainment Desk", slug: "culture" },
  { label: "The Crypt Desk", slug: "the-crypt" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t-2 border-garnet bg-chamber">
      <div className="mx-auto max-w-[1380px] px-4 py-8">
        <div className="flex flex-col items-center gap-5">
          <span className="font-cinzel text-sm font-semibold tracking-[0.1em] text-stone">
            UNN
          </span>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {SECTIONS.map(({ label, slug }) => (
              <Link
                key={slug}
                href={`/section/${slug}`}
                className="font-barlow text-nav font-medium uppercase tracking-[0.14em] text-stone transition-colors hover:text-parchment"
              >
                {label}
              </Link>
            ))}
          </nav>

          <p className="font-barlow text-[10px] tracking-wide text-ash">
            &copy; 1347&ndash;2026 Underworld News Network. All rights reserved.
            Unauthorized reanimation of this content is strictly prohibited.
          </p>
        </div>
      </div>
    </footer>
  );
}
