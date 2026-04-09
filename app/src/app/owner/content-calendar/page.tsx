import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

const C = {
  base: "#0d1117",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  accent: "#50e890",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  red: "#f85149",
  amber: "#f0a030",
  blue: "#38bdf8",
  violet: "#a78bfa",
};

type BatchStatus = "Draft" | "Review" | "Approved" | "Live";

interface WeekPlan {
  weekOf: string;
  weekLabel: string;
  questionsReleasing: number;
  bandTargets: string[];
  themeFocus: string;
  highlight?: string;
}

interface ContentBatch {
  id: string;
  name: string;
  band: string;
  questions: number;
  status: BatchStatus;
  owner: string;
  targetRelease: string;
  version: string;
}

const statusColor: Record<BatchStatus, string> = {
  Draft: C.muted,
  Review: C.amber,
  Approved: C.accent,
  Live: C.blue,
};

const statusBg: Record<BatchStatus, string> = {
  Draft: "rgba(255,255,255,0.06)",
  Review: "rgba(240,160,48,0.12)",
  Approved: "rgba(80,232,144,0.12)",
  Live: "rgba(56,189,248,0.12)",
};

const WEEKS: WeekPlan[] = [];

const BATCHES: ContentBatch[] = [];

// Calculate next release
const nextRelease = BATCHES.find((b) => b.status === "Approved");
const daysToNextRelease = 0;

// Stats
const liveCount = BATCHES.filter((b) => b.status === "Live").length;
const approvedCount = BATCHES.filter((b) => b.status === "Approved").length;
const reviewCount = BATCHES.filter((b) => b.status === "Review").length;
const draftCount = BATCHES.filter((b) => b.status === "Draft").length;

export default async function ContentCalendarPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  return (
    <AppFrame audience="owner" currentPath="/owner/content-calendar">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        {!allowed ? (
          <OwnerGate configured={configured} />
        ) : (
          <div style={{ maxWidth: 1100 }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>📅 Content Calendar</h1>
              <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Scheduled releases and content pipeline</p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Live", value: liveCount, color: C.blue, bg: "rgba(56,189,248,0.08)" },
                { label: "Approved", value: approvedCount, color: C.accent, bg: "rgba(80,232,144,0.08)" },
                { label: "In Review", value: reviewCount, color: C.amber, bg: "rgba(240,160,48,0.08)" },
                { label: "Draft", value: draftCount, color: C.muted, bg: "rgba(255,255,255,0.04)" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{ background: s.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px" }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Next Release countdown */}
            {nextRelease && (
              <div
                style={{
                  background: "rgba(80,232,144,0.06)",
                  border: `1px solid rgba(80,232,144,0.2)`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 28,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span style={{ fontSize: 22 }}>🚀</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 2 }}>
                    Next Release — {nextRelease.targetRelease}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {nextRelease.name} · {nextRelease.band} · {nextRelease.questions} questions · {nextRelease.version}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.accent }}>{daysToNextRelease}d</div>
                  <div style={{ fontSize: 11, color: C.muted }}>until release</div>
                </div>
              </div>
            )}

            {/* Weekly Calendar Strips */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 14 }}>
                4-Week Content Schedule
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {WEEKS.map((week, idx) => (
                  <div
                    key={week.weekOf}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      background: C.surface,
                      border: `1px solid ${idx === 0 ? "rgba(80,232,144,0.2)" : C.border}`,
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    {/* Week label strip */}
                    <div
                      style={{
                        width: 110,
                        flexShrink: 0,
                        background: idx === 0 ? "rgba(80,232,144,0.06)" : "rgba(255,255,255,0.02)",
                        borderRight: `1px solid ${C.border}`,
                        padding: "14px 16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: idx === 0 ? C.accent : C.muted, marginBottom: 2 }}>
                        {week.weekLabel}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted }}>{week.weekOf}</div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{week.themeFocus}</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: "rgba(80,232,144,0.1)",
                            color: C.accent,
                          }}
                        >
                          {week.questionsReleasing} Qs
                        </span>
                        <div style={{ display: "flex", gap: 5 }}>
                          {week.bandTargets.map((b) => (
                            <span
                              key={b}
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: "rgba(167,139,250,0.1)",
                                color: C.violet,
                              }}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                      {week.highlight && (
                        <div style={{ fontSize: 12, color: C.muted }}>{week.highlight}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Status Table */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 32, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Content Pipeline</span>
                <span style={{ fontSize: 11, color: C.muted, marginLeft: 10 }}>Q2 2026 — quarterly view</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Batch", "Band", "Questions", "Status", "Owner", "Target Release", "Version"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 16px",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            color: C.muted,
                            textAlign: "left",
                            borderBottom: `1px solid ${C.border}`,
                            background: "rgba(255,255,255,0.02)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {BATCHES.map((batch, idx) => (
                      <tr key={batch.id} style={{ borderBottom: idx < BATCHES.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{batch.name}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{batch.id}</div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.violet, fontWeight: 600 }}>{batch.band}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.text, textAlign: "center" }}>{batch.questions}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "3px 10px",
                              borderRadius: 10,
                              background: statusBg[batch.status],
                              color: statusColor[batch.status],
                            }}
                          >
                            {batch.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{batch.owner}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{batch.targetRelease}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted, fontFamily: "monospace" }}>{batch.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 20, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
              <Link href="/owner/release-calendar" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
                Release Calendar
              </Link>
              <Link href="/owner/content-health" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
                Content Health
              </Link>
              <Link href="/owner" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
                Owner Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
