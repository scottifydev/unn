"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "magic") {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the magic link.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/";
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-cinzel text-2xl font-bold text-paper">
          Underworld News Network
        </h1>

        <div className="rounded border border-seam bg-chamber p-6">
          <h2 className="mb-6 text-center font-cinzel text-lg text-paper">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-500 uppercase tracking-[0.14em] text-stone">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded border border-seam bg-chamber px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
              />
            </div>

            {mode === "password" && (
              <div>
                <label className="mb-1 block font-barlow text-[11px] font-500 uppercase tracking-[0.14em] text-stone">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded border border-seam bg-chamber px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
                />
              </div>
            )}

            {error && (
              <p className="font-crimson text-sm text-garnet-bright">{error}</p>
            )}
            {message && (
              <p className="font-crimson text-sm text-parchment">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-garnet px-4 py-2 font-barlow text-sm font-600 uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50"
            >
              {loading
                ? "..."
                : mode === "magic"
                  ? "Send Magic Link"
                  : "Sign In"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "password" ? "magic" : "password")}
            className="mt-4 w-full text-center font-barlow text-[11px] uppercase tracking-wider text-stone transition-colors hover:text-parchment"
          >
            {mode === "password"
              ? "Use magic link instead"
              : "Use password instead"}
          </button>
        </div>

        <p className="mt-4 text-center font-barlow text-[11px] uppercase tracking-wider text-stone">
          No account?{" "}
          <Link
            href="/signup"
            className="text-parchment transition-colors hover:text-paper"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
