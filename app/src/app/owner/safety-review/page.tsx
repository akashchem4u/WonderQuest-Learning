"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base:    "#100b2e",
  surface: "#161b22",
  border:  "rgba(255,255,255,0.06)",
  text:    "#f0f6ff",
  muted:   "#8b949e",
  muted2:  "#b8d0ff",
  green:   "#50e890",
  violet:  "#9b72ff",
  blue:    "#38bdf8",
  gold:    "#ffd166",
  amber:   "#f0a020",
  red:     "#ff5f5f",
  coral:   "#ff7b6b",
  teal:    "#58e8c1",
  sky:     "#58b4ff",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 0 | 1 | 2;

interface SafetyRow {
  sev: "p0" | "p1" | "privacy" | "info";
  sevLabel: string;
  item: string;
  itemSub: string;
  desc: string;
  reporter: string;
  actions: ("review" | "block" | "delete" | "dismiss" | "view-report")[];
}

interface AlertItem {
  pillLabel: string;
  pillColor: string;
  pillBg: string;
  desc: string;
  meta: string;
}

interface DeletionJob {
  childId: string;
  type: "Full deletion" | "Anonymise";
  typeStyle: "privacy" | "info";
  scheduled: string;
  status: "Pending" | "Running" | "Complete";
}

// ── Stub data ─────────────────────────────────────────────────────────────────
const SAFETY_ROWS: SafetyRow[] = [
  {
    sev: "p1", sevLabel: "P1",
    item: "Counting Money", itemSub: "Skill content",
    desc: 'Anxiety language detected — "You failed"',
    reporter: "Auto (safe-language checker)",
    actions: ["review", "block", "dismiss"],
  },
  {
    sev: "p1", sevLabel: "P1",
    item: "Reading Shapes", itemSub: "Skill content",
    desc: "Missing alt-text on 3 images",
    reporter: "WCAG auto-scan",
    actions: ["review", "block", "dismiss"],
  },
  {
    sev: "privacy", sevLabel: "Privacy",
    item: "Teacher Message", itemSub: "Communication",
    desc: "Message contains possible student surname",
    reporter: "Auto (PII scan)",
    actions: ["review", "delete", "dismiss"],
  },
  {
    sev: "p1", sevLabel: "P1",
    item: "Animal Sounds", itemSub: "Skill content",
    desc: "Skip rate 73% — above 60% threshold",
    reporter: "Auto",
    actions: ["review", "block", "dismiss"],
  },
  {
    sev: "info", sevLabel: "Info",
    item: "Q3 WCAG Audit", itemSub: "CI/CD report",
    desc: "3 touch targets below 44px on legacy route",
    reporter: "CI/CD",
    actions: ["view-report", "dismiss"],
  },
];

const SEV_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  p0:      { bg: "rgba(255,70,70,.18)",    color: C.red,    border: "rgba(255,70,70,.35)"    },
  p1:      { bg: "rgba(155,114,255,.18)", color: C.violet, border: "rgba(155,114,255,.35)"  },
  privacy: { bg: "rgba(88,180,255,.18)",  color: C.sky,    border: "rgba(88,180,255,.35)"   },
  info:    { bg: "rgba(240,246,255,.08)", color: C.muted,  border: C.border                 },
};

const ALERT_ITEMS: AlertItem[] = [
  {
    pillLabel: "PII in content",
    pillColor: C.gold, pillBg: "rgba(255,209,102,.15)",
    desc: 'Possible name, date of birth, or personal identifier detected in question or explainer text within skill "Reading Numbers".',
    meta: "Created: 2026-03-24 07:42 UTC · Source: PII scan (real-time)",
  },
  {
    pillLabel: "Teacher message — surname",
    pillColor: C.sky, pillBg: "rgba(88,180,255,.15)",
    desc: "Auto-detection flagged a possible full name in teacher message to parent. Message ID: msg_7fa3…b82c.",
    meta: "Created: 2026-03-24 09:01 UTC · Source: PII scan (on message save)",
  },
  {
    pillLabel: "Data retention overdue",
    pillColor: C.coral, pillBg: "rgba(255,123,107,.15)",
    desc: "Student record exceeded configured retention period with no deletion job scheduled. Record type: child_progress_snapshot.",
    meta: "Created: 2026-03-23 22:00 UTC · Source: Retention job scheduler (nightly)",
  },
  {
    pillLabel: "Consent expiry",
    pillColor: C.violet, pillBg: "rgba(155,114,255,.15)",
    desc: "Parental consent policy version updated (v2.4 → v2.5). 12 accounts require re-consent before next session.",
    meta: "Created: 2026-03-22 14:00 UTC · Source: Consent version change event",
  },
  {
    pillLabel: "Beta observation anonymisation overdue",
    pillColor: C.teal, pillBg: "rgba(88,232,193,.15)",
    desc: "3 beta observation records have not been anonymised within the 90-day window. Records created during Dec 2025 pilot.",
    meta: "Created: 2026-03-21 06:00 UTC · Source: Anonymisation schedule check",
  },
];

const DELETION_JOBS: DeletionJob[] = [
  { childId: "a3f82b1c", type: "Full deletion", typeStyle: "privacy", scheduled: "2026-03-25 02:00 UTC", status: "Pending" },
  { childId: "7d94e2a0", type: "Anonymise",     typeStyle: "info",    scheduled: "2026-03-24 23:00 UTC", status: "Pending" },
  { childId: "c1b05f3d", type: "Anonymise",     typeStyle: "info",    scheduled: "2026-03-20 02:00 UTC", status: "Complete" },
  { childId: "8ea71c90", type: "Full deletion", typeStyle: "privacy", scheduled: "2026-03-24 10:15 UTC", status: "Running" },
];

const LANG_BARS = [
  { label: "Anxiety / Pressure", pct: 40, count: 2,  color: C.coral  },
  { label: "Timer Language",     pct: 0,  count: 0,  color: C.green  },
  { label: "Shame Language",     pct: 20, count: 1,  color: C.violet },
  { label: "Complex Vocab",      pct: 80, count: 4,  color: C.gold   },
  { label: "PII Detected",       pct: 20, count: 1,  color: C.sky    },
];

// ── Helper components ─────────────────────────────────────────────────────────
function ActionBtn({ kind }: { kind: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    review:      { bg: "rgba(80,232,144,.15)",  color: C.green,  border: "rgba(80,232,144,.35)"  },
    block:       { bg: "rgba(255,95,95,.15)",   color: C.red,    border: "rgba(255,95,95,.35)"   },
    delete:      { bg: "rgba(255,95,95,.15)",   color: C.red,    border: "rgba(255,95,95,.35)"   },
    dismiss:     { bg: "rgba(255,255,255,.06)", color: C.muted,  border: C.border                },
    "view-report": { bg: "rgba(88,180,255,.15)", color: C.sky,   border: "rgba(88,180,255,.35)"  },
  };
  const s = styles[kind] ?? styles.dismiss;
  const labels: Record<string, string> = {
    review: "Review", block: "Block", delete: "Delete",
    dismiss: "Dismiss", "view-report": "View Report",
  };
  return (
    <button style={{
      padding: "5px 12px", borderRadius: "6px",
      fontSize: "12px", fontWeight: 600, cursor: "pointer",
      border: `1px solid ${s.border}`, background: s.bg, color: s.color,
    }}>
      {labels[kind] ?? kind}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SafetyReviewPage() {
  const allowed = true;
  if (!allowed) return <OwnerGate configured={true} />;

  return (
    <AppFrame audience="owner">
      <SafetyReviewContent />
    </AppFrame>
  );
}

function SafetyReviewContent() {
  const [tab, setTab] = useState<Tab>(0);
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<number>>(new Set());

  const tabLabels = ["Safety Review Console", "Privacy Alerts", "Spec"];

  function resolveAlert(i: number) {
    setResolvedAlerts((prev) => new Set([...prev, i]));
  }

  const statusColor: Record<string, string> = {
    Pending: C.amber, Running: C.sky, Complete: C.green,
  };

  return (
    <main style={{
      background: C.base, minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: "14px", lineHeight: 1.5,
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: "4px", marginBottom: "28px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          {tabLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => setTab(i as Tab)}
              style={{
                padding: "10px 20px",
                background: tab === i ? "rgba(80,232,144,.06)" : "transparent",
                border: "none",
                borderBottom: `2px solid ${tab === i ? C.green : "transparent"}`,
                color: tab === i ? C.green : C.muted,
                cursor: "pointer", fontSize: "14px", fontWeight: 500,
                borderRadius: "6px 6px 0 0", marginBottom: "-1px",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══ TAB 0: Safety Review Console ══ */}
        {tab === 0 && (
          <div>
            {/* Console header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              marginBottom: "28px", flexWrap: "wrap", gap: "16px",
            }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: C.text }}>
                  Safety Review Console
                </h1>
                <div style={{ fontSize: "13px", color: C.muted, marginTop: "2px" }}>
                  Content, privacy, and child safety monitoring
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "6px 14px",
                  background: "rgba(80,232,144,.12)", border: `1px solid rgba(80,232,144,.35)`,
                  borderRadius: "20px", fontSize: "12px", fontWeight: 600, color: C.green,
                }}>
                  🔒 Owner Access Only
                </span>
                <div style={{ fontSize: "12px", color: C.muted, marginTop: "6px" }}>
                  Last reviewed: 2026-03-24 at 09:14 UTC
                </div>
              </div>
            </div>

            {/* Stat row */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".8px", color: C.muted, marginBottom: "14px",
              }}>
                Active Safety Flags
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {[
                  { label: "🔴 P0 Safety Flags",  value: "0", valueColor: C.red,    tagLabel: "All clear",    tagBg: "rgba(80,232,144,.15)", tagColor: C.green,  topBorder: C.red    },
                  { label: "🟡 P1 Content Flags",  value: "2", valueColor: C.violet, tagLabel: "Needs review", tagBg: "rgba(240,160,32,.15)", tagColor: C.amber,  topBorder: C.violet },
                  { label: "🔵 Privacy Alerts",    value: "1", valueColor: C.sky,    tagLabel: "Active",       tagBg: "rgba(88,180,255,.15)", tagColor: C.sky,    topBorder: C.sky    },
                  { label: "🟢 WCAG Violations",   value: "3", valueColor: C.amber,  tagLabel: "Needs fix",    tagBg: "rgba(240,160,32,.15)", tagColor: C.amber,  topBorder: C.amber  },
                  { label: "📋 Pending Reviews",   value: "5", valueColor: C.text,   tagLabel: "In queue",     tagBg: "rgba(155,114,255,.15)", tagColor: C.violet, topBorder: C.muted  },
                ].map((s) => (
                  <div key={s.label} style={{
                    flex: 1, minWidth: "160px",
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderTop: `3px solid ${s.topBorder}`,
                    borderRadius: "10px", padding: "16px 18px",
                  }}>
                    <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: ".6px", color: C.muted, marginBottom: "8px" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 700, color: s.valueColor }}>{s.value}</div>
                    <span style={{
                      display: "inline-block", marginTop: "6px",
                      padding: "2px 10px", borderRadius: "12px",
                      fontSize: "11px", fontWeight: 600,
                      background: s.tagBg, color: s.tagColor,
                    }}>
                      {s.tagLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Content safety queue */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".8px", color: C.muted, marginBottom: "14px",
              }}>
                Content Safety Queue
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%", borderCollapse: "collapse",
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: "10px", overflow: "hidden", fontSize: "13px",
                }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,.04)" }}>
                      {["Severity", "Item", "Flag Description", "Reporter", "Actions"].map((h) => (
                        <th key={h} style={{
                          padding: "10px 14px", textAlign: "left",
                          fontSize: "11px", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: ".6px", color: C.muted,
                          whiteSpace: "nowrap",
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SAFETY_ROWS.map((row, i) => {
                      const ss = SEV_STYLE[row.sev];
                      return (
                        <tr key={i}>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "4px",
                              padding: "3px 10px", borderRadius: "12px",
                              fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
                              background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
                            }}>
                              {row.sev === "p1" ? "⚠️" : row.sev === "privacy" ? "🔵" : "ℹ️"} {row.sevLabel}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle" }}>
                            <div style={{ fontWeight: 600, color: C.text }}>{row.item}</div>
                            <div style={{ fontSize: "11px", color: C.muted }}>{row.itemSub}</div>
                          </td>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle", maxWidth: "280px" }}>
                            {row.desc}
                          </td>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle" }}>
                            <code style={{
                              background: "rgba(255,255,255,.07)", padding: "1px 6px",
                              borderRadius: "4px", fontFamily: "monospace",
                              fontSize: "12px", color: C.muted2,
                            }}>
                              {row.reporter}
                            </code>
                          </td>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle" }}>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {row.actions.map((a) => <ActionBtn key={a} kind={a} />)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Privacy monitoring */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".8px", color: C.muted, marginBottom: "14px",
              }}>
                Privacy Monitoring
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "12px", marginBottom: "16px",
              }}>
                {[
                  { label: "Data deletion jobs",          value: "2 pending" },
                  { label: "Consent records",             value: "847 active · 0 expired" },
                  { label: "Children under COPPA (<13)", value: "612 · All have valid parental consent ✓" },
                  { label: "FERPA schools",               value: "14 active agreements" },
                ].map((p) => (
                  <div key={p.label} style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: "10px", padding: "14px 16px",
                  }}>
                    <div style={{ fontSize: "12px", color: C.muted, marginBottom: "4px" }}>{p.label}</div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: C.text }}>{p.value}</div>
                  </div>
                ))}
              </div>
              <button style={{
                background: C.green, color: "#0d1117", fontWeight: 700,
                border: "none", padding: "8px 18px", borderRadius: "8px",
                fontSize: "13px", cursor: "pointer",
              }}>
                Run data audit
              </button>
            </div>

            {/* Safe language bar chart */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".8px", color: C.muted, marginBottom: "14px",
              }}>
                Safe Language Summary — Last 7 Days
              </div>
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: "10px", padding: "20px 24px",
              }}>
                {LANG_BARS.map((bar) => (
                  <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <div style={{ width: "160px", fontSize: "12px", color: C.muted, flexShrink: 0 }}>{bar.label}</div>
                    <div style={{ flex: 1, height: "10px", background: "rgba(255,255,255,.06)", borderRadius: "5px", overflow: "hidden" }}>
                      <div style={{ width: `${bar.pct}%`, height: "100%", borderRadius: "5px", background: bar.color }} />
                    </div>
                    <div style={{ width: "28px", textAlign: "right", fontSize: "13px", fontWeight: 700, color: bar.color }}>
                      {bar.count}
                    </div>
                  </div>
                ))}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "6px 14px", background: "rgba(80,232,144,.12)",
                  border: `1px solid rgba(80,232,144,.3)`, borderRadius: "20px",
                  fontSize: "12px", fontWeight: 600, color: C.green, marginTop: "8px",
                }}>
                  ✓ 0 timer references detected — critical metric clear
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 1: Privacy Alerts ══ */}
        {tab === 1 && (
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              marginBottom: "28px", flexWrap: "wrap", gap: "16px",
            }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: C.text }}>Privacy Alert Management</h1>
                <div style={{ fontSize: "13px", color: C.muted, marginTop: "2px" }}>Dedicated privacy and PII monitoring panel</div>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", background: "rgba(80,232,144,.12)",
                border: `1px solid rgba(80,232,144,.35)`, borderRadius: "20px",
                fontSize: "12px", fontWeight: 600, color: C.green,
              }}>
                🔒 Owner Access Only
              </span>
            </div>

            {/* Open alerts */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".8px", color: C.muted, marginBottom: "14px",
              }}>
                Open Privacy Alerts
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                {ALERT_ITEMS.map((alert, i) => {
                  const resolved = resolvedAlerts.has(i);
                  return (
                    <div key={i} style={{
                      background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: "10px", padding: "14px 18px",
                      display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", gap: "16px", flexWrap: "wrap",
                      opacity: resolved ? 0.45 : 1,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                          <span style={{
                            padding: "3px 12px", borderRadius: "12px",
                            fontSize: "11px", fontWeight: 700,
                            background: alert.pillBg, color: alert.pillColor,
                            border: `1px solid ${alert.pillColor}44`,
                          }}>
                            {alert.pillLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: C.text, margin: "4px 0" }}>{alert.desc}</div>
                        <div style={{ fontSize: "11px", color: C.muted }}>{alert.meta}</div>
                      </div>
                      <button
                        onClick={() => resolveAlert(i)}
                        disabled={resolved}
                        style={{
                          background: "rgba(80,232,144,.12)", color: C.green,
                          border: `1px solid rgba(80,232,144,.3)`,
                          padding: "5px 12px", borderRadius: "6px",
                          fontSize: "12px", fontWeight: 600,
                          cursor: resolved ? "default" : "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {resolved ? "Resolved" : "Mark Resolved"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deletion job queue */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                fontSize: "13px", fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".8px", color: C.muted, marginBottom: "14px",
              }}>
                Deletion Job Queue
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%", borderCollapse: "collapse",
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: "10px", overflow: "hidden", fontSize: "13px",
                }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,.04)" }}>
                      {["Child ID (partial)", "Deletion Type", "Scheduled At", "Status", "Actions"].map((h) => (
                        <th key={h} style={{
                          padding: "10px 14px", textAlign: "left",
                          fontSize: "11px", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: ".6px", color: C.muted,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DELETION_JOBS.map((job, i) => {
                      const ts = SEV_STYLE[job.typeStyle];
                      return (
                        <tr key={i}>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle" }}>
                            <code style={{
                              background: "rgba(255,255,255,.07)", padding: "1px 6px",
                              borderRadius: "4px", fontFamily: "monospace",
                              fontSize: "12px", color: C.muted2,
                            }}>
                              {job.childId}
                            </code>
                            <span style={{ color: C.muted }}>…</span>
                          </td>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "4px",
                              padding: "3px 10px", borderRadius: "12px",
                              fontSize: "11px", fontWeight: 700,
                              background: ts.bg, color: ts.color, border: `1px solid ${ts.border}`,
                            }}>
                              {job.type}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle", color: C.muted }}>
                            {job.scheduled}
                          </td>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle" }}>
                            <span style={{ color: statusColor[job.status], fontWeight: 600 }}>{job.status}</span>
                          </td>
                          <td style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, verticalAlign: "middle" }}>
                            <button style={{
                              background: "rgba(88,180,255,.15)", color: C.sky,
                              border: `1px solid rgba(88,180,255,.35)`,
                              padding: "5px 12px", borderRadius: "6px",
                              fontSize: "12px", fontWeight: 600, cursor: "pointer",
                            }}>
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 2: Spec ══ */}
        {tab === 2 && (
          <div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              marginBottom: "28px", flexWrap: "wrap", gap: "16px",
            }}>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: C.text }}>Specification</h1>
                <div style={{ fontSize: "13px", color: C.muted, marginTop: "2px" }}>
                  owner-safety-review-console-v2 · Item 234
                </div>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", background: "rgba(80,232,144,.12)",
                border: `1px solid rgba(80,232,144,.35)`, borderRadius: "20px",
                fontSize: "12px", fontWeight: 600, color: C.green,
              }}>
                🔒 Owner Access Only
              </span>
            </div>

            {[
              {
                title: "Access Control",
                items: [
                  { strong: "Visibility:", rest: " is_owner=true only. Not visible to teachers, parents, or content team." },
                  { strong: "All owner actions are logged", rest: " to governance_log and privacy_audit_log — dismiss, block, delete, resolve." },
                ],
              },
              {
                title: "Auto-Flag Sources",
                items: [
                  { strong: "Safe language checker", rest: " — nightly batch scan across all active skill content" },
                  { strong: "WCAG scanner", rest: " — triggered on each CI/CD deploy; results posted to safety_flags" },
                  { strong: "PII scan", rest: " — real-time on message save and content publish" },
                  { strong: "Skip rate threshold", rest: " — daily aggregate; flags skills where skip rate exceeds 60%" },
                  { strong: "Retention job scheduler", rest: " — nightly check for overdue deletion or anonymisation jobs" },
                ],
              },
              {
                title: "P0 Safety Flag Behaviour",
                items: [
                  { strong: "", rest: "Immediately sets delivery_locked=true on the affected item — no child can access it." },
                  { strong: "", rest: "Pages on-call via configured alerting channel." },
                  { strong: "", rest: "Non-dismissible owner banner persists until the flag is resolved." },
                  { strong: "", rest: "P0 flags must be resolved before the next production deploy is permitted." },
                ],
              },
              {
                title: "COPPA Compliance Check",
                items: [
                  { strong: "", rest: "Daily job: verifies every child record where age_years < 13 has parental_consent_at IS NOT NULL." },
                  { strong: "", rest: "Any violation generates a P0 privacy alert — not dismissible until consent is confirmed." },
                  { strong: "", rest: "Counter shown in console is a count only; no individual child data surfaced here." },
                ],
              },
              {
                title: "No Student Data in View",
                items: [
                  { strong: "", rest: "The console displays counts and aggregates only. No individual child records are shown. The deletion job table surfaces UUID partial (first 8 chars) solely for operator identification of the job." },
                ],
              },
            ].map((card) => (
              <div key={card.title} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: "10px", padding: "24px 28px", marginBottom: "20px",
              }}>
                <h3 style={{
                  fontSize: "14px", fontWeight: 700, color: C.green,
                  marginBottom: "14px", paddingBottom: "8px",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  {card.title}
                </h3>
                <ul style={{ paddingLeft: "18px" }}>
                  {card.items.map((item, i) => (
                    <li key={i} style={{ color: C.muted, fontSize: "13px", marginBottom: "8px", lineHeight: 1.6 }}>
                      {item.strong && <strong style={{ color: C.text }}>{item.strong}</strong>}
                      {item.rest}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* DB Schema */}
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "10px", padding: "24px 28px", marginBottom: "20px",
            }}>
              <h3 style={{
                fontSize: "14px", fontWeight: 700, color: C.green,
                marginBottom: "14px", paddingBottom: "8px",
                borderBottom: `1px solid ${C.border}`,
              }}>
                DB Schema Overview
              </h3>
              <pre style={{
                background: "#0d1117", border: `1px solid ${C.border}`,
                borderRadius: "8px", padding: "16px 18px",
                fontSize: "12px", lineHeight: 1.7, color: C.muted2,
                overflowX: "auto", marginTop: "12px",
                fontFamily: '"SF Mono", "Fira Code", Consolas, monospace',
              }}>
{`safety_flags (
  id                UUID,
  type              ENUM,
  severity          ENUM(p0, p1, info),
  source            TEXT,
  description       TEXT,
  item_type         TEXT,
  item_id           UUID,
  status            ENUM(open, resolved, dismissed),
  created_at        TIMESTAMPTZ,
  resolved_by       UUID,
  resolved_at       TIMESTAMPTZ
)

privacy_alerts (
  id                    UUID,
  alert_type            TEXT,
  description           TEXT,
  affected_record_type  TEXT,
  affected_record_id    UUID,
  status                ENUM(open, resolved),
  created_at            TIMESTAMPTZ,
  resolved_by           UUID,
  resolved_at           TIMESTAMPTZ
)`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
