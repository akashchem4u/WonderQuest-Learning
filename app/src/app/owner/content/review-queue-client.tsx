"use client";

import { useState, useEffect, useCallback } from "react";

// ── Design tokens (match page.tsx) ────────────────────────────────────────────
const C = {
  base: "#100b2e",
  bg: "#0d1117",
  bgDeep: "#010409",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  borderFaint: "rgba(255,255,255,0.04)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  faint: "rgba(255,255,255,0.07)",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface HighMissSkill {
  skillCode: string;
  displayName: string;
  bandCode: string;
  missRatePct: number;
  totalAttempts: number;
  studentCount: number;
  questionCount: number;
}

interface FlaggedItem {
  id: string;
  createdAt: string;
  category: string;
  summary: string;
  urgency: string;
  status: string;
}

interface SkillReviewItem {
  id: string;
  skillCode: string;
  status: string;
  notes: string | null;
  reviewedBy: string | null;
  createdAt: string;
}

interface ReviewQueueData {
  highMissSkills: HighMissSkill[];
  recentlyFlagged: FlaggedItem[];
  skillReviewItems: SkillReviewItem[];
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    flag:    { bg: "rgba(245,158,11,0.13)", color: C.amber, label: "Flagged" },
    approve: { bg: "rgba(80,232,144,0.12)", color: C.mint,  label: "Approved" },
    dismiss: { bg: "rgba(255,255,255,0.06)", color: C.muted, label: "Dismissed" },
    pending: { bg: "rgba(245,158,11,0.13)", color: C.amber, label: "Pending" },
    resolved:{ bg: "rgba(80,232,144,0.12)", color: C.mint,  label: "Resolved" },
    open:    { bg: "rgba(248,81,73,0.12)", color: C.red,    label: "Open" },
  };
  const s = map[status] ?? { bg: C.faint, color: C.muted, label: status };
  return (
    <span
      style={{
        fontSize: "9px",
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: "4px",
        background: s.bg,
        color: s.color,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: C.muted,
        marginBottom: "10px",
        paddingBottom: "6px",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReviewQueueClient() {
  const [data, setData] = useState<ReviewQueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagging, setFlagging] = useState<Record<string, boolean>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/content-review");
      if (!res.ok) throw new Error(`${res.status}`);
      const json = (await res.json()) as ReviewQueueData;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFlag = useCallback(async (skillCode: string) => {
    setFlagging((f) => ({ ...f, [skillCode]: true }));
    try {
      const res = await fetch("/api/owner/content-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillCode, action: "flag" }),
      });
      if (res.ok) {
        setFlagged((f) => ({ ...f, [skillCode]: true }));
        // Reload queue to show new triage item
        setTimeout(() => void load(), 400);
      }
    } finally {
      setFlagging((f) => ({ ...f, [skillCode]: false }));
    }
  }, [load]);

  // ── Loading state ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: "20px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: "36px",
              borderRadius: "6px",
              background: C.faint,
              animation: "pulse 1.4s ease-in-out infinite",
            }}
          />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div
        style={{
          padding: "20px",
          background: C.surface,
          borderRadius: "10px",
          border: `1px solid rgba(248,81,73,0.2)`,
          fontSize: "12px",
          color: C.red,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>Could not load review queue{error ? `: ${error}` : "."}</span>
        <button
          onClick={() => void load()}
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: C.mint,
            background: "none",
            border: `1px solid rgba(80,232,144,0.25)`,
            borderRadius: "5px",
            padding: "3px 10px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const { highMissSkills, recentlyFlagged, skillReviewItems } = data;

  // Collect already-flagged skill codes from triage items
  const alreadyFlagged = new Set(skillReviewItems.map((i) => i.skillCode));

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* High miss-rate skills table */}
      <div>
        <SectionLabel>High Miss-Rate Skills (Live Data)</SectionLabel>

        {highMissSkills.length === 0 ? (
          <div
            style={{
              padding: "28px 0",
              textAlign: "center",
              fontSize: "12px",
              color: C.muted,
            }}
          >
            No skills with miss rate &gt; 40% and ≥ 5 attempts.
          </div>
        ) : (
          <div
            style={{
              background: C.surface,
              borderRadius: "10px",
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 70px 70px 90px",
                padding: "7px 14px",
                borderBottom: `1px solid ${C.border}`,
                fontSize: "9px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: C.muted,
                gap: "8px",
              }}
            >
              <span>Skill</span>
              <span style={{ textAlign: "right" }}>Miss Rate</span>
              <span style={{ textAlign: "right" }}>Questions</span>
              <span style={{ textAlign: "right" }}>Students</span>
              <span style={{ textAlign: "right" }}>Action</span>
            </div>

            {/* Table rows */}
            {highMissSkills.map((skill, i) => {
              const isFlaggedNow = flagged[skill.skillCode] || alreadyFlagged.has(skill.skillCode);
              const missColor = skill.missRatePct >= 70 ? C.red : skill.missRatePct >= 55 ? C.amber : C.muted;
              return (
                <div
                  key={skill.skillCode}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 70px 70px 90px",
                    padding: "8px 14px",
                    gap: "8px",
                    alignItems: "center",
                    borderBottom: i < highMissSkills.length - 1 ? `1px solid ${C.borderFaint}` : "none",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: C.text }}>
                      {skill.displayName}
                    </div>
                    <div style={{ fontSize: "9px", color: C.muted, marginTop: "1px" }}>
                      {skill.skillCode} · {skill.bandCode}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "12px", fontWeight: 800, color: missColor }}>
                    {skill.missRatePct}%
                  </div>
                  <div style={{ textAlign: "right", fontSize: "11px", color: C.muted }}>
                    {skill.questionCount}
                  </div>
                  <div style={{ textAlign: "right", fontSize: "11px", color: C.muted }}>
                    {skill.studentCount}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {isFlaggedNow ? (
                      <StatusBadge status="flag" />
                    ) : (
                      <button
                        onClick={() => void handleFlag(skill.skillCode)}
                        disabled={flagging[skill.skillCode]}
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: "4px",
                          border: `1px solid rgba(245,158,11,0.3)`,
                          background: "rgba(245,158,11,0.08)",
                          color: C.amber,
                          cursor: flagging[skill.skillCode] ? "wait" : "pointer",
                          opacity: flagging[skill.skillCode] ? 0.6 : 1,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {flagging[skill.skillCode] ? "…" : "Flag"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Skill review triage items */}
      {skillReviewItems.length > 0 && (
        <div>
          <SectionLabel>Flagged Skills — Triage Log</SectionLabel>
          <div
            style={{
              background: C.surface,
              borderRadius: "10px",
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            {skillReviewItems.slice(0, 10).map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 14px",
                  borderBottom: i < Math.min(skillReviewItems.length, 10) - 1 ? `1px solid ${C.borderFaint}` : "none",
                  gap: "10px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: C.text }}>
                    {item.skillCode}
                  </span>
                  {item.notes && (
                    <span style={{ fontSize: "10px", color: C.muted, marginLeft: "8px" }}>
                      — {item.notes}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "10px", color: C.muted, whiteSpace: "nowrap" }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently flagged content feedback */}
      {recentlyFlagged.length > 0 && (
        <div>
          <SectionLabel>Content Feedback — Last 7 Days</SectionLabel>
          <div
            style={{
              background: C.surface,
              borderRadius: "10px",
              border: `1px solid ${C.border}`,
              overflow: "hidden",
            }}
          >
            {recentlyFlagged.slice(0, 8).map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "7px 14px",
                  borderBottom: i < Math.min(recentlyFlagged.length, 8) - 1 ? `1px solid ${C.borderFaint}` : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                    {item.summary || "(No summary)"}
                  </div>
                  <div style={{ fontSize: "10px", color: C.muted, marginTop: "1px" }}>
                    {new Date(item.createdAt).toLocaleDateString()} · urgency: {item.urgency}
                  </div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {recentlyFlagged.length === 0 && skillReviewItems.length === 0 && (
        <div style={{ fontSize: "11px", color: C.muted, textAlign: "center", padding: "12px 0" }}>
          No flagged items in the last 7 days.
        </div>
      )}
    </div>
  );
}
