"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-seam bg-chamber">
      <div className="scrollbar-none mx-auto flex max-w-[1380px] items-center gap-4 overflow-x-auto px-4 py-2 sm:justify-center sm:gap-6">
        {SECTIONS.map(({ label, slug }) => {
          const href = `/section/${slug}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={slug}
              href={href}
              className={`whitespace-nowrap font-barlow text-nav font-medium uppercase tracking-[0.14em] transition-colors ${
                isActive
                  ? "border-b-2 border-garnet pb-px text-paper"
                  : "text-stone hover:text-parchment"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
