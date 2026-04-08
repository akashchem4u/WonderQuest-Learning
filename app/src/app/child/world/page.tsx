"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { AppFrame } from "@/components/app-frame";
import { PreReaderShell } from "@/components/pre-reader-shell";

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
  totalPoints: number;
  currentLevel: number;
  masteredSkillsCount: number;
  streakDays: number;
};

type ChildSession = {
  student: { launchBandCode: string };
};

const BANDS = [
  { key: "PREK", name: "Seedling Grove", icon: "🌱", ages: "Ages 3–5", color: "#fbbf24" },
  { key: "K1",   name: "Star Valley",    icon: "⭐", ages: "Ages 5–7", color: "#9b72ff" },
  { key: "G23",  name: "Explorer Ridge", icon: "🚀", ages: "Ages 7–9", color: "#2dd4bf" },
  { key: "G45",  name: "Lightning Peak", icon: "⚡", ages: "Ages 9–11", color: "#60a5fa" },
];

const BAND_ORDER = ["PREK", "K1", "G23", "G45"];

export default function ChildWorldPage() {
  const [session, setSession] = useState<ChildSession | null>(null);
  const [stats, setStats] = useState<ChildStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      fetch("/api/child/session").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/child/stats").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([sessionData, statsData]) => {
        if (sessionData) setSession(sessionData as ChildSession);
        if (statsData) setStats(statsData as ChildStats);
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

  const currentBandCode = session?.student?.launchBandCode ?? "K1";
  const currentBandIdx = BAND_ORDER.indexOf(currentBandCode);
  const effectiveIdx = currentBandIdx === -1 ? 1 : currentBandIdx;

  const level = stats?.currentLevel ?? 1;
  const mastered = stats?.masteredSkillsCount ?? 0;
  const streak = stats?.streakDays ?? 0;

  const currentBandMeta = BANDS[effectiveIdx];
  const worldPageIntro = `Welcome to your learning journey! You are in ${currentBandMeta?.name ?? "your world"}. You are level ${level} and have mastered ${mastered} skills. Keep it up!`;

  return (
    <AppFrame audience="kid" currentPath="/child">
      <PreReaderShell bandCode={currentBandCode} pageIntro={worldPageIntro}>
      <style>{`
        @keyframes world-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(155,114,255,0); }
        }
      `}</style>
      <div style={{ minHeight: "100vh", background: C.base, fontFamily: "'Nunito', system-ui, sans-serif", padding: "24px 16px 60px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header */}
          <div style={{ textAlign: "center", paddingBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>World Map</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.text }}>Your Learning Journey</div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ height: 88, borderRadius: 16, background: C.surface, border: `2px solid ${C.border}` }} />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: "center", padding: "40px 24px" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>Couldn&apos;t load world map</div>
              <button onClick={loadData} style={{ padding: "12px 28px", background: C.violet, border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Nunito', system-ui", fontSize: 15, fontWeight: 900, cursor: "pointer", minHeight: 44, minWidth: 44, touchAction: "manipulation" }}>
                Retry
              </button>
            </div>
          )}

          {/* World bands */}
          {!loading && !error && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {BANDS.map((band, idx) => {
                  const isPast = idx < effectiveIdx;
                  const isCurrent = idx === effectiveIdx;
                  const isFuture = idx > effectiveIdx;
                  const glowStyle = isCurrent
                    ? { animation: "world-glow 2s ease-in-out infinite", boxShadow: `0 0 0 3px ${band.color}40` }
                    : {};
                  return (
                    <div
                      key={band.key}
                      style={{
                        background: isFuture ? "#0d0b22" : C.surface,
                        border: `2px solid ${isCurrent ? band.color : isPast ? C.mint : C.border}`,
                        borderRadius: 16,
                        padding: "16px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        opacity: isFuture ? 0.45 : 1,
                        ...glowStyle,
                      }}
                    >
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: isFuture ? "#1a1540" : `${band.color}22`, border: `2px solid ${isFuture ? C.border : band.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                        {band.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: isCurrent ? band.color : isPast ? C.mint : C.muted, marginBottom: 1 }}>{band.name}</div>
                        <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{band.ages}</div>
                      </div>
                      {isPast && (
                        <div style={{ padding: "4px 10px", background: "#0e2a10", border: `1px solid ${C.mint}`, borderRadius: 20, fontSize: 11, fontWeight: 900, color: C.mint, flexShrink: 0 }}>
                          Completed ✓
                        </div>
                      )}
                      {isCurrent && (
                        <div style={{ padding: "4px 10px", background: `${band.color}22`, border: `1px solid ${band.color}`, borderRadius: 20, fontSize: 11, fontWeight: 900, color: band.color, flexShrink: 0 }}>
                          ▶ Your World
                        </div>
                      )}
                      {isFuture && (
                        <div style={{ padding: "4px 10px", background: "#1a1540", border: `1px solid ${C.border}`, borderRadius: 20, fontSize: 11, fontWeight: 900, color: C.muted, flexShrink: 0 }}>
                          🔒 Locked
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stats panel */}
              <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 16, padding: "14px 18px", display: "flex", gap: 0, justifyContent: "space-around", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.violet }}>Level {level}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>Current Level</div>
                </div>
                <div style={{ width: 1, background: C.border }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.gold }}>{mastered}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>Skills Mastered</div>
                </div>
                <div style={{ width: 1, background: C.border }} />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#ff9b72" }}>{streak}🔥</div>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginTop: 2 }}>Day Streak</div>
                </div>
              </div>

              {/* CTA */}
              <Link href="/play" style={{ display: "block", textDecoration: "none" }}>
                <button style={{ width: "100%", padding: "16px", background: `linear-gradient(135deg, ${C.violet}, #7c4ddb)`, border: "none", borderRadius: 14, color: "#fff", fontFamily: "'Nunito', system-ui", fontSize: 18, fontWeight: 900, cursor: "pointer", boxShadow: "0 6px 20px rgba(155,114,255,0.35)", minHeight: 44, touchAction: "manipulation" }}>
                  Continue Quest →
                </button>
              </Link>

              <div style={{ display: "flex", gap: 12 }}>
                <Link href="/child" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none", minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", touchAction: "manipulation" }}>← Home</Link>
                <Link href="/child/quest" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none", minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", touchAction: "manipulation" }}>Start Quest</Link>
              </div>
            </>
          )}
        </div>
      </div>
      </PreReaderShell>
    </AppFrame>
  );
}
