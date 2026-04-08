"use client";

import { useState, useEffect, useCallback } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG      = "#06071a";
const SURFACE = "#0e1029";
const CARD    = "#12152e";
const BORDER  = "rgba(255,255,255,0.07)";
const BORDER_HI = "rgba(255,255,255,0.13)";
const VIOLET  = "#9b72ff";
const TEAL    = "#2dd4bf";
const GOLD    = "#fbbf24";
const CORAL   = "#fb7185";
const TEXT    = "#f1f5f9";
const MUTED   = "rgba(241,245,249,0.52)";
const DIM     = "rgba(241,245,249,0.32)";
const GREEN   = "#4ade80";
const AMBER   = "#fbbf24";
const RED     = "#fb7185";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContentHealthData {
  summary: {
    totalSkills: number;
    publishedSkills: number;
    inactiveSkills: number;
    totalQuestions: number;
    skillsWithQuestions: number;
    skillsWithoutQuestions: number;
  };
  byBand: { bandCode: string; skillCount: number }[];
  bySubject: { subject: string; skillCount: number }[];
  skillGaps: { code: string; displayName: string; bandCode: string }[];
  highMissRate: {
    code: string;
    displayName: string;
    bandCode: string;
    totalAttempts: number;
    misses: number;
    missRatePct: number;
  }[];
}

// ── Skeleton helpers ──────────────────────────────────────────────────────────

function SkeletonBar({ w = "100%", h = 14 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 4,
      background: "rgba(255,255,255,0.07)",
      animation: "pulse 1.6s ease-in-out infinite",
    }} />
  );
}

function SummaryCardSkeleton() {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
      <SkeletonBar w="50%" h={26} />
      <SkeletonBar w="70%" h={11} />
      <SkeletonBar w="40%" h={11} />
    </div>
  );
}

// ── Miss rate color ───────────────────────────────────────────────────────────

function missColor(pct: number) {
  if (pct < 30) return GREEN;
  if (pct <= 60) return AMBER;
  return RED;
}

// ── Band color map ────────────────────────────────────────────────────────────

const BAND_COLORS: Record<string, string> = {
  P0: GOLD, p0: GOLD,
  P1: VIOLET, p1: VIOLET,
  P2: TEAL, p2: TEAL,
  P3: CORAL, p3: CORAL,
};
function bandColor(code: string) {
  return BAND_COLORS[code] ?? BAND_COLORS[code?.slice(0, 2)] ?? MUTED;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContentHealthClient() {
  const [data, setData] = useState<ContentHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/content-health");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setRefreshedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxBandCount = data ? Math.max(...data.byBand.map(b => b.skillCount), 1) : 1;
  const maxSubjectCount = data ? Math.max(...data.bySubject.map(b => b.skillCount), 1) : 1;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", background: BG, minHeight: "100vh", padding: "16px", color: TEXT }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: TEXT }}>Content Health</h1>
            {refreshedAt && (
              <p style={{ margin: 0, fontSize: 11, color: DIM, marginTop: 2 }}>
                Last refreshed {refreshedAt.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: "6px 14px", borderRadius: 8, border: `1px solid ${BORDER_HI}`,
              background: SURFACE, color: loading ? DIM : TEXT, fontSize: 12, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: "rgba(251,113,133,0.12)", border: `1px solid rgba(251,113,133,0.3)`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ color: RED, fontSize: 13, fontWeight: 600 }}>Failed to load: {error}</span>
            <button onClick={load} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${RED}`, background: "transparent", color: RED, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Retry</button>
          </div>
        )}

        {/* Summary cards */}
        {loading && !data ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
          </div>
        ) : data ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Total Skills",    value: data.summary.totalSkills,           accent: VIOLET },
              { label: "Published",       value: data.summary.publishedSkills,       accent: GREEN  },
              { label: "No Questions",    value: data.summary.skillsWithoutQuestions,accent: data.summary.skillsWithoutQuestions > 0 ? AMBER : GREEN },
              { label: "Total Q&A",       value: data.summary.totalQuestions,        accent: TEAL   },
            ].map(card => (
              <div key={card.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: card.accent, lineHeight: 1 }}>{card.value.toLocaleString()}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* By Band + By Subject */}
        {loading && !data ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[0, 1].map(i => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
                <SkeletonBar w="40%" h={12} />
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {Array.from({ length: 4 }).map((_, j) => <SkeletonBar key={j} h={18} />)}
                </div>
              </div>
            ))}
          </div>
        ) : data ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {/* By Band */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>By Band</div>
              {data.byBand.length === 0 ? (
                <p style={{ fontSize: 12, color: DIM }}>No data.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {data.byBand.map(b => (
                    <div key={b.bandCode} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 70, fontSize: 11, fontWeight: 700, color: bandColor(b.bandCode), flexShrink: 0 }}>{b.bandCode}</div>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                        <div style={{ width: `${(b.skillCount / maxBandCount) * 100}%`, height: "100%", borderRadius: 4, background: bandColor(b.bandCode), opacity: 0.7 }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, width: 28, textAlign: "right", flexShrink: 0 }}>{b.skillCount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* By Subject */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>By Subject</div>
              {data.bySubject.length === 0 ? (
                <p style={{ fontSize: 12, color: DIM }}>No data.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {data.bySubject.map(s => (
                    <div key={s.subject} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 100, fontSize: 11, color: MUTED, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.subject}</div>
                      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                        <div style={{ width: `${(s.skillCount / maxSubjectCount) * 100}%`, height: "100%", borderRadius: 4, background: VIOLET, opacity: 0.65 }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, width: 28, textAlign: "right", flexShrink: 0 }}>{s.skillCount}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Skills Missing Questions */}
        {loading && !data ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <SkeletonBar w="30%" h={12} />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 3 }).map((_, i) => <SkeletonBar key={i} h={16} />)}
            </div>
          </div>
        ) : data ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              Skills Missing Questions
              {data.skillGaps.length > 0 && (
                <span style={{ marginLeft: 8, padding: "1px 6px", borderRadius: 4, background: "rgba(251,191,36,0.15)", color: AMBER, fontSize: 10 }}>{data.skillGaps.length}{data.skillGaps.length === 20 ? "+" : ""}</span>
              )}
            </div>
            {data.skillGaps.length === 0 ? (
              <p style={{ fontSize: 13, color: GREEN, margin: 0 }}>All skills have questions</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Code", "Name", "Band"].map(h => (
                      <th key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: DIM, padding: "4px 8px", textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.skillGaps.map((g, i) => (
                    <tr key={g.code} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                      <td style={{ padding: "5px 8px", fontSize: 11, fontWeight: 700, color: MUTED, borderBottom: `1px solid ${BORDER}` }}>{g.code}</td>
                      <td style={{ padding: "5px 8px", fontSize: 12, color: TEXT, borderBottom: `1px solid ${BORDER}` }}>{g.displayName}</td>
                      <td style={{ padding: "5px 8px", fontSize: 11, fontWeight: 700, color: bandColor(g.bandCode), borderBottom: `1px solid ${BORDER}` }}>{g.bandCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}

        {/* High Miss Rate */}
        {loading && !data ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
            <SkeletonBar w="35%" h={12} />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBar key={i} h={16} />)}
            </div>
          </div>
        ) : data ? (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
              High Miss Rate
              <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 400, color: DIM, textTransform: "none", letterSpacing: 0 }}>last 30 days, min 5 attempts</span>
            </div>
            {data.highMissRate.length === 0 ? (
              <p style={{ fontSize: 13, color: GREEN, margin: 0 }}>No high-miss-rate skills yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Skill", "Band", "Attempts", "Misses", "Miss Rate"].map(h => (
                      <th key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: DIM, padding: "4px 8px", textAlign: "left", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.highMissRate.map((row, i) => {
                    const mc = missColor(row.missRatePct);
                    return (
                      <tr key={row.code} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                        <td style={{ padding: "5px 8px", fontSize: 12, color: TEXT, borderBottom: `1px solid ${BORDER}` }}>{row.displayName}</td>
                        <td style={{ padding: "5px 8px", fontSize: 11, fontWeight: 700, color: bandColor(row.bandCode), borderBottom: `1px solid ${BORDER}` }}>{row.bandCode}</td>
                        <td style={{ padding: "5px 8px", fontSize: 12, color: MUTED, borderBottom: `1px solid ${BORDER}` }}>{row.totalAttempts.toLocaleString()}</td>
                        <td style={{ padding: "5px 8px", fontSize: 12, color: MUTED, borderBottom: `1px solid ${BORDER}` }}>{row.misses.toLocaleString()}</td>
                        <td style={{ padding: "5px 8px", borderBottom: `1px solid ${BORDER}` }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: mc, padding: "2px 7px", borderRadius: 5, background: `${mc}18` }}>
                            {row.missRatePct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        ) : null}

      </div>
    </>
  );
}
