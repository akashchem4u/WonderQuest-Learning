"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", gold: "#ffd166",
};

type BandRow = { code: string; displayName: string; studentCount: number };
type Overview = { studentCount: number; guardianCount: number; byBand: BandRow[] };

export default function OwnerSchoolsPage() {
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
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Schools</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>
          School-level management is coming in the next phase. Showing aggregate enrollment for now.
        </p>

        {loading && <div style={{ color: C.muted, fontSize: 14 }}>Loading…</div>}
        {!loading && !data && <div style={{ color: "#ff7b6b", fontSize: 14 }}>Failed to load data</div>}
        {!loading && data && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              {[
                { val: data.studentCount, lbl: "Enrolled Students", color: C.violet },
                { val: data.guardianCount, lbl: "Guardian Accounts", color: C.mint },
              ].map(({ val, lbl, color }) => (
                <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", flex: "1 1 160px" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Enrollment by Band</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(data.byBand ?? []).map((b) => {
                  const total = data.studentCount || 1;
                  const pct = Math.round((b.studentCount / total) * 100);
                  return (
                    <div key={b.code}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{b.displayName ?? b.code}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{b.studentCount} students ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: C.violet, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppFrame>
  );
}
