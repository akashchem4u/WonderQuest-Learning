"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#50e890",
  gold: "#ffd166",
  amber: "#f59e0b",
  text: "#f0f6ff",
  muted: "#8b949e",
  watch: "#f5c542",
  action: "#f59e0b",
  urgent: "#f87171",
  watchBg: "rgba(245,197,66,0.08)",
  actionBg: "rgba(245,158,11,0.08)",
  urgentBg: "rgba(248,113,113,0.08)",
} as const;

type Severity = "watch" | "action" | "urgent";

interface StudentData {
  name: string;
  lastSession: string;
  quests: number;
  signal: string;
  nextStep: string;
}

interface Rung {
  severity: Severity;
  label: string;
  count: string;
  desc: string;
  actionChip: string;
  students: StudentData[];
}

const RUNGS: Rung[] = [
  {
    severity: "watch",
    label: "Watch",
    count: "4 students",
    desc: "Revisiting some quests — keep an eye on engagement",
    actionChip: "✦ Check in during next session",
    students: [
      { name: "Amara", lastSession: "Mar 24", quests: 2, signal: "Revisit pattern", nextStep: "Try: Reading Quest at their current band — short session to rebuild momentum" },
      { name: "Leo", lastSession: "Mar 23", quests: 3, signal: "Revisit pattern", nextStep: "Try: Math Quest at their current band — revisiting familiar content builds confidence" },
      { name: "Priya", lastSession: "Mar 22", quests: 2, signal: "Revisit pattern", nextStep: "Try: Science Quest at their current band — a new topic may spark fresh engagement" },
      { name: "Marcus", lastSession: "Mar 24", quests: 1, signal: "Revisit pattern", nextStep: "Try: Reading Quest at their current band — a familiar format to re-engage on their own terms" },
    ],
  },
  {
    severity: "action",
    label: "Action",
    count: "2 students",
    desc: "Low engagement this week — consider a check-in",
    actionChip: "✦ Schedule a brief check-in",
    students: [
      { name: "Jordan", lastSession: "Mar 20", quests: 0, signal: "Low engagement", nextStep: "Try: A short Story Quest at their current band — low-stakes entry to rebuild a habit" },
      { name: "Sofia", lastSession: "Mar 19", quests: 1, signal: "Quest exit early", nextStep: "Try: Math Quest at their current band — a brief, achievable quest to re-anchor engagement" },
    ],
  },
  {
    severity: "urgent",
    label: "Urgent",
    count: "1 student",
    desc: "Not started this week — may need extra support",
    actionChip: "✦ Personal outreach recommended",
    students: [
      { name: "Eli", lastSession: "Mar 17", quests: 0, signal: "Not started", nextStep: "Reach out to check in — Eli may just be getting started and a warm invitation can go a long way" },
    ],
  },
];

const RESOLVED = [
  { student: "Noah", flag: "low_engagement", date: "Mar 21, 2026", note: "Had a brief check-in — student mentioned they were on a school trip last week. Back on track now." },
  { student: "Isla", flag: "revisit_pattern", date: "Mar 20, 2026", note: "Suggested a new quest band. Student completed two quests the following day." },
  { student: "Kai", flag: "quest_exit_early", date: "Mar 19, 2026", note: "Sent a platform message; family responded that device time was limited that week. Monitoring resumed." },
  { student: "Zara", flag: "not_started", date: "Mar 17, 2026", note: "Coordinated with family — student was at a family event. Welcomed back with a recommended quest." },
  { student: "Theo", flag: "low_engagement", date: "Mar 15, 2026", note: "Engaged student in a live session. Re-introduced Reading Quest at current band. Great response." },
];

function severityColor(s: Severity) {
  if (s === "watch") return C.watch;
  if (s === "action") return C.action;
  return C.urgent;
}
function severityBg(s: Severity) {
  if (s === "watch") return C.watchBg;
  if (s === "action") return C.actionBg;
  return C.urgentBg;
}
function severityBorder(s: Severity) {
  if (s === "watch") return "rgba(245,197,66,0.18)";
  if (s === "action") return "rgba(245,158,11,0.20)";
  return "rgba(248,113,113,0.20)";
}
function flagBadgeStyle(flag: string): React.CSSProperties {
  if (flag === "low_engagement") return { background: "rgba(245,158,11,0.12)", color: C.action };
  if (flag === "revisit_pattern") return { background: "rgba(245,197,66,0.12)", color: C.watch };
  if (flag === "quest_exit_early") return { background: "rgba(248,113,113,0.12)", color: C.urgent };
  return { background: "rgba(248,113,113,0.15)", color: "#fca5a5" };
}

export default function RemediationPage() {
  const [activeTab, setActiveTab] = useState<"ladder" | "resolved" | "spec">("ladder");
  const [openRungs, setOpenRungs] = useState<Set<Severity>>(new Set(["action", "urgent"]));
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set());
  const [resolveModal, setResolveModal] = useState<{ name: string; sev: Severity } | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [toast, setToast] = useState(false);

  function toggleRung(sev: Severity) {
    setOpenRungs((prev) => {
      const n = new Set(prev);
      n.has(sev) ? n.delete(sev) : n.add(sev);
      return n;
    });
  }

  function togglePanel(key: string) {
    setOpenPanels((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  function openResolve(name: string, sev: Severity) {
    setResolveModal({ name, sev });
    setResolveNote("");
  }

  function submitResolve() {
    setResolveModal(null);
    setToast(true);
    setTimeout(() => setToast(false), 2800);
  }

  return (
    <AppFrame audience="teacher">
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 0 48px" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 6,
            background: "rgba(56,189,248,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
          }}>🪜</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>Support Ladder</h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Students who may benefit from a little extra attention — based on engagement signals</p>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(56,189,248,0.12)", color: C.blue,
              fontSize: 11, fontWeight: 600, padding: "3px 10px",
              borderRadius: 20, border: "1px solid rgba(56,189,248,0.25)", marginTop: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Teacher View
            </span>
          </div>
        </div>

        {/* Tab nav */}
        <nav style={{ display: "flex", gap: 4, borderBottom: `1px solid ${C.border}`, marginBottom: 28, overflowX: "auto" }}>
          {(["ladder", "resolved", "spec"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none", border: "none", color: activeTab === tab ? C.mint : C.muted,
                fontSize: 14, fontWeight: 500, padding: "10px 18px", cursor: "pointer",
                borderBottom: `2px solid ${activeTab === tab ? C.mint : "transparent"}`,
                transition: "color 0.2s, border-color 0.2s", whiteSpace: "nowrap", minHeight: 44,
              }}
            >
              {tab === "ladder" ? "Support Ladder" : tab === "resolved" ? "Resolution Log" : "Spec"}
            </button>
          ))}
        </nav>

        {/* TAB: Support Ladder */}
        {activeTab === "ladder" && (
          <div>
            {RUNGS.map((rung) => {
              const isOpen = openRungs.has(rung.severity);
              const color = severityColor(rung.severity);
              return (
                <div
                  key={rung.severity}
                  style={{
                    borderRadius: 10, border: `1px solid ${severityBorder(rung.severity)}`,
                    marginBottom: 16, overflow: "hidden",
                    background: severityBg(rung.severity),
                  }}
                >
                  {/* Rung header */}
                  <div
                    onClick={() => toggleRung(rung.severity)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "16px 20px", cursor: "pointer", userSelect: "none",
                    }}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color }}>{rung.label}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                      background: `${color}26`, color,
                    }}>{rung.count}</span>
                    <span style={{ fontSize: 12, color: C.muted, flex: 1 }}>{rung.desc}</span>
                    <span style={{ fontSize: 16, color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                  </div>

                  {/* Rung body */}
                  {isOpen && (
                    <div style={{ padding: "0 20px 20px" }}>
                      {/* Student chips */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                        {rung.students.map((st) => {
                          const panelKey = `${rung.severity}-${st.name}`;
                          const panelOpen = openPanels.has(panelKey);
                          return (
                            <button
                              key={st.name}
                              onClick={() => togglePanel(panelKey)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                background: panelOpen ? "rgba(80,232,144,0.07)" : C.surface,
                                border: `1px solid ${panelOpen ? "rgba(80,232,144,0.35)" : C.border}`,
                                borderRadius: 20, padding: "6px 14px 6px 10px",
                                fontSize: 13, fontWeight: 500, color: C.text, cursor: "pointer",
                                minHeight: 44,
                              }}
                            >
                              <span style={{
                                width: 24, height: 24, borderRadius: "50%",
                                background: "rgba(56,189,248,0.20)", color: C.blue,
                                fontSize: 11, fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                              }}>{st.name[0]}</span>
                              {st.name}
                            </button>
                          );
                        })}
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: rung.severity === "urgent" ? "rgba(248,113,113,0.07)" : "rgba(80,232,144,0.08)",
                          border: `1px solid ${rung.severity === "urgent" ? "rgba(248,113,113,0.30)" : "rgba(80,232,144,0.20)"}`,
                          borderRadius: 20, padding: "6px 14px",
                          fontSize: 12, fontWeight: 500,
                          color: rung.severity === "urgent" ? C.urgent : C.mint,
                        }}>{rung.actionChip}</span>
                      </div>

                      {/* Per-student panels */}
                      {rung.students.map((st) => {
                        const panelKey = `${rung.severity}-${st.name}`;
                        if (!openPanels.has(panelKey)) return null;
                        const isUrgent = rung.severity === "urgent";
                        return (
                          <div
                            key={st.name}
                            style={{
                              background: C.surface, border: `1px solid ${C.border}`,
                              borderRadius: 10, padding: 18, marginTop: 10,
                            }}
                          >
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                              {st.name}
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                                background: `${color}1F`, color,
                              }}>{rung.label}</span>
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
                              {[
                                { label: "Last session", value: st.lastSession },
                                { label: "Quests explored this week", value: String(st.quests) },
                                { label: "Signal", value: st.signal },
                              ].map((m) => (
                                <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px" }}>
                                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 4 }}>{m.label}</div>
                                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{m.value}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{
                              background: isUrgent ? "rgba(248,113,113,0.06)" : "rgba(80,232,144,0.06)",
                              border: `1px solid ${isUrgent ? "rgba(248,113,113,0.25)" : "rgba(80,232,144,0.18)"}`,
                              borderRadius: 6, padding: "12px 14px", fontSize: 13,
                              color: isUrgent ? "#fca5a5" : C.mint, marginBottom: 14,
                            }}>
                              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: isUrgent ? "rgba(252,165,165,0.55)" : "rgba(80,232,144,0.6)", marginBottom: 4 }}>Recommended next step</div>
                              {st.nextStep}
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                onClick={() => alert(`Platform message sent to ${st.name}'s family.`)}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  background: isUrgent ? "rgba(248,113,113,0.12)" : "rgba(56,189,248,0.12)",
                                  color: isUrgent ? C.urgent : C.blue,
                                  border: `1px solid ${isUrgent ? "rgba(248,113,113,0.25)" : "rgba(56,189,248,0.25)"}`,
                                  borderRadius: 6, fontSize: 13, fontWeight: 600,
                                  padding: "10px 16px", cursor: "pointer", minHeight: 44,
                                }}
                              >✉ Send Message</button>
                              <button
                                onClick={() => openResolve(st.name, rung.severity)}
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  background: "rgba(255,255,255,0.05)", color: C.text,
                                  border: `1px solid ${C.border}`,
                                  borderRadius: 6, fontSize: 13, fontWeight: 600,
                                  padding: "10px 16px", cursor: "pointer", minHeight: 44,
                                }}
                              >Mark Resolved</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <p style={{ fontSize: 12, color: C.muted, marginTop: 20 }}>
              Signals are based on session engagement patterns only. No accuracy data is used or displayed. Student names shown are first names only per privacy policy.
            </p>
          </div>
        )}

        {/* TAB: Resolution Log */}
        {activeTab === "resolved" && (
          <div>
            <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${C.border}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Student", "Flag type", "Resolved", "Resolution notes"].map((h) => (
                      <th key={h} style={{
                        background: C.surface, color: C.muted,
                        fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                        padding: "12px 16px", textAlign: "left", borderBottom: `1px solid ${C.border}`,
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESOLVED.map((r, i) => (
                    <tr key={i} style={{ borderBottom: i < RESOLVED.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <td style={{ padding: "12px 16px", color: C.text, verticalAlign: "middle" }}><strong>{r.student}</strong></td>
                      <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20,
                          ...flagBadgeStyle(r.flag),
                        }}>{r.flag}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: C.muted, whiteSpace: "nowrap", verticalAlign: "middle" }}>{r.date}</td>
                      <td style={{ padding: "12px 16px", color: C.muted, fontSize: 12, maxWidth: 240, verticalAlign: "middle" }}>{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>
              Resolved flags are retained for teacher reference only and are not externally disclosed (FERPA).
            </p>
          </div>
        )}

        {/* TAB: Spec */}
        {activeTab === "spec" && (
          <div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 22px", marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.blue, marginBottom: 14 }}>Component</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginBottom: 8 }}>
                {[
                  { k: "Name", v: "RemediationLadder" },
                  { k: "Design System ID", v: "#293" },
                  { k: "Route", v: "/teacher/remediation" },
                  { k: "Auth", v: "Teacher role required" },
                  { k: "Persona", v: "Teacher (#38bdf8)" },
                ].map((i) => (
                  <div key={i.k} style={{ fontSize: 13, lineHeight: 1.5 }}>
                    <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{i.k}</div>
                    <div style={{ color: C.text, fontWeight: 500 }}>{i.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 22px", marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.blue, marginBottom: 14 }}>Flag Type Definitions</h2>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      {["flag_type", "Trigger condition", "Default severity"].map((h) => (
                        <th key={h} style={{ background: "rgba(255,255,255,0.03)", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", padding: "8px 12px", textAlign: "left", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: "low_engagement", trigger: "Fewer than 2 quest sessions in a 7-day window", sev: "action" },
                      { type: "revisit_pattern", trigger: "Student revisited same quest band 3+ times without progressing", sev: "watch" },
                      { type: "quest_exit_early", trigger: "Student exited a quest before midpoint on 2+ occasions in a week", sev: "action" },
                      { type: "not_started", trigger: "Zero quest activity for 7+ calendar days", sev: "urgent" },
                    ].map((r, i, arr) => (
                      <tr key={r.type} style={{ borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <td style={{ padding: "8px 12px", color: C.blue, fontFamily: "monospace" }}>{r.type}</td>
                        <td style={{ padding: "8px 12px", color: C.text }}>{r.trigger}</td>
                        <td style={{ padding: "8px 12px", color: C.text, fontWeight: 600 }}>{r.sev}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ background: "rgba(255,123,107,0.06)", border: "1px solid rgba(255,123,107,0.25)", borderRadius: 10, padding: "14px 16px", fontSize: 12, color: "rgba(240,246,255,0.65)", lineHeight: 1.6 }}>
              <strong style={{ color: "#ff7b6b" }}>Privacy: </strong>Student first names only · NO accuracy % · flags = engagement signals only (never "struggling" or "below average") · positive framing always · FERPA: School-linked only; not externally disclosed.
            </div>
          </div>
        )}
      </div>

      {/* Resolve modal */}
      {resolveModal && (
        <div
          onClick={() => setResolveModal(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
            zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, width: "100%", maxWidth: 460 }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>Mark {resolveModal.name} as Resolved</h3>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Add a brief note about what you observed or did. This is for your records only.</p>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="e.g. Had a brief check-in — student mentioned they were on a school trip..."
              style={{
                width: "100%", background: C.base, border: `1px solid ${C.border}`,
                borderRadius: 6, color: C.text, fontSize: 13,
                padding: "10px 12px", resize: "vertical", minHeight: 90, marginBottom: 16,
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => setResolveModal(null)}
                style={{ background: "rgba(255,255,255,0.05)", color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 13, fontWeight: 600, padding: "10px 16px", cursor: "pointer", minHeight: 44 }}
              >Cancel</button>
              <button
                onClick={submitResolve}
                style={{ background: C.mint, color: "#0d1117", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, padding: "10px 16px", cursor: "pointer", minHeight: 44 }}
              >Save &amp; Resolve</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div style={{
        position: "fixed", bottom: 24, left: "50%",
        transform: `translateX(-50%) translateY(${toast ? 0 : 80}px)`,
        background: C.surface, border: "1px solid rgba(80,232,144,0.3)",
        color: C.text, fontSize: 13, fontWeight: 500,
        padding: "12px 20px", borderRadius: 8, zIndex: 200,
        transition: "transform 0.3s ease", whiteSpace: "nowrap",
      }}>
        ✓ Flag marked as resolved
      </div>
    </AppFrame>
  );
}
