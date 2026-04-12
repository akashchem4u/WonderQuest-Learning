"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
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
  if (avatarKey.includes("cat")) return "🐱";
  if (avatarKey.includes("dog")) return "🐶";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("owl")) return "🦉";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("tiger")) return "🐯";
  if (avatarKey.includes("unicorn")) return "🦄";
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

function suggestBandFromBirthYear(year: string): string {
  const birthYear = parseInt(year, 10);
  if (!birthYear || birthYear < 1900) return "K1";
  const age = 2026 - birthYear;
  if (age <= 5) return "PREK";
  if (age <= 7) return "K1";
  if (age <= 9) return "G23";
  return "G45";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParentDashboardPage() {
  const router = useRouter();

  const [result, setResult] = useState<ParentAccessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showConvert, setShowConvert] = useState(false);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showBandPicker, setShowBandPicker] = useState(false);
  const [bandUpdating, setBandUpdating] = useState(false);

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

  const [suggestedSession, setSuggestedSession] = useState<{
    skillCode: string;
    skillName: string;
    reason: string;
    subject: string;
    masteryScore: number;
    status: string;
  } | null>(null);

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

  // On mount: fetch session, redirect to /parent if no session
  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });
        if (!response.ok || cancelled) {
          if (!cancelled) router.replace("/parent");
          return;
        }
        const payload = (await response.json()) as ParentAccessResponse;
        if (cancelled) return;
        const defaultId = payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null;
        setSelectedChildId(defaultId);
        if (defaultId) localStorage.setItem("wq_active_student_id", defaultId);
        setResult(payload);
      } catch {
        if (!cancelled) router.replace("/parent");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadSession();
    return () => { cancelled = true; };
  }, [router]);

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

  // Switch active child
  async function handleSwitchChild(childId: string) {
    setSelectedChildId(childId);
    localStorage.setItem("wq_active_child_id", childId);
    localStorage.setItem("wq_active_student_id", childId);
    fetch("/api/parent/account-context", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeChildId: childId }),
    }).catch(() => {/* non-critical */});
    try {
      const sessionRes = await fetch("/api/parent/session", { method: "GET" });
      if (sessionRes.ok) {
        const refreshed = (await sessionRes.json()) as ParentAccessResponse;
        setResult(refreshed);
      }
    } catch {/* ignore */}
  }

  // Fetch top suggested session for active child
  useEffect(() => {
    if (!activeChild?.id) return;
    setSuggestedSession(null);
    fetch(`/api/parent/suggested-sessions?studentId=${activeChild.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { recommendations?: Array<{ skillCode: string; skillName: string; reason: string; subject: string; masteryScore: number; status: string }> } | null) => {
        if (data?.recommendations?.[0]) setSuggestedSession(data.recommendations[0]);
      })
      .catch(() => {/* non-critical */});
  }, [activeChild?.id]);

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

  if (loading) {
    return (
      <AppFrame audience="parent" currentPath="/parent">
        <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #13103a 0%, #0e0b26 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", fontSize: 14 }}>Loading…</span>
        </div>
      </AppFrame>
    );
  }

  if (!result) return null;

  // ─────────────────────────────────────────────────────────────────────────────
  // AUTHENTICATED DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────────

  const childName = activeChild?.displayName ?? "your child";
  const isFirstTimer = (activeChildDashboard?.completedSessions ?? 0) === 0;
  const todaySessions = (activeChildDashboard?.recentSessions ?? []).filter(
    (s) => new Date(s.startedAt).toDateString() === new Date().toDateString()
  );
  const todayCompleted = todaySessions.filter((s) => s.endedAt !== null).length;
  const todayAvgScore = todaySessions.length > 0
    ? Math.round(todaySessions.reduce((sum, s) => sum + (s.effectivenessScore ?? 0), 0) / todaySessions.length)
    : null;

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
          <style>{`
            @media (max-width: 600px) {
              .parent-dashboard-inner { padding: 16px 14px 80px !important; }
              .stat-grid-4 { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
              .parent-login-grid { grid-template-columns: 1fr !important; padding: 24px 16px 48px !important; }
              .parent-skills-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        {result.guardian.isGuest && (
          <GuestBanner
            onConvert={() => setShowConvert(true)}
            sessionCount={activeChildDashboard?.completedSessions ?? 0}
          />
        )}
        <ConvertAccountModal
          open={showConvert}
          onClose={() => setShowConvert(false)}
          onSuccess={() => { setShowConvert(false); window.location.reload(); }}
          sessionCount={activeChildDashboard?.completedSessions ?? 0}
        />
        <div className="parent-dashboard-inner" style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 80px", fontFamily: "system-ui" }}>

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
                    <button
                      onClick={() => setShowBandPicker(v => !v)}
                      title="Change grade level"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 5, marginTop: 4,
                        padding: "3px 10px", borderRadius: 999,
                        background: "rgba(155,114,255,0.15)",
                        border: `1.5px solid ${getBandColor(activeChild.launchBandCode)}`,
                        fontSize: 11, fontWeight: 700, color: "rgba(215,195,255,0.95)",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: getBandColor(activeChild.launchBandCode), flexShrink: 0 }} />
                      {getBandLabel(activeChild.launchBandCode)} · Level {activeChild.currentLevel}
                      <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>✎</span>
                    </button>
                    {showBandPicker && (
                      <div style={{
                        display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8,
                        padding: "10px 12px", borderRadius: 12,
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
                      }}>
                        {([
                          { code: "PREK", label: "🐣 Pre-K", sub: "Ages 4–5" },
                          { code: "K1",   label: "⚽ K–1",   sub: "Ages 5–7" },
                          { code: "G23",  label: "🚀 Gr 2–3", sub: "Ages 7–9" },
                          { code: "G45",  label: "🏗️ Gr 4–5", sub: "Ages 9–11" },
                        ] as const).map(b => (
                          <button
                            key={b.code}
                            disabled={bandUpdating || b.code === activeChild.launchBandCode}
                            onClick={async () => {
                              setBandUpdating(true);
                              const res = await fetch("/api/parent/update-child-band", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ childId: activeChild.id, launchBandCode: b.code }),
                              });
                              if (res.ok) window.location.reload();
                              else setBandUpdating(false);
                            }}
                            style={{
                              padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              cursor: b.code === activeChild.launchBandCode ? "default" : "pointer",
                              border: `1.5px solid ${b.code === activeChild.launchBandCode ? "#9b72ff" : "rgba(255,255,255,0.12)"}`,
                              background: b.code === activeChild.launchBandCode ? "rgba(155,114,255,0.2)" : "rgba(255,255,255,0.04)",
                              color: b.code === activeChild.launchBandCode ? "#c4a0ff" : "rgba(255,255,255,0.6)",
                              opacity: bandUpdating ? 0.5 : 1,
                            }}
                          >
                            {b.label} <span style={{ opacity: 0.5, fontWeight: 400 }}>{b.sub}</span>
                          </button>
                        ))}
                      </div>
                    )}
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

          {/* ── Today at a Glance ─────────────────────────────────────────── */}
          {activeChild && todayCompleted > 0 && (
            <div style={{
              background: "linear-gradient(135deg, rgba(88,232,193,0.12) 0%, rgba(155,114,255,0.08) 100%)",
              borderRadius: 18, padding: "18px 22px", marginBottom: 20,
              border: "1px solid rgba(88,232,193,0.28)",
              display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
            }}>
              <div style={{ fontSize: "1.6rem" }}>☀️</div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.mint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                  Today&apos;s Learning
                </div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: C.text }}>
                  {todayCompleted} quest{todayCompleted !== 1 ? "s" : ""} completed today
                  {todayAvgScore !== null && todayAvgScore > 0 && (
                    <span style={{ color: todayAvgScore >= 75 ? C.mint : todayAvgScore >= 50 ? C.violet : C.gold, marginLeft: 8 }}>
                      · {todayAvgScore}% avg score
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                  {activeChild.displayName} is on a roll 🔥
                </div>
              </div>
              <Link href="/parent/report" style={{
                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: "rgba(88,232,193,0.18)", border: "1.5px solid rgba(88,232,193,0.35)",
                color: C.mint, textDecoration: "none", whiteSpace: "nowrap",
              }}>
                See full report →
              </Link>
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

          {/* ── Suggested Next Session ─────────────────────────────────────── */}
          {activeChild && !isFirstTimer && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                background: "linear-gradient(135deg, rgba(155,114,255,0.16), rgba(88,232,193,0.09))",
                border: "1px solid rgba(155,114,255,0.3)",
                borderRadius: 18, padding: "20px 24px",
                boxShadow: "0 4px 20px rgba(100,60,200,0.12)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: "linear-gradient(135deg, #9b72ff, #58e8c1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.5rem", flexShrink: 0,
                  }}>🎯</div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.violet, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                      {suggestedSession ? "Suggested Next Session" : "Learning Plan"}
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: C.text, marginBottom: 3 }}>
                      {suggestedSession ? suggestedSession.skillName : `Personalized plan for ${activeChild.displayName}`}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>
                      {suggestedSession ? (
                        <>
                          {suggestedSession.reason}
                          {suggestedSession.masteryScore > 0 && (
                            <span style={{ color: C.gold, marginLeft: 6, fontWeight: 600 }}>
                              · {Math.round(suggestedSession.masteryScore)}% mastery
                            </span>
                          )}
                        </>
                      ) : "AI-recommended skills and push-to-play sessions"}
                    </div>
                  </div>
                  <Link href="/parent/suggestions" style={{
                    display: "inline-flex", alignItems: "center",
                    fontSize: 13, fontWeight: 700, color: C.violet,
                    padding: "8px 16px", background: "rgba(155,114,255,0.15)",
                    borderRadius: 10, border: "1px solid rgba(155,114,255,0.25)",
                    textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {suggestedSession ? "Full Learning Plan →" : "View Plan →"}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── 2-col: skills + activity ───────────────────────────────────── */}
          {activeChildDashboard && !isFirstTimer && (
            <div className="parent-skills-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
              {/* Skills panel */}
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.10)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Skills snapshot</span>
                  <Link href="/parent/report" style={{ fontSize: 12, color: C.violet, textDecoration: "none" }}>See all →</Link>
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {[
                      { color: "#58e8c1", label: "Strong (75%+)" },
                      { color: "#9b72ff", label: "Building (50–75%)" },
                      { color: "#ffd166", label: "Needs practice (<50%)" },
                    ].map((leg) => (
                      <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: leg.color, flexShrink: 0 }} />
                        {leg.label}
                      </div>
                    ))}
                  </div>
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

          {/* ── Quick access ────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Quick Access
            </div>
            {/* Primary tools */}
            <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              {[
                { href: "/parent/report",     icon: "📊", title: "Weekly Report",  desc: "Skills & progress breakdown",  color: C.violet },
                { href: "/parent/suggestions", icon: "🎯", title: "Learning Plan",  desc: "AI-recommended sessions",       color: C.gold   },
                { href: "/parent/family",     icon: "👧", title: "Children",        desc: "Manage profiles & PINs",        color: C.mint   },
              ].map((card) => (
                <Link key={card.href} href={card.href} style={{
                  flex: "1 1 160px", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 14, border: "1px solid rgba(255,255,255,0.09)",
                  textDecoration: "none",
                  borderLeft: `3px solid ${card.color}60`,
                }}>
                  <span style={{ fontSize: "1.3rem", flexShrink: 0 }}>{card.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: card.color, marginBottom: 1 }}>{card.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.3 }}>{card.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
            {/* Secondary tools */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { href: "/parent/quiz-review",      icon: "🔍", title: "Quiz Review"      },
                { href: "/parent/practice-planner", icon: "📅", title: "Practice Planner" },
                { href: "/parent/benchmarks",       icon: "ℹ️", title: "How It Works"     },
                { href: "/parent/account",          icon: "⚙️", title: "Settings"         },
              ].map((item) => (
                <Link key={item.href} href={item.href} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: C.muted, textDecoration: "none",
                }}>
                  <span>{item.icon}</span> {item.title}
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
                          { key: "cat_orange", emoji: "🐱", label: "Cat" },
                          { key: "dog_blue", emoji: "🐶", label: "Dog" },
                          { key: "fox_green", emoji: "🦊", label: "Fox" },
                          { key: "owl_yellow", emoji: "🦉", label: "Owl" },
                          { key: "panda_pink", emoji: "🐼", label: "Panda" },
                          { key: "tiger_red", emoji: "🐯", label: "Tiger" },
                          { key: "unicorn_teal", emoji: "🦄", label: "Unicorn" },
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
