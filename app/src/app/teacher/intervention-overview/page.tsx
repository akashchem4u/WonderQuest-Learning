"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";
import { setActiveStudentId } from "@/lib/active-student";
import TeacherGate from "../teacher-gate";

const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  coral: "#f87171",
  faint: "rgba(255,255,255,0.05)",
};

type Intervention = {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  skillLabel: string | null;
  triggerType: string;
  status: "active" | "resolved";
  createdAt: string;
  resolvedAt: string | null;
};

type FilterTab = "all" | "active" | "resolved";

function daysAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function resolvedThisWeek(interventions: Intervention[]): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return interventions.filter(
    (i) => i.status === "resolved" && i.resolvedAt && new Date(i.resolvedAt).getTime() >= cutoff,
  ).length;
}

function avatarColor(name: string): string {
  const colors = ["#475569", "#ec4899", "#0ea5e9", "#16a34a", "#f59e0b", "#8b5cf6", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function triggerBadge(triggerType: string): { label: string; bg: string; color: string } {
  switch (triggerType) {
    case "check_in":
      return { label: "Check-in needed", bg: "rgba(245,158,11,0.15)", color: C.amber };
    case "skill_gap":
      return { label: "Skill gap", bg: "rgba(248,113,113,0.15)", color: C.coral };
    case "low_accuracy":
      return { label: "Low accuracy", bg: "rgba(239,68,68,0.15)", color: C.red };
    case "inactive":
      return { label: "Inactive", bg: "rgba(139,148,158,0.15)", color: C.muted };
    // legacy trigger types from existing data
    case "confidence_floor":
      return { label: "Confidence floor", bg: "rgba(245,158,11,0.15)", color: C.amber };
    case "absence":
      return { label: "Absence", bg: "rgba(139,148,158,0.15)", color: C.muted };
    case "hint_pattern":
      return { label: "Hint pattern", bg: "rgba(56,189,248,0.12)", color: C.blue };
    case "band_ceiling":
      return { label: "Band ceiling", bg: "rgba(155,114,255,0.12)", color: C.violet };
    default:
      return { label: triggerType.replace(/_/g, " "), bg: "rgba(255,255,255,0.07)", color: C.muted };
  }
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 16,
        padding: "20px 22px",
        border: `1px solid ${C.border}`,
        marginBottom: 12,
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 12,
            padding: "14px 0",
            borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: 12,
                width: "40%",
                background: "rgba(255,255,255,0.06)",
                borderRadius: 6,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                height: 10,
                width: "70%",
                background: "rgba(255,255,255,0.04)",
                borderRadius: 6,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function InterventionCard({
  intervention,
  onResolve,
}: {
  intervention: Intervention;
  onResolve: (id: string) => void;
}) {
  const [resolving, setResolving] = useState(false);
  const [fading, setFading] = useState(false);

  const initial = intervention.studentName.charAt(0).toUpperCase();
  const bgColor = avatarColor(intervention.studentName);
  const isActive = intervention.status === "active";
  const badge = triggerBadge(intervention.triggerType);

  async function handleResolve() {
    if (resolving) return;
    setResolving(true);
    try {
      const teacherId = getTeacherId();
      const res = await fetch(`/api/teacher/interventions/${intervention.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, outcome: "resolved" }),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      // Fade out then remove
      setFading(true);
      setTimeout(() => onResolve(intervention.id), 400);
    } catch {
      setResolving(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "16px 0",
        borderBottom: `1px solid ${C.border}`,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.35s ease",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 900,
          color: "#fff",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {initial}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 3 }}>
          {intervention.studentName}
        </div>

        {/* Badges row */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 4 }}>
          {/* Trigger type badge — color-coded */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 9px",
              borderRadius: 8,
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.color}33`,
            }}
          >
            {badge.label}
          </span>

          {/* Skill label if present */}
          {intervention.skillLabel && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: 8,
                background: "rgba(88,232,193,0.10)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.25)",
              }}
            >
              {intervention.skillLabel}
            </span>
          )}

          {/* Status badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 9px",
              borderRadius: 8,
              background: isActive ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.10)",
              color: isActive ? C.amber : C.mint,
              border: `1px solid ${isActive ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.25)"}`,
            }}
          >
            {isActive ? "Active" : "Resolved"}
          </span>
        </div>

        {/* Created date */}
        <div style={{ fontSize: 11, color: C.muted }}>
          {daysAgo(intervention.createdAt)}
        </div>
      </div>

      {/* Right column */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column" as const, alignItems: "flex-end", gap: 6, minWidth: 110 }}>
        <a
          href={`/teacher/intervention-detail/${intervention.id}`}
          style={{
            display: "inline-block",
            padding: "5px 10px",
            borderRadius: 7,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            background: C.surface,
            color: C.blue,
            border: `1.5px solid rgba(56,189,248,0.25)`,
            textDecoration: "none",
          }}
        >
          View →
        </a>

        {isActive && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 7,
              fontSize: 11,
              fontWeight: 700,
              cursor: resolving ? "not-allowed" : "pointer",
              background: resolving ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.13)",
              color: resolving ? C.muted : C.mint,
              border: `1.5px solid ${resolving ? "transparent" : "rgba(34,197,94,0.3)"}`,
              transition: "all 0.2s",
            }}
          >
            {resolving ? "Resolving…" : "✓ Resolve"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function TeacherInterventionOverviewPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(!!getTeacherId()); }, []);

  const [filter, setFilter] = useState<FilterTab>("active");
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoQueueBusy, setAutoQueueBusy] = useState(false);
  const [autoQueueMsg, setAutoQueueMsg] = useState<string | null>(null);

  // Track all-time totals for summary bar (fetched once with status=all)
  const [allInterventions, setAllInterventions] = useState<Intervention[]>([]);

  useEffect(() => {
    const teacherId = getTeacherId();
    setLoading(true);
    setError(null);

    // Fetch the selected filter tab's data
    const statusParam = filter === "all" ? "all" : filter;
    fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=${statusParam}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return r.json() as Promise<{ interventions: any[] }>;
      })
      .then((data) => {
        const normalised: Intervention[] = (data.interventions ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (i: any) => ({
            id: i.id,
            studentId: i.studentId,
            studentName: i.studentName,
            skillCode: i.skillCode ?? null,
            skillLabel: i.skillLabel ?? i.skillCode ?? null,
            triggerType: i.triggerType ?? i.interventionType ?? i.reason ?? "check_in",
            status: i.status as "active" | "resolved",
            createdAt: i.createdAt,
            resolvedAt: i.resolvedAt ?? null,
          }),
        );
        setInterventions(normalised);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load interventions. Please try again.");
        setLoading(false);
      });
  }, [filter]);

  // Fetch all-status data once for the summary bar counts
  useEffect(() => {
    const teacherId = getTeacherId();
    fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=all`)
      .then((r) => r.ok ? r.json() as Promise<{ interventions: Intervention[] }> : Promise.reject())
      .then((data) => {
        setAllInterventions(data.interventions ?? []);
      })
      .catch(() => {/* silent */});
  }, []);

  function handleRemove(id: string) {
    setInterventions((prev) => prev.filter((i) => i.id !== id));
    // Also update allInterventions to reflect the resolution
    setAllInterventions((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "resolved" as const, resolvedAt: new Date().toISOString() } : i,
      ),
    );
  }

  const activeCount = allInterventions.filter((i) => i.status === "active").length;
  const resolvedWeek = resolvedThisWeek(allInterventions);

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "resolved", label: "Resolved" },
  ];

  async function handleAutoQueue() {
    setAutoQueueBusy(true);
    setAutoQueueMsg(null);
    try {
      const teacherId = getTeacherId();
      const r = await fetch(
        `/api/teacher/interventions/auto-queue?teacherId=${encodeURIComponent(teacherId)}`,
        { method: "POST" },
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as { queued?: number };
      setAutoQueueMsg(
        data.queued != null
          ? `Auto-queue ran — ${data.queued} new intervention${data.queued === 1 ? "" : "s"} created.`
          : "Auto-queue ran successfully.",
      );
      // Refresh current list
      const teacherId2 = getTeacherId();
      const statusParam = filter === "all" ? "all" : filter;
      const refresh = await fetch(
        `/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId2)}&status=${statusParam}`,
      );
      if (refresh.ok) {
        const d = (await refresh.json()) as { interventions: Intervention[] };
        setInterventions(d.interventions ?? []);
      }
      // Refresh all counts
      const refreshAll = await fetch(
        `/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId2)}&status=all`,
      );
      if (refreshAll.ok) {
        const d2 = (await refreshAll.json()) as { interventions: Intervention[] };
        setAllInterventions(d2.interventions ?? []);
      }
    } catch {
      setAutoQueueMsg("Auto-queue failed. Please try again.");
    } finally {
      setAutoQueueBusy(false);
    }
  }

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher/intervention-overview">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/intervention-overview">
      <div
        style={{
          padding: "28px 20px 72px",
          minHeight: "100vh",
          background: C.bg,
          fontFamily: "system-ui,-apple-system,sans-serif",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        {/* ── Header ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>
            Intervention Overview
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Track and manage student interventions for your class.
          </div>
        </div>

        {/* ── Summary bar ── */}
        <div
          style={{
            background: C.surface,
            borderRadius: 12,
            padding: "12px 18px",
            border: `1px solid ${C.border}`,
            marginBottom: 20,
            fontSize: 13,
            color: C.muted,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700, color: C.amber }}>
            {loading ? "—" : activeCount}
          </span>
          <span>active intervention{activeCount !== 1 ? "s" : ""}</span>
          <span style={{ color: C.border }}>·</span>
          <span style={{ fontWeight: 700, color: C.mint }}>
            {loading ? "—" : resolvedWeek}
          </span>
          <span>resolved this week</span>
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" as const }}>
          {filterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: "7px 20px",
                borderRadius: 20,
                border: filter === t.id ? `1.5px solid ${C.blue}` : "1.5px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                background: filter === t.id ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.07)",
                color: filter === t.id ? C.blue : C.muted,
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Main card ── */}
        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              padding: "28px 24px",
              border: `1px solid rgba(239,68,68,0.25)`,
              textAlign: "center" as const,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.red, marginBottom: 6 }}>{error}</div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 20px",
                borderRadius: 10,
                background: "transparent",
                border: `1.5px solid rgba(239,68,68,0.4)`,
                color: C.red,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <div
            style={{
              background: C.surface,
              borderRadius: 16,
              padding: "18px 20px",
              border: `1px solid ${C.border}`,
            }}
          >
            {interventions.length === 0 ? (
              <div
                style={{
                  textAlign: "center" as const,
                  padding: "40px 20px",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>
                  {filter === "resolved" ? "✅" : "🎉"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 6 }}>
                  {filter === "active"
                    ? "No active interventions — your class is doing great!"
                    : filter === "resolved"
                    ? "No resolved interventions yet"
                    : "No interventions found"}
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                  {filter === "active"
                    ? "Run the auto-queue below to check for new signals."
                    : filter === "resolved"
                    ? "Resolved interventions will appear here once students make progress."
                    : "Use auto-queue to detect and flag students who may need support."}
                </div>
              </div>
            ) : (
              interventions.map((intervention) => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                  onResolve={handleRemove}
                />
              ))
            )}
          </div>
        )}

        {/* ── Auto-queue prompt ── */}
        <div
          style={{
            marginTop: 20,
            background: C.surface,
            borderRadius: 14,
            padding: "16px 20px",
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap" as const,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>
              Auto-queue
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              Automatically flag students who need intervention based on recent session data.
            </div>
            {autoQueueMsg && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: autoQueueMsg.includes("failed") ? C.red : C.mint,
                }}
              >
                {autoQueueMsg}
              </div>
            )}
          </div>
          <button
            onClick={handleAutoQueue}
            disabled={autoQueueBusy}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              cursor: autoQueueBusy ? "not-allowed" : "pointer",
              background: autoQueueBusy ? "rgba(255,255,255,0.06)" : "rgba(155,114,255,0.15)",
              color: autoQueueBusy ? C.muted : C.violet,
              border: `1.5px solid ${autoQueueBusy ? "transparent" : "rgba(155,114,255,0.35)"}`,
              flexShrink: 0,
            }}
          >
            {autoQueueBusy ? "Running…" : "Check auto-queue →"}
          </button>
        </div>
      </div>
    </AppFrame>
  );
}
