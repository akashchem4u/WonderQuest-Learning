"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

const BASE     = "#100b2e";
const SURFACE  = "#161b22";
const SURFACE2 = "#010409";
const BORDER   = "rgba(255,255,255,0.06)";
const VIOLET   = "#9b72ff";
const MINT     = "#50e890";
const AMBER    = "#f59e0b";
const GOLD     = "#ffd166";
const RED      = "#f85149";
const TEAL     = "#58e8c1";
const TEXT     = "#f0f6ff";
const MUTED    = "rgba(255,255,255,0.4)";
const MUTED2   = "rgba(255,255,255,0.25)";

// ── Types ──────────────────────────────────────────────────────────────────

type Severity   = "critical" | "high" | "medium" | "low";
type RiskStatus = "open" | "monitoring" | "mitigated" | "accepted";
type RiskCat    = "Privacy" | "Compliance" | "Technical" | "Product" | "Business" | "Legal";

interface Risk {
  id: string;
  title: string;
  detail: string;
  tags: RiskCat[];
  score: number;
  likelihood: number;
  impact: number;
  severity: Severity;
  status: RiskStatus;
  owner: string;
}

// ── API type ───────────────────────────────────────────────────────────────
interface OverviewData {
  counts: {
    feedbackItems: number;
  };
}

// ── Styles ─────────────────────────────────────────────────────────────────

const SEVERITY_SCORE_STYLE: Record<Severity, { bg: string; color: string }> = {
  critical: { bg: "rgba(248,81,73,0.2)",   color: RED },
  high:     { bg: "rgba(245,158,11,0.18)", color: AMBER },
  medium:   { bg: "rgba(255,209,102,0.12)", color: GOLD },
  low:      { bg: "rgba(80,232,144,0.12)", color: MINT },
};

const SEVERITY_HEADER_STYLE: Record<Severity, { color: string; label: string; icon: string }> = {
  critical: { color: RED,   label: "Critical", icon: "🔴" },
  high:     { color: AMBER, label: "High",     icon: "🟠" },
  medium:   { color: GOLD,  label: "Medium",   icon: "🟡" },
  low:      { color: MINT,  label: "Low",      icon: "🟢" },
};

const LIKELIHOOD_DOT_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: "rgba(80,232,144,0.1)",  color: MINT },
  2: { bg: "rgba(255,209,102,0.1)", color: GOLD },
  3: { bg: "rgba(245,158,11,0.12)", color: AMBER },
  4: { bg: "rgba(248,81,73,0.1)",   color: RED },
  5: { bg: "rgba(248,81,73,0.25)",  color: RED },
};

const STATUS_PILL_STYLE: Record<RiskStatus, { bg: string; color: string; label: string }> = {
  open:       { bg: "rgba(248,81,73,0.12)",   color: RED,   label: "Open" },
  monitoring: { bg: "rgba(245,158,11,0.12)",  color: AMBER, label: "Monitoring" },
  mitigated:  { bg: "rgba(80,232,144,0.1)",   color: MINT,  label: "Mitigated" },
  accepted:   { bg: "rgba(255,255,255,0.08)", color: MUTED, label: "Accepted" },
};

const TAG_STYLE: Record<RiskCat, { bg: string; color: string }> = {
  Privacy:    { bg: "rgba(155,114,255,0.12)", color: VIOLET },
  Compliance: { bg: "rgba(248,81,73,0.1)",    color: RED },
  Technical:  { bg: "rgba(88,232,193,0.1)",   color: TEAL },
  Product:    { bg: "rgba(80,232,144,0.1)",   color: MINT },
  Business:   { bg: "rgba(245,158,11,0.1)",   color: AMBER },
  Legal:      { bg: "rgba(155,114,255,0.12)", color: VIOLET },
};

// ── Stub data ──────────────────────────────────────────────────────────────

const RISKS: Risk[] = [];

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

// ── Component ──────────────────────────────────────────────────────────────

export function OwnerRiskRegisterView() {
  const [activeCat, setActiveCat] = useState<string>("All");
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingOverview(true);
    setOverviewError(null);
    const timer = setTimeout(() => {
      setLoadingOverview(false);
      setOverviewError("Request timed out");
    }, 8000);
    fetch("/api/owner/overview")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        clearTimeout(timer);
        setOverviewData(json as OverviewData);
        setLoadingOverview(false);
      })
      .catch((e: Error) => {
        clearTimeout(timer);
        setOverviewError(e.message ?? "Failed to load");
        setLoadingOverview(false);
      });
  }, []);

  const categories = ["All", "Privacy", "Technical", "Product", "Business", "Legal"];
  const statuses = ["All", "Open", "Monitoring", "Mitigated"];

  const filteredRisks = RISKS.filter((r) => {
    const catOk = activeCat === "All" || r.tags.includes(activeCat as RiskCat);
    const statusOk =
      activeStatus === "All" ||
      r.status === (activeStatus.toLowerCase() as RiskStatus);
    return catOk && statusOk;
  });

  const critCount    = RISKS.filter((r) => r.severity === "critical").length;
  const highCount    = RISKS.filter((r) => r.severity === "high").length;
  const medCount     = RISKS.filter((r) => r.severity === "medium").length;
  const lowCount     = RISKS.filter((r) => r.severity === "low").length;
  const openMonCount = RISKS.filter((r) => r.status === "open" || r.status === "monitoring").length;

  // Live feedback count from API
  const liveFeedbackCount = overviewData?.counts.feedbackItems;
  const feedbackRiskColor = liveFeedbackCount !== undefined
    ? liveFeedbackCount > 30 ? RED : liveFeedbackCount > 10 ? AMBER : MINT
    : MUTED;

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 12px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    fontFamily: "system-ui",
    background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
    color: active ? TEXT : MUTED,
  });

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ background: BASE, minHeight: "100vh", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: TEXT, marginBottom: 24 }}>
            ⚠️ Risk Register
          </h1>

          {/* ── Live feedback risk metric ──────────────────────────── */}
          <div style={{
            background: SURFACE,
            border: `1px solid ${liveFeedbackCount !== undefined && liveFeedbackCount > 10 ? "rgba(245,158,11,0.3)" : BORDER}`,
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED2, marginBottom: 4 }}>
                Live Risk Metric — Open Feedback Items
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                {loadingOverview ? (
                  <div style={{ width: 48, height: 28, background: "rgba(255,255,255,.06)", borderRadius: 4 }} />
                ) : overviewError ? (
                  <span style={{ fontSize: 13, color: MUTED }}>Unavailable</span>
                ) : (
                  <span style={{ fontSize: 28, fontWeight: 900, color: feedbackRiskColor, lineHeight: 1 }}>
                    {liveFeedbackCount !== undefined ? liveFeedbackCount.toLocaleString() : "—"}
                  </span>
                )}
                <span style={{ fontSize: 12, color: MUTED }}>total feedback items</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>
                Live count from <code style={{ fontSize: 10, background: "rgba(255,255,255,.06)", padding: "1px 5px", borderRadius: 3 }}>GET /api/owner/overview</code>.
                {liveFeedbackCount !== undefined && liveFeedbackCount > 30 && (
                  <span style={{ marginLeft: 6, color: RED, fontWeight: 700 }}>HIGH — review open items in Feedback Workbench.</span>
                )}
                {liveFeedbackCount !== undefined && liveFeedbackCount > 10 && liveFeedbackCount <= 30 && (
                  <span style={{ marginLeft: 6, color: AMBER, fontWeight: 700 }}>ELEVATED — monitor triage queue.</span>
                )}
                {liveFeedbackCount !== undefined && liveFeedbackCount <= 10 && (
                  <span style={{ marginLeft: 6, color: MINT, fontWeight: 700 }}>NORMAL — within expected range.</span>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: "#0d1117",
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${BORDER}`,
          }}>
            {/* Header */}
            <div style={{
              background: SURFACE2,
              padding: "0 24px",
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>⚠️ Risk Register</div>
                <div style={{ fontSize: 11, color: MUTED }}>12 tracked risks · Last reviewed Mar 24</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, cursor: "pointer" }}>↓ Export</div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: MINT,
                  cursor: "pointer",
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(80,232,144,0.3)",
                }}>+ Add Risk</div>
              </div>
            </div>

            {/* Stat row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              background: "rgba(255,255,255,0.04)",
              borderBottom: `1px solid ${BORDER}`,
            }}>
              {[
                { val: critCount,    lbl: "Critical (≥16)",   color: RED },
                { val: highCount,    lbl: "High (10–15)",      color: AMBER },
                { val: medCount,     lbl: "Medium (5–9)",      color: GOLD },
                { val: lowCount,     lbl: "Low (1–4)",         color: MINT },
                { val: openMonCount, lbl: "Open / Monitoring", color: AMBER },
              ].map((s, i) => (
                <div key={i} style={{ background: SURFACE2, padding: "14px 18px" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div style={{
              display: "flex",
              gap: 8,
              padding: "12px 24px",
              background: SURFACE2,
              borderBottom: `1px solid ${BORDER}`,
              flexWrap: "wrap",
              alignItems: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category</div>
              {categories.map((cat) => (
                <button key={cat} style={chipStyle(activeCat === cat)} onClick={() => setActiveCat(cat)}>{cat}</button>
              ))}
              <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</div>
              {statuses.map((st) => (
                <button key={st} style={chipStyle(activeStatus === st)} onClick={() => setActiveStatus(st)}>{st}</button>
              ))}
            </div>

            {/* Risk list */}
            <div style={{ padding: "16px 24px" }}>
              {/* Column headers */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr 90px 80px 80px 90px 100px",
                borderBottom: `1px solid ${BORDER}`,
                paddingBottom: 6,
                marginBottom: 4,
              }}>
                {["#", "Risk", "Score", "Likelihood", "Impact", "Status", "Owner"].map((h) => (
                  <div key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: MUTED2, padding: "8px 12px" }}>{h}</div>
                ))}
              </div>

              {SEVERITY_ORDER.map((sev) => {
                const group = filteredRisks.filter((r) => r.severity === sev);
                if (group.length === 0) return null;
                const sh = SEVERITY_HEADER_STYLE[sev];
                return (
                  <div key={sev}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: MUTED2,
                      margin: "16px 0 8px",
                      paddingBottom: 6,
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      {sh.icon} {sh.label}
                    </div>
                    {group.map((risk) => {
                      const scoreSt = SEVERITY_SCORE_STYLE[risk.severity];
                      const liSt = LIKELIHOOD_DOT_STYLE[risk.likelihood] ?? LIKELIHOOD_DOT_STYLE[1];
                      const impSt = LIKELIHOOD_DOT_STYLE[risk.impact] ?? LIKELIHOOD_DOT_STYLE[1];
                      const statusSt = STATUS_PILL_STYLE[risk.status];
                      return (
                        <div key={risk.id} style={{
                          display: "grid",
                          gridTemplateColumns: "28px 1fr 90px 80px 80px 90px 100px",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          alignItems: "start",
                        }}>
                          {/* ID */}
                          <div style={{ padding: "10px 0", fontSize: 9, fontWeight: 700, color: MUTED2, fontVariantNumeric: "tabular-nums" }}>{risk.id}</div>
                          {/* Risk */}
                          <div style={{ padding: "10px 12px" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: TEXT, marginBottom: 3 }}>{risk.title}</div>
                            <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.4 }}>{risk.detail}</div>
                            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                              {risk.tags.map((tag) => {
                                const ts = TAG_STYLE[tag];
                                return (
                                  <span key={tag} style={{
                                    fontSize: 9,
                                    fontWeight: 700,
                                    padding: "1px 6px",
                                    borderRadius: 3,
                                    background: ts.bg,
                                    color: ts.color,
                                  }}>{tag}</span>
                                );
                              })}
                            </div>
                          </div>
                          {/* Score */}
                          <div style={{ padding: "10px 12px" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 22,
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 800,
                              background: scoreSt.bg,
                              color: scoreSt.color,
                            }}>{risk.score}</span>
                          </div>
                          {/* Likelihood */}
                          <div style={{ padding: "10px 12px" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 28,
                              height: 20,
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background: liSt.bg,
                              color: liSt.color,
                            }}>{risk.likelihood}</span>
                          </div>
                          {/* Impact */}
                          <div style={{ padding: "10px 12px" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 28,
                              height: 20,
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background: impSt.bg,
                              color: impSt.color,
                            }}>{risk.impact}</span>
                          </div>
                          {/* Status */}
                          <div style={{ padding: "10px 12px" }}>
                            <span style={{
                              display: "inline-block",
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 4,
                              background: statusSt.bg,
                              color: statusSt.color,
                            }}>{statusSt.label}</span>
                          </div>
                          {/* Owner */}
                          <div style={{ padding: "10px 12px", fontSize: 10, color: MUTED }}>{risk.owner}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {filteredRisks.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", fontSize: 13, color: MUTED }}>
                  No risks match the current filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
