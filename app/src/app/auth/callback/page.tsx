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
      // Role stored in localStorage before redirect (avoids query-param mismatch
      // with Supabase's redirect URL allow-list).
      const role = (
        (typeof window !== "undefined" && localStorage.getItem("oauth_redirect_role")) ??
        searchParams.get("role") ??
        "parent"
      ) as "parent" | "teacher" | "admin";

      // Admin context (action + optional setupSecret / inviteToken)
      const adminContextRaw =
        typeof window !== "undefined" ? localStorage.getItem("oauth_admin_context") : null;
      type AdminCtx = { action: string; setupSecret?: string; inviteToken?: string };
      let adminContext: AdminCtx | null = null;
      if (adminContextRaw) {
        try { adminContext = JSON.parse(adminContextRaw) as AdminCtx; } catch { /* ignore */ }
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("oauth_redirect_role");
        localStorage.removeItem("oauth_admin_context");
      }

      // Check for an explicit error coming back from Supabase/Google
      const oauthError = searchParams.get("error") ?? searchParams.get("error_description");
      if (oauthError) {
        setError(`Google sign-in was declined: ${oauthError}. Please try again.`);
        return;
      }

      // PKCE flow — code arrives as a query param
      const code = searchParams.get("code");

      // Implicit flow fallback — token arrives in URL hash fragment
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");

      if (!code && !accessToken) {
        setError("No authorization code received. Please try signing in again.");
        return;
      }

      try {
        let googleId = "";
        let email = "";
        let displayName = "";

        if (code) {
          // PKCE — exchange code for session
          const { data, error: exchangeError } = await supabaseBrowser.auth.exchangeCodeForSession(code);
          if (exchangeError || !data.user) {
            setError(exchangeError?.message ?? "Could not verify your Google account. Please try again.");
            return;
          }
          const user = data.user;
          googleId = user.id;
          email = user.email ?? "";
          displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split("@")[0];
        } else {
          // Implicit — parse existing session from hash
          const { data, error: sessionError } = await supabaseBrowser.auth.getUser(accessToken!);
          if (sessionError || !data.user) {
            setError("Could not verify your Google account. Please try again.");
            return;
          }
          const user = data.user;
          googleId = user.id;
          email = user.email ?? "";
          displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? email.split("@")[0];
        }

        // Sign out from Supabase Auth — we use our own custom session system
        await supabaseBrowser.auth.signOut();

        // Create our own session cookie via server-side API
        let apiUrl = "/api/auth/google-callback";
        let apiBody: Record<string, unknown> = { googleId, email, displayName, role };

        if (role === "admin") {
          apiUrl = "/api/auth/google-admin-callback";
          apiBody = {
            googleId,
            email,
            displayName,
            action: adminContext?.action ?? "login",
            ...(adminContext?.setupSecret ? { setupSecret: adminContext.setupSecret } : {}),
            ...(adminContext?.inviteToken ? { inviteToken: adminContext.inviteToken } : {}),
          };
        }

        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiBody),
        });

        const json = await res.json() as { redirectTo?: string; error?: string };
        if (!res.ok) {
          setError(json.error ?? "Sign-in failed. Please try again.");
          return;
        }

        router.replace(json.redirectTo ?? (role === "teacher" ? "/teacher" : role === "admin" ? "/owner" : "/parent"));
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Something went wrong. Please try signing in again.");
      }
    }

    void handleCallback();
  }, [searchParams, router]);

  const C = { base: "#100b2e", violet: "#9b72ff", text: "#f0f6ff", muted: "rgba(255,255,255,0.5)" };

  if (error) {
    const storedRole = typeof window !== "undefined" ? localStorage.getItem("oauth_redirect_role") : null;
    const backHref = storedRole === "teacher" ? "/teacher" : storedRole === "admin" ? "/owner/login" : "/parent";
    return (
      <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>Sign-in failed</h1>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
          <a
            href={backHref}
            style={{ background: C.violet, color: "#fff", borderRadius: 10, padding: "12px 24px", fontWeight: 700, textDecoration: "none", fontSize: 14 }}
          >
            ← Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>
          <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
        </div>
        <p style={{ fontSize: 16, color: C.muted }}>Signing you in with Google…</p>
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
