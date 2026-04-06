"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

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

// ── Types ─────────────────────────────────────────────────────────────────────
type TriggerType = "confidence-floor" | "absence" | "hint-pattern" | "band-ceiling";
type StatusType = "new" | "acknowledged" | "resolved";

type SkillPattern = {
  skill: string;
  hits: string;
  barPct: number;
};

type QueueItem = {
  id: string;
  name: string;
  band: string;
  bandLabel: string;
  trigger: TriggerType;
  triggerDetail: string;
  triggeredAt: string;
  status: StatusType;
  topSkill: string;
  suggestedSupport: string;
  skillPatterns: SkillPattern[];
};

// ── Stub data ─────────────────────────────────────────────────────────────────
const QUEUE_ITEMS: QueueItem[] = [
  {
    id: "jordan",
    name: "Jordan",
    band: "P2",
    bandLabel: "G2-3",
    trigger: "confidence-floor",
    triggerDetail: "Confidence floor hit 3x on Fractions: Division this week",
    triggeredAt: "2 days ago",
    status: "new",
    topSkill: "Fractions: Division",
    suggestedSupport:
      "Jordan may benefit from revisiting the concept of equal parts before continuing with division of fractions. Consider pairing with a concrete model activity or one-on-one check-in. The system has slightly reduced difficulty while this flag is active.",
    skillPatterns: [
      { skill: "Fractions: Division (equal parts)", hits: "3x floor", barPct: 100 },
      { skill: "Fractions: Basic (what is a fraction)", hits: "1x floor", barPct: 33 },
    ],
  },
  {
    id: "priya",
    name: "Priya",
    band: "P1",
    bandLabel: "K-1",
    trigger: "absence",
    triggerDetail: "No sessions in 5 days — last active Thursday",
    triggeredAt: "5 days ago",
    status: "new",
    topSkill: "Counting: Skip Count",
    suggestedSupport:
      "Priya has been away for 5 days. Consider a brief welfare check or re-engagement message through the school system. The system will hold her position until she returns.",
    skillPatterns: [
      { skill: "Counting: Skip Count", hits: "Active skill", barPct: 60 },
    ],
  },
  {
    id: "sam",
    name: "Sam",
    band: "P2",
    bandLabel: "G2-3",
    trigger: "hint-pattern",
    triggerDetail: "5+ hint requests on Place Value: Hundreds this week",
    triggeredAt: "Today",
    status: "new",
    topSkill: "Place Value: Hundreds",
    suggestedSupport:
      "Sam is frequently requesting hints on place value. A short group activity focused on hundreds, tens, ones using manipulatives may help consolidate this concept before the system reintroduces it.",
    skillPatterns: [
      { skill: "Place Value: Hundreds", hits: "5x hints", barPct: 100 },
      { skill: "Place Value: Tens", hits: "2x hints", barPct: 40 },
    ],
  },
  {
    id: "marcus",
    name: "Marcus",
    band: "P2",
    bandLabel: "G2-3",
    trigger: "band-ceiling",
    triggerDetail: "Consistently reaching P2 ceiling — ready to advance to P3",
    triggeredAt: "3 weeks ago",
    status: "acknowledged",
    topSkill: "Multiplication: Arrays",
    suggestedSupport:
      "Marcus has been at the P2 ceiling for 3 weeks. Review band advancement with parent before approving the move to G4-5 content. The system will not auto-advance without teacher confirmation.",
    skillPatterns: [
      { skill: "Multiplication: Arrays", hits: "Ceiling", barPct: 100 },
      { skill: "Addition: Regrouping", hits: "Ceiling", barPct: 95 },
    ],
  },
];

// ── Filter helpers ────────────────────────────────────────────────────────────
type TriggerFilter = "all" | TriggerType;
type BandFilter = "all" | "P1" | "P2" | "P3";
type StatusFilter = "all" | StatusType;

function getTriggerIcon(t: TriggerType) {
  if (t === "confidence-floor") return "⚠️";
  if (t === "absence") return "📅";
  if (t === "hint-pattern") return "💡";
  return "💙";
}

function getTriggerLabel(t: TriggerType) {
  if (t === "confidence-floor") return "Confidence floor";
  if (t === "absence") return "Absence";
  if (t === "hint-pattern") return "Hint pattern";
  return "Band ceiling";
}

function isCeiling(item: QueueItem) {
  return item.trigger === "band-ceiling";
}

function getAccentColor(item: QueueItem) {
  return isCeiling(item) ? C.blue : C.amber;
}

function getAccentBg(item: QueueItem) {
  return isCeiling(item) ? C.blueBg : C.amberBg;
}

function getAccentBorder(item: QueueItem) {
  return isCeiling(item) ? C.blueBorder : C.amberBorder;
}

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Filters
  const [triggerFilter, setTriggerFilter] = useState<TriggerFilter>("all");
  const [bandFilter, setBandFilter] = useState<BandFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("new");

  // Derived
  const activeItems = QUEUE_ITEMS.filter(
    (item) => !dismissedIds.has(item.id) && !resolvedIds.has(item.id)
  );

  const filteredItems = activeItems.filter((item) => {
    if (triggerFilter !== "all" && item.trigger !== triggerFilter) return false;
    if (bandFilter !== "all" && item.band !== bandFilter) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    return true;
  });

  const amberCount = activeItems.filter((i) => !isCeiling(i)).length;
  const blueCount = activeItems.filter((i) => isCeiling(i)).length;
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
    const amberIds = activeItems.filter((i) => !isCeiling(i)).map((i) => i.id);
    setDismissedIds((prev) => new Set([...prev, ...amberIds]));
  }

  // Filter count helpers
  function countByTrigger(t: TriggerType) {
    return activeItems.filter((i) => i.trigger === t).length;
  }
  function countByBand(b: string) {
    return activeItems.filter((i) => i.band === b).length;
  }
  function countByStatus(s: StatusType) {
    return QUEUE_ITEMS.filter((i) => i.status === s && !dismissedIds.has(i.id) && !resolvedIds.has(i.id)).length;
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
                {totalCount > 0 && (
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
                {totalCount} students — {amberCount} amber · {blueCount} blue (positive)
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

          {/* ── Main layout ───────────────────────────────────────────────── */}
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

              {/* Band */}
              <div style={{ ...card, padding: 14 }}>
                <span style={{ ...eyebrow, marginBottom: 10 }}>Band</span>
                {(
                  [
                    { id: "all", label: "All bands", count: activeItems.length },
                    { id: "P1", label: "P1 K-1", count: countByBand("P1") },
                    { id: "P2", label: "P2 G2-3", count: countByBand("P2") },
                    { id: "P3", label: "P3 G4-5", count: countByBand("P3") },
                  ] as { id: BandFilter; label: string; count: number }[]
                ).map((opt) => {
                  const active = bandFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBandFilter(opt.id)}
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
                    { id: "new", label: "New", count: countByStatus("new") },
                    { id: "acknowledged", label: "Acknowledged", count: countByStatus("acknowledged") },
                    { id: "resolved", label: "Resolved", count: 0 },
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
                  const accent = getAccentColor(item);
                  const accentBg = getAccentBg(item);
                  const accentBorder = getAccentBorder(item);
                  const ceiling = isCeiling(item);
                  const expanded = expandedId === item.id;

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
                        {/* Trigger icon */}
                        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1, lineHeight: 1 }}>
                          {getTriggerIcon(item.trigger)}
                        </span>

                        {/* Name + detail + chips */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
                            {item.triggerDetail}
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
                              {getTriggerLabel(item.trigger)}
                            </span>
                            <span style={{ ...chip }}>
                              {item.band} · {item.bandLabel}
                            </span>
                            <span style={{ ...chip }}>
                              {item.topSkill}
                            </span>
                          </div>
                        </div>

                        {/* Right side */}
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
                            {item.triggeredAt}
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
                            <button
                              type="button"
                              style={{
                                padding: "6px 14px",
                                background: ceiling ? C.blue : C.blue,
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "system-ui",
                              }}
                            >
                              {ceiling ? "Review band" : "View student"}
                            </button>
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
                          {/* Skill patterns */}
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: C.subtle,
                              margin: "12px 0 8px",
                            }}
                          >
                            Skill pattern (this week)
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            {item.skillPatterns.map((sp) => (
                              <div
                                key={sp.skill}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "6px 0",
                                  borderBottom: `1px solid ${C.border}`,
                                  fontSize: 12,
                                }}
                              >
                                <span style={{ fontWeight: 700, flex: 1, color: C.text }}>
                                  {sp.skill}
                                </span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: C.amber,
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {sp.hits}
                                </span>
                                <div
                                  style={{
                                    width: 60,
                                    height: 4,
                                    background: "rgba(255,255,255,0.08)",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    flexShrink: 0,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${sp.barPct}%`,
                                      height: "100%",
                                      background: C.amber,
                                      borderRadius: 2,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

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
                            Suggested support
                          </div>
                          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, margin: "0 0 12px" }}>
                            {item.suggestedSupport}
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
                            <button
                              type="button"
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
                              }}
                            >
                              View {item.name}&apos;s profile
                            </button>
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
        </div>
      </main>
    </AppFrame>
  );
}
