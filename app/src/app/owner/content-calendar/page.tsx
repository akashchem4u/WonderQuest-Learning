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

const WEEKS: WeekPlan[] = [
  {
    weekOf: "Apr 6–12",
    weekLabel: "This Week",
    questionsReleasing: 48,
    bandTargets: ["P0", "P1", "P2"],
    themeFocus: "Space & Planets",
    highlight: "🚀 Space Pack launch — Planet Patrol goes live Apr 7",
  },
  {
    weekOf: "Apr 13–19",
    weekLabel: "Week 2",
    questionsReleasing: 32,
    bandTargets: ["P2", "P3"],
    themeFocus: "Community Helpers",
    highlight: "P3 Social Studies Quest Batch — curriculum-aligned",
  },
  {
    weekOf: "Apr 20–26",
    weekLabel: "Week 3",
    questionsReleasing: 56,
    bandTargets: ["P0", "P1", "P2", "P3"],
    themeFocus: "Reading Foundations Q2",
    highlight: "🔖 Largest batch of Q2 — P0 priority reading block",
  },
  {
    weekOf: "Apr 27–May 3",
    weekLabel: "Week 4",
    questionsReleasing: 24,
    bandTargets: ["P1", "P2"],
    themeFocus: "Creative Arts — Sketch Lab",
    highlight: "Arts pack pending child safety review before go",
  },
];

const BATCHES: ContentBatch[] = [
  { id: "CB-041", name: "Space Pack — Planet Patrol", band: "P0–P2", questions: 48, status: "Approved", owner: "Maya Chen", targetRelease: "Apr 7, 2026", version: "v2.5.1" },
  { id: "CB-042", name: "P3 Social Studies Quest Batch", band: "P3", questions: 32, status: "Review", owner: "Jordan Lee", targetRelease: "Apr 14, 2026", version: "v2.5.2" },
  { id: "CB-043", name: "Reading Foundations Q2 — P0 Block", band: "P0", questions: 30, status: "Approved", owner: "Maya Chen", targetRelease: "Apr 22, 2026", version: "v2.5.4" },
  { id: "CB-044", name: "Reading Foundations Q2 — P1–P3 Extension", band: "P1–P3", questions: 26, status: "Review", owner: "Sam Rivera", targetRelease: "Apr 22, 2026", version: "v2.5.4" },
  { id: "CB-045", name: "Arts Pack — Sketch Lab", band: "P1–P2", questions: 24, status: "Review", owner: "Jordan Lee", targetRelease: "Apr 28, 2026", version: "v2.5.5" },
  { id: "CB-046", name: "Ocean Adventure — Deep Sea Pack", band: "P0–P2", questions: 40, status: "Draft", owner: "Priya Nair", targetRelease: "May 6, 2026", version: "v2.6.1" },
  { id: "CB-047", name: "Math Mastery Q2 — Addition & Subtraction", band: "P1–P2", questions: 44, status: "Draft", owner: "Sam Rivera", targetRelease: "May 13, 2026", version: "v2.6.2" },
  { id: "CB-048", name: "Science Explorers — Weather & Seasons", band: "P2–P3", questions: 36, status: "Draft", owner: "Priya Nair", targetRelease: "May 20, 2026", version: "v2.6.3" },
  { id: "CB-049", name: "Phonics Sprint — P0 Intensive", band: "P0", questions: 50, status: "Draft", owner: "Maya Chen", targetRelease: "Jun 2, 2026", version: "v2.7.0" },
  { id: "CB-050", name: "End-of-Year Review Pack — All Bands", band: "P0–P5", questions: 80, status: "Draft", owner: "Jordan Lee", targetRelease: "Jun 15, 2026", version: "v2.7.2" },
];

// Calculate next release
const nextRelease = BATCHES.find((b) => b.status === "Approved");
const daysToNextRelease = 1;

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
