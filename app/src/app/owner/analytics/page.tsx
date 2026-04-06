"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", gold: "#ffd166", coral: "#ff7b6b",
};

type Session = { id: string; displayName: string; sessionMode: string; startedAt: string; endedAt: string | null; effectivenessScore: number | null };
type Overview = {
  studentCount: number; sessionCount: number; exampleCount: number;
  explainerCount: number; totalPoints: number;
  latestSessions: Session[];
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OwnerAnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/overview")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 32px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/owner" style={{ fontSize: 12, color: "rgba(155,114,255,0.7)", textDecoration: "none", fontWeight: 600 }}>← Owner</Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Analytics</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>Platform activity snapshot — testers excluded</p>

        {loading && <div style={{ color: C.muted, fontSize: 14 }}>Loading…</div>}
        {!loading && !data && <div style={{ color: C.coral, fontSize: 14 }}>Failed to load data</div>}
        {!loading && data && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              {[
                { val: data.sessionCount, lbl: "Total Sessions", color: C.violet },
                { val: data.studentCount, lbl: "Active Students", color: C.mint },
                { val: data.exampleCount, lbl: "Question Bank Size", color: C.gold },
                { val: data.explainerCount, lbl: "Explainer Assets", color: C.coral },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", flex: "1 1 140px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Latest Sessions</div>
              {(data.latestSessions ?? []).length === 0 && (
                <div style={{ fontSize: 13, color: C.muted }}>No sessions yet</div>
              )}
              {(data.latestSessions ?? []).map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.displayName}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{s.sessionMode} · {s.effectivenessScore != null ? `${s.effectivenessScore}% effective` : "in progress"}</div>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{relativeTime(s.startedAt)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
