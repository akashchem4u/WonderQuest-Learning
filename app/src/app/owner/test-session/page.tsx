"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  mint: "#50e890",
  // severity
  infoFg: "#50e890",
  infoBg: "rgba(80,232,144,0.10)",
  minorFg: "#ffd250",
  minorBg: "rgba(255,210,80,0.10)",
  majorFg: "#ff8c3c",
  majorBg: "rgba(255,140,60,0.12)",
  blockerFg: "#ff5050",
  blockerBg: "rgba(255,80,80,0.12)",
};

type Tab = "board" | "analysis" | "spec";
type Severity = "info" | "minor" | "major" | "blocker";
type FilterType = "all" | "device_test" | "ux_walkthrough" | "classroom_observation" | "blocker";

const SEV_STYLES: Record<Severity, { fg: string; bg: string; border: string; label: string }> = {
  info: { fg: C.infoFg, bg: C.infoBg, border: C.infoFg, label: "Info" },
  minor: { fg: C.minorFg, bg: C.minorBg, border: C.minorFg, label: "Minor" },
  major: { fg: C.majorFg, bg: C.majorBg, border: C.majorFg, label: "Major" },
  blocker: { fg: C.blockerFg, bg: C.blockerBg, border: C.blockerFg, label: "Blocker" },
};

type Observation = {
  id: string;
  severity: Severity;
  sessionType: "device_test" | "ux_walkthrough" | "classroom_observation";
  text: string;
  context: string;
  timestamp: string;
  tags: string[];
  linkedFeedback?: string;
};

const OBSERVATIONS: Observation[] = [
  {
    id: "obs1",
    severity: "major",
    sessionType: "device_test",
    text: "Voice coach Orbit not audible on iPad mini with volume at 50%",
    context: "iPad mini",
    timestamp: "2026-03-24 14:32 UTC",
    tags: ["audio", "voice-coach"],
  },
  {
    id: "obs2",
    severity: "minor",
    sessionType: "ux_walkthrough",
    text: "Child tapped 'Play' 3 times before response registered — hint button too small",
    context: "iPhone SE",
    timestamp: "2026-03-24 11:15 UTC",
    tags: ["touch-target"],
  },
  {
    id: "obs3",
    severity: "info",
    sessionType: "classroom_observation",
    text: "Classroom: 5 students completed quest without audio assist",
    context: "School B",
    timestamp: "2026-03-23 09:47 UTC",
    tags: ["accessibility"],
  },
  {
    id: "obs4",
    severity: "major",
    sessionType: "device_test",
    text: "Theme switch mid-session caused 2s blank screen flash",
    context: "Android tablet",
    timestamp: "2026-03-23 16:05 UTC",
    tags: ["theme", "performance"],
  },
  {
    id: "obs5",
    severity: "minor",
    sessionType: "ux_walkthrough",
    text: "Parent complained settings were hard to find from home screen",
    context: "iPhone 14",
    timestamp: "2026-03-22 13:20 UTC",
    tags: ["navigation"],
  },
  {
    id: "obs6",
    severity: "blocker",
    sessionType: "classroom_observation",
    text: "School D: firewall blocked Web Speech API entirely",
    context: "School D",
    timestamp: "2026-03-22 10:55 UTC",
    tags: ["audio", "firewall"],
    linkedFeedback: "FB-0041",
  },
];

const TAG_FREQUENCIES = [
  { tag: "audio", count: 4, pct: 100, blocker: false },
  { tag: "touch-target", count: 2, pct: 50, blocker: false },
  { tag: "theme", count: 2, pct: 50, blocker: false },
  { tag: "performance", count: 2, pct: 50, blocker: false },
  { tag: "navigation", count: 1, pct: 25, blocker: false },
  { tag: "firewall", count: 1, pct: 25, blocker: true },
];

const BUSINESS_RULES = [
  "Any observation with severity = 'blocker' automatically creates a feedback_item record with source = 'observation' and links back via linked_feedback_id.",
  "Observations with session_type = 'classroom_observation' must be reviewed by the owner within 24 hours of creation — a review reminder is sent at T+22h if unreviewed.",
  "observation_text is scanned on save for patterns matching personal data (names, emails, phone numbers); the record is rejected with a 422 if a match is found.",
  "Tags are normalized to lowercase and de-duplicated before persistence.",
  "The filter state is reflected in the URL query param ?filter= for deep-link sharing between owner and QA.",
];

const DB_SCHEMA = [
  { col: "id", type: "UUID", notes: "Primary key, auto-generated" },
  {
    col: "session_type",
    type: "ENUM",
    notes: "'device_test' | 'ux_walkthrough' | 'classroom_observation'",
  },
  { col: "observer_name", type: "TEXT", notes: "Owner/QA tester name" },
  { col: "observed_at", type: "TIMESTAMPTZ", notes: "When the observation occurred" },
  { col: "device_type", type: "TEXT", notes: "Device or context label" },
  {
    col: "observation_text",
    type: "TEXT",
    notes: "Structured note; no PII allowed",
  },
  {
    col: "severity",
    type: "ENUM",
    notes: "'info' | 'minor' | 'major' | 'blocker'",
  },
  { col: "tags", type: "TEXT[]", notes: "Free-form tag array" },
  {
    col: "linked_feedback_id",
    type: "UUID",
    notes: "FK → feedback_items (nullable)",
  },
  { col: "created_at", type: "TIMESTAMPTZ", notes: "Auto-set on insert" },
];

export default function OwnerTestSessionPage() {
  const [tab, setTab] = useState<Tab>("board");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedSev, setSelectedSev] = useState<Severity | "">("");
  const [sessionType, setSessionType] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [obsText, setObsText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: "board", label: "Observation Board" },
    { id: "analysis", label: "Tag Analysis" },
    { id: "spec", label: "Spec" },
  ];

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "device_test", label: "device_test" },
    { id: "ux_walkthrough", label: "ux_walkthrough" },
    { id: "classroom_observation", label: "classroom_observation" },
    { id: "blocker", label: "Blocker only" },
  ];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionType || !obsText.trim()) {
      showToast("Please fill in session type and observation text.");
      return;
    }
    showToast("Observation logged.");
    setSessionType("");
    setDeviceType("");
    setObsText("");
    setTagInput("");
    setSelectedSev("");
  }

  const filteredObs = OBSERVATIONS.filter((o) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "blocker") return o.severity === "blocker";
    return o.sessionType === activeFilter;
  });

  return (
    <AppFrame audience="owner">
      <OwnerGate configured={true} />
      <div style={{ padding: "24px 16px 48px" }}>
        {/* Page header */}
        <header style={{ maxWidth: 960, margin: "0 auto 24px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", color: C.text }}>
            Test Session Observation Board
          </h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
            Log and review structured observations from device tests, UX walkthroughs, and classroom sessions.
          </p>
          <div
            style={{
              display: "inline-block",
              background: "rgba(80,232,144,0.12)",
              color: C.mint,
              border: "1px solid rgba(80,232,144,0.3)",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.4px",
              padding: "2px 10px",
              marginTop: 8,
            }}
          >
            /owner/beta/observations
          </div>
        </header>

        {/* Tab nav */}
        <nav
          style={{
            display: "flex",
            gap: 4,
            maxWidth: 960,
            margin: "0 auto 24px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? "rgba(80,232,144,0.05)" : "none",
                border: "none",
                color: tab === t.id ? C.mint : C.muted,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                padding: "10px 18px",
                borderBottom: tab === t.id ? `2px solid ${C.mint}` : "2px solid transparent",
                marginBottom: -1,
                borderRadius: "6px 6px 0 0",
                minHeight: 44,
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ── OBSERVATION BOARD TAB ── */}
        {tab === "board" && (
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            {/* Log form */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "20px 22px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.6px",
                  marginBottom: 14,
                }}
              >
                Log Observation
              </div>
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  {/* Session type */}
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.muted,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.4px",
                      }}
                    >
                      Session Type
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 7,
                        color: sessionType ? C.text : C.muted,
                        fontSize: 13,
                        padding: "10px 13px",
                        width: "100%",
                        minHeight: 44,
                      }}
                    >
                      <option value="">Select session type…</option>
                      <option value="device_test">Device Test</option>
                      <option value="ux_walkthrough">UX Walkthrough</option>
                      <option value="classroom_observation">Classroom Observation</option>
                    </select>
                  </div>

                  {/* Device type */}
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 6 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.muted,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.4px",
                      }}
                    >
                      Device / Context
                    </label>
                    <input
                      type="text"
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value)}
                      placeholder="e.g. iPad mini, iPhone SE, Android tablet…"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 7,
                        color: C.text,
                        fontSize: 13,
                        padding: "10px 13px",
                        width: "100%",
                        minHeight: 44,
                      }}
                    />
                  </div>

                  {/* Observation text */}
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.muted,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.4px",
                      }}
                    >
                      Observation
                    </label>
                    <textarea
                      value={obsText}
                      onChange={(e) => setObsText(e.target.value)}
                      placeholder="Describe what you observed. Do not include child names; use 'child' or 'student' for classroom sessions."
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 7,
                        color: C.text,
                        fontSize: 13,
                        padding: "10px 13px",
                        width: "100%",
                        minHeight: 90,
                        resize: "vertical" as const,
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  {/* Severity */}
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.muted,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.4px",
                      }}
                    >
                      Severity
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                      {(["info", "minor", "major", "blocker"] as Severity[]).map((sev) => {
                        const s = SEV_STYLES[sev];
                        const isSelected = selectedSev === sev;
                        return (
                          <button
                            key={sev}
                            type="button"
                            onClick={() => setSelectedSev(isSelected ? "" : sev)}
                            style={{
                              border: isSelected ? `1px solid ${s.fg}` : "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 7,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              padding: "9px 16px",
                              minHeight: 44,
                              background: isSelected ? s.bg : "rgba(255,255,255,0.04)",
                              color: isSelected ? s.fg : C.muted,
                              transition: "all 0.15s",
                            }}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: C.muted,
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.4px",
                      }}
                    >
                      Tags{" "}
                      <span style={{ color: C.muted, fontWeight: 400, textTransform: "none" as const }}>
                        (comma-separated)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="audio, touch-target, theme, navigation…"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 7,
                        color: C.text,
                        fontSize: 13,
                        padding: "10px 13px",
                        width: "100%",
                        minHeight: 44,
                      }}
                    />
                  </div>

                  {/* Submit */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      gridColumn: "1 / -1",
                      marginTop: 4,
                    }}
                  >
                    <button
                      type="submit"
                      style={{
                        background: C.mint,
                        border: "none",
                        borderRadius: 8,
                        color: "#0d1117",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 700,
                        minHeight: 44,
                        padding: "11px 28px",
                        transition: "opacity 0.15s",
                      }}
                    >
                      Submit Observation
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Filter bar */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap" as const,
                marginBottom: 18,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginRight: 4 }}>Filter:</span>
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    background:
                      activeFilter === f.id ? "rgba(80,232,144,0.12)" : "rgba(255,255,255,0.04)",
                    border:
                      activeFilter === f.id
                        ? "1px solid rgba(80,232,144,0.4)"
                        : "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 7,
                    color: activeFilter === f.id ? C.mint : C.muted,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    minHeight: 36,
                    padding: "6px 14px",
                    transition: "all 0.15s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Observation cards */}
            <div>
              {filteredObs.map((obs) => {
                const s = SEV_STYLES[obs.severity];
                return (
                  <div
                    key={obs.id}
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderLeft: `3px solid ${s.fg}`,
                      borderRadius: 10,
                      padding: "16px 18px",
                      marginBottom: 12,
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 8,
                        flexWrap: "wrap" as const,
                      }}
                    >
                      <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5, flex: 1 }}>{obs.text}</p>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          background: s.bg,
                          color: s.fg,
                          borderRadius: 5,
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 9px",
                          whiteSpace: "nowrap" as const,
                          letterSpacing: "0.3px",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>

                    {/* Meta */}
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        fontSize: 12,
                        color: C.muted,
                        flexWrap: "wrap" as const,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: C.muted,
                          borderRadius: 5,
                          fontSize: 11,
                          fontWeight: 500,
                          padding: "3px 9px",
                        }}
                      >
                        {obs.sessionType}
                      </span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{obs.context}</span>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{obs.timestamp}</span>
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, alignItems: "center" }}>
                      {obs.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            background: "rgba(80,232,144,0.08)",
                            border: "1px solid rgba(80,232,144,0.2)",
                            borderRadius: 5,
                            color: C.mint,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Blocker footer */}
                    {obs.severity === "blocker" && obs.linkedFeedback && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 10,
                          flexWrap: "wrap" as const,
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 11, color: C.blockerFg, fontWeight: 600 }}>
                          Auto-created feedback item #{obs.linkedFeedback}
                        </span>
                        <button
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 8,
                            color: C.text,
                            cursor: "pointer",
                            fontSize: 11,
                            fontWeight: 600,
                            minHeight: 36,
                            padding: "7px 14px",
                          }}
                        >
                          Link to Feedback Item
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAG ANALYSIS TAB ── */}
        {tab === "analysis" && (
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            {/* Blocker chip */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: C.blockerBg,
                border: "1px solid rgba(255,80,80,0.3)",
                borderRadius: 8,
                color: C.blockerFg,
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 16px",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.blockerFg,
                  flexShrink: 0,
                }}
              />
              1 open blocker — firewall (School D)
            </div>

            {/* Tag frequency */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "20px 22px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.6px",
                  marginBottom: 14,
                }}
              >
                Tag Frequency
              </div>
              <div>
                {TAG_FREQUENCIES.map((tf) => (
                  <div
                    key={tf.tag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 100,
                        fontSize: 12,
                        color: C.text,
                        textAlign: "right" as const,
                        fontWeight: 500,
                      }}
                    >
                      {tf.tag}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: 4,
                        height: 24,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 4,
                          background: tf.blocker ? C.blockerFg : C.mint,
                          width: `${tf.pct}%`,
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          color: tf.blocker ? "#fff" : "#0d1117",
                        }}
                      >
                        {tf.count}
                      </div>
                    </div>
                    <div
                      style={{
                        minWidth: 24,
                        fontSize: 12,
                        color: C.muted,
                        fontWeight: 600,
                        textAlign: "left" as const,
                      }}
                    >
                      {tf.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open blockers */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "20px 22px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.muted,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.6px",
                  marginBottom: 14,
                }}
              >
                Open Blockers
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
                <div
                  style={{
                    background: "rgba(255,80,80,0.06)",
                    border: "1px solid rgba(255,80,80,0.18)",
                    borderRadius: 9,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap" as const,
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 13, color: C.text }}>
                    School D: firewall blocked Web Speech API entirely
                    <small
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: C.muted,
                        marginTop: 3,
                      }}
                    >
                      classroom_observation · School D · 2026-03-22 · Tags: audio, firewall
                    </small>
                  </div>
                  <button
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      color: C.text,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      minHeight: 44,
                      padding: "10px 18px",
                    }}
                  >
                    Link to Feedback Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SPEC TAB ── */}
        {tab === "spec" && (
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "20px 22px",
              }}
            >
              {/* Component */}
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.mint,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.6px",
                    marginBottom: 12,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  Component
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                  <thead>
                    <tr>
                      {["Property", "Value"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left" as const,
                            padding: "9px 12px",
                            fontSize: 12,
                            borderBottom: `1px solid ${C.border}`,
                            color: C.muted,
                            fontWeight: 600,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.4px",
                            background: "rgba(255,255,255,0.02)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { k: "Component name", v: "TestSessionObservationBoard" },
                      { k: "Design System item", v: "#288" },
                      { k: "Route", v: "/owner/beta/observations" },
                      { k: "Auth", v: "Owner only — requires role === 'owner' session claim" },
                    ].map((r) => (
                      <tr key={r.k} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "9px 12px", fontSize: 12, color: C.text }}>{r.k}</td>
                        <td
                          style={{
                            padding: "9px 12px",
                            fontSize: 12,
                            color: C.text,
                            fontFamily: "monospace",
                          }}
                        >
                          {r.v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* DB Schema */}
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.mint,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.6px",
                    marginBottom: 12,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  DB Schema — test_observations
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                  <thead>
                    <tr>
                      {["Column", "Type", "Notes"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left" as const,
                            padding: "9px 12px",
                            fontSize: 12,
                            borderBottom: `1px solid ${C.border}`,
                            color: C.muted,
                            fontWeight: 600,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.4px",
                            background: "rgba(255,255,255,0.02)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DB_SCHEMA.map((row) => (
                      <tr key={row.col} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "9px 12px", fontSize: 12 }}>
                          <code
                            style={{
                              background: "rgba(80,232,144,0.1)",
                              color: C.mint,
                              borderRadius: 4,
                              fontFamily: "monospace",
                              fontSize: 11,
                              padding: "1px 6px",
                            }}
                          >
                            {row.col}
                          </code>
                        </td>
                        <td style={{ padding: "9px 12px", fontSize: 12 }}>
                          <code
                            style={{
                              background: "rgba(80,232,144,0.1)",
                              color: C.mint,
                              borderRadius: 4,
                              fontFamily: "monospace",
                              fontSize: 11,
                              padding: "1px 6px",
                            }}
                          >
                            {row.type}
                          </code>
                        </td>
                        <td style={{ padding: "9px 12px", fontSize: 12, color: C.text }}>{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Privacy Rules */}
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.mint,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.6px",
                    marginBottom: 12,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  Privacy Rules
                </h3>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {[
                    "No child names may appear in observation_text or any tag. Use 'child' or 'student' for classroom sessions.",
                    "School names are permitted in observations (B2B context — School A/B/C/D etc.).",
                    "Parent names must not appear. Reference as 'parent' or 'guardian'.",
                  ].map((rule, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: C.text, alignItems: "flex-start" }}>
                      <span style={{ color: C.mint, flexShrink: 0, marginTop: 1 }}>■</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Business Rules */}
              <div style={{ marginBottom: 0 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.mint,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.6px",
                    marginBottom: 12,
                    paddingBottom: 6,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  Business Rules
                </h3>
                <ol style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  {BUSINESS_RULES.map((rule, i) => (
                    <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.5, color: C.text, alignItems: "flex-start" }}>
                      <span
                        style={{
                          background: "rgba(80,232,144,0.15)",
                          color: C.mint,
                          borderRadius: 5,
                          fontSize: 11,
                          fontWeight: 700,
                          minWidth: 22,
                          height: 22,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed" as const,
              bottom: 24,
              right: 24,
              background: C.surface,
              border: "1px solid rgba(80,232,144,0.35)",
              borderRadius: 10,
              color: C.text,
              fontSize: 13,
              fontWeight: 500,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              zIndex: 999,
              maxWidth: 320,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: C.mint,
                flexShrink: 0,
              }}
            />
            {toast}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
