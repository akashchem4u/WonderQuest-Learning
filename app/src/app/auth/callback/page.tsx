"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const role = (searchParams.get("role") ?? "parent") as "parent" | "teacher";

      if (!code) {
        setError("No authorization code received. Please try signing in again.");
        return;
      }

      try {
        // Exchange code for Supabase session (gets us the user's identity)
        const { data, error: exchangeError } = await supabaseBrowser.auth.exchangeCodeForSession(code);
        if (exchangeError || !data.user) {
          setError("Could not verify your Google account. Please try again.");
          return;
        }

        const user = data.user;
        const googleId = user.id; // Supabase user ID (maps to Google sub)
        const email = user.email ?? "";
        const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split("@")[0];

        // Sign out from Supabase Auth immediately — we use our own session system
        await supabaseBrowser.auth.signOut();

        // Create our own session via server-side API
        const res = await fetch("/api/auth/google-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ googleId, email, displayName, role }),
        });

        const json = await res.json() as { redirectTo?: string; error?: string };
        if (!res.ok) {
          setError(json.error ?? "Sign-in failed. Please try again.");
          return;
        }

        router.replace(json.redirectTo ?? (role === "teacher" ? "/teacher" : "/parent"));
      } catch {
        setError("Something went wrong. Please try signing in again.");
      }
    }

    void handleCallback();
  }, [searchParams, router]);

  const C = { base: "#100b2e", violet: "#9b72ff", text: "#f0f6ff", muted: "rgba(255,255,255,0.5)" };

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 400, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Sign-in failed</h1>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
          <a href="/parent" style={{ background: C.violet, color: "#fff", borderRadius: 10, padding: "12px 24px", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
            ← Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 1s linear infinite" }}>🔄</div>
        <p style={{ fontSize: 16, color: C.muted }}>Signing you in…</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#100b2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>Loading…</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
