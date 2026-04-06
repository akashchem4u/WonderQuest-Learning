"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  bg: "#0d1117", surface: "#161b22", border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff", muted: "rgba(255,255,255,0.4)",
  violet: "#9b72ff", mint: "#50e890", gold: "#ffd166", coral: "#ff7b6b",
  amber: "#f59e0b",
};

type ExperimentStatus = "active" | "beta" | "disabled";

const EXPERIMENTS: Array<{
  key: string;
  label: string;
  description: string;
  status: ExperimentStatus;
}> = [
  {
    key: "OPENAI_QUESTION_GENERATION_ENABLED",
    label: "AI Question Generation",
    description: "Generate questions using OpenAI when the question bank is insufficient",
    status: "active",
  },
  {
    key: "live_question_generation",
    label: "Live Question Generation",
    description: "Real-time AI question generation per session",
    status: "active",
  },
  {
    key: "mastery_tracking",
    label: "Mastery Tracking",
    description: "Track and surface skill mastery rates per student",
    status: "active",
  },
  {
    key: "intervention_auto_queue",
    label: "Auto Interventions",
    description: "Automatically queue interventions for at-risk students",
    status: "beta",
  },
  {
    key: "parent_notifications",
    label: "Parent Notifications",
    description: "Push milestone and session notifications to parents",
    status: "beta",
  },
];

const STATUS_STYLES: Record<ExperimentStatus, { bg: string; border: string; color: string; label: string }> = {
  active: { bg: "rgba(80,232,144,0.12)", border: "rgba(80,232,144,0.3)", color: "#50e890", label: "ACTIVE" },
  beta: { bg: "rgba(255,209,102,0.12)", border: "rgba(255,209,102,0.3)", color: "#ffd166", label: "BETA" },
  disabled: { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.35)", label: "OFF" },
};

const DOT_COLORS: Record<ExperimentStatus, string> = {
  active: "#50e890",
  beta: "#ffd166",
  disabled: "rgba(255,255,255,0.2)",
};

type HealthData = { ok: boolean } | null;
type OverviewCounts = {
  students: number;
  sessions: number;
  exampleItems: number;
} | null;

export default function OwnerExperimentsPage() {
  const [health, setHealth] = useState<HealthData>(null);
  const [counts, setCounts] = useState<OverviewCounts>(null);
  const [nodeEnv] = useState(process.env.NODE_ENV ?? "unknown");

  useEffect(() => {
    // Fetch overview for context counts
    fetch("/api/owner/overview")
      .then((r) => r.ok ? r.json() : null)
      .then((d: { counts?: OverviewCounts } | null) => {
        if (d?.counts) {
          setCounts(d.counts as OverviewCounts);
        }
      })
      .catch(() => {});

    // Health check
    fetch("/api/health")
      .then((r) => setHealth({ ok: r.ok }))
      .catch(() => setHealth({ ok: false }));
  }, []);

  const activeCount = EXPERIMENTS.filter((e) => e.status === "active").length;
  const betaCount = EXPERIMENTS.filter((e) => e.status === "beta").length;

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 32px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/owner" style={{ fontSize: 12, color: "rgba(155,114,255,0.7)", textDecoration: "none", fontWeight: 600 }}>← Owner</Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px" }}>Experiments & Feature Flags</h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 24px" }}>
          Active features and runtime configuration for this build
        </p>

        {/* Summary counts */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
          {[
            { val: EXPERIMENTS.length, lbl: "Total Flags", color: C.violet },
            { val: activeCount, lbl: "Active", color: C.mint },
            { val: betaCount, lbl: "Beta", color: C.gold },
          ].map(({ val, lbl, color }) => (
            <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", flex: "1 1 100px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
            </div>
          ))}
          {counts && [
            { val: counts.students, lbl: "Students affected", color: C.violet },
            { val: counts.sessions, lbl: "Sessions in corpus", color: C.mint },
            { val: counts.exampleItems, lbl: "Bank questions", color: C.gold },
          ].map(({ val, lbl, color }) => (
            <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", flex: "1 1 100px" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Feature flag cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {EXPERIMENTS.map((exp) => {
            const badge = STATUS_STYLES[exp.status];
            const dotColor = DOT_COLORS[exp.status];
            const isOn = exp.status !== "disabled";
            return (
              <div key={exp.key} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                {/* Status dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: dotColor, flexShrink: 0, marginTop: 4,
                  boxShadow: isOn ? `0 0 6px ${dotColor}` : "none",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{exp.label}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{exp.description}</div>
                  <div style={{ fontSize: 10, color: "rgba(155,114,255,0.6)", fontFamily: "monospace" }}>{exp.key}</div>
                </div>
                {/* Toggle (visual only) */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 18, borderRadius: 9,
                    background: isOn ? (exp.status === "beta" ? "rgba(255,209,102,0.25)" : "rgba(80,232,144,0.25)") : "rgba(255,255,255,0.1)",
                    border: `1px solid ${isOn ? (exp.status === "beta" ? "rgba(255,209,102,0.4)" : "rgba(80,232,144,0.4)") : "rgba(255,255,255,0.15)"}`,
                    position: "relative", cursor: "default",
                  }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: isOn ? (exp.status === "beta" ? C.gold : C.mint) : "rgba(255,255,255,0.3)",
                      position: "absolute", top: 2,
                      left: isOn ? 16 : 2,
                      transition: "left 0.2s",
                    }} />
                  </div>
                  <div style={{ background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, color: badge.color }}>
                    {badge.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Environment info */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 12 }}>
            Environment
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: C.muted, width: 120, flexShrink: 0 }}>NODE_ENV</span>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: nodeEnv === "production" ? C.mint : C.gold, fontWeight: 700 }}>
                {nodeEnv}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: C.muted, width: 120, flexShrink: 0 }}>DB connection</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: health === null ? C.amber : health.ok ? C.mint : C.coral,
                  boxShadow: `0 0 4px ${health === null ? C.amber : health.ok ? C.mint : C.coral}`,
                }} />
                <span style={{ fontSize: 11, color: health === null ? C.amber : health.ok ? C.mint : C.coral, fontWeight: 700 }}>
                  {health === null ? "checking…" : health.ok ? "connected" : "error"}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: C.muted, width: 120, flexShrink: 0 }}>Last deploy</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>—</span>
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
