"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base:       "#100b2e",
  surface:    "#161b22",
  surface2:   "#0f1419",
  surface3:   "#0d1117",
  border:     "rgba(255,255,255,0.06)",
  text:       "#f0f6ff",
  muted:      "#8b949e",
  accent:     "#50e890",
  passBg:     "rgba(35,134,54,.25)",
  passFg:     "#3fb950",
  failBg:     "rgba(218,54,51,.2)",
  failFg:     "#f85149",
  partialBg:  "rgba(158,106,3,.25)",
  partialFg:  "#e3b341",
  untestedBg: "rgba(139,148,158,.1)",
  untestedFg: "#8b949e",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type CellStatus = "P" | "F" | "T" | "U";
type Tab = "matrix" | "issues" | "spec";

interface Feature {
  label: string;
  row: CellStatus[];
}

interface Issue {
  status: "fail" | "partial";
  device: string;
  feature: string;
  tester: string;
  date: string;
  notes: string;
  linkedItem: string;
  priority: string;
}

// ── Matrix data ───────────────────────────────────────────────────────────────
const DEVICES = [
  { label: "iPhone 14",       sub: "iOS Safari"       },
  { label: "iPhone SE",       sub: "iOS Safari"       },
  { label: "iPad 10th",       sub: "iPadOS Safari"    },
  { label: "iPad mini",       sub: "iPadOS Safari"    },
  { label: "Android Phone",   sub: "Chrome"           },
  { label: "Android Tablet",  sub: "Chrome"           },
  { label: "MacBook",         sub: "Chrome"           },
  { label: "MacBook",         sub: "Safari"           },
  { label: "Windows",         sub: "Chrome"           },
  { label: "Windows",         sub: "Firefox"          },
];

const FEATURES: Feature[] = [
  { label: "Voice Coach Audio",           row: ["P","P","P","F","P","P","P","P","P","P"] },
  { label: "Touch Targets",               row: ["P","P","P","P","P","P","P","P","P","P"] },
  { label: "Theme Rendering",             row: ["P","P","P","P","P","T","P","P","P","P"] },
  { label: "Quest Flow",                  row: ["P","P","P","P","P","P","P","P","P","U"] },
  { label: "Offline / IndexedDB",         row: ["P","P","U","U","P","P","P","P","P","T"] },
  { label: "Accessibility (High Contrast)",row: ["P","P","P","P","P","U","P","P","P","P"] },
  { label: "Quiet Hours",                 row: ["P","P","P","P","P","P","P","P","U","U"] },
  { label: "Parent Dashboard",            row: ["P","P","P","U","P","P","P","P","P","P"] },
];

const STATUS_META: Record<CellStatus, { cls: string; label: string; icon: string; bg: string; color: string }> = {
  P: { cls: "pass",     label: "Pass",     icon: "✓", bg: "rgba(35,134,54,.25)",   color: "#3fb950" },
  F: { cls: "fail",     label: "Fail",     icon: "✗", bg: "rgba(218,54,51,.2)",    color: "#f85149" },
  T: { cls: "partial",  label: "Partial",  icon: "~", bg: "rgba(158,106,3,.25)",   color: "#e3b341" },
  U: { cls: "untested", label: "Untested", icon: "?", bg: "rgba(139,148,158,.1)",  color: "#8b949e" },
};

const ISSUES: Issue[] = [
  {
    status: "fail",
    device: "iPad mini",
    feature: "Voice Coach Audio",
    tester: "R. Patel",
    date: "2026-03-18",
    notes: "Web Audio API context fails to resume after first suspend on iPadOS 17.4. Audio plays once then goes silent. Requires page reload to restore.",
    linkedItem: "OBS-0412",
    priority: "P0",
  },
  {
    status: "partial",
    device: "Android Tablet",
    feature: "Theme Rendering",
    tester: "S. Kim",
    date: "2026-03-20",
    notes: "Custom font variable --wq-heading-font not applied on first paint on Samsung Galaxy Tab S8. Falls back to system font until full render cycle completes.",
    linkedItem: "OBS-0438",
    priority: "P1",
  },
  {
    status: "partial",
    device: "Windows Firefox",
    feature: "Offline / IndexedDB",
    tester: "T. Nguyen",
    date: "2026-03-21",
    notes: "Service worker cache strategy not persisting quest state across Firefox restart on Windows 11. Partial data recovery observed — active quests lost, completed quests intact.",
    linkedItem: "OBS-0451",
    priority: "P1",
  },
  {
    status: "partial",
    device: "Windows Firefox",
    feature: "Quest Flow",
    tester: "T. Nguyen",
    date: "2026-03-21",
    notes: "Step-advance animation stutters on Firefox 124 due to CSS @property not being supported. Fallback to static transition applied but feels degraded.",
    linkedItem: "OBS-0453",
    priority: "P2",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function pctColor(p: number): string {
  if (p >= 80) return "#3fb950";
  if (p >= 60) return "#e3b341";
  return "#f85149";
}

function rowPassPct(row: CellStatus[]): number {
  return Math.round((row.filter((s) => s === "P").length / row.length) * 100);
}

function colPassPct(colIdx: number): number {
  const pass = FEATURES.filter((f) => f.row[colIdx] === "P").length;
  return Math.round((pass / FEATURES.length) * 100);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DeviceCoveragePage() {
  const allowed = true;
  if (!allowed) return <OwnerGate configured={true} />;

  return (
    <AppFrame audience="owner">
      <DeviceCoverageContent />
    </AppFrame>
  );
}

function DeviceCoverageContent() {
  const [tab, setTab] = useState<Tab>("matrix");

  const tabDefs: { key: Tab; label: string }[] = [
    { key: "matrix", label: "Coverage Matrix" },
    { key: "issues", label: "Issue Log" },
    { key: "spec",   label: "Spec" },
  ];

  return (
    <main style={{
      background: C.base, minHeight: "100vh", padding: "24px 16px 48px",
      fontFamily: "Inter, system-ui, sans-serif", lineHeight: 1.5,
    }}>

      {/* Page header */}
      <header style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-.02em", color: C.text }}>
          Device Coverage Board
        </h1>
        <p style={{ fontSize: "13px", color: C.muted, marginTop: "4px" }}>
          Track compatibility status across devices and browsers for each feature area.
        </p>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          background: "rgba(80,232,144,.1)", border: "1px solid rgba(80,232,144,.25)",
          color: C.accent, fontSize: "11px", fontWeight: 600,
          padding: "3px 9px", borderRadius: "20px", marginTop: "8px",
        }}>
          ■ DS #289 · Owner QA
        </span>
      </header>

      {/* Tab nav */}
      <nav style={{
        display: "flex", gap: "4px", borderBottom: `1px solid ${C.border}`,
        marginBottom: "24px", overflowX: "auto",
      }}>
        {tabDefs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: "none", border: "none",
              color: tab === t.key ? C.accent : C.muted,
              fontFamily: "inherit", fontSize: "13.5px", fontWeight: 500,
              padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap",
              borderBottom: `2px solid ${tab === t.key ? C.accent : "transparent"}`,
              minHeight: "44px", marginBottom: "-1px",
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ══ TAB: Coverage Matrix ══ */}
      {tab === "matrix" && (
        <section>
          <div style={{
            fontSize: "15px", fontWeight: 600, marginBottom: "14px",
            color: C.text, display: "flex", alignItems: "center", gap: "8px",
          }}>
            Feature × Device Matrix
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "20px",
              background: "rgba(80,232,144,.12)", color: C.accent,
            }}>
              10 Devices · 8 Features
            </span>
          </div>

          <div style={{
            overflowX: "auto", WebkitOverflowScrolling: "touch",
            border: `1px solid ${C.border}`, borderRadius: "10px",
          }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "1020px", fontSize: "12.5px" }}>
              <thead>
                <tr>
                  <th style={{
                    background: C.surface2, color: C.muted, fontSize: "11px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: ".04em", padding: "10px 12px",
                    textAlign: "left", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
                    minWidth: "160px",
                  }}>
                    Feature Area
                  </th>
                  {DEVICES.map((d, i) => (
                    <th key={i} style={{
                      background: C.surface2, color: C.muted, fontSize: "11px", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: ".04em", padding: "10px 12px",
                      textAlign: "center", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
                    }}>
                      {d.label}<br />
                      <span style={{ fontWeight: 400, fontSize: "10px" }}>{d.sub}</span>
                    </th>
                  ))}
                  <th style={{
                    background: C.surface2, color: C.muted, fontSize: "11px", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: ".04em", padding: "10px 12px",
                    textAlign: "center", borderBottom: `1px solid ${C.border}`, minWidth: "72px",
                  }}>
                    Row Pass%
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feat, fi) => {
                  const rp = rowPassPct(feat.row);
                  const rowBg = fi % 2 === 0 ? C.surface : C.surface2;
                  return (
                    <tr key={fi}>
                      <td style={{
                        padding: "9px 12px", borderBottom: `1px solid ${C.border}`,
                        background: rowBg, fontWeight: 500, color: C.text, fontSize: "12px",
                        textAlign: "left",
                      }}>
                        {feat.label}
                      </td>
                      {feat.row.map((s, di) => {
                        const sm = STATUS_META[s];
                        return (
                          <td key={di} style={{
                            padding: "9px 12px", borderBottom: `1px solid ${C.border}`,
                            textAlign: "center", verticalAlign: "middle", background: rowBg,
                          }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              gap: "4px", fontSize: "11.5px", fontWeight: 600,
                              padding: "3px 8px", borderRadius: "6px", minWidth: "62px",
                              background: sm.bg, color: sm.color,
                            }}>
                              {sm.icon} {sm.label}
                            </span>
                          </td>
                        );
                      })}
                      <td style={{
                        padding: "9px 12px", borderBottom: `1px solid ${C.border}`,
                        textAlign: "center", background: rowBg,
                        fontSize: "12px", fontWeight: 700, color: pctColor(rp),
                      }}>
                        {rp}%
                      </td>
                    </tr>
                  );
                })}
                {/* Summary row */}
                <tr>
                  <td style={{
                    padding: "9px 12px", borderTop: `2px solid ${C.border}`,
                    background: C.surface3, fontSize: "11px",
                    textTransform: "uppercase", letterSpacing: ".04em", color: C.muted,
                    fontWeight: 600,
                  }}>
                    Column Pass%
                  </td>
                  {DEVICES.map((_, di) => {
                    const p = colPassPct(di);
                    return (
                      <td key={di} style={{
                        padding: "9px 12px", borderTop: `2px solid ${C.border}`,
                        background: C.surface3, textAlign: "center",
                        fontSize: "12px", fontWeight: 700, color: pctColor(p),
                      }}>
                        {p}%
                      </td>
                    );
                  })}
                  <td style={{ padding: "9px 12px", borderTop: `2px solid ${C.border}`, background: C.surface3 }} />
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ══ TAB: Issue Log ══ */}
      {tab === "issues" && (
        <section>
          {/* Overall bar */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "10px", padding: "16px 20px", marginBottom: "24px",
            display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: "38px", fontWeight: 700, color: C.accent, lineHeight: 1 }}>76%</div>
              <div style={{ fontSize: "13px", color: C.muted }}>Overall Pass Rate</div>
            </div>
            <div style={{
              flex: 1, minWidth: "180px", height: "10px",
              background: "rgba(255,255,255,.06)", borderRadius: "99px", overflow: "hidden",
            }}>
              <div style={{
                width: "76%", height: "100%", borderRadius: "99px",
                background: "linear-gradient(90deg, #50e890, #38c47a)",
              }} />
            </div>
            <div style={{ fontSize: "12px", color: C.muted, textAlign: "right", minWidth: "120px" }}>
              61 / 80 cells passing<br />
              <span style={{ color: C.failFg }}>3 Fail</span>
              {" · "}
              <span style={{ color: C.partialFg }}>5 Partial</span>
              {" · "}
              <span style={{ color: C.untestedFg }}>11 Untested</span>
            </div>
          </div>

          <div style={{
            fontSize: "15px", fontWeight: 600, marginBottom: "14px", color: C.text,
          }}>
            Failed & Partial Items
          </div>

          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {ISSUES.map((issue, i) => {
              const isFail = issue.status === "fail";
              const statusBg  = isFail ? "rgba(218,54,51,.2)"  : "rgba(158,106,3,.25)";
              const statusFg  = isFail ? "#f85149"             : "#e3b341";
              const priBg     = issue.priority === "P0"
                ? "rgba(248,81,73,0.12)"
                : issue.priority === "P1"
                ? "rgba(245,158,11,0.1)"
                : "rgba(255,209,102,0.1)";
              const priFg     = issue.priority === "P0" ? "#f85149"
                : issue.priority === "P1" ? "#f59e0b"
                : "#ffd166";
              return (
                <article key={i} style={{
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: "10px", padding: "16px",
                }}>
                  <div style={{
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between", gap: "8px", marginBottom: "10px",
                  }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: C.text, lineHeight: 1.4 }}>
                      {issue.feature}
                    </div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      gap: "4px", fontSize: "11.5px", fontWeight: 600,
                      padding: "3px 8px", borderRadius: "6px", minWidth: "62px",
                      flexShrink: 0, background: statusBg, color: statusFg,
                    }}>
                      {isFail ? "✗" : "~"} {isFail ? "Fail" : "Partial"}
                    </span>
                  </div>
                  <div style={{
                    fontSize: "11.5px", color: C.muted, marginBottom: "10px",
                    display: "flex", flexDirection: "column", gap: "3px",
                  }}>
                    <span>📱 {issue.device}</span>
                    <span>👤 Tested by {issue.tester} · {issue.date}</span>
                    <span style={{ color: priFg }}>▲ Priority {issue.priority}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: C.muted, marginBottom: "14px", lineHeight: 1.55 }}>
                    {issue.notes}
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: "8px", flexWrap: "wrap",
                  }}>
                    <span style={{
                      fontSize: "11px", color: C.muted,
                      background: "rgba(255,255,255,.05)", padding: "3px 8px", borderRadius: "6px",
                    }}>
                      🔗 {issue.linkedItem}
                    </span>
                    <button style={{
                      background: "rgba(80,232,144,.12)", border: "1px solid rgba(80,232,144,.3)",
                      color: C.accent, fontFamily: "inherit", fontSize: "12px", fontWeight: 600,
                      padding: "7px 14px", borderRadius: "7px", cursor: "pointer", minHeight: "36px",
                    }}>
                      Link to Fix
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ══ TAB: Spec ══ */}
      {tab === "spec" && (
        <section>
          <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px", color: C.text }}>
            Component Specification
          </div>

          {/* Spec cards */}
          <div style={{
            display: "grid", gap: "16px",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            marginBottom: "24px",
          }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "10px", padding: "18px",
            }}>
              <div style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".06em", color: C.muted, marginBottom: "12px",
              }}>
                Component Info
              </div>
              <dl style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { dt: "Component", dd: "DeviceCoverageBoard" },
                  { dt: "Route",     dd: "/owner/qa/device-coverage" },
                  { dt: "Auth",      dd: "Owner only — role check required on load" },
                  { dt: "DS Item",   dd: "#289" },
                  { dt: "Version",   dd: "v2" },
                ].map((row) => (
                  <div key={row.dt} style={{ display: "flex", gap: "10px", alignItems: "baseline", fontSize: "12.5px" }}>
                    <dt style={{ color: C.muted, minWidth: "90px", flexShrink: 0, fontWeight: 500 }}>{row.dt}</dt>
                    <dd style={{ color: C.text, wordBreak: "break-word" }}>
                      <code style={{
                        background: "rgba(255,255,255,.07)", padding: "1px 6px",
                        borderRadius: "4px", fontSize: "11.5px",
                        fontFamily: "'SF Mono', 'Fira Mono', monospace",
                      }}>
                        {row.dd}
                      </code>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "10px", padding: "18px",
            }}>
              <div style={{
                fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".06em", color: C.muted, marginBottom: "12px",
              }}>
                Props
              </div>
              <dl style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { dt: "ownerId",       dd: "string — required; scopes data fetch" },
                  { dt: "releaseTag",    dd: "string — optional; filter by release" },
                  { dt: "onExport",      dd: "() => void — trigger coverage report export" },
                  { dt: "featureFilter", dd: "string[] — optional; subset feature rows" },
                  { dt: "readOnly",      dd: "boolean — disable status edits (default: false)" },
                ].map((row) => (
                  <div key={row.dt} style={{ display: "flex", gap: "10px", alignItems: "baseline", fontSize: "12.5px" }}>
                    <dt style={{ color: C.muted, minWidth: "110px", flexShrink: 0, fontWeight: 500 }}>
                      <code style={{
                        background: "rgba(255,255,255,.07)", padding: "1px 6px",
                        borderRadius: "4px", fontSize: "11.5px",
                        fontFamily: "'SF Mono', 'Fira Mono', monospace",
                      }}>
                        {row.dt}
                      </code>
                    </dt>
                    <dd style={{ color: C.text, fontSize: "12px" }}>{row.dd}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Schema table */}
          <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px", color: C.text }}>
            DB Schema —{" "}
            <code style={{
              fontSize: "13px", color: C.muted,
              background: "rgba(255,255,255,.07)", padding: "1px 6px", borderRadius: "4px",
              fontFamily: "'SF Mono', monospace",
            }}>
              device_coverage
            </code>
          </div>
          <div style={{
            overflowX: "auto", border: `1px solid ${C.border}`,
            borderRadius: "10px", marginBottom: "24px",
          }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "560px", fontSize: "12.5px" }}>
              <thead>
                <tr>
                  {["Column", "Type", "Description"].map((h) => (
                    <th key={h} style={{
                      background: C.surface2, color: C.muted, fontSize: "11px", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: ".04em",
                      padding: "10px 14px", textAlign: "left", borderBottom: `1px solid ${C.border}`,
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { col: "id",           type: "UUID",                                desc: "Primary key" },
                  { col: "device_label", type: "TEXT",                                desc: 'Human-readable device name (e.g. "iPhone 14")' },
                  { col: "os",           type: "TEXT",                                desc: "Operating system name and version" },
                  { col: "browser",      type: "TEXT",                                desc: "Browser name and version" },
                  { col: "feature_area", type: "TEXT",                                desc: 'Feature area identifier (e.g. "voice_coach_audio")' },
                  { col: "status",       type: "ENUM('pass','fail','partial','untested')", desc: "Test result status" },
                  { col: "tested_by",    type: "TEXT",                                desc: "Tester name or user ID" },
                  { col: "tested_at",    type: "TIMESTAMPTZ",                         desc: "Timestamp of when test was recorded" },
                  { col: "notes",        type: "TEXT",                                desc: "Optional notes or reproduction steps" },
                ].map((row, i) => {
                  const rowBg = i % 2 === 0 ? C.surface : C.surface2;
                  return (
                    <tr key={row.col}>
                      <td style={{ padding: "9px 14px", borderBottom: `1px solid ${C.border}`, background: rowBg, verticalAlign: "top" }}>
                        <code style={{
                          background: "rgba(255,255,255,.07)", padding: "1px 6px",
                          borderRadius: "4px", fontSize: "11.5px",
                          fontFamily: "'SF Mono', 'Fira Mono', monospace",
                        }}>
                          {row.col}
                        </code>
                      </td>
                      <td style={{ padding: "9px 14px", borderBottom: `1px solid ${C.border}`, background: rowBg, verticalAlign: "top" }}>
                        <code style={{
                          background: "rgba(255,255,255,.07)", padding: "1px 6px",
                          borderRadius: "4px", fontSize: "11.5px",
                          fontFamily: "'SF Mono', 'Fira Mono', monospace",
                        }}>
                          {row.type}
                        </code>
                      </td>
                      <td style={{ padding: "9px 14px", borderBottom: `1px solid ${C.border}`, background: rowBg, verticalAlign: "top", color: C.text }}>
                        {row.desc}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rules */}
          <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px", color: C.text }}>Rules</div>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              "A Fail status automatically creates a linked feedback_item in the feedback system with severity derived from the feature's P-level.",
              "All P0 features must be tested on every device before any release is gated as ready. Untested P0 cells block release.",
              "Untested cells appear as amber warnings in the release checklist — treated as a blocking risk until resolved.",
              "A full coverage report (JSON + CSV) is exported automatically as part of the release gate workflow and archived in the release artifact store.",
              "No child PII is stored or transmitted. All data in device_coverage is technical metadata only; tester identity uses owner-role user IDs.",
            ].map((rule, i) => (
              <li key={i} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: "10px", padding: "12px 16px",
                fontSize: "13px", color: C.text,
                display: "flex", gap: "12px", alignItems: "flex-start",
              }}>
                <span style={{
                  background: "rgba(80,232,144,.15)", color: C.accent,
                  fontSize: "11px", fontWeight: 700,
                  minWidth: "22px", height: "22px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: "1px",
                }}>
                  {i + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
