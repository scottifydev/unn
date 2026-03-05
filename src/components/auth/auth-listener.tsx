"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthListener() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;

    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") {
        // Clear the hash fragment
        window.history.replaceState(null, "", window.location.pathname);

        // For invite or recovery, redirect to set-password
        if (hash.includes("type=invite") || hash.includes("type=recovery")) {
          window.location.href = "/auth/set-password";
        }
      }
    });
  }, []);

  return null;
}
