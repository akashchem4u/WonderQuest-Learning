"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "badges" | "trophies" | "streak" | "stars";

type StatsData = {
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  trophyCount: number;
  streakDays: number;
  masteredSkillsCount: number;
};

type ApiBadge = {
  id: string;
  badgeKey: string;
  displayName: string;
  description: string;
  iconKey: string | null;
  earned: boolean;
  earnedAt: string | null;
};

type ApiTrophy = {
  id: string;
  trophyKey: string;
  displayName: string;
  description: string;
  iconKey: string | null;
  tier: string;
  earned: boolean;
  earnedAt: string | null;
};

type HistorySession = {
  startedAt: string;
  correctAnswers: number;
  totalQuestions: number;
  pointsEarned: number;
};

// ─── Palette ──────────────────────────────────────────────────────────────────

const C = {
  base: "#100b2e",
  surface: "#1a1060",
  border: "#2a2060",
  violet: "#9b72ff",
  gold: "#ffd166",
  amber: "#ff9d3b",
  mint: "#50e890",
  muted: "#9b8ec4",
  text: "#e8e0ff",
  font: "'Nunito', system-ui, sans-serif",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBadgeEmoji(key: string): string {
  if (key.includes("streak")) return "🔥";
  if (key.includes("perfect")) return "💯";
  if (key.includes("first")) return "🌟";
  if (key.includes("speed")) return "⚡";
  if (key.includes("mastery") || key.includes("master")) return "🏆";
  if (key.includes("count") || key.includes("session")) return "📚";
  if (key.includes("math")) return "🔢";
  if (key.includes("read") || key.includes("letter")) return "📖";
  return "🏅";
}

function getTrophyEmoji(tier: string, key: string): string {
  if (key.includes("mastery") || key.includes("champion") || tier === "gold") return "🏆";
  if (key.includes("ocean")) return "🌊";
  if (key.includes("crystal")) return "💎";
  if (key.includes("volcano")) return "🌋";
  if (tier === "silver") return "🥈";
  if (tier === "bronze") return "🥉";
  return "🏆";
}

function formatEarnedAt(earnedAt: string | null): string | undefined {
  if (!earnedAt) return undefined;
  const d = new Date(earnedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function buildCalendar(year: number, month: number, activeDays: Set<number>) {
  const totalDays = getDaysInMonth(year, month);
  const firstDow = getFirstDayOfWeek(year, month);
  const todayDate = new Date();
  const isThisMonth = todayDate.getFullYear() === year && todayDate.getMonth() === month;
  const todayDay = isThisMonth ? todayDate.getDate() : -1;

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: { day: number | null; active: boolean; isToday: boolean }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(
      cells.slice(i, i + 7).map((day) => ({
        day,
        active: day !== null && activeDays.has(day),
        isToday: day === todayDay,
      })),
    );
  }
  return weeks;
}

function nextStarMilestone(total: number): number {
  const milestones = [10, 25, 50, 100, 200, 500, 1000, 2500, 5000];
  return milestones.find((m) => m > total) ?? total + 1000;
}

function starsThisWeek(sessions: HistorySession[]): number {
  const weekAgo = Date.now() - 7 * 86400000;
  return sessions
    .filter((s) => new Date(s.startedAt).getTime() > weekAgo)
    .reduce((sum, s) => sum + (s.pointsEarned ?? 0), 0);
}

function starsThisMonth(sessions: HistorySession[]): number {
  const now = new Date();
  return sessions
    .filter((s) => {
      const d = new Date(s.startedAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((sum, s) => sum + (s.pointsEarned ?? 0), 0);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({ id, activeTab, onClick, children }: { id: TabId; activeTab: TabId; onClick: () => void; children: React.ReactNode }) {
  const active = id === activeTab;
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 16px",
        background: active ? C.violet : C.surface,
        border: `2px solid ${active ? C.violet : C.border}`,
        borderRadius: 10,
        color: active ? "#fff" : "#aaa",
        fontFamily: C.font,
        fontSize: 13,
        fontWeight: 900,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function SmallBadgeCard({ badge }: { badge: { emoji: string; name: string; earned: boolean; earnedDate?: string } }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: badge.earned ? "linear-gradient(135deg,#1a1060,#2a1880)" : C.surface,
        border: `2px solid ${badge.earned ? C.violet : C.border}`,
        borderRadius: 16,
        padding: "14px 10px",
        textAlign: "center",
        opacity: badge.earned ? 1 : 0.4,
        transform: hovered && badge.earned ? "translateY(-3px)" : "none",
        transition: "transform 0.2s",
        fontFamily: C.font,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 6, filter: badge.earned ? "none" : "grayscale(1)" }}>
        {badge.earned ? badge.emoji : "🔒"}
      </div>
      <div style={{ fontSize: 11, fontWeight: 900, color: badge.earned ? "#fff" : "#5a4080" }}>
        {badge.name}
      </div>
      {badge.earned && badge.earnedDate && (
        <div style={{ fontSize: 9, color: C.mint, fontWeight: 700, marginTop: 3 }}>
          {badge.earnedDate}
        </div>
      )}
    </div>
  );
}

function SmallTrophyCard({ trophy }: { trophy: { emoji: string; name: string; tier: string; earned: boolean; earnedDate?: string } }) {
  const [hovered, setHovered] = useState(false);
  const tierColor = trophy.tier === "gold" ? "#ffd166" : trophy.tier === "silver" ? "#aaa" : trophy.tier === "bronze" ? "#c07040" : C.border;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: trophy.earned ? "linear-gradient(135deg,#2a2010,#1a1060)" : C.surface,
        border: `2px solid ${trophy.earned ? tierColor : C.border}`,
        borderRadius: 16,
        padding: "14px 10px",
        textAlign: "center",
        opacity: trophy.earned ? 1 : 0.4,
        transform: hovered && trophy.earned ? "translateY(-3px)" : "none",
        boxShadow: trophy.earned ? `0 0 14px rgba(255,209,102,0.2)` : "none",
        transition: "transform 0.2s, box-shadow 0.2s",
        fontFamily: C.font,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 6, filter: trophy.earned ? "none" : "grayscale(1)" }}>
        {trophy.earned ? trophy.emoji : "🔒"}
      </div>
      <div style={{ fontSize: 11, fontWeight: 900, color: trophy.earned ? tierColor : "#5a4080" }}>
        {trophy.name}
      </div>
      {trophy.earned && trophy.earnedDate && (
        <div style={{ fontSize: 9, color: C.mint, fontWeight: 700, marginTop: 3 }}>
          {trophy.earnedDate}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildRewardCabinetPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("badges");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [badges, setBadges] = useState<ApiBadge[]>([]);
  const [trophies, setTrophies] = useState<ApiTrophy[]>([]);
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => {
        if (!r.ok) { router.replace("/child"); return null; }
        return true;
      })
      .catch(() => { router.replace("/child"); return null; })
      .then((authed) => {
        if (!authed) return;
        return Promise.all([
          fetch("/api/child/stats").then((r) => r.ok ? r.json() : null),
          fetch("/api/child/badges").then((r) => r.ok ? r.json() : null),
          fetch("/api/child/trophies").then((r) => r.ok ? r.json() : null),
          fetch("/api/child/history").then((r) => r.ok ? r.json() : null),
        ]).then(([s, b, t, h]: [StatsData | null, { badges?: ApiBadge[] } | null, { trophies?: ApiTrophy[] } | null, { sessions?: HistorySession[] } | null]) => {
          if (s) setStats(s);
          if (b?.badges) setBadges(b.badges);
          if (t?.trophies) setTrophies(t.trophies);
          if (h?.sessions) setHistory(h.sessions);
          else if (Array.isArray(h)) setHistory(h as HistorySession[]);
        }).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [router]);

  const totalPoints = stats?.totalPoints ?? 0;
  const streak = stats?.streakDays ?? 0;

  const earnedBadges = badges.filter((b) => b.earned);
  const earnedTrophies = trophies.filter((t) => t.earned);

  // Calendar data
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DOW_LABELS = ["S","M","T","W","T","F","S"];

  const activeDays = new Set<number>(
    history
      .map((s) => {
        const d = new Date(s.startedAt);
        if (d.getFullYear() === year && d.getMonth() === month) return d.getDate();
        return null;
      })
      .filter((d): d is number => d !== null),
  );
  const calendar = buildCalendar(year, month, activeDays);

  // Stars data
  const weekStars = starsThisWeek(history);
  const monthStars = starsThisMonth(history);
  const nextMilestone = nextStarMilestone(totalPoints);
  const toNextMilestone = nextMilestone - totalPoints;

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.font, color: C.muted, fontSize: 18, fontWeight: 700 }}>
          Loading your rewards...
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes rc-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes rc-glow  { 0%,100%{box-shadow:0 0 0 0 rgba(255,209,102,0.4)} 50%{box-shadow:0 0 0 10px rgba(255,209,102,0)} }
        @keyframes rc-flame { 0%,100%{transform:scale(1) rotate(-3deg)} 50%{transform:scale(1.1) rotate(3deg)} }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.base, fontFamily: C.font, color: C.text, paddingBottom: 60 }}>
        {/* Back nav */}
        <div style={{ padding: "16px 24px 0" }}>
          <Link href="/child" style={{ color: C.violet, fontWeight: 900, fontSize: 14, textDecoration: "none" }}>
            ← Home
          </Link>
        </div>

        {/* Page header */}
        <div style={{ padding: "20px 28px 0" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
            Your Reward Cabinet ✨
          </div>
          <div style={{ fontSize: 14, color: "#b8a0e8", fontWeight: 700, marginBottom: 16 }}>
            Everything you&apos;ve collected on your adventure — every item stays here forever!
          </div>

          {/* Quick stats bar */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { icon: "⭐", val: totalPoints, label: "Stars" },
              { icon: "🏅", val: earnedBadges.length, label: "Badges" },
              { icon: "🏆", val: earnedTrophies.length, label: "Trophies" },
              { icon: "🔥", val: streak, label: "Day streak" },
            ].map((pill) => (
              <div key={pill.label} style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `2px solid ${C.border}`, borderRadius: 12, padding: "8px 14px" }}>
                <span style={{ fontSize: 22 }}>{pill.icon}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{pill.val}</div>
                  <div style={{ fontSize: 10, color: "#7a6090", fontWeight: 700 }}>{pill.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 16px", marginBottom: 20, overflowX: "auto" }}>
          <TabButton id="badges" activeTab={activeTab} onClick={() => setActiveTab("badges")}>🏅 Badges</TabButton>
          <TabButton id="trophies" activeTab={activeTab} onClick={() => setActiveTab("trophies")}>🏆 Trophies</TabButton>
          <TabButton id="streak" activeTab={activeTab} onClick={() => setActiveTab("streak")}>🔥 Streak</TabButton>
          <TabButton id="stars" activeTab={activeTab} onClick={() => setActiveTab("stars")}>⭐ Stars</TabButton>
        </div>

        {/* ── Badges Tab ── */}
        {activeTab === "badges" && (
          <div style={{ padding: "0 16px" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.violet, marginBottom: 4 }}>
              🏅 Badge Collection
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 16 }}>
              {earnedBadges.length} earned · {badges.length - earnedBadges.length} to unlock
            </div>

            {badges.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 14, fontWeight: 700 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
                No badges yet — start playing quests to earn your first badge!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12 }}>
                {[...badges].sort((a, b) => {
                  if (a.earned !== b.earned) return a.earned ? -1 : 1;
                  return 0;
                }).map((b) => (
                  <SmallBadgeCard
                    key={b.id}
                    badge={{
                      emoji: getBadgeEmoji(b.iconKey ?? b.badgeKey),
                      name: b.displayName,
                      earned: b.earned,
                      earnedDate: formatEarnedAt(b.earnedAt),
                    }}
                  />
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Link href="/child/badges" style={{ color: C.violet, fontWeight: 900, fontSize: 13, textDecoration: "none" }}>
                View full badges page →
              </Link>
            </div>
          </div>
        )}

        {/* ── Trophies Tab ── */}
        {activeTab === "trophies" && (
          <div style={{ padding: "0 16px" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#ffd166", marginBottom: 4 }}>
              🏆 Trophy Collection
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 16 }}>
              {earnedTrophies.length} earned · {trophies.length - earnedTrophies.length} to unlock
            </div>

            {trophies.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 14, fontWeight: 700 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
                No trophies yet — reach big milestones to earn your first trophy!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
                {[...trophies].sort((a, b) => {
                  if (a.earned !== b.earned) return a.earned ? -1 : 1;
                  const order: Record<string, number> = { gold: 0, silver: 1, bronze: 2 };
                  return (order[a.tier] ?? 3) - (order[b.tier] ?? 3);
                }).map((t) => (
                  <SmallTrophyCard
                    key={t.id}
                    trophy={{
                      emoji: getTrophyEmoji(t.tier, t.trophyKey),
                      name: t.displayName,
                      tier: t.tier,
                      earned: t.earned,
                      earnedDate: formatEarnedAt(t.earnedAt),
                    }}
                  />
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Link href="/child/trophies" style={{ color: "#ffd166", fontWeight: 900, fontSize: 13, textDecoration: "none" }}>
                View full trophies page →
              </Link>
            </div>
          </div>
        )}

        {/* ── Streak Tab ── */}
        {activeTab === "streak" && (
          <div style={{ padding: "0 16px", maxWidth: 520 }}>
            {/* Current streak hero */}
            <div style={{
              background: streak > 0
                ? "linear-gradient(135deg,#2a1808,#1a1060)"
                : "linear-gradient(135deg,#1a1060,#0d0924)",
              border: `2px solid ${streak > 0 ? C.amber : C.border}`,
              borderRadius: 24,
              padding: "24px 20px",
              textAlign: "center",
              marginBottom: 16,
              animation: streak >= 7 ? "rc-glow 2.5s ease infinite" : undefined,
            }}>
              <span style={{ fontSize: 48, display: "inline-block", animation: streak > 0 ? "rc-flame 1.5s ease-in-out infinite" : undefined }}>🔥</span>
              <div style={{ fontSize: 64, fontWeight: 900, color: streak > 0 ? C.gold : C.muted, lineHeight: 1, marginTop: 8, textShadow: streak > 0 ? "0 4px 20px rgba(255,209,102,0.4)" : undefined }}>
                {streak}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: streak > 0 ? C.amber : C.muted }}>
                {streak === 1 ? "day in a row!" : "days in a row!"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(232,224,255,0.65)", fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>
                {streak > 0
                  ? "Come back tomorrow to keep your streak alive!"
                  : "Complete a quest today to start your streak!"}
              </div>
            </div>

            {/* Monthly calendar */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{MONTH_NAMES[month]} {year}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Active days highlighted</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
                {DOW_LABELS.map((d, i) => (
                  <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 800, color: C.muted, textTransform: "uppercase" }}>
                    {d}
                  </div>
                ))}
              </div>

              {calendar.map((week, wi) => (
                <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      style={{
                        aspectRatio: "1",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        background: cell.day === null ? "transparent" : cell.active ? "rgba(155,114,255,0.6)" : cell.isToday ? "rgba(255,209,102,0.15)" : "rgba(255,255,255,0.05)",
                        border: cell.isToday ? `2px solid ${C.gold}` : cell.active ? `2px solid ${C.violet}` : "2px solid transparent",
                        color: cell.active ? "#fff" : cell.isToday ? C.gold : cell.day !== null ? "rgba(232,224,255,0.5)" : "transparent",
                        boxShadow: cell.active ? `0 0 6px rgba(155,114,255,0.5)` : undefined,
                      }}
                    >
                      {cell.day ?? ""}
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ marginTop: 12, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(155,114,255,0.6)", border: `2px solid ${C.violet}` }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Active day</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${C.gold}` }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>Today</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <Link href="/child/streak" style={{ color: C.amber, fontWeight: 900, fontSize: 13, textDecoration: "none" }}>
                View full streak page →
              </Link>
            </div>
          </div>
        )}

        {/* ── Stars Tab ── */}
        {activeTab === "stars" && (
          <div style={{ padding: "0 16px", maxWidth: 520 }}>
            {/* Big star total */}
            <div style={{
              background: "linear-gradient(135deg,#2a2010,#1a1060)",
              border: `2px solid ${C.gold}`,
              borderRadius: 24,
              padding: "28px 24px",
              textAlign: "center",
              marginBottom: 16,
              animation: "rc-glow 2.5s ease infinite",
            }}>
              <span style={{ fontSize: 60, display: "inline-block", animation: "rc-float 2.5s ease-in-out infinite" }}>⭐</span>
              <div style={{ fontSize: 72, fontWeight: 900, color: C.gold, lineHeight: 1, marginTop: 8, textShadow: "0 4px 24px rgba(255,209,102,0.4)" }}>
                {totalPoints.toLocaleString()}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.amber, marginTop: 4 }}>
                Total Stars Earned
              </div>
            </div>

            {/* This week + this month */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 16, padding: "16px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.gold }}>⭐ {weekStars}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginTop: 4 }}>Stars this week</div>
              </div>
              <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 16, padding: "16px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.gold }}>⭐ {monthStars}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginTop: 4 }}>Stars this month</div>
              </div>
            </div>

            {/* Star milestone progress */}
            <div style={{
              background: C.surface,
              border: `2px solid ${C.border}`,
              borderRadius: 20,
              padding: "20px 18px",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                ⭐ Star Milestone
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <span style={{ fontSize: 36 }}>⭐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
                    {totalPoints.toLocaleString()} / {nextMilestone.toLocaleString()}
                  </div>
                  <div style={{ height: 10, background: C.border, borderRadius: 6, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(Math.round((totalPoints / nextMilestone) * 100), 100)}%`,
                      background: "linear-gradient(90deg, #ffd166, #ffb020)",
                      borderRadius: 6,
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>
                {toNextMilestone > 0
                  ? `${toNextMilestone.toLocaleString()} more to reach ${nextMilestone.toLocaleString()}!`
                  : "All star milestones reached! 🎉"}
              </div>
              {toNextMilestone > 0 && (
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginTop: 4 }}>
                  Keep playing quests to earn more stars!
                </div>
              )}
            </div>

            {/* Star history (last 5 sessions) */}
            {history.length > 0 && (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: C.violet, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  Recent Sessions
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {history.slice(0, 5).map((s, i) => {
                    const d = new Date(s.startedAt);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>
                          {d.toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: C.gold }}>
                          +{s.pointsEarned} ⭐
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
