"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", gold: "#ffd166", coral: "#ff7b6b",
};

type BandRow = { code: string; displayName: string; studentCount: number };
type Learner = { displayName: string; launchBandCode: string; totalPoints: number; currentLevel: number };
type Overview = {
  studentCount: number; guardianCount: number; sessionCount: number;
  totalPoints: number; byBand: BandRow[]; topLearners: Learner[];
};

export default function OwnerUsersPage() {
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
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Users</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>Live counts from production — testers excluded</p>

        {loading && <div style={{ color: C.muted, fontSize: 14 }}>Loading…</div>}
        {!loading && !data && <div style={{ color: C.coral, fontSize: 14 }}>Failed to load data</div>}
        {!loading && data && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              {[
                { val: data.studentCount, lbl: "Students", color: C.violet },
                { val: data.guardianCount, lbl: "Guardians", color: C.mint },
                { val: data.sessionCount, lbl: "Total Sessions", color: C.gold },
                { val: (data.totalPoints ?? 0).toLocaleString(), lbl: "Stars Earned", color: C.coral },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", flex: "1 1 140px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Students by Band</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {(data.byBand ?? []).map((b) => (
                  <div key={b.code} style={{ background: "rgba(155,114,255,0.08)", border: "1px solid rgba(155,114,255,0.2)", borderRadius: 10, padding: "10px 16px", minWidth: 100 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: C.violet }}>{b.studentCount}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{b.displayName ?? b.code}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Top Learners</div>
              {(data.topLearners ?? []).map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(155,114,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: C.violet, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{l.displayName}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{l.launchBandCode} · Level {l.currentLevel}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: C.gold }}>⭐ {l.totalPoints}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
