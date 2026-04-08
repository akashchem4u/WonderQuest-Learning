"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  text: "#e8e0ff",
  muted: "#9b8ec4",
  surface: "#1a1540",
  border: "#2a2060",
} as const;

type ChildStats = {
  displayName: string;
  streakDays: number;
  totalPoints: number;
  lastSession: { startedAt: string; endedAt: string } | null;
};

function getGapMs(lastSession: ChildStats["lastSession"]): number {
  if (!lastSession) return Infinity;
  return Date.now() - new Date(lastSession.startedAt).getTime();
}

const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

export default function ChildReturningPage() {
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch("/api/child/stats")
      .then((r) => {
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then((data: ChildStats) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const font: React.CSSProperties = { fontFamily: "'Nunito', system-ui, sans-serif" };

  const wrapper: React.CSSProperties = {
    ...font,
    minHeight: "100vh",
    background: C.base,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
  };

  if (loading) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={wrapper}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: `4px solid ${C.violet}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: C.muted, fontSize: 16, fontWeight: 700 }}>Loading...</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </AppFrame>
    );
  }

  if (error || !stats) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <div style={wrapper}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.text, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>We couldn&apos;t load your profile.</div>
            <button onClick={loadData} style={{ ...font, padding: "12px 28px", background: C.violet, border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer" }}>
              Retry
            </button>
          </div>
        </div>
      </AppFrame>
    );
  }

  const gapMs = getGapMs(stats.lastSession);
  const name = stats.displayName || "Explorer";
  const streak = stats.streakDays ?? 0;
  const points = stats.totalPoints ?? 0;

  // No prior session
  if (!stats.lastSession) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`@keyframes mascotFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        <div style={wrapper}>
          <div style={{ ...font, maxWidth: 480, width: "100%", background: "linear-gradient(135deg, #1a1060, #140e50)", border: `2px solid ${C.border}`, borderRadius: 24, padding: "36px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 80, marginBottom: 16, display: "block", animation: "mascotFloat 2.5s ease-in-out infinite" }}>🚀</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>
              Ready for your first adventure?
            </div>
            <div style={{ fontSize: 16, color: "#b8a0e8", fontWeight: 700, marginBottom: 28 }}>
              Your quest is about to begin!
            </div>
            <Link href="/child/quickstart" style={{ ...font, display: "block", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${C.violet}, #7c4ddb)`, color: "#fff", fontSize: 20, fontWeight: 900, textDecoration: "none", boxShadow: "0 6px 20px rgba(155,114,255,0.4)" }}>
              Begin your quest →
            </Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // Less than 2 hours
  if (gapMs < 2 * HOUR) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`@keyframes mascotFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        <div style={wrapper}>
          <div style={{ ...font, maxWidth: 480, width: "100%", background: "linear-gradient(135deg, #0e2a10, #1a3a20)", border: `2px solid ${C.mint}`, borderRadius: 24, padding: "36px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 80, marginBottom: 16, display: "inline-block", animation: "mascotFloat 2.5s ease-in-out infinite" }}>👋</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>
              Welcome back, {name}!
            </div>
            <div style={{ fontSize: 16, color: "#b8e8c0", fontWeight: 700, marginBottom: 24 }}>
              You&apos;re on a <span style={{ color: C.gold, fontWeight: 900 }}>{streak} day streak</span>! Keep it up.
            </div>
            <Link href="/play" style={{ ...font, display: "block", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${C.mint}, #3ab870)`, color: "#0a2a15", fontSize: 20, fontWeight: 900, textDecoration: "none", boxShadow: "0 6px 20px rgba(80,232,144,0.35)" }}>
              Continue where you left off →
            </Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // 2–24 hours
  if (gapMs < DAY) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`@keyframes mascotFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        <div style={wrapper}>
          <div style={{ ...font, maxWidth: 480, width: "100%", background: "linear-gradient(135deg, #1a1060, #140e50)", border: `2px solid ${C.violet}`, borderRadius: 24, padding: "36px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 80, marginBottom: 16, display: "inline-block", animation: "mascotFloat 2.5s ease-in-out infinite" }}>⭐</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>
              Great to see you, {name}!
            </div>
            <div style={{ fontSize: 16, color: "#b8a0e8", fontWeight: 700, marginBottom: 20 }}>
              Ready for today&apos;s quest?
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
              <div style={{ background: "#2a2010", border: `2px solid ${C.gold}`, borderRadius: 16, padding: "12px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.gold }}>{streak}🔥</div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>Day Streak</div>
              </div>
              <div style={{ background: "#1a2060", border: `2px solid ${C.violet}`, borderRadius: 16, padding: "12px 18px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.violet }}>⭐ {points}</div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>Total Points</div>
              </div>
            </div>
            <Link href="/play" style={{ ...font, display: "block", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${C.violet}, #7c4ddb)`, color: "#fff", fontSize: 20, fontWeight: 900, textDecoration: "none", boxShadow: "0 6px 20px rgba(155,114,255,0.4)" }}>
              Start today&apos;s quest →
            </Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // 1–7 days
  const daysAway = Math.floor(gapMs / DAY);
  if (gapMs < 7 * DAY) {
    return (
      <AppFrame audience="kid" currentPath="/child">
        <style>{`@keyframes mascotFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        <div style={wrapper}>
          <div style={{ ...font, maxWidth: 480, width: "100%", background: "linear-gradient(135deg, #2a1a10, #1a1008)", border: `2px solid ${C.gold}`, borderRadius: 24, padding: "36px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 80, marginBottom: 16, display: "inline-block", animation: "mascotFloat 2.5s ease-in-out infinite" }}>🌟</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>
              You&apos;ve been away {daysAway} day{daysAway !== 1 ? "s" : ""}, {name}
            </div>
            <div style={{ fontSize: 16, color: "#e8c880", fontWeight: 700, marginBottom: 24 }}>
              Let&apos;s get back on track! Your streak reset but you can start fresh.
            </div>
            <Link href="/play" style={{ ...font, display: "block", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${C.gold}, #e6a800)`, color: "#1a1000", fontSize: 20, fontWeight: 900, textDecoration: "none", boxShadow: "0 6px 20px rgba(255,209,102,0.35)" }}>
              Rebuild your streak →
            </Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  // More than 7 days
  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`@keyframes mascotFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
      <div style={wrapper}>
        <div style={{ ...font, maxWidth: 480, width: "100%", background: "linear-gradient(135deg, #1a1060, #2a1060)", border: `2px solid ${C.violet}`, borderRadius: 24, padding: "36px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 16, display: "inline-block", animation: "mascotFloat 2.5s ease-in-out infinite" }}>🎉</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.text, marginBottom: 8, lineHeight: 1.2 }}>
            Welcome back, {name}!
          </div>
          <div style={{ fontSize: 16, color: "#b8a0e8", fontWeight: 700, marginBottom: 24 }}>
            It&apos;s been a while — let&apos;s restart your adventure!
          </div>
          <Link href="/play" style={{ ...font, display: "block", padding: "16px", borderRadius: 16, background: `linear-gradient(135deg, ${C.violet}, #7c4ddb)`, color: "#fff", fontSize: 20, fontWeight: 900, textDecoration: "none", boxShadow: "0 6px 20px rgba(155,114,255,0.4)" }}>
            Start fresh →
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}
