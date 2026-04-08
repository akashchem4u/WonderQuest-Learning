"use client";

import { useEffect, useState } from "react";

const C = {
  surface: "#161b22",
  bgDeep: "#010409",
  border: "rgba(255,255,255,0.06)",
  borderFaint: "rgba(255,255,255,0.04)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  muted2: "rgba(255,255,255,0.25)",
  mint: "#50e890",
  amber: "#f59e0b",
  red: "#f85149",
} as const;

interface RetentionReport {
  staleStudents: number;
  staleGuardians: number;
  policy: string;
  lastRun: string | null;
}

export default function RetentionReportClient() {
  const [data, setData] = useState<RetentionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/owner/retention-report")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<RetentionReport>;
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e instanceof Error ? e.message : "Failed to load"); setLoading(false); });
  }, []);

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 32,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: C.bgDeep,
          padding: "12px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".07em", color: C.muted2 }}>
          Data Retention — Stale Accounts
        </div>
        <div style={{ fontSize: 10, color: C.muted }}>COPPA § 3.4 — delete after 12 months inactive</div>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ padding: "24px 20px", fontSize: 12, color: C.muted }}>Loading…</div>
      ) : error ? (
        <div style={{ padding: "20px 20px", fontSize: 12, color: C.red }}>{error}</div>
      ) : data ? (
        <div style={{ padding: "20px 20px" }}>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                padding: "14px 16px",
                border: `1px solid ${C.borderFaint}`,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: data.staleStudents > 0 ? C.amber : C.mint,
                  marginBottom: 4,
                }}
              >
                {data.staleStudents}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".06em", color: C.muted }}>
                Stale Student Accounts
              </div>
              <div style={{ fontSize: 10, color: C.muted2, marginTop: 2 }}>Inactive &gt; 12 months</div>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                padding: "14px 16px",
                border: `1px solid ${C.borderFaint}`,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: data.staleGuardians > 0 ? C.amber : C.mint,
                  marginBottom: 4,
                }}
              >
                {data.staleGuardians}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: ".06em", color: C.muted }}>
                Stale Guardian Accounts
              </div>
              <div style={{ fontSize: 10, color: C.muted2, marginTop: 2 }}>Inactive &gt; 12 months</div>
            </div>
          </div>

          {/* Policy row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: C.bgDeep,
              borderRadius: 8,
              border: `1px solid ${C.borderFaint}`,
              fontSize: 11,
            }}
          >
            <span style={{ color: C.muted }}>
              Policy: <span style={{ color: C.text, fontWeight: 600 }}>{data.policy}</span>
            </span>
            <span style={{ color: C.muted2 }}>
              Last deletion run: {data.lastRun ?? <span style={{ color: C.muted }}>Not yet run</span>}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
