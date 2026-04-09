"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { US_STATES } from "@/lib/curriculum-frameworks";
import { SiblingSwitcher } from "@/components/sibling-switcher";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { ClassEnrollmentCard } from "@/components/class-enrollment-card";
import { GuestBanner } from "@/components/guest-banner";
import { ConvertAccountModal } from "@/components/convert-account-modal";

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

type ChildDashboard = {
  studentId: string;
  sessionCount: number;
  completedSessions: number;
  totalTimeSpentMs: number;
  effectiveTimeSpentMs: number;
  averageEffectiveness: number | null;
  completionRate: number | null;
  effectiveRatio: number | null;
  lastSessionAt: string | null;
  recommendedFocus: string;
  readinessLabel: string;
  strengths: {
    skillCode: string;
    displayName: string;
    masteryRate: number;
    attempts: number;
  }[];
  supportAreas: {
    skillCode: string;
    displayName: string;
    masteryRate: number;
    attempts: number;
  }[];
  recentSessions: {
    id: string;
    sessionMode: string;
    startedAt: string;
    endedAt: string | null;
    effectivenessScore: number | null;
    totalQuestions: number;
  }[];
};

type ParentAccessResponse = {
  guardian: {
    id: string;
    username: string;
    displayName: string;
    plan?: string;
    isGuest?: boolean;
  };
  linkedChild: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  } | null;
  linkedChildren: {
    id: string;
    username: string;
    displayName: string;
    avatarKey: string;
    launchBandCode: string;
    totalPoints: number;
    currentLevel: number;
    badgeCount: number;
    trophyCount: number;
  }[];
  childDashboards: ChildDashboard[];
  childDashboard: ChildDashboard | null;
};

type ParentAccessMode = "signin" | "register" | "forgot" | "forgot-verify";

type NameAvailability = "idle" | "checking" | "available" | "taken" | "invalid";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMinutes(ms: number) {
  return `${Math.round((ms / 60000) * 10) / 10} min`;
}

function formatPercent(value: number | null) {
  return value === null ? "n/a" : `${value}%`;
}

function formatSessionMode(value: string) {
  return value === "self-directed-challenge" ? "Self-directed" : "Guided";
}

function formatLastSeen(value: string | null) {
  if (!value) return "Not yet started";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAvatarSymbol(avatarKey: string) {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "✨";
}

function getBandColor(bandCode: string) {
  if (bandCode.startsWith("pre")) return C.mint;
  if (bandCode.startsWith("k1")) return C.violet;
  if (bandCode.startsWith("g2") || bandCode.startsWith("g3")) return C.gold;
  return C.coral;
}

function getBandLabel(bandCode: string) {
  if (bandCode.startsWith("pre")) return "Pre-K Band";
  if (bandCode.startsWith("k1")) return "K–1 Band";
  if (bandCode.startsWith("g2")) return "Grades 2–3";
  if (bandCode.startsWith("g3")) return "Grades 2–3";
  if (bandCode.startsWith("g4") || bandCode.startsWith("g5")) return "Grades 4–5";
  return bandCode;
}

function buildParentSkillAction(skillCode: string, displayName: string) {
  const label = `${skillCode} ${displayName}`.toLowerCase();
  if (label.includes("count")) return "Count a few objects together once.";
  if (label.includes("letter") || label.includes("phonics")) return "Point to one familiar letter or sound.";
  if (label.includes("shape")) return "Find the same shape in the room.";
  if (label.includes("add")) return "Use small objects and let them combine.";
  if (label.includes("read") || label.includes("word")) return "Say one target word and spot it again.";
  return `Keep practice short around ${displayName.toLowerCase()}.`;
}

function formatLastActive(lastSessionAt: string | null): string {
  if (!lastSessionAt) return "Not started";
  const diff = Date.now() - new Date(lastSessionAt).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function deriveStreakDays(recentSessions: ChildDashboard["recentSessions"]) {
  if (!recentSessions.length) return 0;
  const days = new Set(recentSessions.map((s) => new Date(s.startedAt).toDateString()));
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

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

// ─── Nav quick-links shown on authenticated dashboard ─────────────────────────

const DASHBOARD_NAV = [
  { href: "/parent/report", label: "Weekly Report", icon: "📊" },
  { href: "/parent/practice", label: "Practice Ideas", icon: "💡" },
  { href: "/parent/link-health", label: "Link Health", icon: "🔗" },
  { href: "/parent/family", label: "Family Hub", icon: "👨‍👩‍👧" },
  { href: "/parent/benchmarks", label: "How it works", icon: "ℹ️" },
  { href: "/parent/activity-log", label: "Activity Log", emoji: "📋", icon: "📋" },
  { href: "/parent/account", label: "Settings", emoji: "⚙️", icon: "⚙️" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentAccessPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [accessMode, setAccessMode] = useState<ParentAccessMode>("signin");
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
  const [showConvert, setShowConvert] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ParentAccessResponse | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [addChildForm, setAddChildForm] = useState({
    displayName: "",
    username: "",
    pin: "",
    birthYear: "",
    avatarKey: "bunny_purple",
    launchBandCode: "K1",
    coppaConsent: false,
  });
  const [addChildSubmitting, setAddChildSubmitting] = useState(false);
  const [addChildError, setAddChildError] = useState("");
  const [addChildSuccess, setAddChildSuccess] = useState("");
  const [addChildUpgradeRequired, setAddChildUpgradeRequired] = useState<{ limit: number; plan: string } | null>(null);
  const [lastCreatedChildUsername, setLastCreatedChildUsername] = useState("");
  const [lastCreatedChildDisplayName, setLastCreatedChildDisplayName] = useState("");


  // Reset PIN state
  const [resetPinFor, setResetPinFor] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const activeChildId =
    selectedChildId ??
    result?.linkedChild?.id ??
    result?.linkedChildren[0]?.id ??
    null;

  const activeChild =
    result?.linkedChildren.find((c) => c.id === activeChildId) ??
    result?.linkedChild ??
    result?.linkedChildren[0] ??
    null;

  const activeChildDashboard =
    result?.childDashboards.find((d) => d.studentId === activeChildId) ??
    result?.childDashboard ??
    null;

  const streakDays = activeChildDashboard
    ? deriveStreakDays(activeChildDashboard.recentSessions)
    : 0;

  const allSkills = activeChildDashboard
    ? [...activeChildDashboard.supportAreas, ...activeChildDashboard.strengths]
    : [];

  // Cookie-based session restore
  useEffect(() => {
    let cancelled = false;
    async function trySessionRestore() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as ParentAccessResponse;
        if (cancelled) return;
        const defaultId = payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null;
        setSelectedChildId(defaultId);
        if (defaultId) localStorage.setItem("wq_active_student_id", defaultId);
        // If landed here via middleware redirect, go back to the requested page
        const nextPath = new URLSearchParams(window.location.search).get("next");
        if (nextPath && nextPath.startsWith("/parent/")) {
          window.location.assign(nextPath);
          return;
        }
        setResult(payload);
      } catch {
        // No valid session — stay on the credential form.
      }
    }
    void trySessionRestore();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!result) return;
    const activeId = selectedChildId ?? result.linkedChild?.id ?? result.linkedChildren[0]?.id;
    const stillValid = activeId
      ? result.linkedChildren.some((c) => c.id === activeId)
      : false;
    if (!stillValid) {
      setSelectedChildId(result.linkedChild?.id ?? result.linkedChildren[0]?.id ?? null);
    }
  }, [result, selectedChildId]);

  // Switch active child: persist to DB + localStorage, then refresh dashboard data
  async function handleSwitchChild(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("wq_active_child_id", childId);
    localStorage.setItem("wq_active_student_id", childId);
    // Persist to DB (fire-and-forget — UX is already updated)
    fetch("/api/parent/account-context", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeChildId: childId }),
    }).catch(() => {/* non-critical */});
    // Re-fetch session to pull fresh dashboard data for the switched child
    try {
      const sessionRes = await fetch("/api/parent/session", { method: "GET" });
      if (sessionRes.ok) {
        const refreshed = (await sessionRes.json()) as ParentAccessResponse;
        setResult(refreshed);
      }
    } catch {/* ignore */}
  }

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
      const payload = (await response.json()) as ParentAccessResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Sign-in failed.");
      const defaultId = payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null;
      setSelectedChildId(defaultId);
      if (defaultId) localStorage.setItem("wq_active_student_id", defaultId);
      const nextPath = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
      if (nextPath && nextPath.startsWith("/parent/")) {
        window.location.assign(nextPath);
        return;
      }
      setResult(payload);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Sign-in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuestLogin() {
    setGuestLoading(true);
    const res = await fetch("/api/parent/guest", { method: "POST" });
    if (res.ok) window.location.href = "/parent";
    else setGuestLoading(false);
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
      const payload = (await response.json()) as ParentAccessResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Registration failed.");
      const defaultId = payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null;
      setSelectedChildId(defaultId);
      if (defaultId) localStorage.setItem("wq_active_student_id", defaultId);
      const nextPath = typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
      if (nextPath && nextPath.startsWith("/parent/")) {
        window.location.assign(nextPath);
        return;
      }
      setResult(payload);
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

  function suggestBandFromBirthYear(year: string): string {
    const birthYear = parseInt(year, 10);
    if (!birthYear || birthYear < 1900) return "K1";
    const age = 2026 - birthYear;
    if (age <= 5) return "PREK";
    if (age <= 7) return "K1";
    if (age <= 9) return "G23";
    return "G45";
  }

  async function handleAddChild(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddChildSubmitting(true);
    setAddChildError("");
    setAddChildSuccess("");
    try {
      const response = await fetch("/api/parent/create-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: addChildForm.displayName,
          username: addChildForm.username,
          pin: addChildForm.pin,
          avatarKey: addChildForm.avatarKey,
          launchBandCode: addChildForm.launchBandCode,
          birthYear: addChildForm.birthYear ? parseInt(addChildForm.birthYear, 10) : undefined,
          coppaConsent: addChildForm.coppaConsent,
        }),
      });
      const payload = (await response.json()) as { success?: boolean; child?: { displayName: string }; error?: string; limit?: number; plan?: string };
      if (response.status === 403 && payload.error === "upgrade_required") {
        setAddChildUpgradeRequired({ limit: payload.limit ?? 1, plan: payload.plan ?? "free" });
        return;
      }
      if (!response.ok) throw new Error(payload.error ?? "Could not create child account.");
      setLastCreatedChildUsername(addChildForm.username);
      setLastCreatedChildDisplayName(addChildForm.displayName || payload.child?.displayName || "your child");
      setAddChildSuccess(`${payload.child?.displayName ?? "Child"} account created! They can now sign in.`);
      setAddChildForm({ displayName: "", username: "", pin: "", birthYear: "", avatarKey: "bunny_purple", launchBandCode: "K1", coppaConsent: false });
      // Refresh dashboard data
      const sessionRes = await fetch("/api/parent/session", { method: "GET" });
      if (sessionRes.ok) {
        const refreshed = (await sessionRes.json()) as ParentAccessResponse;
        setResult(refreshed);
      }
    } catch (caughtError) {
      setAddChildError(caughtError instanceof Error ? caughtError.message : "Could not create child account.");
    } finally {
      setAddChildSubmitting(false);
    }
  }

  async function handleResetPin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!resetPinFor) return;
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setResetError("PIN must be exactly 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setResetError("PINs do not match.");
      return;
    }
    setResetSubmitting(true);
    setResetError("");
    try {
      const response = await fetch("/api/parent/reset-child-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: resetPinFor, newPin }),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "PIN reset failed.");
      setResetSuccess(true);
      setTimeout(() => {
        setResetPinFor(null);
        setNewPin("");
        setConfirmPin("");
        setResetSuccess(false);
      }, 2000);
    } catch (caughtError) {
      setResetError(caughtError instanceof Error ? caughtError.message : "PIN reset failed.");
    } finally {
      setResetSubmitting(false);
    }
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
  // UNAUTHENTICATED — 2-col hero sign-in
  // ─────────────────────────────────────────────────────────────────────────────

  if (!result) {
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
                  font: "700 2.6rem/1.15 system-ui",
                  color: C.text,
                  maxWidth: "460px",
                  margin: 0,
                }}
              >
                Welcome to{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #9b72ff, #58e8c1)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Family Hub
                </span>
              </h1>

              <p
                style={{
                  font: "400 1.05rem/1.7 system-ui",
                  color: C.muted,
                  maxWidth: "420px",
                  margin: 0,
                }}
              >
                Track your child&apos;s learning progress, get weekly insights, and stay connected to their classroom.
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

              {/* ── Tab bar (Sign In / Create Account) ── */}
              {(accessMode === "signin" || accessMode === "register") && (
                <>
                  <div style={{ font: "700 1.5rem system-ui", color: C.text, marginBottom: "20px" }}>
                    {accessMode === "signin" ? "Welcome back" : "Create your account"}
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
                        {tab === "signin" ? "Sign In" : "Create Account"}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── Sign In form ── */}
              {accessMode === "signin" && (
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
              {accessMode === "register" && (
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
                  <div>
                    <label style={labelStyle}>State <span style={{ font: "400 0.7rem system-ui", color: C.muted }}>(optional)</span></label>
                    <select
                      value={regStateCode}
                      onChange={(e) => setRegStateCode(e.target.value)}
                      style={{ ...inputStyle, background: "rgba(255,255,255,0.05)", color: "#f0f6ff" }}
                    >
                      <option value="">Select your state…</option>
                      {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>School name <span style={{ font: "400 0.7rem system-ui", color: C.muted }}>(optional)</span></label>
                      <input onChange={(e) => setRegSchoolName(e.target.value)} placeholder="e.g. Lincoln Elementary" style={inputStyle} type="text" value={regSchoolName} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>ISD / District <span style={{ font: "400 0.7rem system-ui", color: C.muted }}>(optional)</span></label>
                      <input onChange={(e) => setRegIsdName(e.target.value)} placeholder="e.g. Austin ISD" style={inputStyle} type="text" value={regIsdName} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{"Child's quest name "}<span style={{ font: "400 0.7rem system-ui", color: C.muted }}>(optional \u2014 letters &amp; numbers only)</span></label>
                    <input
                      onChange={(e) => handleChildNameChange(e.target.value)}
                      placeholder="e.g. stargazer42"
                      style={{
                        ...inputStyle,
                        borderColor: regChildNameAvailability === "available"
                          ? "rgba(88,232,193,0.6)"
                          : regChildNameAvailability === "taken" || regChildNameAvailability === "invalid"
                            ? "rgba(255,123,107,0.6)"
                            : "rgba(155,114,255,0.3)",
                      }}
                      type="text"
                      value={regChildName}
                    />
                    {regChildNameAvailability === "checking" && (
                      <div style={{ font: "500 0.75rem system-ui", marginTop: 4, color: C.muted }}>Checking…</div>
                    )}
                    {regChildNameMessage && regChildNameAvailability !== "checking" && (
                      <div style={{ font: "500 0.75rem system-ui", marginTop: 4, color: regChildNameAvailability === "available" ? C.mint : "#ff7b6b" }}>
                        {regChildNameMessage}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { key: "weekly", label: "Weekly summaries", sub: "Time, insights, and next focus.", val: notifyWeekly, toggle: () => setNotifyWeekly((v) => !v) },
                      { key: "milestones", label: "Milestones", sub: "Badges, trophies, and level moments.", val: notifyMilestones, toggle: () => setNotifyMilestones((v) => !v) },
                    ].map((item) => (
                      <button key={item.key} onClick={item.toggle} type="button" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderRadius: "10px", cursor: "pointer", border: `1.5px solid ${item.val ? "rgba(155,114,255,0.3)" : C.border}`, background: item.val ? "rgba(155,114,255,0.1)" : C.surface, textAlign: "left", fontFamily: "system-ui", minHeight: 44, touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                        <div>
                          <div style={{ font: "600 0.82rem system-ui", color: C.text }}>{item.label}</div>
                          <div style={{ font: "400 0.7rem system-ui", color: C.muted }}>{item.sub}</div>
                        </div>
                        <span style={{ font: "700 0.72rem system-ui", color: item.val ? C.violet : C.muted, background: item.val ? "rgba(155,114,255,0.15)" : "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "10px" }}>
                          {item.val ? "On" : "Off"}
                        </span>
                      </button>
                    ))}
                  </div>

                  {error && (
                    <p style={{ font: "500 0.82rem system-ui", color: "#ff6b6b", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", borderRadius: "8px", padding: "10px 14px", margin: 0 }}>
                      {error}
                    </p>
                  )}

                  <button disabled={submitting} type="submit" style={{ ...primaryBtnStyle, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer", marginTop: "4px" }}>
                    {submitting ? "Creating account\u2026" : "Create Account \u2192"}
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

              {/* ── Forgot Password \u2014 Step 1 ── */}
              {accessMode === "forgot" && (
                <form onSubmit={handleForgotStep1} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ font: "700 1.3rem system-ui", color: C.text, marginBottom: "8px" }}>Reset your password</div>
                  <div style={{ font: "400 0.82rem/1.5 system-ui", color: C.muted, marginBottom: "6px" }}>
                    Enter your email or username. We will give you a recovery code to use right here \u2014 no email needed.
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

              {/* ── Forgot Password \u2014 Step 2 ── */}
              {accessMode === "forgot-verify" && (
                <form onSubmit={handleForgotStep2} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ font: "700 1.3rem system-ui", color: C.text, marginBottom: "4px" }}>
                    {forgotDisplayName ? `Hi, ${forgotDisplayName}!` : "Almost there!"}
                  </div>
                  <div style={{ background: "rgba(88,232,193,0.08)", border: "1px solid rgba(88,232,193,0.3)", borderRadius: "12px", padding: "14px 16px" }}>
                    <div style={{ font: "600 0.72rem system-ui", color: C.mint, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Your recovery code \u2014 save this!</div>
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

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────

  const childName = activeChild?.displayName ?? "your child";
  const isFirstTimer = (activeChildDashboard?.completedSessions ?? 0) === 0;

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #13103a 0%, #0e0b26 100%)",
          fontFamily: "system-ui",
          paddingBottom: "env(safe-area-inset-bottom, 80px)",
        }}
      >
        {result.guardian.isGuest && <GuestBanner onConvert={() => setShowConvert(true)} />}
        <ConvertAccountModal
          open={showConvert}
          onClose={() => setShowConvert(false)}
          onSuccess={() => { setShowConvert(false); window.location.reload(); }}
        />
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 80px", fontFamily: "system-ui" }}>

          {/* ── Welcome header ──────────────────────────────────────────────── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
              {greeting()} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.text, margin: 0 }}>
                Hello, {result.guardian.displayName} 👋
              </h1>
              {(!result.guardian.plan || result.guardian.plan === "free") && (
                <Link
                  href="/parent/account#upgrade"
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    background: "rgba(255,209,102,0.12)",
                    border: "1.5px solid rgba(255,209,102,0.4)",
                    font: "700 0.7rem system-ui",
                    color: "#ffd166",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Free Plan · Upgrade
                </Link>
              )}
            </div>
          </div>

          {/* ── Sibling Switcher (multi-child only) ───────────────────────── */}
          {result.linkedChildren.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Your children
              </div>
              <SiblingSwitcher
                children={result.linkedChildren}
                activeChildId={activeChildId ?? ""}
                onSwitch={handleSwitchChild}
              />
            </div>
          )}

          {/* ── Child hero card ─────────────────────────────────────────────── */}
          {activeChild && (
            <div style={{
              background: "linear-gradient(135deg, rgba(155,114,255,0.16) 0%, rgba(88,232,193,0.08) 100%)",
              borderRadius: 20,
              padding: "22px 24px",
              border: "1px solid rgba(155,114,255,0.25)",
              marginBottom: 20,
            }}>
              <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
                {/* Avatar + name */}
                <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1, minWidth: 200 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(155,114,255,0.35), rgba(88,232,193,0.25))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.8rem", flexShrink: 0,
                    border: "2px solid rgba(155,114,255,0.4)",
                    boxShadow: "0 4px 16px rgba(155,114,255,0.25)",
                  }}>
                    {getAvatarSymbol(activeChild.avatarKey)}
                  </div>
                  <div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: C.text }}>{activeChild.displayName}</div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4,
                      padding: "3px 10px", borderRadius: 999,
                      background: "rgba(155,114,255,0.15)",
                      border: `1.5px solid ${getBandColor(activeChild.launchBandCode)}`,
                      fontSize: 11, fontWeight: 700, color: "rgba(215,195,255,0.95)",
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: getBandColor(activeChild.launchBandCode), flexShrink: 0 }} />
                      {getBandLabel(activeChild.launchBandCode)} · Level {activeChild.currentLevel}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      Last active: {formatLastActive(activeChildDashboard?.lastSessionAt ?? null)}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                  {[
                    { icon: "⭐", val: activeChild.totalPoints, label: "Stars" },
                    { icon: "📚", val: activeChildDashboard?.completedSessions ?? 0, label: "Sessions" },
                    { icon: "🔥", val: streakDays, label: "Streak" },
                    { icon: "🏅", val: activeChild.badgeCount, label: "Badges" },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center", minWidth: 48 }}>
                      <div style={{ fontSize: "1.3rem", fontWeight: 900, color: C.text }}>{s.icon} {s.val}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Primary CTA */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <Link href="/parent/report" style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "10px 18px", borderRadius: 10,
                    background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                    color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}>
                    📊 Full Report →
                  </Link>
                  <button type="button"
                    onClick={() => {
                      if (resetPinFor === activeChild?.id) {
                        setResetPinFor(null); setNewPin(""); setConfirmPin(""); setResetError(""); setResetSuccess(false);
                      } else {
                        setResetPinFor(activeChild?.id ?? null); setNewPin(""); setConfirmPin(""); setResetError(""); setResetSuccess(false);
                      }
                    }}
                    style={{
                      padding: "8px 18px", borderRadius: 10, cursor: "pointer",
                      background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
                      color: C.muted, fontSize: 12, fontWeight: 600, fontFamily: "system-ui",
                      whiteSpace: "nowrap",
                    }}>
                    🔑 Reset PIN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Reset PIN inline form ──────────────────────────────────────── */}
          {resetPinFor && activeChild && resetPinFor === activeChild.id && (
            <div style={{
              background: "rgba(155,114,255,0.07)", borderRadius: 16,
              padding: "18px 22px", border: "1px solid rgba(155,114,255,0.2)", marginBottom: 20,
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>
                Reset PIN for {activeChild.displayName}
              </div>
              {resetSuccess ? (
                <div style={{ fontSize: 14, fontWeight: 600, color: C.mint }}>PIN updated ✓</div>
              ) : (
                <form onSubmit={handleResetPin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 140px" }}>
                      <label style={labelStyle}>New PIN</label>
                      <input type="password" inputMode="numeric" maxLength={4} placeholder="4 digits" value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))} required style={inputStyle} />
                    </div>
                    <div style={{ flex: "1 1 140px" }}>
                      <label style={labelStyle}>Confirm PIN</label>
                      <input type="password" inputMode="numeric" maxLength={4} placeholder="4 digits" value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))} required style={inputStyle} />
                    </div>
                  </div>
                  {resetError && <p style={{ fontSize: 13, color: C.coral, margin: 0 }}>{resetError}</p>}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" disabled={resetSubmitting} style={{
                      padding: "10px 22px", background: "linear-gradient(135deg, #9b72ff, #5a30d0)", color: "#fff",
                      border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: resetSubmitting ? "not-allowed" : "pointer",
                      opacity: resetSubmitting ? 0.7 : 1, minHeight: 44, fontFamily: "system-ui",
                    }}>{resetSubmitting ? "Saving…" : "Save"}</button>
                    <button type="button" onClick={() => { setResetPinFor(null); setNewPin(""); setConfirmPin(""); setResetError(""); }}
                      style={{ padding: "10px 18px", background: "rgba(255,255,255,0.05)", color: C.muted, border: "1.5px solid rgba(255,255,255,0.10)", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 44, fontFamily: "system-ui" }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── First-timer: Getting Started guide ─────────────────────────── */}
          {isFirstTimer && activeChild && (
            <div style={{
              background: "linear-gradient(135deg, rgba(88,232,193,0.10) 0%, rgba(155,114,255,0.08) 100%)",
              border: "1.5px solid rgba(88,232,193,0.25)",
              borderRadius: 18, padding: "22px 24px", marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.mint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Getting Started
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: C.text, marginBottom: 16 }}>
                {activeChild.displayName} hasn&apos;t played yet — here&apos;s how it works
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { step: "1", icon: "🎮", title: "Child plays a quest", body: `Give ${activeChild.displayName} their username and PIN. They log in at the Child portal and start a quest.` },
                  { step: "2", icon: "📊", title: "You see progress here", body: "After each session, skill scores, stars, and activity appear on this dashboard — updated in real time." },
                  { step: "3", icon: "🎯", title: "Push learning goals", body: "Use Learning Plan to suggest specific skills. The AI adapts questions to your child's current level." },
                ].map((item) => (
                  <div key={item.step} style={{
                    flex: "1 1 180px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 14, padding: "14px 16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: "rgba(88,232,193,0.2)", border: "1.5px solid rgba(88,232,193,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 900, color: C.mint, flexShrink: 0,
                      }}>{item.step}</div>
                      <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.title}</span>
                    </div>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>{item.body}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/child" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 10,
                  background: "rgba(88,232,193,0.18)", border: "1.5px solid rgba(88,232,193,0.35)",
                  color: C.mint, textDecoration: "none", fontSize: 13, fontWeight: 700,
                }}>
                  🎮 Go to Child Portal →
                </Link>
                <Link href="/parent/benchmarks" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "9px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.12)",
                  color: C.muted, textDecoration: "none", fontSize: 13, fontWeight: 600,
                }}>
                  ℹ️ How scoring works →
                </Link>
              </div>
            </div>
          )}

          {/* ── Stat tiles ─────────────────────────────────────────────────── */}
          {activeChildDashboard && !isFirstTimer && (
            <div className="stat-grid-4" style={{ marginBottom: 20 }}>
              {[
                { icon: "⭐", val: activeChild?.totalPoints ?? 0, label: "Stars earned", sub: `Level ${activeChild?.currentLevel ?? 1}`, bg: "rgba(255,209,102,0.08)", border: "rgba(255,209,102,0.25)", color: C.gold },
                { icon: "📚", val: activeChildDashboard.completedSessions, label: "Sessions done", sub: formatMinutes(activeChildDashboard.totalTimeSpentMs) + " total", bg: "rgba(155,114,255,0.08)", border: "rgba(155,114,255,0.25)", color: C.violet },
                { icon: "⏱", val: formatMinutes(activeChildDashboard.effectiveTimeSpentMs), label: "Focused time", sub: formatPercent(activeChildDashboard.averageEffectiveness) + " engagement", bg: "rgba(88,232,193,0.07)", border: "rgba(88,232,193,0.22)", color: C.mint },
                { icon: "🏅", val: activeChild?.badgeCount ?? 0, label: "Badges earned", sub: `${activeChild?.trophyCount ?? 0} trophies`, bg: "rgba(255,123,107,0.08)", border: "rgba(255,123,107,0.22)", color: C.coral },
              ].map((tile) => (
                <div key={tile.label} style={{
                  background: tile.bg, borderRadius: 16, padding: "18px 20px",
                  border: `1px solid ${tile.border}`,
                  borderLeft: `3px solid ${tile.color}`,
                }}>
                  <div style={{ fontSize: "1.1rem", marginBottom: 8 }}>{tile.icon}</div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 900, color: C.text }}>{tile.val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{tile.label}</div>
                  <div style={{ fontSize: 11, color: tile.color, fontWeight: 600, marginTop: 5 }}>{tile.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Learning Plan CTA ──────────────────────────────────────────── */}
          {activeChild && !isFirstTimer && (
            <Link href="/parent/suggestions" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(155,114,255,0.16), rgba(88,232,193,0.09))",
                border: "1px solid rgba(155,114,255,0.3)",
                borderRadius: 18, padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 16,
                boxShadow: "0 4px 20px rgba(100,60,200,0.12)",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "linear-gradient(135deg, #9b72ff, #58e8c1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem", flexShrink: 0,
                }}>🎯</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: C.text, marginBottom: 3 }}>Learning Plan</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                    Recommended skills and push-to-play sessions for {activeChild.displayName}
                  </div>
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: C.violet,
                  padding: "7px 14px", background: "rgba(155,114,255,0.15)",
                  borderRadius: 10, border: "1px solid rgba(155,114,255,0.25)", flexShrink: 0,
                }}>
                  View Plan →
                </div>
              </div>
            </Link>
          )}

          {/* ── 2-col: skills + activity ───────────────────────────────────── */}
          {activeChildDashboard && !isFirstTimer && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
              {/* Skills panel */}
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.10)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Skills snapshot</span>
                  <Link href="/parent/report" style={{ fontSize: 12, color: C.violet, textDecoration: "none" }}>See all →</Link>
                </div>
                {allSkills.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {allSkills.slice(0, 5).map((skill) => {
                      const pct = Math.min(100, Math.round(skill.masteryRate));
                      const barColor = pct >= 75 ? C.mint : pct >= 50 ? C.violet : C.gold;
                      return (
                        <div key={skill.skillCode}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>
                              {skill.displayName}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: barColor, flexShrink: 0 }}>{pct}%</span>
                          </div>
                          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 3, transition: "width 0.5s" }} />
                          </div>
                        </div>
                      );
                    })}
                    {activeChildDashboard.supportAreas[0] && (
                      <div style={{
                        marginTop: 8, padding: "10px 12px",
                        background: "rgba(88,232,193,0.08)", borderRadius: 8,
                        border: "1px solid rgba(88,232,193,0.18)",
                        fontSize: 12, color: C.mint, lineHeight: 1.5,
                      }}>
                        💡 {buildParentSkillAction(activeChildDashboard.supportAreas[0].skillCode, activeChildDashboard.supportAreas[0].displayName)}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Skills appear after a few sessions.</p>
                )}
              </div>

              {/* Recent activity panel */}
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.10)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Recent sessions</div>
                {activeChildDashboard.recentSessions.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {activeChildDashboard.recentSessions.slice(0, 5).map((session, i) => {
                      const score = session.effectivenessScore;
                      const dotColor = score && score >= 75 ? C.mint : score && score >= 50 ? C.gold : C.coral;
                      return (
                        <div key={session.id} style={{
                          display: "flex", gap: 12, padding: "10px 0",
                          borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.07)" : "none",
                        }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: dotColor, flexShrink: 0, marginTop: 4 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
                              <strong style={{ color: C.text }}>{childName}</strong> · {formatSessionMode(session.sessionMode).toLowerCase()} session
                              {score !== null ? <span style={{ color: dotColor, fontWeight: 700 }}> · {score}%</span> : ""}
                            </div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                              {formatLastSeen(session.startedAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <Link href="/parent/quiz-review" style={{ display: "inline-block", marginTop: 10, fontSize: 12, color: C.violet, textDecoration: "none" }}>
                      View full quiz review →
                    </Link>
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Activity appears after the first lesson.</p>
                )}
              </div>
            </div>
          )}

          {/* ── Class enrollment ─────────────────────────────────────────────── */}
          {activeChild && (
            <div style={{ marginBottom: 20, maxWidth: 480 }}>
              <ClassEnrollmentCard
                studentId={activeChild.id}
                studentName={activeChild.displayName}
              />
            </div>
          )}

          {/* ── Feature navigation cards ────────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Tools &amp; Reports
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { href: "/parent/report",            icon: "📊", title: "Weekly Report",    desc: "Sessions, skills, and time breakdown.",       color: C.violet },
                { href: "/parent/quiz-review",        icon: "🔍", title: "Quiz Review",      desc: "Question-by-question session replay.",         color: C.mint },
                { href: "/parent/suggestions",        icon: "🎯", title: "Learning Plan",    desc: "AI-recommended skills and push sessions.",    color: C.gold },
                { href: "/parent/practice-planner",   icon: "📅", title: "Practice Planner", desc: "Schedule weekly learning goals.",              color: C.coral },
                { href: "/parent/family",             icon: "👧", title: "Children",         desc: "Manage profiles, bands, and accounts.",       color: C.violet },
                { href: "/parent/benchmarks",         icon: "ℹ️", title: "How It Works",     desc: "Bands, mastery scores, and stars explained.", color: C.mint },
              ].map((card) => (
                <Link key={card.href} href={card.href} style={{
                  display: "block", padding: "16px 18px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 14, border: "1px solid rgba(255,255,255,0.09)",
                  textDecoration: "none",
                  borderTop: `3px solid ${card.color}40`,
                  transition: "background 0.15s",
                }}>
                  <div style={{ fontSize: "1.3rem", marginBottom: 8 }}>{card.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: card.color, marginBottom: 3 }}>{card.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{card.desc}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Add a child ───────────────────────────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            {!showAddChild ? (
              <button
                type="button"
                onClick={() => { setShowAddChild(true); setAddChildError(""); setAddChildSuccess(""); }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1.5px solid rgba(155,114,255,0.35)",
                  background: "rgba(155,114,255,0.07)",
                  color: "rgba(195,170,255,0.85)",
                  fontSize: 13, fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                }}
              >
                + Add a child
              </button>
            ) : (
              <div
                style={{
                  background: "rgba(155,114,255,0.07)",
                  border: "1.5px solid rgba(155,114,255,0.3)",
                  borderRadius: "16px",
                  padding: "24px",
                  maxWidth: "560px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                  <span style={{ font: "700 1rem system-ui", color: C.text }}>Add a child account</span>
                  <button
                    type="button"
                    onClick={() => { setShowAddChild(false); setAddChildError(""); setAddChildSuccess(""); }}
                    style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "1.1rem", fontFamily: "system-ui" }}
                  >
                    ✕
                  </button>
                </div>

                {addChildSuccess ? (
                  <div style={{ background: "rgba(88,232,193,0.08)", border: "1px solid rgba(88,232,193,0.25)", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#58e8c1", marginBottom: 8 }}>
                      ✅ {addChildSuccess}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                      <strong style={{ color: "rgba(255,255,255,0.8)" }}>Share these with {lastCreatedChildDisplayName}:</strong><br />
                      Username: <code style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 6px", color: "#f0f6ff" }}>{lastCreatedChildUsername}</code><br />
                      PIN: <code style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "1px 6px", color: "#f0f6ff" }}>****</code> (the 4 digits you chose)
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                      💡 They can sign in at the Child Portal with this username and PIN.
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowAddChild(false); setAddChildSuccess(""); }}
                      style={{ display: "block", marginTop: "12px", background: "none", border: "none", color: "rgba(88,232,193,0.7)", cursor: "pointer", font: "500 0.8rem system-ui", fontFamily: "system-ui", padding: 0 }}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddChild} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", font: "600 0.78rem system-ui", color: "rgba(255,255,255,0.6)", marginBottom: "6px", fontFamily: "system-ui" }}>
                        Display name
                      </label>
                      <input
                        required
                        placeholder="e.g. Maya"
                        value={addChildForm.displayName}
                        onChange={(e) => setAddChildForm((f) => ({ ...f, displayName: e.target.value }))}
                        style={inputStyle}
                        type="text"
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", font: "600 0.78rem system-ui", color: "rgba(255,255,255,0.6)", marginBottom: "6px", fontFamily: "system-ui" }}>
                        Username (child uses this to sign in)
                      </label>
                      <input
                        required
                        placeholder="e.g. maya2024"
                        value={addChildForm.username}
                        onChange={(e) => setAddChildForm((f) => ({ ...f, username: e.target.value }))}
                        style={inputStyle}
                        type="text"
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", font: "600 0.78rem system-ui", color: "rgba(255,255,255,0.6)", marginBottom: "6px", fontFamily: "system-ui" }}>
                        4-digit PIN
                      </label>
                      <input
                        required
                        placeholder="e.g. 1234"
                        maxLength={4}
                        value={addChildForm.pin}
                        onChange={(e) => setAddChildForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        style={inputStyle}
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", font: "600 0.78rem system-ui", color: "rgba(255,255,255,0.6)", marginBottom: "6px", fontFamily: "system-ui" }}>
                        Birth year (optional — helps suggest the right band)
                      </label>
                      <input
                        placeholder="e.g. 2018"
                        value={addChildForm.birthYear}
                        onChange={(e) => {
                          const yr = e.target.value;
                          const suggested = yr ? suggestBandFromBirthYear(yr) : addChildForm.launchBandCode;
                          setAddChildForm((f) => ({ ...f, birthYear: yr, launchBandCode: suggested }));
                        }}
                        style={inputStyle}
                        type="number"
                        min={2010}
                        max={2025}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                          Learning Band
                        </label>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                          💡 Enter birth year above to auto-select
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {[
                          { code: "PREK", label: "🐣 Pre-K", sub: "Ages 2–5" },
                          { code: "K1", label: "⚽ K–Grade 1", sub: "Ages 5–7" },
                          { code: "G23", label: "🚀 Grades 2–3", sub: "Ages 7–9" },
                          { code: "G45", label: "🏗️ Grades 4–5", sub: "Ages 9–11" },
                        ].map((band) => (
                          <button
                            key={band.code}
                            type="button"
                            onClick={() => setAddChildForm((f) => ({ ...f, launchBandCode: band.code }))}
                            style={{
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border: `1.5px solid ${addChildForm.launchBandCode === band.code ? "#9b72ff" : "rgba(255,255,255,0.1)"}`,
                              background: addChildForm.launchBandCode === band.code ? "rgba(155,114,255,0.15)" : "rgba(255,255,255,0.03)",
                              color: addChildForm.launchBandCode === band.code ? "#c4a0ff" : C.muted,
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily: "system-ui",
                            }}
                          >
                            <div style={{ font: "600 0.82rem system-ui" }}>{band.label}</div>
                            <div style={{ font: "400 0.7rem system-ui", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{band.sub}</div>
                          </button>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                        Not sure? Choose by age — you can change this anytime in Settings.
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", font: "600 0.78rem system-ui", color: "rgba(255,255,255,0.6)", marginBottom: "8px", fontFamily: "system-ui" }}>
                        Avatar
                      </label>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {[
                          { key: "bunny_purple", emoji: "🐰", label: "Bunny" },
                          { key: "bear_blue", emoji: "🐻", label: "Bear" },
                          { key: "lion_gold", emoji: "🦁", label: "Lion" },
                          { key: "fox_orange", emoji: "🦊", label: "Fox" },
                          { key: "panda_white", emoji: "🐼", label: "Panda" },
                          { key: "owl_teal", emoji: "🦉", label: "Owl" },
                        ].map((av) => (
                          <button
                            key={av.key}
                            type="button"
                            onClick={() => setAddChildForm((f) => ({ ...f, avatarKey: av.key }))}
                            style={{
                              padding: "10px 12px",
                              borderRadius: "10px",
                              border: `1.5px solid ${addChildForm.avatarKey === av.key ? "#ffd166" : "rgba(255,255,255,0.1)"}`,
                              background: addChildForm.avatarKey === av.key ? "rgba(255,209,102,0.12)" : "rgba(255,255,255,0.03)",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                              fontFamily: "system-ui",
                            }}
                          >
                            <span style={{ fontSize: "1.4rem" }}>{av.emoji}</span>
                            <span style={{ font: "600 0.68rem system-ui", color: addChildForm.avatarKey === av.key ? "#ffd166" : C.muted }}>{av.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {addChildUpgradeRequired && (
                      <UpgradePrompt reason="child_limit" limit={addChildUpgradeRequired.limit} />
                    )}

                    {addChildError && !addChildUpgradeRequired && (
                      <p
                        style={{
                          font: "500 0.82rem system-ui",
                          color: "#ff6b6b",
                          background: "rgba(255,107,107,0.1)",
                          border: "1px solid rgba(255,107,107,0.25)",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          margin: 0,
                        }}
                      >
                        {addChildError}
                      </p>
                    )}

                    {/* COPPA Consent */}
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginTop: 8 }}>
                      <input
                        type="checkbox"
                        checked={addChildForm.coppaConsent}
                        onChange={(e) => setAddChildForm((prev) => ({ ...prev, coppaConsent: e.target.checked }))}
                        style={{ marginTop: 3, accentColor: "#9b72ff", width: 16, height: 16, flexShrink: 0 }}
                      />
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                        I confirm that I am the parent or legal guardian of this child. I give WonderQuest Learning permission to create an educational account and collect educational data as described in the{" "}
                        <a href="/privacy" style={{ color: "#9b72ff" }}>Privacy Policy</a>
                        {" "}on behalf of my child. (Required by COPPA)
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={addChildSubmitting || !addChildForm.coppaConsent}
                      style={{
                        ...primaryBtnStyle,
                        opacity: addChildSubmitting || !addChildForm.coppaConsent ? 0.7 : 1,
                        cursor: addChildSubmitting || !addChildForm.coppaConsent ? "not-allowed" : "pointer",
                      }}
                    >
                      {addChildSubmitting ? "Creating…" : "Create child account"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>


        </div>
      </div>
    </AppFrame>
  );
}
