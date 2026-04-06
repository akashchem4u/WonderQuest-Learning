"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0f172a",
  surface: "#1e2a3a",
  surfaceAlt: "#162032",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  text: "#f1f5f9",
  muted: "rgba(148,163,184,0.85)",
  subtle: "rgba(100,116,139,0.7)",
  mint: "#58e8c1",
  violet: "#9b72ff",
  gold: "#ffd166",
  coral: "#ff7b6b",
  amber: "#f59e0b",
  amberBg: "rgba(245,158,11,0.12)",
  amberBorder: "rgba(245,158,11,0.30)",
  blue: "#3b82f6",
  blueBg: "rgba(59,130,246,0.12)",
  blueBorder: "rgba(59,130,246,0.30)",
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

// ── Types ─────────────────────────────────────────────────────────────────────
type TriggerType = "confidence-floor" | "absence" | "hint-pattern" | "band-ceiling" | "other";

function detectTrigger(reason: string): TriggerType {
  const r = reason.toLowerCase();
  if (r.includes("confidence") || r.includes("floor")) return "confidence-floor";
  if (r.includes("absence") || r.includes("absent")) return "absence";
  if (r.includes("hint")) return "hint-pattern";
  if (r.includes("ceiling") || r.includes("band")) return "band-ceiling";
  return "other";
}

function getTriggerIcon(t: TriggerType) {
  if (t === "confidence-floor") return "⚠️";
  if (t === "absence") return "📅";
  if (t === "hint-pattern") return "💡";
  if (t === "band-ceiling") return "💙";
  return "⚠️";
}

function getTriggerLabel(t: TriggerType) {
  if (t === "confidence-floor") return "Confidence floor";
  if (t === "absence") return "Absence";
  if (t === "hint-pattern") return "Hint pattern";
  if (t === "band-ceiling") return "Band ceiling";
  return "Support needed";
}

function isCeiling(t: TriggerType) {
  return t === "band-ceiling";
}

function formatRelativeDate(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function getBand(interventionType: string): string {
  if (interventionType.includes("P1")) return "P1";
  if (interventionType.includes("P2")) return "P2";
  if (interventionType.includes("P3")) return "P3";
  return "—";
}

// ── Filter types ──────────────────────────────────────────────────────────────
type TriggerFilter = "all" | TriggerType;
type StatusFilter = "all" | "new" | "acknowledged";

// ── Reusable styles ───────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: "18px 20px",
};

const eyebrow: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: C.mint,
  marginBottom: 8,
  display: "block",
};

const chip: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 9px",
  borderRadius: 20,
  fontSize: 10,
  fontWeight: 700,
  background: "rgba(255,255,255,0.07)",
  border: `1px solid ${C.border}`,
  color: C.muted,
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function TeacherSupportQueuePage() {
  const [loading, setLoading] = useState(true);
  const [interventions, setInterventions] = useState<ApiIntervention[]>([]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const [triggerFilter, setTriggerFilter] = useState<TriggerFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    const teacherId = getTeacherId();

    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=active`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { interventions: ApiIntervention[] };
        setInterventions(data.interventions);
      } catch {
        // silently fail, show empty state
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const activeItems = interventions.filter(
    (item) => !dismissedIds.has(item.id) && !resolvedIds.has(item.id)
  );

  const filteredItems = activeItems.filter((item) => {
    const t = detectTrigger(item.reason);
    if (triggerFilter !== "all" && t !== triggerFilter) return false;
    if (statusFilter !== "all") {
      // treat all API items as "new" since they're active
      if (statusFilter !== "new") return false;
    }
    return true;
  });

  const amberCount = activeItems.filter((i) => !isCeiling(detectTrigger(i.reason))).length;
  const blueCount = activeItems.filter((i) => isCeiling(detectTrigger(i.reason))).length;
  const totalCount = activeItems.length;

  function dismiss(id: string) {
    setDismissedIds((prev) => new Set([...prev, id]));
    if (expandedId === id) setExpandedId(null);
  }

  function resolve(id: string) {
    setResolvedIds((prev) => new Set([...prev, id]));
    if (expandedId === id) setExpandedId(null);
  }

  function dismissAllAmber() {
    const amberIds = activeItems.filter((i) => !isCeiling(detectTrigger(i.reason))).map((i) => i.id);
    setDismissedIds((prev) => new Set([...prev, ...amberIds]));
  }

  function countByTrigger(t: TriggerType) {
    return activeItems.filter((i) => detectTrigger(i.reason) === t).length;
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher">
      <main
        style={{
          minHeight: "100vh",
          background: C.bg,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
          padding: "28px 20px 60px",
        }}
      >
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Top nav ───────────────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Link
              href="/teacher"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.muted,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              ← Dashboard
            </Link>
            <span style={{ color: C.border, fontSize: 12 }}>|</span>
            <Link
              href="/teacher/command"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.muted,
                textDecoration: "none",
              }}
            >
              Command Center
            </Link>
          </div>

          {/* ── Header ────────────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.text,
                  margin: "0 0 4px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                ⚠️ Support Queue
                {!loading && totalCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    {totalCount}
                  </span>
                )}
              </h1>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                {loading
                  ? "Loading…"
                  : `${totalCount} students — ${amberCount} amber · ${blueCount} blue (positive)`}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={dismissAllAmber}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  color: C.amber,
                  border: `1.5px solid ${C.amberBorder}`,
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                }}
              >
                Dismiss all amber
              </button>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  background: C.blue,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                }}
              >
                📤 Export
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.muted, fontSize: 14 }}>
              Loading support queue…
            </div>
          )}

          {/* ── Main layout ───────────────────────────────────────────────── */}
          {!loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: 16,
                alignItems: "start",
              }}
            >
              {/* ── Filter sidebar ─────────────────────────────────────────── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Trigger type */}
                <div style={{ ...card, padding: 14 }}>
                  <span style={{ ...eyebrow, marginBottom: 10 }}>Trigger type</span>
                  {(
                    [
                      { id: "all", label: "All triggers", count: activeItems.length },
                      { id: "confidence-floor", label: "⚠️ Confidence floor", count: countByTrigger("confidence-floor") },
                      { id: "absence", label: "📅 Absence", count: countByTrigger("absence") },
                      { id: "hint-pattern", label: "💡 Hint pattern", count: countByTrigger("hint-pattern") },
                      { id: "band-ceiling", label: "💙 Band ceiling", count: countByTrigger("band-ceiling") },
                    ] as { id: TriggerFilter; label: string; count: number }[]
                  ).map((opt) => {
                    const active = triggerFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTriggerFilter(opt.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 0",
                          cursor: "pointer",
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          borderBottom: `1px solid ${C.border}`,
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            border: active ? "none" : `2px solid ${C.borderStrong}`,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: active ? C.blue : "transparent",
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 900,
                          }}
                        >
                          {active ? "✓" : ""}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: active ? C.text : C.muted, flex: 1 }}>
                          {opt.label}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.subtle }}>
                          {opt.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Status */}
                <div style={{ ...card, padding: 14 }}>
                  <span style={{ ...eyebrow, marginBottom: 10 }}>Status</span>
                  {(
                    [
                      { id: "all", label: "All", count: activeItems.length },
                      { id: "new", label: "New", count: activeItems.length },
                    ] as { id: StatusFilter; label: string; count: number }[]
                  ).map((opt) => {
                    const active = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setStatusFilter(opt.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 0",
                          cursor: "pointer",
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          borderBottom: `1px solid ${C.border}`,
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            border: active ? "none" : `2px solid ${C.borderStrong}`,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: active ? C.blue : "transparent",
                            color: "#fff",
                            fontSize: 9,
                            fontWeight: 900,
                          }}
                        >
                          {active ? "✓" : ""}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: active ? C.text : C.muted, flex: 1 }}>
                          {opt.label}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.subtle }}>
                          {opt.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Queue list ─────────────────────────────────────────────── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {filteredItems.length === 0 ? (
                  <div
                    style={{
                      ...card,
                      textAlign: "center",
                      padding: "56px 24px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 42 }}>🎉</span>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
                      All clear!
                    </h2>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, maxWidth: 320, margin: 0 }}>
                      No students in the support queue right now. The queue updates automatically as new triggers are detected.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const triggerType = detectTrigger(item.reason);
                    const ceiling = isCeiling(triggerType);
                    const accent = ceiling ? C.blue : C.amber;
                    const accentBg = ceiling ? C.blueBg : C.amberBg;
                    const accentBorder = ceiling ? C.blueBorder : C.amberBorder;
                    const expanded = expandedId === item.id;
                    const band = getBand(item.interventionType);

                    return (
                      <div
                        key={item.id}
                        style={{
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                          borderLeft: `4px solid ${accent}`,
                          borderRadius: 14,
                          overflow: "hidden",
                        }}
                      >
                        {/* Card header */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 12,
                            padding: "14px 16px",
                            cursor: "pointer",
                          }}
                          onClick={() => setExpandedId(expanded ? null : item.id)}
                        >
                          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1, lineHeight: 1 }}>
                            {getTriggerIcon(triggerType)}
                          </span>

                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                              {item.studentName}
                            </span>
                            <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                              {item.reason}
                            </span>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  background: accentBg,
                                  border: `1px solid ${accentBorder}`,
                                  color: accent,
                                }}
                              >
                                {getTriggerLabel(triggerType)}
                              </span>
                              {band !== "—" && (
                                <span style={{ ...chip }}>{band}</span>
                              )}
                              {item.skillCode && (
                                <span style={{ ...chip }}>{item.skillCode}</span>
                              )}
                              <span style={{ ...chip }}>{item.interventionType}</span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 6,
                              flexShrink: 0,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span style={{ fontSize: 11, color: C.subtle, whiteSpace: "nowrap" }}>
                              {formatRelativeDate(item.createdAt)}
                            </span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                type="button"
                                onClick={() => dismiss(item.id)}
                                style={{
                                  padding: "6px 12px",
                                  background: "transparent",
                                  color: C.subtle,
                                  border: `1.5px solid ${C.border}`,
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontFamily: "system-ui",
                                }}
                              >
                                Dismiss
                              </button>
                              <a
                                href={`/teacher/intervention-detail/${item.id}`}
                                style={{
                                  padding: "6px 14px",
                                  background: C.blue,
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 8,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontFamily: "system-ui",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                {ceiling ? "Review band" : "View student"}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {expanded && (
                          <div
                            style={{
                              padding: "0 16px 16px",
                              borderTop: `1px solid ${C.border}`,
                            }}
                          >
                            {/* Suggested support */}
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                color: C.subtle,
                                margin: "12px 0 6px",
                              }}
                            >
                              Reason / notes
                            </div>
                            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, margin: "0 0 12px" }}>
                              {item.teacherNote ?? item.reason}
                            </p>

                            {/* Privacy note */}
                            <div
                              style={{
                                background: C.blueBg,
                                border: `1px solid ${C.blueBorder}`,
                                borderRadius: 10,
                                padding: "10px 12px",
                                fontSize: 12,
                                color: "#93c5fd",
                                lineHeight: 1.5,
                                marginBottom: 12,
                              }}
                            >
                              Privacy note: This card shows skill-category patterns and floor-hit counts only. Specific questions, exact answers, and accuracy percentages are never surfaced here.
                            </div>

                            {/* Action row */}
                            <div style={{ display: "flex", gap: 8 }}>
                              <a
                                href={`/teacher/intervention-detail/${item.id}`}
                                style={{
                                  padding: "8px 14px",
                                  background: C.blue,
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontFamily: "system-ui",
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                }}
                              >
                                View {item.studentName}&apos;s intervention
                              </a>
                              <button
                                type="button"
                                style={{
                                  padding: "8px 14px",
                                  background: "transparent",
                                  color: C.muted,
                                  border: `1.5px solid ${C.borderStrong}`,
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontFamily: "system-ui",
                                }}
                              >
                                Log a note
                              </button>
                              <button
                                type="button"
                                onClick={() => resolve(item.id)}
                                style={{
                                  padding: "8px 14px",
                                  background: "transparent",
                                  color: C.subtle,
                                  border: `1.5px solid ${C.border}`,
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontFamily: "system-ui",
                                }}
                              >
                                Mark resolved
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </AppFrame>
  );
}
