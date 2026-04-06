"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { getAvatarsForBand } from "@/lib/launch-data";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionData = {
  student: {
    displayName: string;
    username?: string;
    avatarKey: string;
    launchBandCode: string;
  };
};

type StatsData = {
  totalPoints: number;
  currentLevel: number;
  badgeCount: number;
  streakDays: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  base: "#0a0820",
  violet: "#9b72ff",
  mint: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  surface: "#12103a",
  surface2: "#1e1a50",
  border: "#2a2060",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Map avatar_key → emoji
const AVATAR_EMOJI: Record<string, string> = {
  "lion-striker": "🦁",
  "fox-runner": "🦊",
  "panda-pilot": "🐼",
  "owl-builder": "🦉",
  "bunny-helper": "🐰",
  "bear-explorer": "🐻",
};

function avatarEmoji(key: string): string {
  return AVATAR_EMOJI[key] ?? "🌟";
}

function bandLabel(code: string): string {
  const map: Record<string, string> = {
    PREK: "⭐ Pre-K Adventure",
    K1: "⭐ Super Starter · Kinder–Grade 1",
    G23: "🚀 Space Explorer · Grades 2–3",
    G45: "🔨 Quest Builder · Grades 4–5",
    G67: "⚡ Champion · Grades 6–7",
  };
  return map[code] ?? code;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChildProfilePage() {
  const router = useRouter();

  const [session, setSession] = useState<SessionData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);

  // Avatar picker state
  const [currentAvatarKey, setCurrentAvatarKey] = useState<string>("");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarSaved, setAvatarSaved] = useState(false);

  // Load session + stats in parallel
  useEffect(() => {
    const sessionP = fetch("/api/child/session").then((r) => {
      if (!r.ok) {
        if (r.status === 401) router.replace("/child");
        return Promise.reject(r.status);
      }
      return r.json() as Promise<SessionData>;
    });

    const statsP = fetch("/api/child/stats").then((r) =>
      r.ok ? (r.json() as Promise<StatsData>) : Promise.reject(r.status),
    );

    Promise.all([sessionP, statsP])
      .then(([sess, st]) => {
        setSession(sess);
        setCurrentAvatarKey(sess.student.avatarKey);
        setStats(st);
        setLoading(false);
      })
      .catch(() => {
        setSessionError(true);
        setLoading(false);
      });
  }, [router]);

  async function handleAvatarSelect(avatarKey: string) {
    if (avatarKey === currentAvatarKey || savingAvatar) return;
    setSavingAvatar(true);
    setCurrentAvatarKey(avatarKey); // optimistic update
    try {
      await fetch("/api/child/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarKey }),
      });
      setAvatarSaved(true);
      setTimeout(() => setAvatarSaved(false), 2000);
    } catch {
      // revert on error
      setCurrentAvatarKey(session?.student.avatarKey ?? avatarKey);
    } finally {
      setSavingAvatar(false);
    }
  }

  const displayName = session?.student.displayName ?? "Explorer";
  const username = session?.student.username;
  const launchBandCode = session?.student.launchBandCode ?? "K1";
  const bandAvatars = getAvatarsForBand(launchBandCode);

  const totalPoints = stats?.totalPoints ?? 0;
  const currentLevel = stats?.currentLevel ?? 1;
  const badgeCount = stats?.badgeCount ?? 0;
  const streakDays = stats?.streakDays ?? 0;

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @keyframes card-enter { from { opacity:0; transform:translateY(14px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes pulse-gold { 0%,100% { box-shadow: 0 0 0 0 rgba(255,209,102,0.5); } 50% { box-shadow: 0 0 0 6px rgba(255,209,102,0); } }
        @keyframes pop-in { from { transform:scale(0.7); opacity:0; } to { transform:scale(1); opacity:1; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.base, fontFamily: "'Nunito', system-ui, sans-serif", padding: "20px 16px 72px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: 440, width: "100%" }}>

          {/* ── Loading ──────────────────────────────────────────────── */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0", color: C.muted, fontSize: 15, fontWeight: 700 }}>
              ✨ Loading your profile...
            </div>
          )}

          {/* ── Error ────────────────────────────────────────────────── */}
          {!loading && sessionError && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😅</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.text, marginBottom: 8 }}>Couldn&apos;t load your profile</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Check your connection and try again.</div>
              <button onClick={() => window.location.reload()} style={{ padding: "10px 24px", background: C.violet, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Nunito', system-ui, sans-serif" }}>
                Try again
              </button>
            </div>
          )}

          {/* ── Profile ──────────────────────────────────────────────── */}
          {!loading && !sessionError && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "card-enter 0.35s cubic-bezier(0.34,1.56,0.64,1) both" }}>

              {/* ── Hero card ──────────────────────────────────────── */}
              <div style={{ background: "linear-gradient(145deg, #1a1260, #2a1080, #0a0820)", border: `2px solid ${C.gold}44`, borderRadius: 24, padding: "28px 24px 22px", position: "relative", overflow: "hidden" }}>
                {/* Decorative circles */}
                <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: `${C.gold}10`, pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, borderRadius: "50%", background: `${C.violet}10`, pointerEvents: "none" }} />

                {/* Avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20, position: "relative" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 22, background: "linear-gradient(135deg, #1a1060, #2a1880)", border: `3px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, boxShadow: `0 0 20px ${C.gold}40`, animation: "pulse-gold 3s infinite", flexShrink: 0 }}>
                    {avatarEmoji(currentAvatarKey)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 6 }}>{displayName}</div>
                    <div style={{ display: "inline-block", background: `${C.gold}20`, border: `1px solid ${C.gold}66`, borderRadius: 10, padding: "4px 10px", fontSize: 12, fontWeight: 800, color: C.gold, marginBottom: username ? 6 : 0 }}>
                      {bandLabel(launchBandCode)}
                    </div>
                    {username && (
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>@{username}</div>
                    )}
                  </div>
                </div>

                {/* Stats strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[
                    { emoji: "⭐", value: totalPoints, label: "Stars" },
                    { emoji: "📈", value: `Lv ${currentLevel}`, label: "Level" },
                    { emoji: "🏅", value: badgeCount, label: "Badges" },
                    { emoji: "🔥", value: streakDays, label: "Streak" },
                  ].map(({ emoji, value, label }) => (
                    <div key={label} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "10px 6px", textAlign: "center", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 18 }}>{emoji}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: C.gold, lineHeight: 1.2 }}>{value}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Change your guide ──────────────────────────────── */}
              <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 20, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>Change your guide</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Pick the explorer who travels with you</div>
                  </div>
                  {avatarSaved && (
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.mint, animation: "pop-in 0.2s ease" }}>✓ Saved!</div>
                  )}
                </div>

                {bandAvatars.length === 0 ? (
                  <div style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "12px 0" }}>
                    No guides available for your band yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {bandAvatars.map((av) => {
                      const isActive = av.avatar_key === currentAvatarKey;
                      const emoji = avatarEmoji(av.avatar_key);
                      return (
                        <button
                          key={av.avatar_key}
                          onClick={() => handleAvatarSelect(av.avatar_key)}
                          disabled={savingAvatar}
                          style={{
                            width: 72,
                            background: isActive ? `${C.gold}18` : "rgba(255,255,255,0.04)",
                            border: `3px solid ${isActive ? C.gold : C.border}`,
                            borderRadius: 16,
                            padding: "10px 0 8px",
                            cursor: savingAvatar ? "wait" : "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                            transition: "border-color 0.15s, background 0.15s, transform 0.1s",
                            transform: isActive ? "scale(1.06)" : "scale(1)",
                            boxShadow: isActive ? `0 0 12px ${C.gold}44` : "none",
                            fontFamily: "'Nunito', system-ui, sans-serif",
                          }}
                        >
                          <span style={{ fontSize: 30 }}>{emoji}</span>
                          <span style={{ fontSize: 9, fontWeight: 800, color: isActive ? C.gold : C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            {av.display_name.split(" ")[0]}
                          </span>
                          {isActive && (
                            <span style={{ fontSize: 10, fontWeight: 900, color: C.gold }}>★</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Quick links ────────────────────────────────────── */}
              <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 20, padding: "18px 20px" }}>
                <div style={{ fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontSize: 11 }}>
                  Quick links
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { emoji: "🏆", label: "My badges", href: "/child/badges", color: C.gold },
                    { emoji: "🔥", label: "My streak", href: "/child/streak", color: C.coral },
                    { emoji: "📊", label: "My progress", href: "/child/band", color: C.violet },
                    { emoji: "🎯", label: "Daily challenge", href: "/child/daily-challenge", color: C.mint },
                  ].map(({ emoji, label, href, color }) => (
                    <Link
                      key={href}
                      href={href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        background: `${color}10`,
                        border: `1.5px solid ${color}40`,
                        borderRadius: 14,
                        textDecoration: "none",
                        transition: "background 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Theme link ─────────────────────────────────────── */}
              <Link
                href="/child/theme"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: C.surface,
                  border: `2px solid ${C.border}`,
                  borderRadius: 20,
                  padding: "16px 20px",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>🎨</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>Change theme</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Make WonderQuest look just right</div>
                  </div>
                </div>
                <span style={{ fontSize: 18, color: C.muted }}>›</span>
              </Link>

              {/* ── Back link ──────────────────────────────────────── */}
              <div style={{ textAlign: "center", paddingTop: 4 }}>
                <Link href="/child" style={{ fontSize: 13, fontWeight: 700, color: C.violet, textDecoration: "none" }}>
                  ← Back to home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
