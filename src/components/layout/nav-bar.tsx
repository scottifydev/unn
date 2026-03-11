"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const NAV_SECTIONS = [
  { label: "Underworld Affairs", slug: "underworld-affairs" },
  { label: "Ether & Veil", slug: "ether-and-veil" },
  { label: "Occult Markets", slug: "occult-markets" },
  { label: "Creature Profile", slug: "creature-profile" },
  { label: "Ask Astra", slug: "ask-astra" },
  { label: "Weather & Omens", slug: "weather-and-omens" },
  { label: "Opinion", slug: "opinion" },
] as const;

const MORE_SECTIONS = [
  { label: "Human Affairs Desk", slug: "human-affairs" },
  { label: "Labor Desk", slug: "labor" },
  { label: "Health Desk", slug: "health" },
  { label: "Cultural & Entertainment Desk", slug: "culture" },
  { label: "The Crypt Desk", slug: "the-crypt" },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const moreIsActive = MORE_SECTIONS.some(({ slug }) =>
    pathname.startsWith(`/section/${slug}`)
  );

  return (
    <nav className="relative z-40 border-b border-seam bg-chamber">
      <div className="scrollbar-none mx-auto flex max-w-[1380px] items-center gap-4 overflow-x-auto px-4 py-2 sm:justify-center sm:gap-6">
        {NAV_SECTIONS.map(({ label, slug }) => {
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

        <div ref={moreRef} className="relative shrink-0">
          <button
            onClick={() => setMoreOpen((o) => !o)}
            className={`whitespace-nowrap font-barlow text-nav font-medium uppercase tracking-[0.14em] transition-colors ${
              moreIsActive
                ? "border-b-2 border-garnet pb-px text-paper"
                : "text-stone hover:text-parchment"
            }`}
          >
            More {moreOpen ? "▴" : "▾"}
          </button>
          {moreOpen && (
            <div className="absolute left-0 top-full z-[100] mt-1 min-w-[220px] rounded border border-seam bg-chamber shadow-lg">
              {MORE_SECTIONS.map(({ label, slug }) => {
                const href = `/section/${slug}`;
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={slug}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2.5 font-barlow text-nav font-medium uppercase tracking-[0.14em] transition-colors hover:bg-graphite ${
                      isActive ? "text-paper" : "text-stone hover:text-parchment"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
