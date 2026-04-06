"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { FeedbackForm } from "@/components/feedback-form";
import { FieldBlock, ShellCard } from "@/components/ui";
import { launchBands } from "@/lib/launch-plan";

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

type ParentAccessMode = "new" | "returning";
type AccessSection = "profile" | "notifications" | "relink";

function formatMinutes(totalTimeSpentMs: number) {
  return `${Math.round((totalTimeSpentMs / 60000) * 10) / 10} min`;
}

function formatPercent(value: number | null) {
  return value === null ? "n/a" : `${value}%`;
}

function formatSessionMode(value: string) {
  return value === "self-directed-challenge" ? "Self-directed" : "Guided";
}

function formatLastSeen(value: string | null) {
  if (!value) {
    return "Not yet started";
  }

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDay(value: string) {
  return new Date(value).toLocaleDateString([], {
    weekday: "short",
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

function getBandLabel(bandCode: string) {
  return launchBands.find((band) => band.code === bandCode)?.label ?? bandCode;
}

function getBandColor(bandCode: string) {
  if (bandCode.startsWith("pre")) return "#58e8c1";
  if (bandCode.startsWith("k1")) return "#9b72ff";
  if (bandCode.startsWith("g2") || bandCode.startsWith("g3")) return "#ffd166";
  return "#ff7b6b";
}

function dedupeSkills<T extends { skillCode: string }>(skills: T[]) {
  const seen = new Set<string>();
  return skills.filter((skill) => {
    if (seen.has(skill.skillCode)) return false;
    seen.add(skill.skillCode);
    return true;
  });
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

function buildParentSkillSignal(masteryRate: number) {
  if (masteryRate >= 80) return "Growing strength.";
  if (masteryRate >= 60) return "Improving, but still worth a short guided practice.";
  return "Needs gentle support and slower repetition.";
}

function buildParentWeekSummary(
  childName: string,
  dashboard: ChildDashboard,
  skillCount: number,
) {
  const leadStrength = dashboard.strengths[0]?.displayName;
  const leadSupport = dashboard.supportAreas[0]?.displayName;

  if (leadStrength && leadSupport) {
    return {
      headline: `${childName} is steadier this week.`,
      body: `${leadStrength} is looking easier. ${leadSupport.toLowerCase()} is the clearest next focus.`,
      chips: [
        `${dashboard.strengths.length} strengths`,
        `${dashboard.supportAreas.length} focus`,
        `${Math.min(Math.max(skillCount, 1), 3)} ideas`,
      ],
    };
  }

  if (leadStrength) {
    return {
      headline: `${childName} had a strong week.`,
      body: `${leadStrength} is looking confident. Keep the next return short.`,
      chips: [
        `${dashboard.strengths.length} strengths`,
        `${dashboard.completedSessions} sessions`,
        `${Math.min(Math.max(skillCount, 1), 3)} ideas`,
      ],
    };
  }

  return {
    headline: `${childName} is building confidence.`,
    body: `Keep practice calm, short, and centered on ${dashboard.recommendedFocus.toLowerCase()}.`,
    chips: [
      `${dashboard.completedSessions} sessions`,
      `${dashboard.supportAreas.length} focus`,
      `${Math.min(Math.max(skillCount, 1), 3)} ideas`,
    ],
  };
}

function buildParentTeacherMessage(childName: string, dashboard: ChildDashboard) {
  if (dashboard.strengths[0]?.displayName) {
    return `"${childName} is gaining comfort in ${dashboard.strengths[0].displayName.toLowerCase()}. Next, try ${dashboard.recommendedFocus.toLowerCase()} in one calm moment."`;
  }
  return `"Try one short, calm practice moment around ${dashboard.recommendedFocus.toLowerCase()}."`;
}

function buildParentWeekendActivities(
  primarySkill: { skillCode: string; displayName: string } | null,
  secondarySkill: { skillCode: string; displayName: string } | null,
) {
  const activities = [];

  if (primarySkill) {
    activities.push({
      icon: "🏠",
      title: `Try ${primarySkill.displayName} at home`,
      body: buildParentSkillAction(primarySkill.skillCode, primarySkill.displayName),
      tag: "5 min",
    });
  }

  if (secondarySkill) {
    activities.push({
      icon: "✨",
      title: `Keep ${secondarySkill.displayName} feeling easy`,
      body: `Let your child lead one quick moment around ${secondarySkill.displayName.toLowerCase()}.`,
      tag: "Confidence",
    });
  }

  activities.push({
    icon: "🎒",
    title: "End while it still feels easy",
    body: "Stop after one or two wins so the next return feels calm and easy.",
    tag: "Routine",
  });

  return activities.slice(0, 3);
}

// Derive a simple streak count from recent sessions (days with at least one session)
function deriveStreakDays(recentSessions: ChildDashboard["recentSessions"]) {
  if (!recentSessions.length) return 0;
  const days = new Set(
    recentSessions.map((s) => new Date(s.startedAt).toDateString()),
  );
  // Simple streak: count consecutive days ending today/yesterday
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

// Build a week-of-dots array (Mon–Sun) based on recent sessions
function buildStreakDots(recentSessions: ChildDashboard["recentSessions"]) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const todayDow = today.getDay(); // 0=Sun
  // Map to Mon=0 index
  const todayIdx = todayDow === 0 ? 6 : todayDow - 1;

  const playedDays = new Set(
    recentSessions.map((s) => {
      const d = new Date(s.startedAt);
      const dow = d.getDay();
      return dow === 0 ? 6 : dow - 1;
    }),
  );

  return labels.map((label, idx) => ({
    label,
    played: playedDays.has(idx),
    isToday: idx === todayIdx,
  }));
}

const parentPreviewWeekly = {
  childName: "Maya",
  bandLabel: "Kinder – Grade 1",
  summary: "Maya had a steadier week with one clear next step in sight words.",
  chips: ["3 strengths", "1 focus", "2 ideas"],
  kpis: [
    { label: "Days practiced", value: "4", detail: "short visits" },
    { label: "Effective time", value: "18 min", detail: "steady play" },
    { label: "Badges earned", value: "2", detail: "this week" },
  ],
  strengths: ["Counting objects", "Matching shapes", "Quick number recognition"],
  support: "Sight words",
  teacherMessage:
    "Maya is looking more comfortable with counting. A short sight-word check-in at home would help next.",
  activities: [
    { icon: "📚", title: "Sight-word warmup", body: "Pick one word, say it together, then spot it once nearby.", tag: "2 min" },
    { icon: "🍓", title: "Count small groups", body: "Use snacks, blocks, or fruit and count each item slowly.", tag: "Confidence" },
    { icon: "🎉", title: "Stop on a win", body: "Leave while it still feels easy.", tag: "Routine" },
  ],
};

export default function ParentAccessPage() {
  const [accessMode, setAccessMode] = useState<ParentAccessMode>("returning");
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [childUsername, setChildUsername] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ParentAccessResponse | null>(null);
  const [showAccessManager, setShowAccessManager] = useState(true);
  const [openAccessSection, setOpenAccessSection] = useState<AccessSection | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [selectedSkillCode, setSelectedSkillCode] = useState<string | null>(null);
  const returningAccessMode = accessMode === "returning";
  const activeChildId =
    selectedChildId ??
    result?.linkedChild?.id ??
    result?.linkedChildren[0]?.id ??
    null;
  const activeChild =
    result?.linkedChildren.find((child) => child.id === activeChildId) ??
    result?.linkedChild ??
    result?.linkedChildren[0] ??
    null;
  const activeChildDashboard =
    result?.childDashboards.find((dashboard) => dashboard.studentId === activeChildId) ??
    result?.childDashboard ??
    null;
  const recentProgressSessions = activeChildDashboard?.recentSessions.slice(-6) ?? [];
  const familyTotals = result
    ? result.childDashboards.reduce(
        (summary, dashboard) => {
          summary.completedSessions += dashboard.completedSessions;
          summary.totalTimeSpentMs += dashboard.totalTimeSpentMs;
          summary.effectiveTimeSpentMs += dashboard.effectiveTimeSpentMs;
          return summary;
        },
        { completedSessions: 0, totalTimeSpentMs: 0, effectiveTimeSpentMs: 0 },
      )
    : null;
  const activeSkillOptions = activeChildDashboard
    ? dedupeSkills([
        ...activeChildDashboard.supportAreas,
        ...activeChildDashboard.strengths,
      ])
    : [];
  const supportSkillCodes = new Set(
    activeChildDashboard?.supportAreas.map((skill) => skill.skillCode) ?? [],
  );
  const parentNextMilestoneSkills = activeSkillOptions.filter(
    (skill) =>
      !supportSkillCodes.has(skill.skillCode) &&
      skill.masteryRate >= 65 &&
      skill.masteryRate < 85,
  );
  const activeSkill =
    activeSkillOptions.find((skill) => skill.skillCode === selectedSkillCode) ??
    activeChildDashboard?.supportAreas[0] ??
    activeChildDashboard?.strengths[0] ??
    null;
  const parentWeekSummary =
    activeChild && activeChildDashboard
      ? buildParentWeekSummary(activeChild.displayName, activeChildDashboard, activeSkillOptions.length)
      : null;
  const parentTeacherMessage =
    activeChild && activeChildDashboard
      ? buildParentTeacherMessage(activeChild.displayName, activeChildDashboard)
      : "";
  const parentWeekendActivities = activeChildDashboard
    ? buildParentWeekendActivities(
        activeChildDashboard.supportAreas[0] ?? activeSkill,
        activeChildDashboard.strengths[0] ?? null,
      )
    : [];
  const familyBadgeTotal = result
    ? result.linkedChildren.reduce((total, child) => total + child.badgeCount, 0)
    : 0;
  const familyTrophyTotal = result
    ? result.linkedChildren.reduce((total, child) => total + child.trophyCount, 0)
    : 0;
  const primaryStrength = activeChildDashboard?.strengths[0] ?? null;
  const primarySupport = activeChildDashboard?.supportAreas[0] ?? null;
  const parentNextMilestone =
    parentNextMilestoneSkills.find(
      (skill) => skill.skillCode !== primaryStrength?.skillCode,
    ) ??
    activeSkillOptions.find(
      (skill) =>
        !supportSkillCodes.has(skill.skillCode) &&
        skill.skillCode !== primaryStrength?.skillCode,
    ) ??
    null;

  const streakDays = activeChildDashboard
    ? deriveStreakDays(activeChildDashboard.recentSessions)
    : 0;
  const streakDots = activeChildDashboard
    ? buildStreakDots(activeChildDashboard.recentSessions)
    : [];

  // Attempt cookie-based session restore on first mount.
  useEffect(() => {
    let cancelled = false;

    async function trySessionRestore() {
      try {
        const response = await fetch("/api/parent/session", { method: "GET" });
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as ParentAccessResponse;
        if (cancelled) return;
        setSelectedChildId(
          payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null,
        );
        setResult(payload);
        setShowAccessManager(false);
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
      ? result.linkedChildren.some((child) => child.id === activeId)
      : false;
    if (!stillValid) {
      setSelectedChildId(result.linkedChild?.id ?? result.linkedChildren[0]?.id ?? null);
    }
  }, [result, selectedChildId]);

  useEffect(() => {
    if (!activeChildDashboard) {
      if (selectedSkillCode !== null) setSelectedSkillCode(null);
      return;
    }
    const fallbackSkillCode =
      activeChildDashboard.supportAreas[0]?.skillCode ??
      activeChildDashboard.strengths[0]?.skillCode ??
      null;
    if (
      selectedSkillCode &&
      activeSkillOptions.some((skill) => skill.skillCode === selectedSkillCode)
    ) {
      return;
    }
    if (fallbackSkillCode !== selectedSkillCode) {
      setSelectedSkillCode(fallbackSkillCode);
    }
  }, [activeChildDashboard, activeSkillOptions, selectedSkillCode]);

  function openAccessManager(section: AccessSection = "profile") {
    setShowAccessManager(true);
    setOpenAccessSection(section);
  }

  function closeAccessManager() {
    setShowAccessManager(false);
    setOpenAccessSection(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/parent/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          pin,
          displayName: returningAccessMode ? "" : displayName,
          childUsername: returningAccessMode ? "" : childUsername,
          relationship: returningAccessMode ? "parent" : relationship,
          notifyWeekly,
          notifyMilestones,
        }),
      });

      const payload = (await response.json()) as ParentAccessResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Parent access failed.");

      setSelectedChildId(
        payload.linkedChild?.id ?? payload.linkedChildren[0]?.id ?? null,
      );
      setResult(payload);
      closeAccessManager();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Parent access failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Shared inline style constants
  // ─────────────────────────────────────────────────────────────────────────────

  const heroCardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(155,114,255,0.07) 100%)",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 4px 24px rgba(100,60,200,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "24px",
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gap: "24px",
    alignItems: "center",
  };

  const avatarLgStyle: React.CSSProperties = {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ede8ff, #d8d0ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    flexShrink: 0,
    boxShadow: "0 4px 16px rgba(155,114,255,0.2)",
  };

  const quickStatGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "24px",
  };

  const statCardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "14px",
    padding: "18px 20px",
    boxShadow: "0 2px 12px rgba(100,60,200,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  const twoColStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
    marginBottom: "24px",
  };

  const skillCardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "16px",
    padding: "22px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 2px 12px rgba(100,60,200,0.06)",
  };

  const streakCardStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #1a1240, #2a1860)",
    borderRadius: "16px",
    padding: "22px",
    color: "#e8e4f8",
  };

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <main className="page-shell page-shell-split">

        {/* ── LOGIN / UNAUTHENTICATED STATE ─────────────────────────────────── */}
        {!result ? (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 400px",
              gap: "48px",
              alignItems: "start",
              padding: "48px 40px 80px",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
            id="parent-access-form"
          >
            {/* Left: preview hero */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Wordmark */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: "linear-gradient(135deg, #9b72ff, #5a30d0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  🌟
                </div>
                <span
                  style={{
                    font: "900 1.5rem system-ui",
                    background: "linear-gradient(135deg, #3d2a8a, #9b72ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  WonderQuest
                </span>
              </div>

              <h1 style={{ font: "700 2.4rem/1.15 system-ui", color: "#ffffff", maxWidth: "440px" }}>
                See how your child is{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #9b72ff, #6030c0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  really doing
                </span>
              </h1>
              <p style={{ font: "400 1.05rem/1.7 system-ui", color: "#5a5070", maxWidth: "420px" }}>
                Clear signals, not walls of data. See strengths, next steps, and what to try at home — in under a minute.
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {["🔒 COPPA-safe", "📵 No ads", "✅ Teacher-guided"].map((badge) => (
                  <span
                    key={badge}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      font: "500 0.75rem system-ui", color: "rgba(216,240,234,0.5)",
                      background: "rgba(155,114,255,0.15)", border: "1px solid rgba(155,114,255,0.25)",
                      borderRadius: "20px", padding: "5px 12px",
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Preview dashboard card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "24px",
                  border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 24px rgba(100,60,200,0.08)",
                  marginTop: "8px",
                }}
              >
                <div style={{ font: "600 0.7rem system-ui", color: "#9b72ff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                  Preview — what you'll see
                </div>
                <div style={{ font: "700 0.95rem system-ui", color: "#ffffff", marginBottom: "16px" }}>
                  {parentPreviewWeekly.childName}'s week at a glance
                </div>

                {/* Mini stat row */}
                <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>
                  {[
                    { icon: "⭐", val: "42", label: "Stars" },
                    { icon: "📚", val: "14", label: "Sessions" },
                    { icon: "🔥", val: "5", label: "Streak" },
                    { icon: "🏅", val: "2", label: "Badges" },
                  ].map((s) => (
                    <div key={s.label}>
                      <span style={{ font: "700 1.2rem system-ui", color: "#ffffff", display: "block" }}>
                        {s.icon} {s.val}
                      </span>
                      <span style={{ font: "400 0.68rem system-ui", color: "rgba(216,240,234,0.55)" }}>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Mini skill bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { name: "Rhyming words", pct: 88, color: "#9b72ff" },
                    { name: "Letter sounds", pct: 74, color: "#9b72ff" },
                    { name: "Counting", pct: 60, color: "#ffd166" },
                  ].map((skill) => (
                    <div key={skill.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ font: "600 0.78rem system-ui", color: "#ffffff", width: "110px", flexShrink: 0 }}>
                        {skill.name}
                      </span>
                      <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${skill.pct}%`, height: "100%", background: skill.color, borderRadius: "3px" }} />
                      </div>
                      <span style={{ font: "600 0.7rem system-ui", color: "rgba(216,240,234,0.55)", width: "30px", textAlign: "right" }}>
                        {skill.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: sign-in card */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "20px", padding: "40px 36px",
                boxShadow: "0 8px 40px rgba(100,60,200,0.1)", border: "1px solid rgba(255,255,255,0.1)",
                position: "sticky", top: "24px",
              }}
            >
              <div style={{ font: "600 0.75rem system-ui", color: "#9b72ff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                Parent access
              </div>
              <div style={{ font: "700 1.4rem system-ui", color: "#ffffff", marginBottom: "22px" }}>
                {returningAccessMode ? "Sign in to family view" : "Create parent access"}
              </div>

              {/* Mode toggle */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "22px" }}>
                {(["returning", "new"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setAccessMode(mode); setError(""); }}
                    type="button"
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
                      font: "600 0.8rem system-ui", textAlign: "left",
                      border: accessMode === mode ? "2px solid #9b72ff" : "1.5px solid #d8d0f0",
                      background: accessMode === mode ? "#ede8ff" : "#faf8ff",
                      color: accessMode === mode ? "#3d2a8a" : "#7060a0",
                      transition: "all 0.15s",
                    }}
                  >
                    <span style={{ display: "block", marginBottom: "2px" }}>
                      {mode === "returning" ? "🔐" : "✨"}
                    </span>
                    {mode === "returning" ? "Existing parent" : "First-time setup"}
                    <span style={{ display: "block", font: "400 0.7rem system-ui", marginTop: "2px", color: "#9080b0" }}>
                      {mode === "returning" ? "Username + PIN" : "Set name, PIN, link child"}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <FieldBlock
                  autoComplete="username"
                  label="Username"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="parent username"
                  value={username}
                />
                <FieldBlock
                  autoComplete="current-password"
                  label="4-digit PIN"
                  maxLength={4}
                  onChange={(event) => setPin(event.target.value)}
                  placeholder="0000"
                  type="password"
                  value={pin}
                />
                {!returningAccessMode ? (
                  <>
                    <FieldBlock
                      label="Display name"
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Parent name"
                      value={displayName}
                    />
                    <FieldBlock
                      label="Child username"
                      onChange={(event) => setChildUsername(event.target.value)}
                      placeholder="child quest name"
                      value={childUsername}
                    />
                  </>
                ) : null}

                {returningAccessMode ? (
                  <div style={{ font: "500 0.78rem system-ui", color: "rgba(216,240,234,0.5)", background: "rgba(155,114,255,0.1)", borderRadius: "8px", padding: "10px 14px" }}>
                    Username + PIN only needed to sign in.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { key: "weekly", label: "Weekly summary", sub: "Time, insights, and next focus.", val: notifyWeekly, toggle: () => setNotifyWeekly((v) => !v) },
                      { key: "milestones", label: "Milestones", sub: "Badges, trophies, and level moments.", val: notifyMilestones, toggle: () => setNotifyMilestones((v) => !v) },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={item.toggle}
                        type="button"
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "11px 14px", borderRadius: "10px", cursor: "pointer",
                          border: "1.5px solid rgba(255,255,255,0.12)", background: item.val ? "#faf5ff" : "#faf8ff",
                          textAlign: "left",
                        }}
                      >
                        <div>
                          <div style={{ font: "600 0.82rem system-ui", color: "#ffffff" }}>{item.label}</div>
                          <div style={{ font: "400 0.7rem system-ui", color: "rgba(216,240,234,0.55)" }}>{item.sub}</div>
                        </div>
                        <span
                          style={{
                            font: "700 0.75rem system-ui",
                            color: item.val ? "#9b72ff" : "#b0a0c0",
                            background: item.val ? "#ede8ff" : "#f0eef8",
                            padding: "3px 10px", borderRadius: "10px",
                          }}
                        >
                          {item.val ? "On" : "Off"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {error ? (
                  <p style={{ font: "500 0.82rem system-ui", color: "#c02020", background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "8px", padding: "10px 14px" }}>
                    {error}
                  </p>
                ) : null}

                <button
                  disabled={submitting}
                  type="submit"
                  style={{
                    padding: "14px", background: "#9b72ff", color: "#fff",
                    border: "none", borderRadius: "12px", font: "700 0.95rem system-ui",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.7 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  {submitting
                    ? returningAccessMode ? "Signing in…" : "Saving…"
                    : returningAccessMode ? "Sign in to family view" : "Create parent access"}
                </button>
                <Link
                  href="/child"
                  style={{ font: "500 0.82rem system-ui", color: "#9b72ff", textAlign: "center", textDecoration: "none" }}
                >
                  Child access →
                </Link>
              </form>
            </div>
          </section>
        ) : null}

        {/* ── AUTHENTICATED DASHBOARD ────────────────────────────────────────── */}
        {result && activeChild && activeChildDashboard ? (
          <section
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "40px 36px 80px",
              width: "100%",
            }}
            id="parent-family-hub"
          >
            {/* Page header */}
            <div style={{ marginBottom: "28px" }}>
              <div style={{ font: "700 1.6rem system-ui", color: "#ffffff", marginBottom: "4px" }}>
                👋 Hello, {result.guardian.displayName}
              </div>
              <div style={{ font: "400 0.88rem system-ui", color: "rgba(216,240,234,0.7)" }}>
                Here's how {activeChild.displayName} is doing this week
              </div>
              {result.linkedChildren.length > 1 ? (
                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                  {result.linkedChildren.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChildId(child.id)}
                      type="button"
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "6px 14px", borderRadius: "20px", cursor: "pointer",
                        border: activeChildId === child.id ? "2px solid #9b72ff" : "1.5px solid #e0d8f0",
                        background: activeChildId === child.id ? "#ede8ff" : "#fff",
                        font: "600 0.8rem system-ui",
                        color: activeChildId === child.id ? "#3d2a8a" : "#6a5890",
                        transition: "all 0.15s",
                      }}
                    >
                      <span>{getAvatarSymbol(child.avatarKey)}</span>
                      {child.displayName}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* ── Child hero card ──────────────────────────────────────────── */}
            <div style={heroCardStyle}>
              <div style={avatarLgStyle}>
                {getAvatarSymbol(activeChild.avatarKey)}
              </div>

              <div>
                <div style={{ font: "700 1.3rem system-ui", color: "#ffffff", marginBottom: "6px" }}>
                  {activeChild.displayName}
                </div>
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "3px 12px", borderRadius: "16px", marginBottom: "12px",
                    background: "rgba(155,114,255,0.15)", border: `1.5px solid ${getBandColor(activeChild.launchBandCode)}`,
                    font: "700 0.72rem system-ui", color: "#c3aaff",
                  }}
                >
                  <span
                    style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: getBandColor(activeChild.launchBandCode),
                      flexShrink: 0,
                    }}
                  />
                  {getBandLabel(activeChild.launchBandCode)} · Level {activeChild.currentLevel}
                </div>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {[
                    { val: `⭐ ${activeChild.totalPoints}`, label: "Stars earned" },
                    { val: `${activeChildDashboard.completedSessions}`, label: "Sessions played" },
                    { val: `🔥 ${streakDays}`, label: "Day streak" },
                    { val: `${activeChild.badgeCount}`, label: "Badges" },
                  ].map((s) => (
                    <div key={s.label}>
                      <span style={{ font: "900 1.35rem system-ui", color: "#ffffff", display: "block" }}>
                        {s.val}
                      </span>
                      <span style={{ font: "400 0.7rem system-ui", color: "rgba(216,240,234,0.55)", marginTop: "1px", display: "block" }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a
                  href="#parent-family-detail"
                  style={{
                    padding: "10px 18px", background: "#9b72ff", color: "#fff",
                    border: "none", borderRadius: "10px", font: "600 0.82rem system-ui",
                    cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none",
                    display: "block", textAlign: "center",
                  }}
                >
                  📊 See full progress →
                </a>
                <button
                  onClick={() => openAccessManager("profile")}
                  type="button"
                  style={{
                    padding: "9px 18px", background: "rgba(255,255,255,0.05)", color: "rgba(216,240,234,0.8)",
                    border: "1.5px solid #d0c8e8", borderRadius: "10px",
                    font: "600 0.78rem system-ui", cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  ⚙️ Manage access
                </button>
              </div>
            </div>

            {/* ── 4 quick-stat tiles ──────────────────────────────────────── */}
            <div style={quickStatGridStyle}>
              {[
                {
                  icon: "⭐",
                  val: activeChild.totalPoints,
                  label: "Stars earned",
                  delta: `Level ${activeChild.currentLevel}`,
                  up: true,
                },
                {
                  icon: "📚",
                  val: activeChildDashboard.completedSessions,
                  label: "Sessions completed",
                  delta: formatMinutes(activeChildDashboard.totalTimeSpentMs) + " total",
                  up: true,
                },
                {
                  icon: "⏱️",
                  val: formatMinutes(activeChildDashboard.effectiveTimeSpentMs),
                  label: "Effective time",
                  delta: formatPercent(activeChildDashboard.averageEffectiveness) + " engagement",
                  up: false,
                },
                {
                  icon: "🏅",
                  val: activeChild.badgeCount,
                  label: "Badges earned",
                  delta: `${activeChild.trophyCount} trophies`,
                  up: true,
                },
              ].map((tile) => (
                <div key={tile.label} style={statCardStyle}>
                  <div style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{tile.icon}</div>
                  <span style={{ font: "900 1.5rem system-ui", color: "#ffffff", display: "block", marginBottom: "2px" }}>
                    {tile.val}
                  </span>
                  <div style={{ font: "400 0.72rem system-ui", color: "rgba(216,240,234,0.55)" }}>{tile.label}</div>
                  <div
                    style={{
                      font: "600 0.72rem system-ui", marginTop: "6px",
                      color: tile.up ? "#30a060" : "#9080a0",
                    }}
                  >
                    {tile.up ? "↑ " : "→ "}{tile.delta}
                  </div>
                </div>
              ))}
            </div>

            {/* ── 2-column: Skills + (Streak calendar + Activity) ─────────── */}
            <div style={twoColStyle}>
              {/* Left: Skills practiced */}
              <div style={skillCardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{ font: "700 0.95rem system-ui", color: "#ffffff" }}>Skills practiced this week</span>
                  <a href="#parent-family-detail" style={{ font: "500 0.75rem system-ui", color: "#9b72ff", textDecoration: "none" }}>
                    See all →
                  </a>
                </div>

                {activeSkillOptions.length > 0 ? (
                  <>
                    {activeSkillOptions.slice(0, 5).map((skill) => {
                      const barColor = skill.masteryRate >= 75 ? "#9b72ff" : "#ffd166";
                      return (
                        <div
                          key={skill.skillCode}
                          style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}
                        >
                          <span
                            style={{
                              font: "600 0.8rem system-ui", color: "#ffffff",
                              width: "120px", flexShrink: 0,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {skill.displayName}
                          </span>
                          <div
                            style={{
                              flex: 1, height: "6px", background: "rgba(255,255,255,0.1)",
                              borderRadius: "3px", overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${skill.masteryRate}%`, height: "100%",
                                background: barColor, borderRadius: "3px",
                                transition: "width 0.4s ease",
                              }}
                            />
                          </div>
                          <span style={{ font: "600 0.72rem system-ui", color: "rgba(216,240,234,0.55)", width: "32px", textAlign: "right", flexShrink: 0 }}>
                            {skill.masteryRate}%
                          </span>
                        </div>
                      );
                    })}

                    {/* Support tip */}
                    {primarySupport ? (
                      <div
                        style={{
                          marginTop: "14px", padding: "10px 12px",
                          background: "rgba(88,232,193,0.1)", borderRadius: "8px",
                          border: "1px solid rgba(88,232,193,0.25)",
                          font: "400 0.76rem/1.4 system-ui", color: "#58e8c1",
                        }}
                      >
                        💡 <strong>Support tip:</strong>{" "}
                        {buildParentSkillAction(primarySupport.skillCode, primarySupport.displayName)}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p style={{ font: "400 0.82rem system-ui", color: "rgba(216,240,234,0.55)" }}>
                    Skills appear after a few sessions.
                  </p>
                )}
              </div>

              {/* Right: Streak card + Recent activity */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {/* Streak calendar */}
                <div style={streakCardStyle}>
                  <div
                    style={{
                      font: "600 0.72rem system-ui", color: "#c0b0f0",
                      textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px",
                    }}
                  >
                    Current streak
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "10px" }}>
                    <span style={{ font: "900 2.4rem system-ui", color: "#ffd166" }}>🔥 {streakDays}</span>
                    <span style={{ font: "600 0.85rem system-ui", color: "#ffd166" }}>
                      {streakDays === 1 ? "day in a row!" : "days in a row!"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {streakDots.map((dot, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: "28px", height: "28px", borderRadius: "6px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          font: "600 0.65rem system-ui",
                          background: dot.isToday ? "#ffd166" : dot.played ? "rgba(255,209,102,0.15)" : "#2a2060",
                          color: dot.isToday ? "#1a1240" : dot.played ? "#ffd166" : "#8070b0",
                          fontWeight: dot.isToday ? 700 : undefined,
                        }}
                      >
                        {dot.label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div style={{ ...skillCardStyle, flex: 1 }}>
                  <div style={{ font: "700 0.95rem system-ui", color: "#ffffff", marginBottom: "14px" }}>
                    Recent activity
                  </div>
                  {activeChildDashboard.recentSessions.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {activeChildDashboard.recentSessions.slice(0, 5).map((session) => {
                        const dotColor =
                          session.effectivenessScore && session.effectivenessScore >= 75
                            ? "#9b72ff"
                            : session.effectivenessScore && session.effectivenessScore >= 50
                              ? "#ffd166"
                              : "#58e8c1";
                        return (
                          <li
                            key={session.id}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: "12px",
                              padding: "10px 0",
                              borderBottom: "1px solid #f0e8f8",
                            }}
                          >
                            <div
                              style={{
                                width: "10px", height: "10px", borderRadius: "50%",
                                background: dotColor, flexShrink: 0, marginTop: "4px",
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ font: "400 0.82rem/1.4 system-ui", color: "rgba(216,240,234,0.7)" }}>
                                <strong style={{ fontWeight: 700, color: "#ffffff" }}>
                                  {activeChild.displayName}
                                </strong>{" "}
                                completed a {formatSessionMode(session.sessionMode).toLowerCase()} session
                                {session.effectivenessScore !== null
                                  ? ` · ${session.effectivenessScore}% engagement`
                                  : ""}
                              </div>
                              <div style={{ font: "400 0.7rem system-ui", color: "rgba(216,240,234,0.4)", marginTop: "2px" }}>
                                {formatLastSeen(session.startedAt)}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p style={{ font: "400 0.82rem system-ui", color: "rgba(216,240,234,0.55)" }}>
                      Activity appears here after the first lesson.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Weekly snapshot section ──────────────────────────────────── */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px",
                border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 2px 12px rgba(100,60,200,0.06)",
                marginBottom: "24px",
              }}
            >
              <div style={{ font: "600 0.7rem system-ui", color: "#9b72ff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                Family learning snapshot
              </div>
              <div style={{ font: "700 1rem system-ui", color: "#ffffff", marginBottom: "18px" }}>
                {parentWeekSummary?.headline ?? `${activeChild.displayName} is making progress.`}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                {[
                  {
                    label: "Days practiced",
                    val: activeChildDashboard.recentSessions.length > 0
                      ? new Set(activeChildDashboard.recentSessions.map((s) => new Date(s.startedAt).toDateString())).size
                      : 0,
                    detail: "this week",
                  },
                  {
                    label: "Effective time",
                    val: formatMinutes(activeChildDashboard.effectiveTimeSpentMs),
                    detail: "quality play",
                  },
                  {
                    label: "Badges earned",
                    val: activeChild.badgeCount,
                    detail: "total",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px",
                      border: "1px solid rgba(155,114,255,0.2)",
                    }}
                  >
                    <div style={{ font: "400 0.72rem system-ui", color: "rgba(216,240,234,0.55)", marginBottom: "4px" }}>{item.label}</div>
                    <div style={{ font: "900 1.4rem system-ui", color: "#ffffff", marginBottom: "2px" }}>{item.val}</div>
                    <div style={{ font: "400 0.68rem system-ui", color: "rgba(216,240,234,0.4)" }}>{item.detail}</div>
                  </div>
                ))}
              </div>

              {parentWeekendActivities.length > 0 ? (
                <div style={{ marginTop: "18px" }}>
                  <div style={{ font: "600 0.75rem system-ui", color: "rgba(216,240,234,0.7)", marginBottom: "10px" }}>Try at home</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {parentWeekendActivities.map((activity) => (
                      <div
                        key={activity.title}
                        style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          padding: "10px 14px", background: "rgba(155,114,255,0.1)",
                          borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{activity.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ font: "600 0.82rem system-ui", color: "#ffffff" }}>{activity.title}</div>
                          <div style={{ font: "400 0.72rem system-ui", color: "rgba(216,240,234,0.5)" }}>{activity.body}</div>
                        </div>
                        <span
                          style={{
                            font: "600 0.68rem system-ui", color: "#9b72ff",
                            background: "rgba(155,114,255,0.15)", padding: "3px 8px",
                            borderRadius: "8px", whiteSpace: "nowrap",
                          }}
                        >
                          {activity.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* ── Access manager (inline, collapsible) ────────────────────── */}
            {showAccessManager ? (
              <div
                style={{
                  background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px",
                  border: "1px solid rgba(255,255,255,0.1)", marginBottom: "24px",
                  boxShadow: "0 2px 12px rgba(100,60,200,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div>
                    <div style={{ font: "600 0.7rem system-ui", color: "#9b72ff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                      Access manager
                    </div>
                    <div style={{ font: "700 0.95rem system-ui", color: "#ffffff" }}>
                      Family access — {result.guardian.displayName}
                    </div>
                  </div>
                  <button
                    onClick={closeAccessManager}
                    type="button"
                    style={{
                      padding: "6px 14px", borderRadius: "8px", cursor: "pointer",
                      border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)",
                      font: "500 0.78rem system-ui", color: "rgba(216,240,234,0.7)",
                    }}
                  >
                    Done
                  </button>
                </div>

                <div style={{ display: "flex", gap: "6px", marginBottom: "18px" }}>
                  {(["profile", "notifications", "relink"] as const).map((section) => (
                    <button
                      key={section}
                      onClick={() => setOpenAccessSection((c) => (c === section ? null : section))}
                      type="button"
                      style={{
                        padding: "7px 14px", borderRadius: "8px", cursor: "pointer",
                        font: "600 0.78rem system-ui",
                        border: openAccessSection === section ? "2px solid #9b72ff" : "1.5px solid #e0d8f0",
                        background: openAccessSection === section ? "#ede8ff" : "#faf8ff",
                        color: openAccessSection === section ? "#3d2a8a" : "#6a5890",
                      }}
                    >
                      {section === "profile" ? "Edit info" : section === "notifications" ? "Notifications" : "Relink child"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  {openAccessSection === "profile" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                      <FieldBlock
                        helper="Shown in family summaries and notifications."
                        label="Display name"
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Parent name"
                        value={displayName}
                      />
                      <label className="field-block">
                        <span>Relationship</span>
                        <div className="summary-chip-row">
                          {["parent", "guardian", "grandparent", "other"].map((option) => (
                            <button
                              className={`summary-chip parent-access-chip ${relationship === option ? "is-current" : ""}`}
                              key={option}
                              onClick={() => setRelationship(option)}
                              type="button"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </label>
                    </div>
                  ) : null}

                  {openAccessSection === "notifications" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                      {[
                        { key: "weekly", label: "Weekly summary", sub: "Time spent, productive time, and next support areas.", val: notifyWeekly, toggle: () => setNotifyWeekly((v) => !v) },
                        { key: "milestones", label: "Milestones and badges", sub: "Celebrate progress without a noisy stream of alerts.", val: notifyMilestones, toggle: () => setNotifyMilestones((v) => !v) },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={item.toggle}
                          type="button"
                          style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "11px 14px", borderRadius: "10px", cursor: "pointer",
                            border: "1.5px solid rgba(255,255,255,0.12)",
                            background: item.val ? "#faf5ff" : "#faf8ff",
                            textAlign: "left",
                          }}
                        >
                          <div>
                            <div style={{ font: "600 0.82rem system-ui", color: "#ffffff" }}>{item.label}</div>
                            <div style={{ font: "400 0.7rem system-ui", color: "rgba(216,240,234,0.55)" }}>{item.sub}</div>
                          </div>
                          <span
                            style={{
                              font: "700 0.75rem system-ui",
                              color: item.val ? "#9b72ff" : "#b0a0c0",
                              background: item.val ? "#ede8ff" : "#f0eef8",
                              padding: "3px 10px", borderRadius: "10px",
                            }}
                          >
                            {item.val ? "On" : "Off"}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {openAccessSection === "relink" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                      <div style={{ font: "500 0.8rem system-ui", color: "#805020", background: "rgba(255,209,102,0.1)", border: "1px solid #ffe0b0", borderRadius: "8px", padding: "10px 14px" }}>
                        <strong>Relinking is uncommon.</strong> Only use this if your child has a new account.
                      </div>
                      <FieldBlock
                        label="Child username"
                        onChange={(event) => setChildUsername(event.target.value)}
                        placeholder="child quest name"
                        value={childUsername}
                      />
                      {activeChild ? (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(155,114,255,0.1)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <div>
                            <div style={{ font: "600 0.8rem system-ui", color: "#ffffff" }}>Currently linked</div>
                            <div style={{ font: "400 0.72rem system-ui", color: "rgba(216,240,234,0.5)" }}>{activeChild.displayName}</div>
                          </div>
                          <span style={{ font: "500 0.72rem system-ui", color: "#9b72ff" }}>{getBandLabel(activeChild.launchBandCode)}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {error ? (
                    <p style={{ font: "500 0.82rem system-ui", color: "#c02020", background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
                      {error}
                    </p>
                  ) : null}

                  {openAccessSection ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        disabled={submitting}
                        type="submit"
                        style={{
                          padding: "10px 20px", background: "#9b72ff", color: "#fff",
                          border: "none", borderRadius: "10px", font: "600 0.85rem system-ui",
                          cursor: submitting ? "not-allowed" : "pointer",
                          opacity: submitting ? 0.7 : 1,
                        }}
                      >
                        {submitting ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  ) : null}
                </form>
              </div>
            ) : (
              <div style={{ marginBottom: "16px" }}>
                <button
                  onClick={() => openAccessManager("profile")}
                  type="button"
                  style={{
                    font: "500 0.82rem system-ui", color: "#9b72ff", background: "none",
                    border: "none", cursor: "pointer", padding: 0,
                  }}
                >
                  Manage family access →
                </button>
              </div>
            )}

            {/* ── Full skill detail + progress + activity ──────────────────── */}
            <div
              id="parent-family-detail"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "24px" }}
            >
              {/* Skill detail */}
              <ShellCard
                className="shell-card-soft parent-skill-detail-shell"
                eyebrow="Skill detail"
                title={activeSkill ? `${activeSkill.displayName} at a glance` : "Skill detail"}
              >
                {activeSkill ? (
                  <div className="parent-skill-detail-layout">
                    <div className="summary-chip-row">
                      {activeSkillOptions.map((skill) => (
                        <button
                          className={`summary-chip parent-skill-switch ${selectedSkillCode === skill.skillCode ? "is-current" : ""}`}
                          key={skill.skillCode}
                          onClick={() => setSelectedSkillCode(skill.skillCode)}
                          type="button"
                        >
                          {skill.displayName}
                        </button>
                      ))}
                    </div>
                    <div className="parent-skill-summary-row">
                      <article className="parent-skill-summary-card">
                        <span>Accuracy</span>
                        <strong>{activeSkill.masteryRate}%</strong>
                      </article>
                      <article className="parent-skill-summary-card">
                        <span>Questions seen</span>
                        <strong>{activeSkill.attempts}</strong>
                      </article>
                    </div>
                    <div className="parent-skill-detail-grid">
                      <article className="parent-skill-detail-card">
                        <span>Progress</span>
                        <strong>{buildParentSkillSignal(activeSkill.masteryRate)}</strong>
                      </article>
                      <article className="parent-skill-detail-card">
                        <span>Try next</span>
                        <strong>{buildParentSkillAction(activeSkill.skillCode, activeSkill.displayName)}</strong>
                      </article>
                    </div>
                  </div>
                ) : (
                  <p className="soft-copy">
                    A few more sessions will surface strengths, support areas, and next activities.
                  </p>
                )}
              </ShellCard>

              {/* Progress over time */}
              <ShellCard
                className="shell-card-soft"
                eyebrow="Progress over time"
                title="How recent sessions are trending"
              >
                {recentProgressSessions.length ? (
                  <div className="parent-progress-card">
                    <div className="parent-progress-bars" aria-hidden="true">
                      {recentProgressSessions.map((session) => (
                        <span
                          className="parent-progress-bar"
                          key={session.id}
                          style={{
                            height: `${Math.max(20, Math.round(((session.effectivenessScore ?? 52) / 100) * 68))}px`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="parent-progress-labels">
                      {recentProgressSessions.map((session) => (
                        <span key={session.id}>{formatShortDay(session.startedAt)}</span>
                      ))}
                    </div>
                    <p className="soft-copy">Taller bars = stronger sessions.</p>
                  </div>
                ) : (
                  <p className="soft-copy">
                    Progress-over-time will appear once there are enough recent sessions to compare.
                  </p>
                )}
              </ShellCard>
            </div>

            {/* Recent sessions list */}
            <ShellCard
              className="shell-card-soft"
              eyebrow="Recent activity"
              title="Recent sessions"
            >
              {activeChildDashboard.recentSessions.length ? (
                <div className="activity-list">
                  {activeChildDashboard.recentSessions.map((session) => (
                    <article className="activity-card" key={session.id}>
                      <div className="activity-card-row">
                        <strong>{formatSessionMode(session.sessionMode)}</strong>
                        <span>{formatLastSeen(session.startedAt)}</span>
                      </div>
                      <div className="summary-chip-row">
                        <span className="summary-chip">{session.totalQuestions} questions</span>
                        <span className="summary-chip">Score {formatPercent(session.effectivenessScore)}</span>
                        <span className="summary-chip">{session.endedAt ? "Finished" : "In progress"}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="soft-copy">Activity appears here after the first lesson.</p>
              )}
            </ShellCard>
          </section>
        ) : null}

        {/* ── Feedback ─────────────────────────────────────────────────────── */}
        <section className="route-grid route-grid-parent">
          <ShellCard
            className="shell-card-soft"
            eyebrow="Feedback"
            title="Parent product feedback"
          >
            <div id="parent-feedback">
              <FeedbackForm
                guardianId={result?.guardian.id}
                helper="Report bugs, confusing flows, content issues, or ideas from the parent side."
                sourceChannel="parent-dashboard"
                studentId={activeChildId ?? undefined}
                submittedByRole="parent"
                title="Help improve the parent experience"
              />
            </div>
          </ShellCard>
        </section>
      </main>
    </AppFrame>
  );
}
