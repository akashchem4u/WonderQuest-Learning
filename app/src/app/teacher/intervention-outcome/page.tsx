"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "rgba(240,246,255,0.45)",
  blue: "#38bdf8",
  mint: "#50e890",
  gold: "#ffd166",
  violet: "#9b72ff",
  teal: "#58e8c1",
  coral: "#ff7b6b",
};

type Tab = "outcomes" | "detail" | "spec";

const INTERVENTIONS = [
  {
    id: "emma",
    name: "Emma",
    skill: "Shapes",
    type: "Additional practice",
    assigned: "3 weeks ago",
    outcome: "progress",
    outcomeLabel: "✓ Progress noted",
  },
  {
    id: "liam",
    name: "Liam",
    skill: "Short Vowels",
    type: "Slow reading mode",
    assigned: "4 weeks ago",
    outcome: "engaged",
    outcomeLabel: "✓ Engagement improved",
  },
  {
    id: "sofia",
    name: "Sofia",
    skill: "Counting to 20",
    type: "Parent home activity suggestion",
    assigned: "5 weeks ago",
    outcome: "inprog",
    outcomeLabel: "🔄 In progress",
  },
  {
    id: "marcus",
    name: "Marcus",
    skill: "Community Helpers",
    type: "Skill prerequisite added",
    assigned: "2 weeks ago",
    outcome: "strong",
    outcomeLabel: "✓ Strong now",
  },
  {
    id: "ava",
    name: "Ava",
    skill: "Animals",
    type: "Additional practice",
    assigned: "1 week ago",
    outcome: "early",
    outcomeLabel: "⏳ Early stage",
  },
];

const OUTCOME_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  progress: {
    bg: "rgba(80,232,144,0.12)",
    color: "#50e890",
    border: "rgba(80,232,144,0.3)",
  },
  engaged: {
    bg: "rgba(56,189,248,0.12)",
    color: "#38bdf8",
    border: "rgba(56,189,248,0.3)",
  },
  inprog: {
    bg: "rgba(255,209,102,0.12)",
    color: "#ffd166",
    border: "rgba(255,209,102,0.3)",
  },
  strong: {
    bg: "rgba(88,232,193,0.12)",
    color: "#58e8c1",
    border: "rgba(88,232,193,0.3)",
  },
  early: {
    bg: "rgba(255,123,107,0.12)",
    color: "#ff7b6b",
    border: "rgba(255,123,107,0.3)",
  },
};

const TIMELINE_STEPS = [
  {
    id: "w0",
    label: "W0",
    week: "Week 0",
    desc: "Intervention assigned — Emma was Exploring Shapes",
    pill: "Exploring",
    pillColor: "#ffd166",
    pillBg: "rgba(255,209,102,0.12)",
    pillBorder: "rgba(255,209,102,0.3)",
    dotType: "reached",
  },
  {
    id: "w1",
    label: "W1",
    week: "Week 1",
    desc: "Emma's engagement with Shapes increased — sessions: 2 → 5",
    pill: null,
    pillColor: null,
    pillBg: null,
    pillBorder: null,
    dotType: "reached",
  },
  {
    id: "w2",
    label: "W2",
    week: "Week 2",
    desc: "Emma moved from Exploring → Growing for Shapes ✨",
    pill: "Growing",
    pillColor: "#50e890",
    pillBg: "rgba(80,232,144,0.12)",
    pillBorder: "rgba(80,232,144,0.3)",
    dotType: "active",
  },
  {
    id: "w3",
    label: "W3",
    week: "Week 3",
    desc: 'Emma at Growing — teacher marks "Progress noted"',
    pill: "✓ Closed",
    pillColor: "#50e890",
    pillBg: "rgba(80,232,144,0.12)",
    pillBorder: "rgba(80,232,144,0.3)",
    dotType: "active",
  },
];

const SPEC_TYPES = ["additional_practice", "slow_reading", "parent_suggestion", "prerequisite", "custom_note"];

export default function TeacherInterventionOutcomePage() {
  const [tab, setTab] = useState<Tab>("outcomes");
  const [composerOpen, setComposerOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [feedback, setFeedback] = useState<{ msg: string; color: string } | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: "outcomes", label: "Intervention Outcome Report" },
    { id: "detail", label: "Intervention Detail" },
    { id: "spec", label: "Spec" },
  ];

  function showFeedback(msg: string, color: string) {
    setFeedback({ msg, color });
    setTimeout(() => setFeedback(null), 4000);
  }

  function sendNote() {
    if (!noteText.trim()) {
      showFeedback("Please write a note before sending.", C.gold);
      return;
    }
    setComposerOpen(false);
    setNoteText("");
    showFeedback("✓ Parent note sent — positive framing confirmed.", C.mint);
  }

  return (
    <AppFrame audience="teacher">
      <div style={{ padding: "24px 16px 60px", minHeight: "100vh" }}>
        {/* Page header */}
        <div style={{ maxWidth: 860, marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.blue, letterSpacing: "-0.3px" }}>
            Intervention Outcomes
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Class 4B — Term 2, 2026</p>
        </div>

        {/* Tab nav */}
        <div
          style={{
            display: "flex",
            gap: 6,
            maxWidth: 860,
            marginBottom: 20,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none",
                border: "none",
                color: tab === t.id ? C.blue : C.muted,
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 16px 10px",
                cursor: "pointer",
                borderBottom: tab === t.id ? `2px solid ${C.blue}` : "2px solid transparent",
                whiteSpace: "nowrap" as const,
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OUTCOMES TAB ── */}
        {tab === "outcomes" && (
          <div style={{ maxWidth: 860 }}>
            {/* Stat row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                { n: "5", lbl: "Interventions assigned\nthis term", color: C.blue },
                { n: "4", lbl: "Students showing\nprogress after intervention", color: C.mint },
                { n: "2", lbl: "Interventions\ncompleted", color: C.gold },
                { n: "1", lbl: "Intervention\nin progress", color: C.violet },
              ].map((s) => (
                <div
                  key={s.lbl}
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: 16,
                    textAlign: "center" as const,
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 4, color: s.color }}>
                    {s.n}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.3, whiteSpace: "pre-line" as const }}>
                    {s.lbl}
                  </div>
                </div>
              ))}
            </div>

            {/* Intervention list */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Intervention List
            </div>

            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                <thead>
                  <tr>
                    {["Student", "Skill", "Intervention Type", "Assigned", "Outcome"].map((h) => (
                      <th
                        key={h}
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase" as const,
                          letterSpacing: "0.06em",
                          color: C.muted,
                          padding: "8px 12px",
                          textAlign: "left" as const,
                          borderBottom: `1px solid ${C.border}`,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INTERVENTIONS.map((row) => {
                    const os = OUTCOME_STYLES[row.outcome];
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setTab("detail")}
                        style={{
                          borderBottom: `1px solid ${C.border}`,
                          cursor: "pointer",
                        }}
                      >
                        <td style={{ padding: "12px 12px", fontSize: 13, fontWeight: 700, color: C.blue }}>
                          {row.name}
                        </td>
                        <td style={{ padding: "12px 12px", fontSize: 13 }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: "rgba(240,246,255,0.07)",
                              border: `1px solid ${C.border}`,
                              borderRadius: 5,
                              padding: "2px 8px",
                              fontSize: 12,
                              fontWeight: 600,
                              color: C.teal,
                            }}
                          >
                            {row.skill}
                          </span>
                        </td>
                        <td style={{ padding: "12px 12px", fontSize: 12, color: C.muted }}>{row.type}</td>
                        <td style={{ padding: "12px 12px", fontSize: 12, color: C.muted }}>{row.assigned}</td>
                        <td style={{ padding: "12px 12px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: os.bg,
                              color: os.color,
                              border: `1px solid ${os.border}`,
                            }}
                          >
                            {row.outcomeLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>
              Tap any row to view intervention timeline. Outcomes reflect mastery-level change — no accuracy scores are shown.
            </p>
          </div>
        )}

        {/* ── DETAIL TAB ── */}
        {tab === "detail" && (
          <div style={{ maxWidth: 860 }}>
            <button
              onClick={() => setTab("outcomes")}
              style={{
                background: "none",
                border: `1px solid ${C.border}`,
                color: C.muted,
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back to Report
            </button>

            {/* Hero */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "18px 20px",
                marginBottom: 18,
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #38bdf8, #6ee7f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0d1117",
                  flexShrink: 0,
                }}
              >
                E
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Emma — Shapes</h2>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  Additional practice · Assigned 3 weeks ago ·{" "}
                  <span style={{ color: C.mint }}>✓ Progress noted</span>
                </p>
              </div>
            </div>

            {/* Privacy note */}
            <div
              style={{
                background: "rgba(56,189,248,0.07)",
                border: "1px solid rgba(56,189,248,0.2)",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 12,
                color: "rgba(56,189,248,0.9)",
                marginBottom: 20,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>🔒</span>
              <span>
                Intervention details are visible only to Emma&apos;s teacher and school admin. This is not shared with parents unless teacher manually sends a note.
              </span>
            </div>

            {/* Timeline */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              Intervention Timeline
            </div>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "4px 16px",
                marginBottom: 20,
              }}
            >
              {TIMELINE_STEPS.map((step) => (
                <div
                  key={step.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 0",
                    borderBottom: step.id !== "w3" ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background:
                        step.dotType === "active"
                          ? "rgba(80,232,144,0.1)"
                          : "rgba(56,189,248,0.1)",
                      border:
                        step.dotType === "active"
                          ? `2px solid ${C.mint}`
                          : `2px solid ${C.blue}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      color: step.dotType === "active" ? C.mint : C.blue,
                      flexShrink: 0,
                    }}
                  >
                    {step.label}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.muted,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.06em",
                        marginBottom: 3,
                      }}
                    >
                      {step.week}
                    </div>
                    <div style={{ fontSize: 13, color: C.text }}>
                      {step.desc}
                      {step.pill && (
                        <span
                          style={{
                            display: "inline-block",
                            background: step.pillBg!,
                            color: step.pillColor!,
                            border: `1px solid ${step.pillBorder}`,
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 9px",
                            marginLeft: 6,
                          }}
                        >
                          {step.pill}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.muted,
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                marginBottom: 10,
                marginTop: 22,
              }}
            >
              Actions
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10, marginBottom: 24 }}>
              <button
                onClick={() => showFeedback("✓ Intervention marked complete.", C.mint)}
                style={{
                  background: C.mint,
                  border: "none",
                  borderRadius: 7,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#0d1117",
                }}
              >
                Mark complete
              </button>
              <button
                onClick={() => showFeedback("✓ Intervention extended by 2 weeks.", C.mint)}
                style={{
                  background: "rgba(56,189,248,0.15)",
                  border: "1px solid rgba(56,189,248,0.3)",
                  borderRadius: 7,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: C.blue,
                }}
              >
                Extend intervention
              </button>
              <button
                onClick={() => setComposerOpen(!composerOpen)}
                style={{
                  background: "rgba(240,246,255,0.06)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 7,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: C.muted,
                }}
              >
                Send parent note
              </button>
            </div>

            {/* Note composer */}
            {composerOpen && (
              <div
                style={{
                  background: C.surface,
                  border: "1px solid rgba(56,189,248,0.25)",
                  borderRadius: 10,
                  padding: "18px 20px",
                  marginTop: 4,
                }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.blue, marginBottom: 10 }}>
                  📧 Send Parent Note
                </h3>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
                  Platform-routed · Positive framing only · Max 120 characters · No individual accuracy data
                </p>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Emma is making great progress exploring shapes this week — keep up the wonderful work at home!"
                  style={{
                    width: "100%",
                    background: "rgba(240,246,255,0.05)",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    color: C.text,
                    fontSize: 13,
                    padding: "10px 12px",
                    resize: "vertical" as const,
                    minHeight: 70,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    color: noteText.length > 120 ? "#ff7b6b" : C.muted,
                    textAlign: "right" as const,
                    marginTop: 5,
                  }}
                >
                  {noteText.length} / 120
                </div>
                <div style={{ fontSize: 11, color: "rgba(80,232,144,0.7)", marginTop: 8, marginBottom: 12 }}>
                  ✓ Positive framing required. This note will not include skill scores or accuracy data.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={sendNote}
                    style={{
                      background: C.mint,
                      border: "none",
                      borderRadius: 7,
                      padding: "9px 18px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      color: "#0d1117",
                    }}
                  >
                    Send note
                  </button>
                  <button
                    onClick={() => setComposerOpen(false)}
                    style={{
                      background: "rgba(240,246,255,0.06)",
                      border: `1px solid ${C.border}`,
                      borderRadius: 7,
                      padding: "9px 18px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      color: C.muted,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: feedback.color }}>
                {feedback.msg}
              </div>
            )}
          </div>
        )}

        {/* ── SPEC TAB ── */}
        {tab === "spec" && (
          <div style={{ maxWidth: 860 }}>
            {/* Intervention Types */}
            <div style={{ marginBottom: 28 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.blue,
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Intervention Types
              </h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {SPEC_TYPES.map((t) => (
                  <span
                    key={t}
                    style={{
                      display: "inline-block",
                      background: "rgba(155,114,255,0.12)",
                      color: C.violet,
                      border: "1px solid rgba(155,114,255,0.25)",
                      borderRadius: 4,
                      padding: "1px 8px",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Outcome Measurement */}
            <div style={{ marginBottom: 28 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.blue,
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Outcome Measurement
              </h3>
              {[
                {
                  key: "Basis",
                  val: "Mastery level change from snapshot_date to current. NOT accuracy percentages.",
                },
                { key: "Not shown", val: "Accuracy %, correct/incorrect counts, test scores" },
              ].map((r) => (
                <div key={r.key} style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 13 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: C.muted,
                      minWidth: 160,
                      flexShrink: 0,
                      fontSize: 12,
                    }}
                  >
                    {r.key}
                  </span>
                  <span
                    style={{
                      color: r.key === "Not shown" ? C.coral : C.text,
                    }}
                  >
                    {r.val}
                  </span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: C.muted, minWidth: 160, flexShrink: 0, fontSize: 12 }}>
                  Mastery levels
                </span>
                <span>
                  {[
                    { lbl: "Exploring", bg: "rgba(56,189,248,0.1)", color: C.blue, border: "rgba(56,189,248,0.25)" },
                    { lbl: "Growing", bg: "rgba(88,232,193,0.1)", color: C.teal, border: "rgba(88,232,193,0.25)" },
                    { lbl: "Shining", bg: "rgba(80,232,144,0.1)", color: C.mint, border: "rgba(80,232,144,0.25)" },
                  ].map((m) => (
                    <span
                      key={m.lbl}
                      style={{
                        display: "inline-block",
                        background: m.bg,
                        color: m.color,
                        border: `1px solid ${m.border}`,
                        borderRadius: 4,
                        padding: "1px 8px",
                        fontSize: 12,
                        fontWeight: 600,
                        marginRight: 6,
                      }}
                    >
                      {m.lbl}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* Privacy */}
            <div style={{ marginBottom: 28 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.blue,
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Privacy
              </h3>
              {[
                { key: "Access", val: "Teacher of record + school admin only" },
                { key: "Parent dashboard", val: "NOT shown by default; teacher can optionally send a note" },
                {
                  key: "Parent note rules",
                  val: "Platform-composed · No individual accuracy data · Positive framing required · Max 120 chars",
                },
                { key: "FERPA classification", val: "🔒 Education record" },
                { key: "Parent right", val: "Parent may request access under FERPA" },
              ].map((r) => (
                <div key={r.key} style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 13 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: C.muted,
                      minWidth: 160,
                      flexShrink: 0,
                      fontSize: 12,
                    }}
                  >
                    {r.key}
                  </span>
                  <span style={{ color: C.text }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* DB Schema */}
            <div style={{ marginBottom: 28 }}>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.blue,
                  marginBottom: 10,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                Database Schema
              </h3>
              <div
                style={{
                  background: "#0d1117",
                  border: `1px solid ${C.border}`,
                  borderRadius: 7,
                  padding: "14px 16px",
                  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                  fontSize: 12,
                  color: "#a8d8a8",
                  overflowX: "auto" as const,
                  lineHeight: 1.7,
                  whiteSpace: "pre" as const,
                }}
              >
                {`CREATE TABLE interventions (
  id               UUID           PRIMARY KEY,
  class_id         UUID,
  student_id       UUID,
  skill_id         UUID,
  teacher_id       UUID,
  type             ENUM(additional_practice, slow_reading,
                        parent_suggestion, prerequisite, custom_note),
  assigned_at      TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  outcome_notes    TEXT,
  baseline_level   ENUM(exploring, growing, shining),
  current_level    ENUM(exploring, growing, shining)
);`}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
