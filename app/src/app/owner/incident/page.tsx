"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "@/app/owner/owner-gate";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  bg: "#0d1117",
  bgDeep: "#010409",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
} as const;

// ── Stub data ─────────────────────────────────────────────────────────────────
const TIMELINE = [
  {
    dot: C.violet,
    title: "Investigation update — root cause identified",
    sub: "Redis queue consumer crashing on null task payloads introduced in v2.5.0. Fix in progress — hotfix branch created. ETA deploy 11:30 AM.",
    time: "10:05 AM",
  },
  {
    dot: C.violet,
    title: "Investigation update — scoping impact",
    sub: "Confirmed 9 schools affected. Play sessions and mastery scoring unaffected — only assignment delivery is impacted. Students can still play free sessions.",
    time: "8:45 AM",
  },
  {
    dot: C.amber,
    title: "Engineering on-call acknowledged",
    sub: "Sam (Lead Engineer) acknowledged via PagerDuty. Joining incident call.",
    time: "6:22 AM",
  },
  {
    dot: C.red,
    title: "Escalated to on-call via PagerDuty · Slack #incidents notified",
    sub: "Auto-triage escalated after 2+ P0 feedback reports. PD-4412 created.",
    time: "6:15 AM",
  },
  {
    dot: "rgba(255,255,255,.3)",
    title: "Incident declared — P0 — Assignment Engine queue processing failure",
    sub: 'First teacher report received. Platform status page updated: "We\'re investigating an issue."',
    time: "6:10 AM",
  },
];

const AFFECTED_ROUTES = [
  { name: "Assignment Engine", dot: C.red, status: "DOWN", statusBg: "rgba(248,81,73,.15)", statusColor: C.red },
  { name: "Play Session", dot: C.mint, status: "OK", statusBg: "rgba(80,232,144,.1)", statusColor: C.mint },
  { name: "Adaptive Engine", dot: C.mint, status: "OK", statusBg: "rgba(80,232,144,.1)", statusColor: C.mint },
  { name: "Auth / SSO", dot: C.mint, status: "OK", statusBg: "rgba(80,232,144,.1)", statusColor: C.mint },
  { name: "All other routes", dot: C.mint, status: "OK", statusBg: "rgba(80,232,144,.1)", statusColor: C.mint },
];

const ON_CALL = [
  { initial: "S", name: "Sam (Lead Eng)", avatarBg: "rgba(80,232,144,.15)", avatarColor: C.mint, status: "Acknowledged", statusBg: "rgba(80,232,144,.1)", statusColor: C.mint },
  { initial: "J", name: "Jordan (Infra)", avatarBg: "rgba(245,158,11,.12)", avatarColor: C.amber, status: "Paged", statusBg: "rgba(245,158,11,.1)", statusColor: C.amber },
  { initial: "A", name: "Alex (Backend)", avatarBg: "rgba(155,114,255,.12)", avatarColor: C.violet, status: "Acknowledged", statusBg: "rgba(80,232,144,.1)", statusColor: C.mint },
];

const HISTORY = [
  { sev: "P0", sevBg: "rgba(248,81,73,.2)", sevColor: C.red, title: "SSO token expiry — Batch deploy misconfiguration", meta: "Auth/SSO · Mar 24 · Resolved in 3h 18m · Hotfix v2.4.8", ttr: "3h 18m", ttrColor: C.mint },
  { sev: "P0", sevBg: "rgba(248,81,73,.2)", sevColor: C.red, title: "Assignment queue failure — Redis consumer crash", meta: "Assignment Engine · Mar 17 · Resolved in 5h 45m · Hotfix v2.4.7", ttr: "5h 45m", ttrColor: C.mint },
  { sev: "P1", sevBg: "rgba(245,158,11,.15)", sevColor: C.amber, title: "Mastery score calculation lag spike", meta: "Mastery Score · Mar 10 · Resolved in 22h · DB query optimisation", ttr: "22h", ttrColor: C.amber },
  { sev: "P1", sevBg: "rgba(245,158,11,.15)", sevColor: C.amber, title: "Content CDN cache invalidation failure", meta: "Content Delivery · Feb 28 · Resolved in 4h · CDN config rollback", ttr: "4h", ttrColor: C.mint },
];

const POST_INCIDENT = [
  { label: "Incident", val: "P0 — Assignment Engine Queue Failure", valColor: C.text },
  { label: "Root cause", val: "Redis consumer null payload crash (v2.5.0 regression)", valColor: C.text },
  { label: "Fix", val: "Hotfix v2.5.1 — null guard in consumer loop", valColor: C.text },
  { label: "Schools affected", val: "9 confirmed", valColor: C.text },
  { label: "Time to detect", val: "5 min (teacher report)", valColor: C.text },
  { label: "Time to acknowledge", val: "12 min (on-call)", valColor: C.text },
  { label: "Time to resolve", val: "5h 20m (SLA: 4h — missed by 1h 20m)", valColor: C.mint },
  { label: "SLA", val: "Missed — 4h P0 SLA", valColor: C.amber },
  { label: "Post-mortem", val: "Scheduled Thu 10 AM", valColor: C.violet },
];

type TabId = "active" | "clear" | "resolved";

// ── Page ──────────────────────────────────────────────────────────────────────
export default function IncidentPage() {
  const [tab, setTab] = useState<TabId>("active");
  const [updateText, setUpdateText] = useState("");

  // Static stub — gate not wired; OwnerGate shown via real server guard
  const allowed = true;
  if (!allowed) {
    return <OwnerGate configured={false} />;
  }

  const TABS: { id: TabId; label: string }[] = [
    { id: "active", label: "Active P0 Incident" },
    { id: "clear", label: "All Clear" },
    { id: "resolved", label: "Post-Incident" },
  ];

  return (
    <AppFrame audience="owner">
      <main
        style={{
          minHeight: "100vh",
          background: C.base,
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
        }}
      >
        {/* ── Page title ────────────────────────────────────────────────── */}
        <div style={{ fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "20px" }}>
          Live Incident Center
        </div>

        {/* ── Tab bar ───────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "system-ui",
                background: tab === t.id ? "#2563eb" : "#fff",
                color: tab === t.id ? "#fff" : "#555",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Shell ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: C.bg,
            borderRadius: "16px",
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >

          {/* ════════════════ ACTIVE P0 ════════════════ */}
          {tab === "active" && (
            <>
              {/* Incident header */}
              <div
                style={{
                  background: C.bgDeep,
                  borderBottom: `2px solid rgba(248,81,73,.4)`,
                  padding: "0 24px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: "5px",
                    background: "rgba(248,81,73,.2)",
                    color: C.red,
                    flexShrink: 0,
                  }}
                >
                  P0 INCIDENT
                </span>
                <div style={{ fontSize: "14px", fontWeight: 800, color: C.red, flex: 1 }}>
                  Assignment Engine Down — Queue Processing Failure
                </div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(248,81,73,.7)", fontVariantNumeric: "tabular-nums" }}>
                  ⏱ 5h 23m
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { label: "+ Add Update", bg: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)" },
                    { label: "PD-4412", bg: "rgba(248,81,73,.15)", color: C.red },
                    { label: "✓ Resolve", bg: "rgba(80,232,144,.15)", color: C.mint },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "7px",
                        fontSize: "11px",
                        fontWeight: 700,
                        fontFamily: "system-ui",
                        cursor: "pointer",
                        border: "none",
                        background: btn.bg,
                        color: btn.color,
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "1px",
                  background: "rgba(255,255,255,.06)",
                  borderBottom: "1px solid rgba(255,255,255,.06)",
                }}
              >
                {[
                  { dot: C.red, val: "P0", label: "Severity", valColor: C.red },
                  { dot: C.red, val: "1", label: "Route Down", valColor: C.red },
                  { dot: C.amber, val: "8–12", label: "Schools Affected", valColor: C.amber },
                  { dot: C.mint, val: "Engaged", label: "On-Call", valColor: C.mint },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    style={{ background: C.bg, padding: "14px 20px", display: "flex", gap: "8px", alignItems: "center" }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cell.dot, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: cell.valColor }}>{cell.val}</div>
                      <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "rgba(255,255,255,.3)" }}>
                        {cell.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Body */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", minHeight: "580px" }}>
                {/* Main */}
                <div style={{ padding: "20px 24px", borderRight: `1px solid ${C.border}` }}>
                  {/* Meta chips */}
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {[
                      { label: "Route", val: "Assignment Engine", valColor: C.text },
                      { label: "Started", val: "Today 6:10 AM", valColor: C.text },
                      { label: "PagerDuty", val: "PD-4412", valColor: C.amber },
                      { label: "SLA deadline", val: "11:10 AM (1h rem)", valColor: C.amber },
                    ].map((chip) => (
                      <div
                        key={chip.label}
                        style={{
                          background: C.surface,
                          borderRadius: "6px",
                          padding: "6px 10px",
                          border: `1px solid ${C.border}`,
                        }}
                      >
                        <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,.25)", letterSpacing: ".04em" }}>
                          {chip.label}
                        </div>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: chip.valColor, marginTop: "1px" }}>
                          {chip.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline header */}
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      color: "rgba(255,255,255,.3)",
                      marginBottom: "12px",
                      paddingBottom: "6px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    Incident Timeline
                  </div>

                  {/* Timeline */}
                  <div
                    style={{
                      background: C.surface,
                      borderRadius: "12px",
                      padding: "16px 18px",
                      marginBottom: "14px",
                      border: "1px solid rgba(255,255,255,.05)",
                    }}
                  >
                    {TIMELINE.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "12px",
                          padding: "10px 0",
                          borderBottom: i < TIMELINE.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: item.dot,
                            marginTop: "4px",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,.75)" }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: "11px", color: "rgba(255,255,255,.45)", marginTop: "2px", lineHeight: 1.4 }}>
                            {item.sub}
                          </div>
                        </div>
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,.25)", flexShrink: 0 }}>
                          {item.time}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add update form */}
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      color: "rgba(255,255,255,.3)",
                      marginBottom: "12px",
                      paddingBottom: "6px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    Add Update
                  </div>
                  <div
                    style={{
                      background: C.surface,
                      borderRadius: "10px",
                      padding: "14px 16px",
                      border: "1px solid rgba(255,255,255,.05)",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,.3)", letterSpacing: ".06em", marginBottom: "8px" }}>
                      Post Incident Update
                    </div>
                    <textarea
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      placeholder="Describe investigation progress, findings, or next steps. This posts to #incidents Slack automatically…"
                      style={{
                        width: "100%",
                        background: C.bg,
                        border: "1px solid rgba(255,255,255,.1)",
                        borderRadius: "6px",
                        padding: "8px 10px",
                        fontSize: "12px",
                        color: C.text,
                        fontFamily: "system-ui",
                        resize: "none",
                        height: "70px",
                        outline: "none",
                      }}
                    />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button
                        style={{
                          padding: "7px 14px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          fontFamily: "system-ui",
                          cursor: "pointer",
                          border: "none",
                          background: C.mint,
                          color: C.bgDeep,
                        }}
                      >
                        Post Update
                      </button>
                      <button
                        style={{
                          padding: "7px 14px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 700,
                          fontFamily: "system-ui",
                          cursor: "pointer",
                          border: `1px solid rgba(80,232,144,.2)`,
                          background: "rgba(80,232,144,.12)",
                          color: C.mint,
                        }}
                      >
                        Resolve Incident
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div style={{ padding: "18px 20px" }}>
                  {/* Affected routes */}
                  <div
                    style={{
                      background: C.surface,
                      borderRadius: "10px",
                      padding: "14px 16px",
                      marginBottom: "12px",
                      border: "1px solid rgba(248,81,73,.15)",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "rgba(248,81,73,.6)", letterSpacing: ".06em", marginBottom: "8px" }}>
                      Affected Routes
                    </div>
                    {AFFECTED_ROUTES.map((route) => (
                      <div
                        key={route.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "5px 0",
                          borderBottom: "1px solid rgba(255,255,255,.04)",
                        }}
                      >
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: route.dot, flexShrink: 0 }} />
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,.6)", flex: 1 }}>{route.name}</div>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "3px",
                            background: route.statusBg,
                            color: route.statusColor,
                          }}
                        >
                          {route.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* On-call team */}
                  <div
                    style={{
                      background: C.surface,
                      borderRadius: "10px",
                      padding: "14px 16px",
                      marginBottom: "12px",
                      border: "1px solid rgba(255,255,255,.05)",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,.3)", letterSpacing: ".06em", marginBottom: "8px" }}>
                      On-Call Team
                    </div>
                    {ON_CALL.map((person) => (
                      <div
                        key={person.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "5px 0",
                          borderBottom: "1px solid rgba(255,255,255,.04)",
                        }}
                      >
                        <div
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                            flexShrink: 0,
                            background: person.avatarBg,
                            color: person.avatarColor,
                          }}
                        >
                          {person.initial}
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(255,255,255,.7)", flex: 1 }}>{person.name}</div>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "1px 5px",
                            borderRadius: "3px",
                            background: person.statusBg,
                            color: person.statusColor,
                          }}
                        >
                          {person.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Teacher status page */}
                  <div
                    style={{
                      background: C.surface,
                      borderRadius: "10px",
                      padding: "14px 16px",
                      border: "1px solid rgba(255,255,255,.05)",
                    }}
                  >
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,.3)", letterSpacing: ".06em", marginBottom: "8px" }}>
                      Teacher Status Page
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>
                      Platform status page auto-updated: "We are currently investigating an issue affecting some features. Play sessions continue to work normally." Refresh on resolve.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════════ ALL CLEAR ════════════════ */}
          {tab === "clear" && (
            <>
              {/* Clear header */}
              <div
                style={{
                  background: C.bgDeep,
                  borderBottom: "1px solid rgba(80,232,144,.15)",
                  padding: "0 24px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: C.mint }} />
                  <div style={{ fontSize: "13px", fontWeight: 800, color: C.text }}>All Systems Operational</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>
                    No active incidents · Last incident resolved 7d ago
                  </div>
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.red, cursor: "pointer" }}>
                  + Declare Incident
                </div>
              </div>

              {/* Status strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,1fr)",
                  gap: "1px",
                  background: "rgba(255,255,255,.06)",
                  borderBottom: "1px solid rgba(255,255,255,.06)",
                }}
              >
                {[
                  { val: "0", label: "Active Incidents" },
                  { val: "10", label: "Routes Healthy" },
                  { val: "99.8%", label: "30d Uptime" },
                  { val: "4", label: "Incidents 30d" },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    style={{ background: C.bg, padding: "14px 20px", display: "flex", gap: "8px", alignItems: "center" }}
                  >
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.mint, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 900, color: C.mint }}>{cell.val}</div>
                      <div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "rgba(255,255,255,.3)" }}>
                        {cell.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Incident history */}
              <div style={{ padding: "20px 24px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    color: "rgba(255,255,255,.3)",
                    marginBottom: "12px",
                    paddingBottom: "6px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  Incident History — Last 30 Days
                </div>
                <div
                  style={{
                    background: C.surface,
                    borderRadius: "12px",
                    padding: "16px 18px",
                    border: "1px solid rgba(255,255,255,.05)",
                  }}
                >
                  {HISTORY.map((h, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "8px",
                        padding: "8px 0",
                        borderBottom: i < HISTORY.length - 1 ? "1px solid rgba(255,255,255,.04)" : "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: "3px",
                          flexShrink: 0,
                          marginTop: "1px",
                          background: h.sevBg,
                          color: h.sevColor,
                        }}
                      >
                        {h.sev}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,.7)" }}>{h.title}</div>
                        <div style={{ fontSize: "10px", color: "rgba(255,255,255,.3)", marginTop: "1px" }}>{h.meta}</div>
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: h.ttrColor, flexShrink: 0 }}>
                        {h.ttr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════════════════ POST-INCIDENT ════════════════ */}
          {tab === "resolved" && (
            <>
              {/* Resolved header */}
              <div
                style={{
                  background: C.bgDeep,
                  borderBottom: "1px solid rgba(80,232,144,.15)",
                  padding: "0 24px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: C.mint }} />
                  <div style={{ fontSize: "13px", fontWeight: 800, color: C.text }}>
                    Incident Resolved — All Systems Operational
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>
                    PD-4412 closed · Post-mortem scheduled
                  </div>
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.violet, cursor: "pointer" }}>
                  Schedule Post-Mortem →
                </div>
              </div>

              {/* Post-incident summary */}
              <div style={{ padding: "20px 24px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    color: "rgba(255,255,255,.3)",
                    marginBottom: "12px",
                    paddingBottom: "6px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  Post-Incident Summary — PD-4412
                </div>
                <div
                  style={{
                    background: C.surface,
                    borderRadius: "12px",
                    padding: "18px 20px",
                    marginBottom: "14px",
                    border: "1px solid rgba(80,232,144,.12)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: C.mint }}>
                      ✅ Incident Resolved
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,.3)" }}>
                      Today 11:30 AM · Resolved after 5h 20m
                    </div>
                  </div>
                  {POST_INCIDENT.map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        fontSize: "12px",
                        borderBottom: "1px solid rgba(255,255,255,.04)",
                      }}
                    >
                      <div style={{ color: "rgba(255,255,255,.5)" }}>{row.label}</div>
                      <div style={{ color: row.valColor, fontWeight: 700 }}>{row.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </AppFrame>
  );
}
