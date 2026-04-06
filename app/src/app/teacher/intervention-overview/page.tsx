"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { getTeacherId } from "@/lib/teacher-identity";

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

type FilterTab = "active" | "resolved" | "all";

function daysAgo(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function resolvedThisWeek(interventions: Intervention[]): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return interventions.filter(
    (i) => i.status === "resolved" && i.resolvedAt && new Date(i.resolvedAt).getTime() >= cutoff,
  ).length;
}

function autoTriggeredCount(interventions: Intervention[]): number {
  const autoTypes = ["confidence_floor", "absence", "hint_pattern", "band_ceiling"];
  return interventions.filter((i) => autoTypes.includes(i.triggerType)).length;
}

function triggerDescription(i: Intervention): string {
  switch (i.triggerType) {
    case "confidence_floor":
      return `Confidence floor${i.skillLabel ? ` on ${i.skillLabel}` : ""}. Student hit the skill floor multiple times.`;
    case "absence":
      return "Absence — missed sessions. Monitor re-engagement and mastery recovery.";
    case "hint_pattern":
      return `Hint pattern${i.skillLabel ? ` on ${i.skillLabel}` : ""}. Student requested excessive hints on the same question type.`;
    case "band_ceiling":
      return `Band ceiling${i.skillLabel ? ` on ${i.skillLabel}` : ""}. Student consistently reaching band limit — ready for advancement review.`;
    default:
      return i.triggerType.replace(/_/g, " ");
  }
}

function avatarColor(name: string): string {
  const colors = ["#475569", "#ec4899", "#0ea5e9", "#16a34a", "#f59e0b", "#8b5cf6", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
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

function InterventionCard({ intervention }: { intervention: Intervention }) {
  const initial = intervention.studentName.charAt(0).toUpperCase();
  const bgColor = avatarColor(intervention.studentName);
  const isActive = intervention.status === "active";
  const days = daysAgo(intervention.createdAt);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "16px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
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
        <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 2 }}>
          {intervention.studentName}
        </div>
        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 6 }}>
          {triggerDescription(intervention)}
        </div>

        {/* Chips */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
          {/* Status badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 8,
              background: isActive ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.12)",
              color: isActive ? C.amber : C.mint,
              border: `1px solid ${isActive ? "rgba(245,158,11,0.35)" : "rgba(34,197,94,0.3)"}`,
            }}
          >
            {isActive ? "Active" : "Resolved"}
          </span>

          {/* Trigger type chip */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              color: C.muted,
            }}
          >
            {intervention.triggerType.replace(/_/g, " ")}
          </span>

          {/* Band/skill label */}
          {intervention.skillLabel && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 8,
                background: "rgba(88,232,193,0.10)",
                color: "#0d9065",
              }}
            >
              {intervention.skillLabel}
            </span>
          )}
        </div>
      </div>

      {/* Right column */}
      <div style={{ flexShrink: 0, textAlign: "right" as const, minWidth: 88 }}>
        <div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>
          Started {formatDate(intervention.createdAt)}
        </div>
        {isActive ? (
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, marginBottom: 4 }}>
            {days === 0 ? "Today" : `${days}d open`}
          </div>
        ) : (
          <div style={{ fontSize: 10, fontWeight: 700, color: C.mint, marginBottom: 4 }}>
            {intervention.resolvedAt ? `Resolved ${formatDate(intervention.resolvedAt)}` : "Resolved"}
          </div>
        )}
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
      </div>
    </div>
  );
}

export default function TeacherInterventionOverviewPage() {
  const [filter, setFilter] = useState<FilterTab>("active");
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoQueueBusy, setAutoQueueBusy] = useState(false);
  const [autoQueueMsg, setAutoQueueMsg] = useState<string | null>(null);

  useEffect(() => {
    const teacherId = getTeacherId();
    setLoading(true);
    setError(null);

    fetch(`/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=all`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ interventions: Intervention[] }>;
      })
      .then((data) => {
        setInterventions(data.interventions ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load interventions. Please try again.");
        setLoading(false);
      });
  }, []);

  const filtered = interventions.filter((i) => {
    if (filter === "active") return i.status === "active";
    if (filter === "resolved") return i.status === "resolved";
    return true;
  });

  const activeCount = interventions.filter((i) => i.status === "active").length;
  const resolvedWeek = resolvedThisWeek(interventions);
  const autoCount = autoTriggeredCount(interventions);

  const filterTabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "active", label: "Active", count: interventions.filter((i) => i.status === "active").length },
    { id: "resolved", label: "Resolved", count: interventions.filter((i) => i.status === "resolved").length },
    { id: "all", label: "All", count: interventions.length },
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
      // Refresh list
      const teacherId2 = getTeacherId();
      const refresh = await fetch(
        `/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId2)}&status=all`,
      );
      if (refresh.ok) {
        const d = (await refresh.json()) as { interventions: Intervention[] };
        setInterventions(d.interventions ?? []);
      }
    } catch {
      setAutoQueueMsg("Auto-queue failed. Please try again.");
    } finally {
      setAutoQueueBusy(false);
    }
  }

  return (
    <AppFrame audience="teacher">
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
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 4 }}>
            ⚡ Intervention Overview
          </div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Track and manage student interventions for your class.
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            { value: loading ? "—" : String(activeCount), label: "Active now", color: C.amber },
            { value: loading ? "—" : String(resolvedWeek), label: "Resolved this week", color: C.mint },
            { value: loading ? "—" : String(autoCount), label: "Auto-triggered", color: C.blue },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: C.surface,
                borderRadius: 12,
                padding: "14px 16px",
                border: `1px solid ${C.border}`,
                textAlign: "center" as const,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, marginBottom: 2 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" as const }}>
          {filterTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: "7px 18px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                background: filter === t.id ? C.blue : "rgba(255,255,255,0.08)",
                color: filter === t.id ? "#0d1117" : C.muted,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {t.label}
              <span
                style={{
                  display: "inline-block",
                  background: filter === t.id ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "0 5px",
                  borderRadius: 5,
                }}
              >
                {loading ? "…" : t.count}
              </span>
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
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center" as const,
                  padding: "36px 20px",
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>
                  {filter === "resolved" ? "✅" : "🎉"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 6 }}>
                  {filter === "active"
                    ? "No active interventions"
                    : filter === "resolved"
                    ? "No resolved interventions yet"
                    : "No interventions found"}
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                  {filter === "active"
                    ? "Great work — your class is on track. Run the auto-queue to check for new signals."
                    : filter === "resolved"
                    ? "Resolved interventions will appear here once students make progress."
                    : "Use auto-queue to detect and flag students that may need support."}
                </div>
              </div>
            ) : (
              filtered.map((intervention) => (
                <InterventionCard key={intervention.id} intervention={intervention} />
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
