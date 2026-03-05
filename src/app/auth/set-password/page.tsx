"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center font-cinzel text-2xl font-bold text-paper">
          Underworld News Network
        </h1>

        <div className="rounded border border-seam bg-chamber p-6">
          <h2 className="mb-6 text-center font-cinzel text-lg text-paper">
            Set Your Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block font-barlow text-[11px] font-500 uppercase tracking-[0.14em] text-stone">
                New Password
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

            <div>
              <label className="mb-1 block font-barlow text-[11px] font-500 uppercase tracking-[0.14em] text-stone">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full rounded border border-seam bg-chamber px-3 py-2 font-crimson text-parchment outline-none focus:border-garnet"
              />
            </div>

            {error && (
              <p className="font-crimson text-sm text-garnet-bright">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-garnet px-4 py-2 font-barlow text-sm font-600 uppercase tracking-wider text-paper transition-colors hover:bg-garnet-bright disabled:opacity-50"
            >
              {loading ? "..." : "Set Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
