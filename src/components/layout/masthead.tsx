"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

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

type UserRole = "reader" | "contributor" | "editor" | "admin";

function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("reader");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.role) setRole(data.role as UserRole);
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="font-barlow text-nav font-medium uppercase tracking-[0.14em] text-stone transition-colors hover:text-parchment"
      >
        Sign In
      </Link>
    );
  }

  const isEditor = role === "editor" || role === "admin";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-barlow text-nav font-medium uppercase tracking-[0.14em] text-stone transition-colors hover:text-parchment"
      >
        <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 border border-seam bg-chamber py-1 shadow-lg z-50">
          {isEditor && (
            <>
              <Link
                href="/editor/queue"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-[0.1em] text-parchment transition-colors hover:bg-slate hover:text-paper"
              >
                Editorial Queue
              </Link>
              <Link
                href="/editor/generate"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-[0.1em] text-parchment transition-colors hover:bg-slate hover:text-paper"
              >
                Generate Article
              </Link>
              <Link
                href="/editor/ticker"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-[0.1em] text-parchment transition-colors hover:bg-slate hover:text-paper"
              >
                Ticker
              </Link>
              <Link
                href="/editor/advisories"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-[0.1em] text-parchment transition-colors hover:bg-slate hover:text-paper"
              >
                Advisories
              </Link>
              <Link
                href="/editor/trending"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-[0.1em] text-parchment transition-colors hover:bg-slate hover:text-paper"
              >
                Trending
              </Link>
              <Link
                href="/editor/ads"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-[0.1em] text-parchment transition-colors hover:bg-slate hover:text-paper"
              >
                Ads
              </Link>
              <div className="my-1 border-t border-seam" />
            </>
          )}
          <Link
            href="/submit"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 font-barlow text-[11px] font-medium uppercase tracking-[0.1em] text-parchment transition-colors hover:bg-slate hover:text-paper"
          >
            Submit Article
          </Link>
          <div className="my-1 border-t border-seam" />
          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              setOpen(false);
              window.location.href = "/";
            }}
            className="block w-full px-4 py-2 text-left font-barlow text-[11px] font-medium uppercase tracking-[0.1em] text-stone transition-colors hover:bg-slate hover:text-parchment"
          >
            Sign Out
          </button>
        </div>
      )}
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
      <div className="mx-auto flex h-[52px] max-w-[1380px] items-center justify-between px-4 sm:h-[60px] lg:grid lg:h-[68px] lg:grid-cols-3">
        <div className="hidden items-center gap-4 lg:flex">
          <span className="font-barlow text-nav font-medium uppercase tracking-[0.14em] text-stone">
            {dateString}
          </span>
        </div>

        <Link href="/" className="flex flex-col items-center justify-center text-center max-lg:flex-1">
          <span className="font-cinzel text-[26px] font-black uppercase leading-none tracking-[0.08em] text-paper sm:text-[32px] lg:text-[40px]">
            UNN
          </span>
          <span className="hidden font-barlow text-[9px] font-light uppercase tracking-[0.2em] text-ash sm:block">
            Underworld News Network
          </span>
        </Link>

        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <LiveBug />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
