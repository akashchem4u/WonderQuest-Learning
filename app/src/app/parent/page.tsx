"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type ParentAccessMode = "signin" | "register" | "forgot" | "forgot-verify";

type NameAvailability = "idle" | "checking" | "available" | "taken" | "invalid";

// ─── Stub preview data ────────────────────────────────────────────────────────

const STUB_PREVIEW_SKILLS = [
  { name: "Rhyming words", pct: 88, color: C.violet },
  { name: "Letter sounds", pct: 74, color: C.violet },
  { name: "Counting", pct: 60, color: C.gold },
];

const STUB_STATS = [
  { icon: "⭐", val: "42", label: "Stars" },
  { icon: "📚", val: "14", label: "Sessions" },
  { icon: "🔥", val: "5", label: "Streak" },
  { icon: "🏅", val: "2", label: "Badges" },
];

const TRUST_BADGES = ["🔒 COPPA-safe", "📵 No ads", "✅ Teacher-guided"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentAccessPage() {
  const router = useRouter();

  const [showDemo, setShowDemo] = useState(false);
  const [accessMode, setAccessMode] = useState<ParentAccessMode>("signin");
  const [showIntentScreen, setShowIntentScreen] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyMilestones, setNotifyMilestones] = useState(true);

  // Sign-in fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regChildName, setRegChildName] = useState("");
  const [regChildNameAvailability, setRegChildNameAvailability] = useState<NameAvailability>("idle");
  const [regChildNameMessage, setRegChildNameMessage] = useState("");
  const [regChildNameDebounceRef, setRegChildNameDebounceRef] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [regSchoolName, setRegSchoolName] = useState("");
  const [regIsdName, setRegIsdName] = useState("");
  const [regStateCode, setRegStateCode] = useState("");

  // Forgot password fields
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotToken, setForgotToken] = useState("");
  const [forgotDisplayName, setForgotDisplayName] = useState("");
  const [forgotChildPin, setForgotChildPin] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState("");
  const [guestCredentials, setGuestCredentials] = useState<{
    childUsername: string;
    childPin: string;
    parentUsername: string;
    parentPin: string;
  } | null>(null);

  // On mount: if session already exists, redirect to dashboard
  useEffect(() => {
    let cancelled = false;
    async function trySessionRestore() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });
        if (!response.ok || cancelled) return;
        // Valid session exists — check for ?next redirect first
        const nextPath = new URLSearchParams(window.location.search).get("next");
        if (nextPath && nextPath.startsWith("/parent/")) {
          window.location.assign(nextPath);
          return;
        }
        if (!cancelled) router.replace("/parent/dashboard");
      } catch {
        // No valid session — stay on the credential form.
      }
    }
    void trySessionRestore();
    return () => { cancelled = true; };
  }, [router]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/parent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const payload = (await response.json()) as { error?: string; linkedChild?: { id: string }; linkedChildren?: { id: string }[] };
      if (!response.ok) throw new Error(payload.error ?? "Sign-in failed.");
      const defaultId = payload.linkedChild?.id ?? payload.linkedChildren?.[0]?.id ?? null;
      if (defaultId) localStorage.setItem("wq_active_student_id", defaultId);
      const nextPath = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
      if (nextPath && nextPath.startsWith("/parent/")) {
        window.location.assign(nextPath);
        return;
      }
      router.push("/parent/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuestLogin() {
    setGuestLoading(true);
    try {
      const res = await fetch("/api/parent/guest", { method: "POST" });
      if (!res.ok) { setGuestLoading(false); return; }
      const data = await res.json() as { credentials?: { parentUsername: string; parentPin: string; childUsername: string; childPin: string } };
      if (data.credentials) {
        setGuestCredentials(data.credentials);
      } else {
        router.push("/parent/dashboard");
      }
    } catch {
      setGuestLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/parent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          displayName: regDisplayName,
          childUsername: regChildName.trim() || undefined,
          notifyWeekly,
          notifyMilestones,
          schoolName: regSchoolName.trim() || undefined,
          isdName: regIsdName.trim() || undefined,
          stateCode: regStateCode || undefined,
        }),
      });
      const payload = (await response.json()) as { error?: string; linkedChild?: { id: string }; linkedChildren?: { id: string }[] };
      if (!response.ok) throw new Error(payload.error ?? "Registration failed.");
      const defaultId = payload.linkedChild?.id ?? payload.linkedChildren?.[0]?.id ?? null;
      if (defaultId) localStorage.setItem("wq_active_student_id", defaultId);
      const nextPath = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
      if (nextPath && nextPath.startsWith("/parent/")) {
        window.location.assign(nextPath);
        return;
      }
      router.push("/parent/dashboard");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleChildNameChange(val: string) {
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
    setRegChildName(cleaned);
    setRegChildNameAvailability("idle");
    setRegChildNameMessage("");

    if (regChildNameDebounceRef) clearTimeout(regChildNameDebounceRef);

    if (!cleaned || cleaned.length < 2) {
      setRegChildNameAvailability("idle");
      return;
    }

    setRegChildNameAvailability("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/parent/check-child-name?username=${encodeURIComponent(cleaned)}`);
        const data = (await res.json()) as { available?: boolean; message?: string };
        if (data.available) {
          setRegChildNameAvailability("available");
          setRegChildNameMessage("Available!");
        } else {
          setRegChildNameAvailability("taken");
          setRegChildNameMessage(data.message ?? "That name is taken.");
        }
      } catch {
        setRegChildNameAvailability("idle");
      }
    }, 500);
    setRegChildNameDebounceRef(timer);
  }

  async function handleForgotStep1(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/parent/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier }),
      });
      const payload = (await response.json()) as { token?: string; displayName?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Request failed.");
      setForgotToken(payload.token ?? "");
      setForgotDisplayName(payload.displayName ?? "");
      setAccessMode("forgot-verify");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotStep2(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/parent/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: forgotToken, childPin: forgotChildPin, newPassword: forgotNewPassword }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Password reset failed.");
      setError("");
      setAccessMode("signin");
      setForgotIdentifier("");
      setForgotToken("");
      setForgotChildPin("");
      setForgotNewPassword("");
      setForgotDisplayName("");
      // Show a success message via error field (we'll style it green inline)
      setError("__success__Password updated! Sign in with your new password.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Password reset failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn(role: "parent" | "teacher") {
    // Store role in localStorage — avoids adding query params to redirectTo
    // which can cause Supabase redirect URL allow-list mismatches.
    localStorage.setItem("oauth_redirect_role", role);
    const redirectTo = `${window.location.origin}/auth/callback`;
    await import("@/lib/supabase-browser").then(({ supabaseBrowser }) =>
      supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      })
    );
  }

  // ── Shared style helpers ───────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid rgba(155,114,255,0.3)",
    borderRadius: "10px",
    font: "400 0.92rem system-ui",
    color: C.text,
    background: "rgba(155,114,255,0.08)",
    outline: "none",
    fontFamily: "system-ui",
    fontSize: 16,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    font: "600 0.78rem system-ui",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "6px",
    fontFamily: "system-ui",
  };

  const primaryBtnStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px",
    background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    font: "700 0.95rem system-ui",
    cursor: "pointer",
    fontFamily: "system-ui",
    minHeight: 44,
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────────
  // GUEST CREDENTIALS SCREEN — shown immediately after guest account creation
  // ─────────────────────────────────────────────────────────────────────────────

  if (guestCredentials) {
    return (
      <AppFrame audience="home" currentPath="/parent">
        <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #13103a 0%, #0e0b26 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "system-ui" }}>
          <div style={{ width: "100%", maxWidth: 480 }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: C.text, margin: 0, marginBottom: 8 }}>
                Your guest account is ready!
              </h1>
              <p style={{ color: C.muted, fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>
                Save these credentials — your child will need them to sign in.
              </p>
            </div>

            {/* STEP 1: Child credentials */}
            <div style={{ background: "rgba(72,199,142,0.1)", border: "2px solid rgba(72,199,142,0.4)", borderRadius: 16, padding: "20px 22px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ background: "rgba(72,199,142,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800, color: "#48c78e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  STEP 1 — For your child
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>→ enter at <strong style={{ color: "rgba(255,255,255,0.7)" }}>wonderquest.app/child</strong></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Child Username</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#48c78e", letterSpacing: "0.04em", fontFamily: "monospace" }}>{guestCredentials.childUsername}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Child PIN</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#48c78e", letterSpacing: "0.2em", fontFamily: "monospace" }}>{guestCredentials.childPin}</div>
                </div>
              </div>
            </div>

            {/* STEP 2: Parent credentials */}
            <div style={{ background: "rgba(155,114,255,0.07)", border: "1px solid rgba(155,114,255,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ background: "rgba(155,114,255,0.15)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 800, color: C.violet, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  STEP 2 — For you (parent)
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>→ enter at <strong style={{ color: "rgba(255,255,255,0.5)" }}>wonderquest.app/parent</strong></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Parent Username</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{guestCredentials.parentUsername}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Parent PIN</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: "monospace", letterSpacing: "0.15em" }}>{guestCredentials.parentPin}</div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link
                href="/child"
                style={{
                  display: "block", width: "100%", padding: "14px", borderRadius: 12, textAlign: "center",
                  background: "linear-gradient(135deg, #48c78e, #1a9c6c)",
                  color: "#fff", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none",
                  boxSizing: "border-box",
                }}
              >
                🎮 Open Child Portal (use child credentials above) →
              </Link>
              <button
                type="button"
                onClick={() => router.push("/parent/dashboard")}
                style={{
                  width: "100%", padding: "12px", borderRadius: 12, border: "1px solid rgba(155,114,255,0.25)",
                  background: "transparent", color: "rgba(155,114,255,0.8)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                }}
              >
                View parent dashboard (use parent credentials above) →
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: "0.78rem", color: C.muted, marginTop: 20, lineHeight: 1.5 }}>
              ⏳ Guest accounts last 24 hours. Convert to a free account to save progress permanently.
            </p>
          </div>
        </div>
      </AppFrame>
    );
  }

  // UNAUTHENTICATED — 2-col hero sign-in
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <AppFrame audience="home" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui",
        }}
      >
        <div className="parent-login-grid" style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 40px 80px", minHeight: "100vh" }}>
          {/* ── Left hero ───────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                }}
              >
                🌟
              </div>
              <span
                style={{
                  font: "900 1.5rem system-ui",
                  background: "linear-gradient(135deg, #c3aaff, #9b72ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                WonderQuest
              </span>
            </div>

            <h1
              style={{
                font: "800 2.8rem/1.1 system-ui",
                color: C.text,
                maxWidth: "480px",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Know exactly how your child{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #9b72ff, #58e8c1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                is learning.
              </span>
            </h1>

            <p
              style={{
                font: "400 1.05rem/1.7 system-ui",
                color: C.muted,
                maxWidth: "440px",
                margin: 0,
              }}
            >
              WonderQuest uses AI to adapt every quest to your child&apos;s level. You get a simple dashboard showing what they practiced, what improved, and what to focus on next — updated after every session.
            </p>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {TRUST_BADGES.map((badge) => (
                <span
                  key={badge}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    font: "500 0.75rem system-ui",
                    color: "rgba(195,170,255,0.7)",
                    background: "rgba(155,114,255,0.12)",
                    border: "1px solid rgba(155,114,255,0.25)",
                    borderRadius: "20px",
                    padding: "5px 12px",
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Value prop checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 440 }}>
              {[
                { icon: "🧠", text: "AI adapts every question to your child's exact level" },
                { icon: "📊", text: "Mastery scores, streaks & skill progress after every session" },
                { icon: "🎯", text: "Personalized suggestions for what to practice next" },
                { icon: "🔒", text: "COPPA-compliant · No ads · No data sold ever" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Sample preview — gated behind toggle */}
            <div style={{ marginTop: "8px", maxWidth: "440px" }}>
              <button
                onClick={() => setShowDemo((v) => !v)}
                style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "system-ui", minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
              >
                {showDemo ? "Hide sample ▲" : "See what Family Hub looks like ▼"}
              </button>
              {showDemo && (
                <div style={{ marginTop: 16, opacity: 0.85, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, background: C.surface }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    📋 Sample preview — not your real data
                  </div>
                  <div
                    style={{
                      font: "700 0.95rem system-ui",
                      color: C.text,
                      marginBottom: "16px",
                    }}
                  >
                    Maya&apos;s week at a glance
                  </div>

                  <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
                    {STUB_STATS.map((s) => (
                      <div key={s.label}>
                        <span
                          style={{
                            font: "700 1.2rem system-ui",
                            color: C.text,
                            display: "block",
                          }}
                        >
                          {s.icon} {s.val}
                        </span>
                        <span
                          style={{
                            font: "400 0.68rem system-ui",
                            color: C.muted,
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {STUB_PREVIEW_SKILLS.map((skill) => (
                      <div
                        key={skill.name}
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                      >
                        <span
                          style={{
                            font: "600 0.78rem system-ui",
                            color: C.text,
                            width: "110px",
                            flexShrink: 0,
                          }}
                        >
                          {skill.name}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: "6px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${skill.pct}%`,
                              height: "100%",
                              background: skill.color,
                              borderRadius: "3px",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            font: "600 0.7rem system-ui",
                            color: C.muted,
                            width: "30px",
                            textAlign: "right",
                          }}
                        >
                          {skill.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right auth card ────────────────────────────────────────── */}
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "20px",
              padding: "40px 36px",
              boxShadow: "0 8px 40px rgba(100,60,200,0.15)",
              border: "1px solid rgba(155,114,255,0.2)",
            }}
          >
            <div
              style={{
                font: "600 0.75rem system-ui",
                color: C.violet,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "6px",
              }}
            >
              Family Hub
            </div>

            {/* ── Intent screen: shown first before sign-in/register forms ── */}
            {showIntentScreen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ font: "800 1.5rem/1.2 system-ui", color: C.text, marginBottom: 4, letterSpacing: "-0.02em" }}>
                  How can we help?
                </div>
                {[
                  {
                    icon: "✨",
                    title: "I'm new — create free account",
                    sub: "Set up in 60 seconds. No credit card.",
                    action: () => { setShowIntentScreen(false); setAccessMode("register"); setError(""); },
                    highlight: true,
                  },
                  {
                    icon: "👋",
                    title: "I already have an account",
                    sub: "Sign in to see your child's progress.",
                    action: () => { setShowIntentScreen(false); setAccessMode("signin"); setError(""); },
                    highlight: false,
                  },
                  {
                    icon: "🏫",
                    title: "My child's teacher invited me",
                    sub: "I have a class code from their teacher.",
                    action: () => { setShowIntentScreen(false); setAccessMode("register"); setError(""); },
                    highlight: false,
                  },
                  {
                    icon: "👀",
                    title: "Just exploring — try as guest",
                    sub: "No sign-up needed. Progress saved for 24 hours.",
                    action: handleGuestLogin,
                    highlight: false,
                  },
                ].map((opt) => (
                  <button
                    key={opt.title}
                    type="button"
                    onClick={opt.action}
                    disabled={guestLoading && opt.icon === "👀"}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 14, textAlign: "left",
                      padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                      fontFamily: "system-ui",
                      border: opt.highlight ? "2px solid rgba(155,114,255,0.5)" : "1.5px solid rgba(255,255,255,0.09)",
                      background: opt.highlight ? "rgba(155,114,255,0.14)" : "rgba(255,255,255,0.04)",
                      minHeight: 44, touchAction: "manipulation",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "1.3rem", flexShrink: 0, marginTop: 1 }}>{opt.icon}</span>
                    <div>
                      <div style={{ font: `700 0.92rem system-ui`, color: opt.highlight ? C.violet : C.text, marginBottom: 2 }}>
                        {opt.title}
                      </div>
                      <div style={{ font: "400 0.78rem system-ui", color: C.muted, lineHeight: 1.4 }}>{opt.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* ── Back link when intent screen is hidden ── */}
            {!showIntentScreen && (
              <button
                type="button"
                onClick={() => { setShowIntentScreen(true); setError(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", font: "500 0.8rem system-ui", color: C.muted, fontFamily: "system-ui", padding: "0 0 12px 0", display: "flex", alignItems: "center", gap: 4 }}
              >
                ← Back
              </button>
            )}

            {/* ── Tab bar (Sign In / Create Account) ── */}
            {!showIntentScreen && (accessMode === "signin" || accessMode === "register") && (
              <>
                <div style={{ font: "800 1.6rem/1.2 system-ui", color: C.text, marginBottom: "4px", letterSpacing: "-0.02em" }}>
                  {accessMode === "signin" ? "Welcome back 👋" : "Start your free account"}
                </div>
                <div style={{ font: "400 0.85rem system-ui", color: C.muted, marginBottom: "18px" }}>
                  {accessMode === "signin" ? "Sign in to see your child's progress." : "Set up in 60 seconds. No credit card needed."}
                </div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "22px" }}>
                  {(["signin", "register"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setAccessMode(tab); setError(""); }}
                      type="button"
                      style={{
                        flex: 1,
                        padding: "9px 12px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        font: "600 0.82rem system-ui",
                        border: accessMode === tab ? "2px solid #9b72ff" : "1.5px solid rgba(155,114,255,0.2)",
                        background: accessMode === tab ? "rgba(155,114,255,0.18)" : "rgba(255,255,255,0.04)",
                        color: accessMode === tab ? C.violet : C.muted,
                        fontFamily: "system-ui",
                        transition: "all 0.15s",
                        minHeight: 44,
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {tab === "signin" ? "Sign In" : "Free Account"}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── Sign In form ── */}
            {!showIntentScreen && accessMode === "signin" && (
              <form
                onSubmit={handleSignIn}
                style={{ display: "flex", flexDirection: "column", gap: "14px" }}
              >
                <div>
                  <label style={labelStyle}>Email or username</label>
                  <input autoComplete="username" onChange={(e) => setIdentifier(e.target.value)} placeholder="you@example.com" style={inputStyle} type="text" value={identifier} />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} type="password" value={password} />
                </div>

                {error && !error.startsWith("__success__") && (
                  <p style={{ font: "500 0.82rem system-ui", color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>
                    {error}
                  </p>
                )}
                {error.startsWith("__success__") && (
                  <p style={{ font: "500 0.82rem system-ui", color: C.mint, background: "rgba(88,232,193,0.1)", border: "1px solid rgba(88,232,193,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>
                    {error.replace("__success__", "")}
                  </p>
                )}

                <button disabled={submitting} type="submit" style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer", marginTop: "4px" }}>
                  {submitting ? "Signing in\u2026" : "Sign In \u2192"}
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>or continue with</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                </div>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn("parent")}
                  style={{
                    width: "100%", background: "#fff", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10, color: "#1a1a2e", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 10,
                    fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                    minHeight: 44, padding: "10px 16px", touchAction: "manipulation",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div style={{ textAlign: "center" }}>
                  <button type="button" onClick={() => { setAccessMode("forgot"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", font: "500 0.8rem system-ui", color: C.violet, fontFamily: "system-ui", minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Link href="/child" style={{ font: "500 0.8rem system-ui", color: C.violet, textDecoration: "none" }}>
                    Child access →
                  </Link>
                </div>
                <div style={{ textAlign: "center", marginTop: 4 }}>
                  <Link href="/parent/onboarding" style={{ fontSize: 13, color: C.muted, textDecoration: "underline" }}>
                    New to WonderQuest? Set up your family account →
                  </Link>
                </div>

                {/* Guest divider + button */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={guestLoading}
                  style={{
                    width: "100%",
                    padding: "10px 13px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)",
                    color: guestLoading ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)",
                    fontSize: "0.875rem",
                    fontFamily: "system-ui",
                    cursor: guestLoading ? "not-allowed" : "pointer",
                    opacity: guestLoading ? 0.5 : 1,
                    transition: "background 0.15s, color 0.15s",
                    minHeight: 44,
                    touchAction: "manipulation",
                  }}
                >
                  {guestLoading ? "Setting up\u2026" : "Try as Guest \u2014 no sign-up needed"}
                </button>
              </form>
            )}

            {/* ── Create Account form ── */}
            {!showIntentScreen && accessMode === "register" && (
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Your email</label>
                  <input autoComplete="email" onChange={(e) => setRegEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} type="email" value={regEmail} />
                </div>
                <div>
                  <label style={labelStyle}>Password (min 6 characters)</label>
                  <input autoComplete="new-password" onChange={(e) => setRegPassword(e.target.value)} placeholder="\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7" style={inputStyle} type="password" value={regPassword} />
                </div>
                <div>
                  <label style={labelStyle}>Your name</label>
                  <input onChange={(e) => setRegDisplayName(e.target.value)} placeholder="e.g. Sarah" style={inputStyle} type="text" value={regDisplayName} />
                </div>


                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5, padding: "8px 0" }}>
                  You can add your child&apos;s profile right after signing up. School and notification settings are available in your account settings.
                </div>

                {error && !error.startsWith("__success__") && (
                  <p style={{ font: "500 0.82rem system-ui", color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>
                    {error}
                  </p>
                )}

                <button disabled={submitting} type="submit" style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer", marginTop: "4px" }}>
                  {submitting ? "Creating account\u2026" : "Create free account \u2192"}
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>or continue with</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                </div>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn("parent")}
                  style={{
                    width: "100%", background: "#fff", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10, color: "#1a1a2e", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", gap: 10,
                    fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                    minHeight: 44, padding: "10px 16px", touchAction: "manipulation",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div style={{ textAlign: "center" }}>
                  <Link href="/child" style={{ font: "500 0.8rem system-ui", color: C.violet, textDecoration: "none" }}>Child access →</Link>
                </div>
              </form>
            )}

            {/* ── Forgot Password — Step 1 ── */}
            {!showIntentScreen && accessMode === "forgot" && (
              <form onSubmit={handleForgotStep1} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ font: "700 1.3rem system-ui", color: C.text, marginBottom: "8px" }}>Reset your password</div>
                <div style={{ font: "400 0.82rem/1.5 system-ui", color: C.muted, marginBottom: "6px" }}>
                  Enter your email or username. We will give you a recovery code to use right here — no email needed.
                </div>
                <div>
                  <label style={labelStyle}>Email or username</label>
                  <input onChange={(e) => setForgotIdentifier(e.target.value)} placeholder="you@example.com" style={inputStyle} type="text" value={forgotIdentifier} />
                </div>
                {error && (
                  <p style={{ font: "500 0.82rem system-ui", color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>{error}</p>
                )}
                <button disabled={submitting} type="submit" style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Looking up\u2026" : "Get recovery code \u2192"}
                </button>
                <div style={{ textAlign: "center" }}>
                  <button type="button" onClick={() => { setAccessMode("signin"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", font: "500 0.8rem system-ui", color: C.muted, fontFamily: "system-ui", minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ── Forgot Password — Step 2 ── */}
            {!showIntentScreen && accessMode === "forgot-verify" && (
              <form onSubmit={handleForgotStep2} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ font: "700 1.3rem system-ui", color: C.text, marginBottom: "4px" }}>
                  {forgotDisplayName ? `Hi, ${forgotDisplayName}!` : "Almost there!"}
                </div>
                <div style={{ background: "rgba(88,232,193,0.08)", border: "1px solid rgba(88,232,193,0.3)", borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ font: "600 0.72rem system-ui", color: C.mint, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your recovery code — save this!</div>
                  <div style={{ font: "700 1.6rem/1 system-ui", color: C.text, letterSpacing: "0.12em" }}>{forgotToken}</div>
                  <div style={{ font: "400 0.72rem system-ui", color: C.muted, marginTop: "6px" }}>This code expires in 30 minutes.</div>
                </div>
                <div style={{ font: "400 0.82rem/1.5 system-ui", color: C.muted }}>
                  To verify it is you, enter your {"child's"} 4-digit passcode and choose a new password.
                </div>
                <div>
                  <label style={labelStyle}>{"Child's"} 4-digit passcode</label>
                  <input inputMode="numeric" maxLength={4} onChange={(e) => setForgotChildPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="\u2022\u2022\u2022\u2022" style={{ ...inputStyle, fontSize: "1.4rem", letterSpacing: "6px", textAlign: "center" }} type="password" value={forgotChildPin} />
                </div>
                <div>
                  <label style={labelStyle}>New password</label>
                  <input autoComplete="new-password" onChange={(e) => setForgotNewPassword(e.target.value)} placeholder="At least 6 characters" style={inputStyle} type="password" value={forgotNewPassword} />
                </div>
                {error && (
                  <p style={{ font: "500 0.82rem system-ui", color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>{error}</p>
                )}
                <button disabled={submitting} type="submit" style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting ? "Resetting\u2026" : "Reset Password \u2192"}
                </button>
                <div style={{ textAlign: "center" }}>
                  <button type="button" onClick={() => { setAccessMode("forgot"); setError(""); setForgotToken(""); setForgotDisplayName(""); }} style={{ background: "none", border: "none", cursor: "pointer", font: "500 0.8rem system-ui", color: C.muted, fontFamily: "system-ui", minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                    ← Back
                  </button>
                </div>
              </form>
            )}

            {/* COPPA note */}
            <div style={{ marginTop: "20px", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: `1px solid ${C.border}`, font: "400 0.71rem/1.6 system-ui", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
              🔒 This portal is for parents and guardians only. We comply with COPPA and never collect data from children without parental consent.
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
