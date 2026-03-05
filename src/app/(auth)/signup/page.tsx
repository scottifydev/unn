"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Check your email to confirm your account.");
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
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-500 uppercase tracking-[0.14em] text-stone">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded border border-seam bg-chamber px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
              />
            </div>

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

            <div>
              <label className="mb-1 block font-barlow text-[11px] font-500 uppercase tracking-[0.14em] text-stone">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded border border-seam bg-chamber px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
              />
            </div>

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
              {loading ? "..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center font-barlow text-[11px] uppercase tracking-wider text-stone">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-parchment transition-colors hover:text-paper"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
