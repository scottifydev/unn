"use client";

import { useEffect, useState } from "react";

const SECTION_NAMES = [
  "Vampire Affairs",
  "Undead Health",
  "Demon Politics",
  "Werewolf Rights",
  "Occult Markets",
  "Spirit World",
  "Opinion",
  "Weather & Omens",
] as const;

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function LiveBug() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-garnet opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-garnet-bright" />
      </span>
      <span className="font-barlow text-nav font-semibold uppercase tracking-[0.14em] text-garnet-bright">
        Live
      </span>
    </div>
  );
}

export default function Masthead() {
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    setDateString(formatDate(new Date()));
  }, []);

  return (
    <header className="sticky top-0 z-[100] border-t-2 border-garnet border-b border-b-seam bg-void">
      <div className="mx-auto grid h-[68px] max-w-[1380px] grid-cols-3 items-center px-4">
        <div className="flex items-center gap-4">
          <span className="font-barlow text-nav font-medium uppercase tracking-[0.14em] text-stone">
            {dateString}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center text-center">
          <span className="font-cinzel text-lg font-bold tracking-[0.12em] text-paper">
            UNDERWORLD NEWS NETWORK
          </span>
          <span className="font-barlow text-[9px] font-light uppercase tracking-[0.2em] text-ash">
            Est. 1347 &mdash; All the news that&apos;s unfit for daylight.
          </span>
        </div>

        <div className="flex items-center justify-end gap-4">
          <LiveBug />
          <button
            type="button"
            className="font-barlow text-nav font-medium uppercase tracking-[0.14em] text-stone transition-colors hover:text-parchment"
          >
            Subscribe
          </button>
        </div>
      </div>
    </header>
  );
}
