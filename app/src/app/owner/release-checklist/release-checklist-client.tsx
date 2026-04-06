"use client";

import { useState } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const BASE    = "#100b2e";
const CARD    = "#161b22";
const SHELL   = "#0d1117";
const BORDER  = "rgba(255,255,255,0.06)";
const TEXT    = "#f0f6ff";
const MUTED   = "#8b949e";
const MINT    = "#50e890";
const AMBER   = "#f0a030";
const RED_ST  = "#e85050";
const PURPLE  = "#a371f7";

type ItemStatus = "complete" | "in_progress" | "blocked" | "pending" | "waived";

interface CheckItem {
  label: string;
  status: ItemStatus;
  completedBy?: string;
  completedAt?: string;
  note?: string;
  noteType?: "blocked" | "progress";
  assignee?: string;
  noWaive?: boolean;
}

interface Category {
  id: string;
  icon: string;
  name: string;
  items: CheckItem[];
}

// ── Stub Data ─────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  {
    id: "engineering",
    icon: "⚙️",
    name: "Engineering",
    items: [
      { label: "All P0 bugs resolved",            status: "complete",    completedBy: "jrodriguez@wq.dev", completedAt: "Apr 8, 2026" },
      { label: "Device coverage 100% on P0 features", status: "complete", completedBy: "kpatel@wq.dev",     completedAt: "Apr 9, 2026" },
      { label: "Offline sync tested",             status: "complete",    completedBy: "jrodriguez@wq.dev", completedAt: "Apr 10, 2026" },
      { label: "Performance regression check",    status: "in_progress", assignee: "kpatel@wq.dev", note: "In progress — benchmarks running, results expected Apr 13", noteType: "progress" },
    ],
  },
  {
    id: "content",
    icon: "📚",
    name: "Content",
    items: [
      { label: "P3 Social Studies quest batch approved",        status: "complete",    completedBy: "mwilliams@wq.dev",    completedAt: "Apr 7, 2026" },
      { label: "Arts pack Sketch Lab child safety sign-off",    status: "complete",    completedBy: "safety-team@wq.dev",  completedAt: "Apr 8, 2026" },
      { label: "All new audio assets reviewed",                 status: "in_progress", assignee: "mwilliams@wq.dev", note: "In progress — 14 of 19 assets reviewed", noteType: "progress" },
    ],
  },
  {
    id: "accessibility",
    icon: "♿",
    name: "Accessibility",
    items: [
      { label: "WCAG 2.1 AA audit complete",          status: "complete", completedBy: "adesai@wq.dev", completedAt: "Apr 9, 2026" },
      { label: "High contrast mode tested all devices",status: "complete", completedBy: "adesai@wq.dev", completedAt: "Apr 9, 2026" },
      { label: "Touch targets ≥44px verified",         status: "complete", completedBy: "kpatel@wq.dev",  completedAt: "Apr 10, 2026" },
      { label: "Screen reader test",                   status: "blocked",  assignee: "adesai@wq.dev", note: "Blocked — needs iOS 17 device. Cannot be waived (P0 accessibility item).", noteType: "blocked", noWaive: true },
    ],
  },
  {
    id: "privacy",
    icon: "🔒",
    name: "Privacy & Compliance",
    items: [
      { label: "COPPA review",                                status: "complete", completedBy: "legal@wq.dev",       completedAt: "Apr 6, 2026" },
      { label: "FERPA review",                                status: "complete", completedBy: "legal@wq.dev",       completedAt: "Apr 6, 2026" },
      { label: "Benchmark disclaimer keyword triggers tested", status: "complete", completedBy: "jrodriguez@wq.dev", completedAt: "Apr 10, 2026" },
      { label: "Data minimization audit",                     status: "complete", completedBy: "legal@wq.dev",       completedAt: "Apr 7, 2026" },
    ],
  },
  {
    id: "signoffs",
    icon: "✍️",
    name: "Sign-offs",
    items: [
      { label: "Content team",       status: "complete",    completedBy: "mwilliams@wq.dev", completedAt: "Apr 10, 2026" },
      { label: "Engineering lead",   status: "in_progress", assignee: "jrodriguez@wq.dev", note: "In progress — awaiting performance regression results", noteType: "progress" },
      { label: "Owner final approval",status: "pending",    assignee: "owner" },
    ],
  },
];

const HISTORY = [
  {
    version: "v2.5",
    shipped: "Shipped Mar 10, 2026",
    tally: "16 / 16 complete",
    note: "All 16 checklist items completed and signed off. Deploy authorized by owner on Mar 10, 2026 at 14:32 UTC.",
    cats: ["Engineering (4/4)", "Content (3/3)", "Accessibility (4/4)", "Privacy & Compliance (3/3)", "Sign-offs (2/2)"],
  },
  {
    version: "v2.4",
    shipped: "Shipped Jan 28, 2026",
    tally: "14 / 14 complete",
    note: "All 14 checklist items completed. 1 item waived (owner note on file). Deploy authorized by owner on Jan 28, 2026 at 11:05 UTC.",
    cats: ["Engineering (4/4)", "Content (2/2)", "Accessibility (3/3)", "Privacy & Compliance (3/3)", "Sign-offs (2/2)"],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(s: ItemStatus): string {
  if (s === "complete")    return MINT;
  if (s === "in_progress") return AMBER;
  if (s === "blocked")     return RED_ST;
  if (s === "waived")      return PURPLE;
  return MUTED;
}

function statusLabel(s: ItemStatus): string {
  if (s === "complete")    return "Complete";
  if (s === "in_progress") return "In Progress";
  if (s === "blocked")     return "Blocked";
  if (s === "waived")      return "Waived";
  return "Pending";
}

function statusIndicatorContent(s: ItemStatus): string {
  if (s === "complete")    return "✓";
  if (s === "in_progress") return "~";
  if (s === "blocked")     return "✗";
  if (s === "waived")      return "–";
  return "○";
}

function getCounts(items: CheckItem[]): { complete: number; total: number; blocked: number } {
  const complete = items.filter((i) => i.status === "complete" || i.status === "waived").length;
  const blocked  = items.filter((i) => i.status === "blocked").length;
  return { complete, total: items.length, blocked };
}

function getOverallCounts() {
  let total = 0;
  let complete = 0;
  let blocked = 0;
  for (const cat of CATEGORIES) {
    const c = getCounts(cat.items);
    total    += c.total;
    complete += c.complete;
    blocked  += c.blocked;
  }
  return { total, complete, blocked };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReleaseChecklistClient() {
  const [tab, setTab] = useState<"checklist" | "history">("checklist");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    engineering: true, content: true, accessibility: true, privacy: true, signoffs: true,
  });
  const [histExpanded, setHistExpanded] = useState<Record<string, boolean>>({});

  const overall = getOverallCounts();
  const pct = Math.round((overall.complete / overall.total) * 100);
  const deployLocked = overall.blocked > 0 || overall.complete < overall.total;
  const inProgress = CATEGORIES.flatMap((c) => c.items).filter((i) => i.status === "in_progress").length;

  function toggleCat(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }
  function toggleHist(id: string) {
    setHistExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: BASE, minHeight: "100vh", color: TEXT, paddingBottom: "60px" }}>

      {/* Page Header */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ width: "38px", height: "38px", background: MINT, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "18px", color: SHELL, flexShrink: 0 }}>W</div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: TEXT, letterSpacing: "-.3px", margin: 0 }}>Release Checklist</h1>
          <span style={{ background: "rgba(80,232,144,.12)", border: "1px solid rgba(80,232,144,.25)", color: MINT, borderRadius: "20px", padding: "2px 10px", fontSize: "11.5px", fontWeight: 600, letterSpacing: ".4px" }}>Owner</span>
          <span style={{ fontSize: "13px", color: MUTED, marginLeft: "auto" }}>Pre-release gate &nbsp;·&nbsp; /owner/release-checklist</span>
        </div>

        {/* Tab Nav */}
        <div style={{ display: "flex", gap: "4px", borderBottom: `1px solid ${BORDER}`, marginBottom: "28px", paddingTop: "20px" }}>
          {(["checklist", "history"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", color: tab === t ? MINT : MUTED, fontFamily: "inherit", fontSize: "14px", fontWeight: 500, padding: "10px 18px", borderRadius: "6px 6px 0 0", cursor: "pointer", borderBottom: tab === t ? `2px solid ${MINT}` : "2px solid transparent", background: tab === t ? "rgba(80,232,144,.06)" : "none" }}>
              {t === "checklist" ? "Checklist (v2.6)" : "History"}
            </button>
          ))}
        </div>

        {/* ── Checklist Tab ── */}
        {tab === "checklist" && (
          <>
            {/* Release Header Card */}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "24px 28px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: TEXT, letterSpacing: "-.25px", margin: 0 }}>v2.6 Release Checklist</h2>
                <p style={{ fontSize: "13px", color: MUTED, marginTop: "3px", marginBottom: 0 }}>Target deploy date: <strong style={{ color: TEXT }}>April 15, 2026</strong></p>
              </div>
              <div style={{ marginLeft: "auto", minWidth: "220px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: MUTED, marginBottom: "7px" }}>
                  <span>Overall progress</span>
                  <span style={{ fontWeight: 600, color: MINT, fontSize: "14px" }}>{overall.complete} / {overall.total} complete</span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,.08)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: MINT, borderRadius: "99px", width: `${pct}%`, transition: "width .4s ease" }} />
                </div>
              </div>
            </div>

            {/* Blocked Banner */}
            {overall.blocked > 0 && (
              <div style={{ background: "rgba(232,80,80,.12)", border: "1px solid rgba(232,80,80,.35)", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: "#ff9090" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>⛔</span>
                <span><strong>{overall.blocked} blocked item{overall.blocked > 1 ? "s" : ""}</strong> — Screen reader test. Resolve before deploy.</span>
              </div>
            )}

            {/* Categories */}
            {CATEGORIES.map((cat) => {
              const counts = getCounts(cat.items);
              const isOpen = expanded[cat.id] ?? true;
              const hasBlocked = counts.blocked > 0;
              return (
                <div key={cat.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", marginBottom: "14px", overflow: "hidden" }}>
                  <button onClick={() => toggleCat(cat.id)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 20px", cursor: "pointer", background: "none", border: "none", width: "100%", textAlign: "left", color: TEXT, fontFamily: "inherit", fontSize: "14.5px", fontWeight: 600, minHeight: "52px" }}>
                    <span style={{ fontSize: "17px" }}>{cat.icon}</span>
                    <span style={{ flex: 1 }}>{cat.name}</span>
                    <span style={{ fontSize: "12.5px", color: hasBlocked ? RED_ST : MUTED, fontWeight: 500 }}>
                      <span style={{ fontWeight: 700, color: hasBlocked ? RED_ST : MINT }}>{counts.complete}</span> / {counts.total} complete{hasBlocked ? ` · ${counts.blocked} blocked` : ""}
                    </span>
                    <span style={{ fontSize: "16px", color: MUTED, transition: "transform .2s", display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", marginLeft: "4px" }}>▾</span>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${BORDER}`, paddingBottom: "10px" }}>
                      {cat.items.map((item, idx) => {
                        const sc = statusColor(item.status);
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "12px 20px" }}>
                            {/* Status indicator */}
                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0, marginTop: "1px", background: `${sc}22`, border: `1.5px solid ${sc}`, color: sc }}>
                              {statusIndicatorContent(item.status)}
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "14px", fontWeight: 500, color: item.status === "complete" ? MUTED : TEXT, lineHeight: 1.45 }}>{item.label}</div>
                              <div style={{ display: "flex", gap: "14px", marginTop: "4px", flexWrap: "wrap" }}>
                                {item.completedBy && <span style={{ fontSize: "12px", color: "rgba(80,232,144,.7)" }}>{item.completedBy}</span>}
                                {item.completedAt && <span style={{ fontSize: "12px", color: MUTED }}>{item.completedAt}</span>}
                                {item.assignee && <span style={{ fontSize: "12px", color: MUTED }}>Assigned: {item.assignee}</span>}
                                {item.noWaive && <span style={{ fontSize: "12px", color: "#ff9090" }}>P0 — cannot be waived</span>}
                              </div>
                              {item.note && (
                                <span style={{ marginTop: "5px", fontSize: "12px", color: item.noteType === "blocked" ? "#ff9090" : "#f0c060", background: item.noteType === "blocked" ? "rgba(232,80,80,.08)" : "rgba(240,160,48,.08)", borderRadius: "4px", padding: "4px 8px", display: "inline-block" }}>{item.note}</span>
                              )}
                            </div>
                            {/* Status badge */}
                            <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: ".3px", padding: "2px 8px", borderRadius: "20px", flexShrink: 0, marginTop: "2px", whiteSpace: "nowrap", background: `${sc}1f`, color: sc, border: `1px solid ${sc}33` }}>{statusLabel(item.status)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Deploy Button */}
            <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
              <button disabled style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(139,148,158,.12)", border: "1.5px solid rgba(139,148,158,.25)", color: MUTED, fontFamily: "inherit", fontSize: "14.5px", fontWeight: 600, padding: "13px 28px", borderRadius: "6px", cursor: "not-allowed", minHeight: "48px", letterSpacing: ".2px" }}>
                <span style={{ fontSize: "16px" }}>🔒</span>
                Deploy to Production
              </button>
              <p style={{ fontSize: "12.5px", color: MUTED, margin: 0 }}>
                Deploy is locked.{" "}
                {overall.blocked > 0 && <strong style={{ color: "#ff9090" }}>{overall.blocked} blocked item{overall.blocked > 1 ? "s" : ""}</strong>}
                {overall.blocked > 0 && inProgress > 0 && " and "}
                {inProgress > 0 && <strong style={{ color: "#ff9090" }}>{inProgress} in-progress item{inProgress > 1 ? "s" : ""}</strong>}
                {" "}must be resolved before deploy unlocks.
              </p>
            </div>
          </>
        )}

        {/* ── History Tab ── */}
        {tab === "history" && (
          <>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: TEXT, marginBottom: "18px", marginTop: 0 }}>Release History</h2>
            {HISTORY.map((h) => {
              const isOpen = histExpanded[h.version] ?? false;
              return (
                <div key={h.version} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "10px", marginBottom: "12px", overflow: "hidden" }}>
                  <button onClick={() => toggleHist(h.version)} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 22px", cursor: "pointer", background: "none", border: "none", width: "100%", textAlign: "left", color: TEXT, fontFamily: "inherit", fontSize: "14.5px", fontWeight: 600, minHeight: "52px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: MINT }}>{h.version}</span>
                    <span style={{ fontSize: "12.5px", color: MUTED, fontWeight: 400 }}>{h.shipped}</span>
                    <span style={{ marginLeft: "auto", fontSize: "12.5px", fontWeight: 600, color: MINT, background: "rgba(80,232,144,.1)", border: "1px solid rgba(80,232,144,.2)", padding: "2px 10px", borderRadius: "20px" }}>{h.tally}</span>
                    <span style={{ fontSize: "16px", color: MUTED, display: "inline-block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s", marginLeft: "8px" }}>▾</span>
                  </button>
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 22px" }}>
                      <p style={{ fontSize: "13.5px", color: MUTED, marginBottom: "10px" }}>{h.note}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {h.cats.map((cat) => (
                          <span key={cat} style={{ fontSize: "12px", background: "rgba(255,255,255,.05)", border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "4px 10px", color: MUTED }}>
                            <span style={{ color: MINT, marginRight: "4px" }}>✓</span>{cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
