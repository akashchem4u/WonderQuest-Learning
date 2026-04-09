"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { setActiveChildId } from "@/lib/active-child";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  green: "#22c55e",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────────

interface ChildDashboard {
  studentId: string;
  completedSessions: number;
  totalTimeSpentMs: number;
  lastSessionAt: string | null;
  recentSessions: {
    id: string;
    startedAt: string;
  }[];
}

interface LinkedChild {
  id: string;
  displayName: string;
  username: string;
  avatarKey: string;
  launchBandCode: string;
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
}

interface ParentSession {
  guardian: { id: string; username: string; displayName: string };
  linkedChildren: LinkedChild[];
  childDashboards: ChildDashboard[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatLastActive(lastSessionAt: string | null): string {
  if (!lastSessionAt) return "Not started";
  const diff = Date.now() - new Date(lastSessionAt).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getAvatarSymbol(avatarKey: string): string {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "✨";
}

function getBandColor(bandCode: string): string {
  if (bandCode === "PREK" || bandCode === "P0") return "#ffd166";
  if (bandCode === "K1" || bandCode === "P1") return "#9b72ff";
  if (bandCode === "G23" || bandCode === "P2") return "#58e8c1";
  if (bandCode === "G45" || bandCode === "P3") return "#ff7b6b";
  return "#9b72ff";
}

function getBandLabel(bandCode: string): string {
  if (bandCode === "PREK" || bandCode === "P0") return "Pre-K";
  if (bandCode === "K1" || bandCode === "P1") return "K–1";
  if (bandCode === "G23" || bandCode === "P2") return "G2–3";
  if (bandCode === "G45" || bandCode === "P3") return "G4–5";
  if (bandCode.startsWith("pre")) return "Pre-K";
  if (bandCode.startsWith("k1")) return "K–1";
  if (bandCode.startsWith("g2") || bandCode.startsWith("g3")) return "G2–3";
  if (bandCode.startsWith("g4") || bandCode.startsWith("g5")) return "G4–5";
  return bandCode;
}

function deriveFamilyStreak(dashboards: ChildDashboard[]): number {
  // Collect all unique session dates across all children
  const allDays = new Set<string>();
  for (const dash of dashboards) {
    for (const session of dash.recentSessions) {
      allDays.add(new Date(session.startedAt).toDateString());
    }
  }
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (allDays.has(d.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function sessionsThisWeek(dashboards: ChildDashboard[]): number {
  const now = Date.now();
  const weekMs = 7 * 86400000;
  let count = 0;
  for (const dash of dashboards) {
    for (const session of dash.recentSessions) {
      if (now - new Date(session.startedAt).getTime() < weekMs) {
        count++;
      }
    }
  }
  return count;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function FamilyHubPage() {
  const router = useRouter();
  const [session, setSession] = useState<ParentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ParentSession | null) => setSession(data))
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, []);

  const children = session?.linkedChildren ?? [];
  const dashboards = session?.childDashboards ?? [];
  const totalStars = children.reduce((sum, c) => sum + c.totalPoints, 0);
  const totalBadges = children.reduce((sum, c) => sum + c.badgeCount, 0);
  const familyStreak = deriveFamilyStreak(dashboards);
  const weekSessions = sessionsThisWeek(dashboards);

  return (
    <AppFrame audience="parent" currentPath="/parent/family">
      <div style={{ minHeight: "100vh", background: C.base, fontFamily: "system-ui", paddingBottom: "80px" }}>

        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}`, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #9b72ff, #5a30d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              🌟
            </div>
            <span style={{ font: "800 1.1rem system-ui", background: "linear-gradient(135deg, #c3aaff, #9b72ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WonderQuest
            </span>
          </div>
          <Link href="/parent" style={{ font: "600 0.8rem system-ui", color: C.muted, textDecoration: "none" }}>← Back to Dashboard</Link>
        </div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 36px 0" }}>

          {/* Page title */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ font: "700 0.72rem system-ui", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Family Hub</div>
            <h1 style={{ font: "800 1.8rem system-ui", color: C.text, margin: 0, marginBottom: "4px" }}>
              👨‍👩‍👧 {loading ? "Your Family" : (session?.guardian.displayName ? `${session.guardian.displayName}'s Family` : "Your Family")}
            </h1>
            <p style={{ font: "400 0.88rem system-ui", color: C.muted, margin: 0 }}>All children at a glance — stats, activity, and quick actions.</p>
          </div>

          {/* Combined family stats */}
          <div className="stat-grid-4" style={{ marginBottom: "28px" }}>
            {[
              { icon: "⭐", val: loading ? "—" : String(totalStars), label: "Total stars", color: C.gold },
              { icon: "🏅", val: loading ? "—" : String(totalBadges), label: "Badges combined", color: C.violet },
              { icon: "🔥", val: loading ? "—" : `${familyStreak}d`, label: "Family streak", color: C.coral },
              { icon: "📚", val: loading ? "—" : String(weekSessions), label: "Sessions this week", color: C.mint },
            ].map((s) => (
              <div key={s.label} style={{ background: C.surface, borderRadius: "14px", padding: "20px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "10px" }}>{s.icon}</div>
                <div style={{ font: "900 1.6rem system-ui", color: C.text, marginBottom: "2px" }}>{s.val}</div>
                <div style={{ font: "400 0.72rem system-ui", color: C.muted }}>{s.label}</div>
                <div style={{ width: "24px", height: "3px", borderRadius: "2px", background: s.color, marginTop: "10px" }} />
              </div>
            ))}
          </div>

          {/* Children grid */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ font: "700 0.75rem system-ui", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
              {loading ? "Children" : `${children.length} ${children.length === 1 ? "Child" : "Children"}`}
            </div>

            {loading && (
              <div style={{ background: C.surface, borderRadius: "16px", padding: "28px", border: `1px solid ${C.border}`, color: C.muted, fontSize: "0.88rem" }}>Loading…</div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {children.map((child) => {
                const dash = dashboards.find((d) => d.studentId === child.id) ?? null;
                const lastActive = formatLastActive(dash?.lastSessionAt ?? null);
                const avatar = getAvatarSymbol(child.avatarKey);
                const bandColor = getBandColor(child.launchBandCode);
                const bandLabel = getBandLabel(child.launchBandCode);
                const maxPoints = Math.max(...children.map((c) => c.totalPoints), 1);
                const barPct = Math.round((child.totalPoints / maxPoints) * 100);
                return (
                  <div
                    key={child.id}
                    onClick={() => { setActiveChildId(child.id); router.push(`/parent/report?studentId=${child.id}`); }}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: "18px",
                      padding: "24px",
                      border: `1px solid rgba(255,255,255,0.07)`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0",
                      cursor: "pointer",
                    }}
                  >
                    {/* Avatar + name */}
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                      <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `${bandColor}1a`, border: `2px solid ${bandColor}4d`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.7rem", flexShrink: 0 }}>
                        {avatar}
                      </div>
                      <div>
                        <div style={{ font: "700 1rem system-ui", color: C.text, marginBottom: "3px" }}>{child.displayName}</div>
                        <div style={{ display: "inline-block", padding: "2px 10px", borderRadius: "12px", background: `${bandColor}1a`, border: `1.5px solid ${bandColor}4d`, font: "700 0.68rem system-ui", color: bandColor }}>
                          {bandLabel} · Lv {child.currentLevel}
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
                      {[
                        [`⭐ ${child.totalPoints}`, "Stars", C.gold],
                        [`🏅 ${child.badgeCount}`, "Badges", C.violet],
                        [lastActive, "Last active", C.muted],
                      ].map(([val, label, color]) => (
                        <div key={label as string}>
                          <div style={{ font: "700 0.82rem system-ui", color: color as string }}>{val}</div>
                          <div style={{ font: "400 0.65rem system-ui", color: C.muted, marginTop: "1px" }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stars bar */}
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", marginBottom: "16px" }}>
                      <div style={{ height: "100%", width: `${barPct}%`, background: bandColor, borderRadius: "2px" }} />
                    </div>

                    {/* CTA */}
                    <a
                      href={`/parent/report?studentId=${child.id}`}
                      onClick={(e) => { e.stopPropagation(); setActiveChildId(child.id); }}
                      style={{
                        display: "block",
                        padding: "10px 0",
                        background: `${bandColor}22`,
                        border: `1.5px solid ${bandColor}55`,
                        color: bandColor,
                        borderRadius: "10px",
                        font: "600 0.8rem system-ui",
                        textAlign: "center",
                        textDecoration: "none",
                      }}
                    >
                      📊 See {child.displayName}&apos;s report →
                    </a>
                  </div>
                );
              })}

              {/* Add another child card */}
              {!loading && (
                <Link
                  href="/parent/link"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "28px 20px",
                    background: "rgba(155,114,255,0.04)",
                    borderRadius: "18px",
                    border: "2px dashed rgba(155,114,255,0.25)",
                    textDecoration: "none",
                    minHeight: "180px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div style={{ fontSize: "2rem", opacity: 0.5 }}>👶</div>
                  <div style={{ font: "700 0.88rem system-ui", color: C.violet }}>Add another child</div>
                  <div style={{ font: "400 0.72rem system-ui", color: C.muted, textAlign: "center" }}>Family plan: unlimited children</div>
                </Link>
              )}
            </div>
          </div>

          {/* Family streak detail */}
          {!loading && dashboards.length > 0 && (
            <div style={{ background: "linear-gradient(135deg, #1a1240, #2a1860)", borderRadius: "18px", padding: "24px", marginBottom: "28px", border: "1px solid rgba(155,114,255,0.15)" }}>
              <div style={{ font: "700 0.75rem system-ui", color: "rgba(192,176,240,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                Family activity streak
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
                <span style={{ font: "900 2.2rem system-ui", color: C.gold }}>🔥 {familyStreak}</span>
                <span style={{ font: "700 1rem system-ui", color: C.gold }}>day{familyStreak !== 1 ? "s" : ""}</span>
              </div>
              <p style={{ font: "400 0.82rem system-ui", color: C.muted, margin: 0 }}>
                A family streak counts any day where at least one child has an active learning session. Keep it going!
              </p>
            </div>
          )}

          {/* Footer nav */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { href: "/parent", label: "← Dashboard" },
              { href: "/parent/report", label: "Weekly Report" },
              { href: "/parent/practice", label: "Practice Plan" },
              { href: "/parent/notifications", label: "Notifications" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ font: "600 0.8rem system-ui", color: C.violet, textDecoration: "none" }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
