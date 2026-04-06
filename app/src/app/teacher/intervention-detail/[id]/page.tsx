"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../../teacher-gate";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
};

// ── API types ─────────────────────────────────────────────────────────────────
type ApiIntervention = {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  reason: string;
  interventionType: string;
  status: string;
  teacherNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
};

// ── UI types ──────────────────────────────────────────────────────────────────
type ActionItem = {
  title: string;
  desc: string;
  date: string;
  done: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function getTriggerLabel(reason: string): string {
  if (reason.includes("confidence") || reason.includes("floor")) return "Confidence floor";
  if (reason.includes("absence") || reason.includes("absent")) return "Absence";
  if (reason.includes("hint")) return "Hint pattern";
  if (reason.includes("ceiling") || reason.includes("band")) return "Band ceiling";
  return reason;
}

function getTriggerIcon(reason: string): string {
  if (reason.includes("confidence") || reason.includes("floor")) return "⚠️";
  if (reason.includes("absence") || reason.includes("absent")) return "📅";
  if (reason.includes("hint")) return "💡";
  if (reason.includes("ceiling") || reason.includes("band")) return "💙";
  return "⚠️";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function InterventionDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervention, setIntervention] = useState<ApiIntervention | null>(null);
  const [showLogNote, setShowLogNote] = useState(false);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!authed) return;
    const teacherId = getTeacherId();

    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=all`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { interventions: ApiIntervention[] };
        const match = data.interventions.find((iv) => iv.id === id);
        if (!match) {
          setError("Intervention not found.");
          return;
        }
        setIntervention(match);
        // Seed default action items based on API data
        setActions([
          {
            title: `Check-in with ${match.studentName}`,
            desc: match.teacherNote ?? "Review progress and offer support.",
            date: formatDate(match.createdAt),
            done: false,
          },
          {
            title: "Follow-up in 2 sessions",
            desc: "Review mastery progress — if still below 65 after 2 more sessions, escalate.",
            date: "Upcoming",
            done: false,
          },
        ]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load intervention.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id, authed]);

  const toggleAction = (idx: number) => {
    setActions((prev) => prev.map((a, i) => (i === idx ? { ...a, done: !a.done } : a)));
  };

  async function handleResolve() {
    if (!intervention || resolving) return;
    setResolving(true);
    try {
      const teacherId = getTeacherId();
      const res = await fetch(`/api/teacher/interventions/${intervention.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, outcome: "resolved" }),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      const now = new Date().toISOString();
      setIntervention((prev) => prev ? { ...prev, status: "resolved", resolvedAt: now } : prev);
    } catch {
      // silent — button re-enables
    } finally {
      setResolving(false);
    }
  }

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  const isActive = intervention?.status === "active";
  const statusLabel = isActive ? "Active" : "Resolved";
  const statusColor = isActive ? C.amber : C.mint;
  const openedStr = intervention ? formatDate(intervention.createdAt) : "—";
  const skillLabel = intervention?.skillCode ?? intervention?.reason ?? "Unknown skill";
  const triggerLabel = intervention ? getTriggerLabel(intervention.reason) : "";
  const triggerIcon = intervention ? getTriggerIcon(intervention.reason) : "⚠️";

  return (
    <AppFrame audience="teacher" currentPath="/teacher/intervention-overview">
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 60px" }}>

          {/* Breadcrumb */}
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 16 }}>
            <span style={{ color: C.blue, cursor: "pointer" }}>Support Queue</span>
            {" › "}
            {loading ? "Loading…" : intervention ? `Intervention: ${intervention.studentName} · ${skillLabel}` : "Not found"}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0", color: C.muted, fontSize: 14 }}>
              Loading intervention…
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ background: C.surface, border: `1px solid ${C.red}`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.red, marginBottom: 8 }}>Intervention Not Found</div>
              <div style={{ fontSize: 13, color: C.muted }}>{error}</div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && intervention && (
            <>
              {/* Intervention header card */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `4px solid ${statusColor}`, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 36, flexShrink: 0 }}>{triggerIcon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{intervention.studentName} — {skillLabel}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
                      {`Triggered: ${triggerLabel}\nOpened: ${openedStr} · Status: ${statusLabel}`}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "#fef3c7", color: "#92400e" }}>{triggerLabel}</span>
                      {intervention.skillCode && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: C.muted }}>{intervention.skillCode}</span>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: C.muted }}>{intervention.interventionType}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setShowLogNote(true)}
                      style={{ padding: "8px 16px", background: "transparent", border: `1.5px solid ${C.blue}`, borderRadius: 10, fontSize: 12, fontWeight: 700, color: C.blue, cursor: "pointer" }}
                    >
                      Log note
                    </button>
                    {isActive && (
                      <button
                        onClick={handleResolve}
                        disabled={resolving}
                        style={{ padding: "8px 16px", background: resolving ? "rgba(34,197,94,0.4)" : C.mint, border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "#fff", cursor: resolving ? "not-allowed" : "pointer" }}
                      >
                        {resolving ? "Resolving…" : "Mark resolved"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Stat row */}
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { val: openedStr, lbl: "Opened" },
                    { val: statusLabel, lbl: "Status", valColor: statusColor },
                    { val: intervention.interventionType, lbl: "Type" },
                    { val: intervention.resolvedAt ? formatDate(intervention.resolvedAt) : "—", lbl: "Resolved at" },
                  ].map((stat) => (
                    <div key={stat.lbl} style={{ textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 16px", flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 900, color: stat.valColor ?? C.text, wordBreak: "break-word" }}>{stat.val}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{stat.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log note modal (inline) */}
              {showLogNote && (
                <div style={{ background: C.surface, border: `1px solid ${C.blue}`, borderRadius: 12, padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginBottom: 10 }}>Log a note for this intervention</div>
                  <textarea
                    placeholder="Write your note here..."
                    style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, fontSize: 13, color: C.text, resize: "vertical", minHeight: 80, boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button style={{ padding: "8px 18px", background: C.blue, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>Save note</button>
                    <button onClick={() => setShowLogNote(false)} style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.muted, cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Two column */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>

                {/* Reason / notes card */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: C.text, marginBottom: 12 }}>
                    Intervention details
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Reason</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>{intervention.reason}</div>
                  {intervention.teacherNote && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Teacher note</div>
                      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{intervention.teacherNote}</div>
                    </>
                  )}
                  {intervention.resolutionNote && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.mint, marginTop: 12, marginBottom: 6 }}>Resolution note</div>
                      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{intervention.resolutionNote}</div>
                    </>
                  )}
                </div>

                {/* Action plan card */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: C.text, marginBottom: 12 }}>Action plan</div>
                  {actions.map((action, idx) => (
                    <div key={action.title} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 8, border: `1.5px solid ${C.border}`, cursor: "pointer" }} onClick={() => toggleAction(idx)}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5,
                        border: action.done ? "none" : `2px solid rgba(155,114,255,0.4)`,
                        background: action.done ? C.mint : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 900, color: "#fff", flexShrink: 0, marginTop: 1,
                      }}>
                        {action.done ? "✓" : ""}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{action.title}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>{action.desc}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{action.date}</div>
                      </div>
                    </div>
                  ))}
                  <button style={{ marginTop: 8, width: "100%", padding: 9, background: "rgba(255,255,255,0.04)", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 12, fontWeight: 700, color: C.blue, cursor: "pointer" }}>
                    + Add action
                  </button>
                </div>

              </div>

              {/* Timeline card — built from API data */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: C.text, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Intervention timeline</span>
                  <a href={`/teacher/intervention-timeline?id=${id}`} style={{ fontSize: 11, fontWeight: 700, color: C.blue, textDecoration: "none" }}>View full history →</a>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* Opened event */}
                  <div style={{ display: "flex", gap: 12, paddingBottom: 16, position: "relative" }}>
                    <div style={{ position: "absolute", left: 15, top: 30, bottom: 0, width: 2, background: C.border }} />
                    <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, position: "relative", zIndex: 1, background: "#fef3c7", border: `2px solid ${C.amber}` }}>
                      ⚠️
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{openedStr}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>Intervention opened — {triggerLabel}</div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{intervention.reason}</div>
                    </div>
                  </div>
                  {/* Resolved event (if applicable) */}
                  {intervention.resolvedAt && (
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, background: "rgba(34,197,94,0.15)", border: `2px solid ${C.mint}` }}>
                        ✅
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{formatDate(intervention.resolvedAt)}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>Intervention resolved</div>
                        {intervention.resolutionNote && (
                          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{intervention.resolutionNote}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </AppFrame>
  );
}
