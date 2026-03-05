import Link from "next/link";

const SECTIONS = [
  { label: "Vampire Affairs", slug: "vampire-affairs" },
  { label: "Undead Health", slug: "undead-health" },
  { label: "Demon Politics", slug: "demon-politics" },
  { label: "Werewolf Rights", slug: "werewolf-rights" },
  { label: "Occult Markets", slug: "occult-markets" },
  { label: "Spirit World", slug: "spirit-world" },
  { label: "Opinion", slug: "opinion" },
  { label: "Weather & Omens", slug: "weather-omens" },
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
