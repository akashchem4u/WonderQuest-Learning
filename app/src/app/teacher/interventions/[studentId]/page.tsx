"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------
const C = {
  base: "#100b2e",
  blue: "#38bdf8",
  violet: "#9b72ff",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Intervention = {
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

// ---------------------------------------------------------------------------
// Card wrapper
// ---------------------------------------------------------------------------
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          color: C.muted,
          marginBottom: 14,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TeacherInterventionDetailPage() {
  const params = useParams();
  const studentId = (params?.studentId as string | undefined) ?? "";

  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [newSkillCode, setNewSkillCode] = useState("");
  const [newNote, setNewNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Resolve state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  function fetchInterventions() {
    setLoading(true);
    setFetchError(null);
    fetch("/api/teacher/interventions?teacherId=demo-teacher&status=all")
      .then((r) => r.json())
      .then((data: { interventions?: Intervention[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        const all = data.interventions ?? [];
        setInterventions(all.filter((iv) => iv.studentId === studentId));
      })
      .catch((e: unknown) => {
        setFetchError(e instanceof Error ? e.message : "Failed to load interventions");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (studentId) fetchInterventions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  async function handleCreate() {
    if (!newReason.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/teacher/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: "demo-teacher",
          studentId,
          reason: newReason.trim(),
          skillCode: newSkillCode.trim() || undefined,
          teacherNote: newNote.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to create intervention");
      }
      setNewReason("");
      setNewSkillCode("");
      setNewNote("");
      setShowCreateForm(false);
      fetchInterventions();
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  async function handleResolve(interventionId: string) {
    setResolvingId(interventionId);
    setResolveError(null);
    try {
      const res = await fetch("/api/teacher/interventions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: "demo-teacher",
          interventionId,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Failed to resolve");
      }
      fetchInterventions();
    } catch (e: unknown) {
      setResolveError(e instanceof Error ? e.message : "Failed to resolve");
    } finally {
      setResolvingId(null);
    }
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
  }

  const activeInterventions = interventions.filter((iv) => iv.status === "active");
  const resolvedInterventions = interventions.filter((iv) => iv.status === "resolved");
  const studentName = interventions[0]?.studentName ?? "Student";

  return (
    <AppFrame audience="teacher" currentPath="/teacher/intervention-overview">
      <div
        style={{
          minHeight: "100vh",
          background: C.base,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
          paddingBottom: 60,
        }}
      >
        {/* Topbar */}
        <div
          style={{
            borderBottom: `1px solid ${C.border}`,
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Link
            href={`/teacher/students/${studentId}`}
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.muted,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ← Student
          </Link>
          <span style={{ color: C.border, fontSize: 16 }}>/</span>
          <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>
            Interventions{loading ? "" : `: ${studentName}`}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Link
              href="/teacher"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                textDecoration: "none",
                padding: "6px 14px",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: 8,
              }}
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Loading / error */}
        {loading && (
          <div style={{ padding: "40px 28px", color: C.muted, fontSize: 14 }}>
            Loading interventions…
          </div>
        )}

        {!loading && fetchError && (
          <div style={{ margin: "22px 28px 0", padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13, color: C.red }}>
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && (
          <>
            {/* Header card */}
            <div
              style={{
                margin: "22px 28px 0",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderTop: `3px solid ${C.amber}`,
                borderRadius: 14,
                padding: "20px 22px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
                <span style={{ fontSize: 36, flexShrink: 0 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 6 }}>
                    {studentName} — Interventions
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {activeInterventions.length} active · {resolvedInterventions.length} resolved
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm((v) => !v)}
                  style={{
                    padding: "8px 16px",
                    background: C.blue,
                    border: "none",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0d1117",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  + Create intervention
                </button>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { val: String(activeInterventions.length), lbl: "Active" },
                  { val: String(resolvedInterventions.length), lbl: "Resolved" },
                  { val: String(interventions.length), lbl: "Total" },
                ].map(({ val, lbl }) => (
                  <div
                    key={lbl}
                    style={{
                      textAlign: "center" as const,
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${C.border}`,
                      borderRadius: 10,
                      padding: "10px 18px",
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{val}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create form */}
            {showCreateForm && (
              <div
                style={{
                  margin: "16px 28px 0",
                  background: C.surface,
                  border: `1px solid rgba(56,189,248,0.3)`,
                  borderRadius: 14,
                  padding: "18px 20px",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 14 }}>
                  New Intervention
                </div>
                {createError && (
                  <div style={{ marginBottom: 12, padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 12, color: C.red }}>
                    {createError}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5 }}>Reason *</div>
                    <input
                      type="text"
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      placeholder="e.g. Confidence floor hit 3×"
                      style={{ width: "100%", padding: "9px 12px", background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "system-ui", outline: "none", boxSizing: "border-box" as const }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5 }}>Skill code (optional)</div>
                    <input
                      type="text"
                      value={newSkillCode}
                      onChange={(e) => setNewSkillCode(e.target.value)}
                      placeholder="e.g. fractions-division"
                      style={{ width: "100%", padding: "9px 12px", background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "system-ui", outline: "none", boxSizing: "border-box" as const }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 5 }}>Teacher note (optional)</div>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Observations, suggested strategies…"
                      rows={3}
                      style={{ width: "100%", padding: "9px 12px", background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, fontFamily: "system-ui", outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={creating || !newReason.trim()}
                      style={{ flex: 1, padding: "10px", background: creating || !newReason.trim() ? "rgba(56,189,248,0.4)" : C.blue, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#0d1117", cursor: creating || !newReason.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                    >
                      {creating ? "Creating…" : "Create intervention"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13, fontWeight: 700, color: C.muted, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {resolveError && (
              <div style={{ margin: "12px 28px 0", padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, fontSize: 13, color: C.red }}>
                {resolveError}
              </div>
            )}

            {/* Active interventions */}
            <div style={{ margin: "16px 28px 0" }}>
              <Card title={`Active Interventions (${activeInterventions.length})`}>
                {activeInterventions.length === 0 ? (
                  <div style={{ fontSize: 12, color: C.muted }}>No active interventions.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                    {activeInterventions.map((iv) => (
                      <div
                        key={iv.id}
                        style={{
                          padding: "14px 16px",
                          background: "rgba(245,158,11,0.06)",
                          border: "1px solid rgba(245,158,11,0.25)",
                          borderRadius: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 20 }}>⚠️</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 3 }}>
                              {iv.reason}
                            </div>
                            {iv.skillCode && (
                              <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>
                                Skill: {iv.skillCode}
                              </div>
                            )}
                            <div style={{ fontSize: 11, color: C.muted }}>
                              Opened: {fmtDate(iv.createdAt)} · {iv.interventionType}
                            </div>
                            {iv.teacherNote && (
                              <div style={{ marginTop: 8, padding: "7px 10px", background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 8, fontSize: 11, color: "rgba(240,246,255,0.75)", lineHeight: 1.5 }}>
                                {iv.teacherNote}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleResolve(iv.id)}
                            disabled={resolvingId === iv.id}
                            style={{
                              padding: "7px 14px",
                              background: resolvingId === iv.id ? "rgba(34,197,94,0.4)" : C.mint,
                              border: "none",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#100b2e",
                              cursor: resolvingId === iv.id ? "not-allowed" : "pointer",
                              fontFamily: "inherit",
                              flexShrink: 0,
                            }}
                          >
                            {resolvingId === iv.id ? "Resolving…" : "Mark resolved"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Resolved interventions */}
            {resolvedInterventions.length > 0 && (
              <div style={{ margin: "16px 28px 0" }}>
                <Card title={`Resolved (${resolvedInterventions.length})`}>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                    {resolvedInterventions.map((iv) => (
                      <div
                        key={iv.id}
                        style={{
                          padding: "12px 14px",
                          background: "rgba(255,255,255,0.02)",
                          border: `1px solid ${C.border}`,
                          borderRadius: 10,
                          opacity: 0.75,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14 }}>✅</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{iv.reason}</span>
                          {iv.skillCode && (
                            <span style={{ fontSize: 11, color: C.muted }}>· {iv.skillCode}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                          Opened {fmtDate(iv.createdAt)}
                          {iv.resolvedAt ? ` · Resolved ${fmtDate(iv.resolvedAt)}` : ""}
                        </div>
                        {iv.resolutionNote && (
                          <div style={{ marginTop: 6, fontSize: 11, color: C.muted, fontStyle: "italic" }}>
                            {iv.resolutionNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </AppFrame>
  );
}
