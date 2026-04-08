"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

const C = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
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

interface RosterStudent {
  studentId: string;
  displayName: string;
  launchBandCode: string | null;
  inInterventionQueue: boolean;
  lastActiveAt: string | null;
  streakCount: number;
}

interface BandGroup {
  bandCode: string;
  severity: Severity;
  students: RosterStudent[];
}

interface ApiIntervention {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  reason: string;
  interventionType: string;
  triggerType?: string;
  status: string;
  teacherNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
}

function getRemediationSuggestions(triggerType: string, skillLabel?: string): string[] {
  switch (triggerType) {
    case "skill_gap":
      return [
        `Focus on ${skillLabel ?? "the flagged skill"} during the next session`,
        "Assign a guided-quest session targeting this skill specifically",
        "Check for prerequisite skills they may be missing",
      ];
    case "low_accuracy":
      return [
        "Review recent session responses to identify error patterns",
        "Assign easier questions first to rebuild confidence",
        "Consider a one-on-one check-in to understand blockers",
      ];
    case "inactive":
      return [
        "Reach out to the parent to check for barriers to access",
        "Set a shorter session target (3-5 questions) to reduce friction",
        "Add an encouraging note to motivate re-engagement",
      ];
    default:
      return [
        "Schedule a brief check-in with the student",
        "Review their recent activity in the student report",
        "Consider adjusting their learning band if needed",
      ];
  }
}

function deriveTriggerType(iv: ApiIntervention): string {
  if (iv.triggerType) return iv.triggerType;
  const r = (iv.reason ?? "").toLowerCase();
  if (r.includes("skill") || r.includes("gap") || r.includes("mastery")) return "skill_gap";
  if (r.includes("accuracy") || r.includes("confidence") || r.includes("floor")) return "low_accuracy";
  if (r.includes("inactive") || r.includes("absence") || r.includes("absent")) return "inactive";
  return "other";
}

function getTriggerLabel(triggerType: string): string {
  if (triggerType === "skill_gap") return "Skill gap";
  if (triggerType === "low_accuracy") return "Low accuracy";
  if (triggerType === "inactive") return "Inactive";
  return "Support needed";
}

function getTriggerIcon(triggerType: string): string {
  if (triggerType === "skill_gap") return "📚";
  if (triggerType === "low_accuracy") return "⚠️";
  if (triggerType === "inactive") return "😴";
  return "🔔";
}

const STUDENT_AVATARS = ["🦊", "🐧", "🦁", "🐸", "🦋", "🐙", "🦄", "🐻", "🐺", "🐳"];

function classifySeverity(student: RosterStudent): Severity {
  if (!student.lastActiveAt) return "urgent";
  const daysSinceActive = (Date.now() - new Date(student.lastActiveAt).getTime()) / 86400_000;
  if (daysSinceActive >= 7) return "urgent";
  if (daysSinceActive >= 4) return "action";
  return "watch";
}

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
function severityLabel(s: Severity) {
  if (s === "watch") return "Watch";
  if (s === "action") return "Action";
  return "Urgent";
}
function severityDesc(s: Severity) {
  if (s === "watch") return "Revisiting some quests — keep an eye on engagement";
  if (s === "action") return "Low engagement recently — consider a check-in";
  return "No recent activity — may need extra support";
}
function severityChip(s: Severity) {
  if (s === "watch") return "✦ Check in during next session";
  if (s === "action") return "✦ Schedule a brief check-in";
  return "✦ Personal outreach recommended";
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RemediationPage() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<"interventions" | "ladder" | "resolved">("interventions");
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["action-urgent", "urgent-urgent"]));
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set());
  const [resolveModal, setResolveModal] = useState<{ name: string; sev: Severity } | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [toast, setToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bandGroups, setBandGroups] = useState<BandGroup[]>([]);
  const [interventions, setInterventions] = useState<ApiIntervention[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolvedInterventionIds, setResolvedInterventionIds] = useState<Set<string>>(new Set());

  useEffect(() => { fetchTeacherId().then(id => setAuthed(!!id)); }, []);

  useEffect(() => {
    if (!authed) return;
    async function loadRoster() {
      try {
        setLoading(true);
        const teacherId = await fetchTeacherId();
        const res = await fetch(`/api/teacher/class?teacherId=${encodeURIComponent(teacherId)}`);
        if (!res.ok) throw new Error(`Failed to load roster (${res.status})`);
        const data = await res.json();
        const roster: RosterStudent[] = data.roster ?? [];

        // Filter to students in intervention queue
        const interventionStudents = roster.filter((s) => s.inInterventionQueue);

        // Group by band code, assign severity per student then pick worst for the group
        const byBand: Record<string, RosterStudent[]> = {};
        for (const student of interventionStudents) {
          const band = student.launchBandCode ?? "General";
          if (!byBand[band]) byBand[band] = [];
          byBand[band].push(student);
        }

        const groups: BandGroup[] = Object.entries(byBand).map(([bandCode, students]) => {
          // Worst severity in the group drives the group's severity
          const severities = students.map(classifySeverity);
          const sev: Severity = severities.includes("urgent")
            ? "urgent"
            : severities.includes("action")
            ? "action"
            : "watch";
          return { bandCode, severity: sev, students };
        });

        // Sort groups: urgent first, then action, then watch
        const order: Record<Severity, number> = { urgent: 0, action: 1, watch: 2 };
        groups.sort((a, b) => order[a.severity] - order[b.severity]);

        setBandGroups(groups);
        // Auto-open urgent and action groups
        const autoOpen = new Set<string>();
        for (const g of groups) {
          if (g.severity !== "watch") autoOpen.add(`${g.bandCode}-${g.severity}`);
        }
        setOpenGroups(autoOpen);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadRoster();
  }, [authed]);

  // Fetch active interventions
  useEffect(() => {
    if (!authed) return;
    async function loadInterventions() {
      try {
        const teacherId = await fetchTeacherId();
        const res = await fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=active`);
        if (!res.ok) return;
        const data = await res.json() as { interventions: ApiIntervention[] };
        setInterventions(data.interventions ?? []);
      } catch {
        // silently ignore — roster data still shown
      }
    }
    loadInterventions();
  }, [authed]);

  async function resolveIntervention(id: string) {
    setResolvingId(id);
    try {
      const teacherId = await fetchTeacherId();
      const res = await fetch(`/api/teacher/interventions/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, resolutionNote: "Resolved by teacher" }),
      });
      if (res.ok) {
        setResolvedInterventionIds((prev) => new Set([...prev, id]));
        setToast(true);
        setTimeout(() => setToast(false), 2800);
      }
    } catch {
      // ignore
    } finally {
      setResolvingId(null);
    }
  }

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
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

  const totalInterventionCount = bandGroups.reduce((sum, g) => sum + g.students.length, 0);
  const activeInterventions = interventions.filter((iv) => !resolvedInterventionIds.has(iv.id));

  if (!authed) {
    return (
      <AppFrame audience="teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
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
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>Remediation &amp; Support</h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Students who may benefit from targeted support — with suggested actions per intervention type</p>
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
          {(["interventions", "ladder", "resolved"] as const).map((tab) => (
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
              {tab === "interventions"
                ? `Remediation Plans${activeInterventions.length > 0 ? ` (${activeInterventions.length})` : ""}`
                : tab === "ladder"
                ? "Support Ladder"
                : "Resolution Log"}
            </button>
          ))}
        </nav>

        {/* TAB: Remediation Plans */}
        {activeTab === "interventions" && (
          <div>
            {activeInterventions.length === 0 ? (
              <div style={{
                background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)",
                borderRadius: 10, padding: "32px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>No students currently need remediation support.</div>
                <div style={{ fontSize: 13, color: C.muted }}>Active interventions will appear here when triggered.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activeInterventions.map((iv, idx) => {
                  const triggerType = deriveTriggerType(iv);
                  const suggestions = getRemediationSuggestions(triggerType, iv.skillCode ?? undefined);
                  const avatar = STUDENT_AVATARS[idx % STUDENT_AVATARS.length];
                  const isResolving = resolvingId === iv.id;
                  return (
                    <div
                      key={iv.id}
                      style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        padding: "20px 22px",
                      }}
                    >
                      {/* Card header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <span style={{ fontSize: 26, flexShrink: 0 }}>{avatar}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{iv.studentName}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13 }}>{getTriggerIcon(triggerType)}</span>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                              background: triggerType === "inactive" ? "rgba(245,197,66,0.12)" : triggerType === "low_accuracy" ? "rgba(248,113,113,0.10)" : "rgba(56,189,248,0.10)",
                              color: triggerType === "inactive" ? C.gold : triggerType === "low_accuracy" ? C.urgent : C.blue,
                              border: `1px solid ${triggerType === "inactive" ? "rgba(245,197,66,0.25)" : triggerType === "low_accuracy" ? "rgba(248,113,113,0.25)" : "rgba(56,189,248,0.25)"}`,
                            }}>
                              {getTriggerLabel(triggerType)}
                            </span>
                            {iv.skillCode && (
                              <span style={{
                                fontSize: 11, padding: "2px 8px", borderRadius: 20,
                                background: "rgba(155,114,255,0.10)", color: C.violet,
                                border: "1px solid rgba(155,114,255,0.25)", fontWeight: 600,
                              }}>{iv.skillCode}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Suggested actions */}
                      <div style={{
                        background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "12px 14px", marginBottom: 14,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.muted, marginBottom: 8 }}>Suggested Actions</div>
                        <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                          {suggestions.map((s, i) => (
                            <li key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link
                          href={`/teacher/students/${iv.studentId}`}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: "rgba(56,189,248,0.10)", color: C.blue,
                            border: "1px solid rgba(56,189,248,0.25)",
                            borderRadius: 6, fontSize: 12, fontWeight: 600,
                            padding: "8px 14px", textDecoration: "none",
                          }}
                        >
                          View student report →
                        </Link>
                        <button
                          onClick={() => void resolveIntervention(iv.id)}
                          disabled={isResolving}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            background: "rgba(34,197,94,0.08)", color: C.mint,
                            border: "1px solid rgba(34,197,94,0.22)",
                            borderRadius: 6, fontSize: 12, fontWeight: 600,
                            padding: "8px 14px", cursor: isResolving ? "wait" : "pointer",
                            opacity: isResolving ? 0.6 : 1,
                          }}
                        >
                          {isResolving ? "Resolving…" : "Resolve intervention"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: Support Ladder */}
        {activeTab === "ladder" && (
          <div>
            {loading && (
              <div style={{ textAlign: "center", padding: "48px 0", color: C.muted, fontSize: 14 }}>
                Loading class roster...
              </div>
            )}

            {error && (
              <div style={{
                background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: 10, padding: "16px 20px", color: "#fca5a5", fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {!loading && !error && bandGroups.length === 0 && (
              <div style={{
                background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.18)",
                borderRadius: 10, padding: "32px 24px", textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>All students on track</div>
                <div style={{ fontSize: 13, color: C.muted }}>No students are currently in the intervention queue. Great work!</div>
              </div>
            )}

            {!loading && !error && bandGroups.length > 0 && (
              <>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
                  background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)",
                  borderRadius: 8, padding: "10px 14px",
                }}>
                  <span style={{ fontSize: 13, color: C.blue, fontWeight: 600 }}>
                    {totalInterventionCount} student{totalInterventionCount !== 1 ? "s" : ""} in the support queue
                  </span>
                  <span style={{ fontSize: 12, color: C.muted }}>across {bandGroups.length} skill band{bandGroups.length !== 1 ? "s" : ""}</span>
                </div>

                {bandGroups.map((group) => {
                  const groupKey = `${group.bandCode}-${group.severity}`;
                  const isOpen = openGroups.has(groupKey);
                  const color = severityColor(group.severity);
                  return (
                    <div
                      key={groupKey}
                      style={{
                        borderRadius: 10, border: `1px solid ${severityBorder(group.severity)}`,
                        marginBottom: 16, overflow: "hidden",
                        background: severityBg(group.severity),
                      }}
                    >
                      {/* Group header */}
                      <div
                        onClick={() => toggleGroup(groupKey)}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "16px 20px", cursor: "pointer", userSelect: "none",
                        }}
                      >
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color }}>{severityLabel(group.severity)}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                          background: `${color}26`, color,
                        }}>{group.students.length} student{group.students.length !== 1 ? "s" : ""}</span>
                        <span style={{
                          fontSize: 11, padding: "2px 8px", borderRadius: 20,
                          background: "rgba(56,189,248,0.10)", color: C.blue, fontWeight: 600,
                        }}>Band: {group.bandCode}</span>
                        <span style={{ fontSize: 12, color: C.muted, flex: 1 }}>{severityDesc(group.severity)}</span>
                        <span style={{ fontSize: 16, color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                      </div>

                      {/* Group body */}
                      {isOpen && (
                        <div style={{ padding: "0 20px 20px" }}>
                          {/* Student chips */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                            {group.students.map((st) => {
                              const panelKey = `${groupKey}-${st.studentId}`;
                              const panelOpen = openPanels.has(panelKey);
                              return (
                                <button
                                  key={st.studentId}
                                  onClick={() => togglePanel(panelKey)}
                                  style={{
                                    display: "inline-flex", alignItems: "center", gap: 6,
                                    background: panelOpen ? "rgba(34,197,94,0.07)" : C.surface,
                                    border: `1px solid ${panelOpen ? "rgba(34,197,94,0.35)" : C.border}`,
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
                                  }}>{st.displayName[0]}</span>
                                  {st.displayName.split(" ")[0]}
                                </button>
                              );
                            })}
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              background: group.severity === "urgent" ? "rgba(248,113,113,0.07)" : "rgba(34,197,94,0.08)",
                              border: `1px solid ${group.severity === "urgent" ? "rgba(248,113,113,0.30)" : "rgba(34,197,94,0.20)"}`,
                              borderRadius: 20, padding: "6px 14px",
                              fontSize: 12, fontWeight: 500,
                              color: group.severity === "urgent" ? C.urgent : C.mint,
                            }}>{severityChip(group.severity)}</span>
                          </div>

                          {/* Per-student panels */}
                          {group.students.map((st) => {
                            const panelKey = `${groupKey}-${st.studentId}`;
                            if (!openPanels.has(panelKey)) return null;
                            const isUrgent = group.severity === "urgent";
                            const studentSev = classifySeverity(st);
                            return (
                              <div
                                key={st.studentId}
                                style={{
                                  background: C.surface, border: `1px solid ${C.border}`,
                                  borderRadius: 10, padding: 18, marginTop: 10,
                                }}
                              >
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                  {st.displayName.split(" ")[0]}
                                  <span style={{
                                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                                    background: `${severityColor(studentSev)}1F`, color: severityColor(studentSev),
                                  }}>{severityLabel(studentSev)}</span>
                                </h3>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
                                  {[
                                    { label: "Last active", value: formatRelativeDate(st.lastActiveAt) },
                                    { label: "Streak days", value: String(st.streakCount) },
                                    { label: "Skill band", value: st.launchBandCode ?? "General" },
                                  ].map((m) => (
                                    <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px" }}>
                                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 4 }}>{m.label}</div>
                                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{m.value}</div>
                                    </div>
                                  ))}
                                </div>
                                <div style={{
                                  background: isUrgent ? "rgba(248,113,113,0.06)" : "rgba(34,197,94,0.06)",
                                  border: `1px solid ${isUrgent ? "rgba(248,113,113,0.25)" : "rgba(34,197,94,0.18)"}`,
                                  borderRadius: 6, padding: "12px 14px", fontSize: 13,
                                  color: isUrgent ? "#fca5a5" : C.mint, marginBottom: 14,
                                }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: isUrgent ? "rgba(252,165,165,0.55)" : "rgba(34,197,94,0.6)", marginBottom: 4 }}>Recommended next step</div>
                                  {isUrgent
                                    ? `Reach out to check in — ${st.displayName.split(" ")[0]} may just need a warm invitation to re-engage`
                                    : `Try: a quest at their current band (${st.launchBandCode ?? "General"}) — a short, familiar session to rebuild momentum`}
                                </div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                  <button
                                    onClick={() => alert(`Platform message sent to ${st.displayName.split(" ")[0]}'s family.`)}
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
                                    onClick={() => openResolve(st.displayName.split(" ")[0], studentSev)}
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
              </>
            )}
          </div>
        )}

        {/* TAB: Resolution Log */}
        {activeTab === "resolved" && (
          <div>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "48px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>No resolved remediations yet</div>
              <div style={{ fontSize: 13, color: C.muted, maxWidth: 320, margin: "0 auto", lineHeight: 1.6 }}>
                When you mark a student as resolved from the Support Ladder, their record will appear here for your reference.
              </div>
            </div>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 16 }}>
              Resolved flags are retained for teacher reference only and are not externally disclosed (FERPA).
            </p>
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
              placeholder="e.g. Had a brief check-in — student mentioned they were on a school trip last week..."
              style={{
                width: "100%", background: C.base, border: `1px solid ${C.border}`,
                borderRadius: 6, color: C.text, fontSize: 13,
                padding: "10px 12px", resize: "vertical", minHeight: 90, marginBottom: 16,
                fontFamily: "inherit", boxSizing: "border-box",
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
        background: C.surface, border: "1px solid rgba(34,197,94,0.3)",
        color: C.text, fontSize: 13, fontWeight: 500,
        padding: "12px 20px", borderRadius: 8, zIndex: 200,
        transition: "transform 0.3s ease", whiteSpace: "nowrap",
      }}>
        ✓ Intervention resolved
      </div>
    </AppFrame>
  );
}
