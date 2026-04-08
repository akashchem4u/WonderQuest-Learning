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

type ChildSession = {
  student: { displayName?: string; launchBandCode?: string };
};

type Assignment = {
  id: string;
  skillCode: string;
  dueAt: string | null;
  completedAt: string | null;
  status: string;
  title: string | null;
};

type MissedQuestion = {
  skillCode: string;
  displayName: string;
  missCount: number;
  lastMissedAt: string;
};

function SkeletonCard() {
  return (
    <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 14, padding: 14, display: "flex", gap: 12 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: C.border, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 14, borderRadius: 6, background: C.border, width: "60%" }} />
        <div style={{ height: 10, borderRadius: 6, background: C.border, width: "80%" }} />
      </div>
    </div>
  );
}

export default function ChildQuestPage() {
  const [session, setSession] = useState<ChildSession | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [missed, setMissed] = useState<MissedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      fetch("/api/child/session").then((r) => r.json()),
      fetch("/api/child/assignments").then((r) => r.json()),
      fetch("/api/child/missed-questions").then((r) => r.json()),
    ])
      .then(([sessionData, assignData, missData]) => {
        if (sessionData) setSession(sessionData as ChildSession);
        setAssignments(Array.isArray(assignData) ? assignData : []);
        setMissed(Array.isArray(missData) ? missData : []);
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

  const practiceItems = missed.slice(0, 3);
  const bandCode = session?.student?.launchBandCode ?? "";
  const pageIntro = `Welcome to your quests, ${session?.student?.displayName ?? "adventurer"}! Here are your learning quests for today.`;

  return (
    <AppFrame audience="kid" currentPath="/child">
      <PreReaderShell bandCode={bandCode} pageIntro={pageIntro}>
      <style>{`@keyframes dot-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.5); } 50% { box-shadow: 0 0 0 4px rgba(155,114,255,0); } }`}</style>
      <div style={{ minHeight: "100vh", background: "#0a0820", fontFamily: "'Nunito', system-ui, sans-serif", padding: "24px 16px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ height: 20, borderRadius: 6, background: C.border, width: 120, marginBottom: 8 }} />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>Couldn&apos;t load quests</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>Check your connection and try again.</div>
            <button onClick={loadData} style={{ padding: "12px 28px", background: C.violet, border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Nunito', system-ui", fontSize: 15, fontWeight: 900, cursor: "pointer", minHeight: 44, minWidth: 44, touchAction: "manipulation" }}>
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Section: Your Quests */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Your Quests</div>
              {assignments.length === 0 ? (
                <div style={{ background: C.surface, border: `2px solid ${C.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No quests yet — your teacher will assign some soon.</div>
                  <Link href="/play" style={{ fontSize: 14, fontWeight: 900, color: C.violet, textDecoration: "none" }}>Try free play! →</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {assignments.map((a) => {
                    const isDone = a.status === "completed" || !!a.completedAt;
                    const isLocked = a.status === "locked";
                    const emoji = isDone ? "✅" : isLocked ? "🔒" : "📚";
                    const borderColor = isDone ? C.mint : isLocked ? C.border : C.violet;
                    const bg = isDone ? "#0e2010" : isLocked ? "#12103a" : "#1e1470";
                    return (
                      <div
                        key={a.id}
                        style={{ background: bg, border: `2px solid ${borderColor}`, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center", opacity: isLocked ? 0.5 : 1 }}
                      >
                        <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: isDone ? "#1a3a20" : isLocked ? "#12083a" : "#2d1f80", flexShrink: 0 }}>
                          {emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color: isDone ? "#c0e8c0" : C.text, marginBottom: 2 }}>{a.title || a.skillCode}</div>
                          {isDone && <div style={{ fontSize: 11, color: C.mint, fontWeight: 700 }}>Completed ✓</div>}
                          {isLocked && (
                            <>
                              <div style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>🔒 Locked</div>
                              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                                Complete other quests first
                              </div>
                            </>
                          )}
                        </div>
                        {!isLocked && (
                          <Link href="/play" style={{ padding: "8px 14px", background: isDone ? C.mint : C.violet, borderRadius: 10, color: isDone ? "#0a2a15" : "#fff", fontSize: 12, fontWeight: 900, textDecoration: "none", flexShrink: 0, minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation" }}>
                            {isDone ? "Replay" : "Start →"}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section: Practice Zone */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Practice Zone</div>
              {practiceItems.length === 0 ? (
                <div style={{ background: "#0e2010", border: `2px solid ${C.mint}`, borderRadius: 14, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🌟</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.mint, marginBottom: 4 }}>All caught up!</div>
                  <Link href="/play" style={{ fontSize: 13, fontWeight: 900, color: C.mint, textDecoration: "none" }}>Keep practicing →</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {practiceItems.map((m) => (
                    <div key={m.skillCode} style={{ background: "#1a1020", border: `2px solid #3a1060`, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: "#2a0a40", flexShrink: 0 }}>
                        🎯
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: C.text, marginBottom: 2 }}>{m.displayName}</div>
                        <div style={{ fontSize: 11, color: "#ff9b72", fontWeight: 700 }}>{m.missCount} recent miss{m.missCount !== 1 ? "es" : ""}</div>
                      </div>
                      <Link href={`/play?skill=${m.skillCode}`} style={{ padding: "8px 14px", background: "#7c4ddb", borderRadius: 10, color: "#fff", fontSize: 12, fontWeight: 900, textDecoration: "none", flexShrink: 0, minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation" }}>
                        Practice →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
              <Link href="/child" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none", minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", touchAction: "manipulation" }}>← Home</Link>
              <Link href="/child/world" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none", minHeight: 44, minWidth: 44, display: "inline-flex", alignItems: "center", touchAction: "manipulation" }}>World Map</Link>
            </div>
          </div>
        )}
      </div>
      </PreReaderShell>
    </AppFrame>
  );
}
