import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Palette ──────────────────────────────────────────────────────────────────
const BASE = "#100b2e";
const MINT = "#50e890";
const VIOLET = "#9b72ff";
const RED = "#f85149";
const AMBER = "#f59e0b";
const BLUE = "#2563eb";
const SURFACE = "#161b22";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT = "#f0f6ff";
const MUTED = "rgba(255,255,255,0.4)";

// ── Stub data ─────────────────────────────────────────────────────────────────

type FbStatus = "open" | "review" | "resolved";
type FbPriority = "P0" | "P1" | "P2" | "Feature";

interface FeedbackItem {
  id: string;
  priority: FbPriority;
  type: string;
  timeAgo: string;
  summary: string;
  school: string;
  screen: string;
  status: FbStatus;
  statusLabel: string;
  severity: string;
  body: string;
  upvotes?: number;
  history: { time: string; text: string }[];
  productNote?: string;
  upvotedBy?: string;
}

const FEEDBACK_ITEMS: FeedbackItem[] = [
  {
    id: "fb-001",
    priority: "P1",
    type: "Bug",
    timeAgo: "2h ago",
    summary: "Mastery bar not updating after session ends",
    school: "Maple Ridge Elementary",
    screen: "Student detail page",
    status: "review",
    statusLabel: "Under review",
    severity: "Moderate severity",
    body: "I viewed Jordan's profile after their session ended but the mastery bar for Long Division still shows the old value. Refreshing the page fixes it but the stale state is confusing. Happened twice this week on the same student's profile.",
    history: [
      { time: "9:14am", text: "Feedback submitted by teacher at Maple Ridge Elementary" },
      { time: "9:22am", text: "Auto-triaged: P1 (Moderate severity bug · Teacher portal). Slack alert sent to #engineering." },
      { time: "10:08am", text: "Kavya R. confirmed bug — cache invalidation missing on session_end event. Fix in progress." },
      { time: "11:05am", text: "Status set to Under review by Avi M." },
    ],
  },
  {
    id: "fb-002",
    priority: "Feature",
    type: "Request",
    timeAgo: "Mar 18",
    summary: "Export class progress as PDF for parent-teacher conferences",
    school: "Sunnybrook K-5",
    screen: "Command center",
    status: "review",
    statusLabel: "In review · Product team",
    severity: "Enhancement",
    body: "Would love a printable one-page class summary I can bring to parent-teacher night. Ideally: student name, band, current skills in progress, streak, and a mastery trend. Parents love having something tangible. Could also use it for my own planning.",
    upvotes: 12,
    productNote: "This is the #3 most upvoted feature request this month. 12 teachers from 8 schools. Already in Q2 roadmap (teacher-class-summary PDF export). Targeting April release.",
    upvotedBy: "12 teachers across 8 schools · Sunnybrook K-5 (3) · Maple Ridge (2) · Lincoln Park (2) · 5 others",
    history: [
      { time: "Mar 18", text: "Feature request submitted by teacher at Sunnybrook K-5" },
      { time: "Mar 19", text: "Auto-triaged: Feature request. Added to monthly review queue." },
      { time: "Mar 21", text: "12 upvotes collected across 8 schools. Added to Q2 roadmap." },
    ],
  },
  {
    id: "fb-003",
    priority: "P2",
    type: "Content",
    timeAgo: "Mar 10",
    summary: "Ambiguous diagram in P2 Fractions: Comparing question set",
    school: "Lincoln Park Primary",
    screen: "Play session",
    status: "review",
    statusLabel: "Curriculum review",
    severity: "Low severity",
    body: "The diagram in question 4 of the Fractions Comparing set shows two bars of nearly identical length — students are confused which is larger. Multiple students in my class asked for help on this specific question. Suggest redrawing with a clearer visual ratio.",
    history: [
      { time: "Mar 10", text: "Content feedback submitted by teacher at Lincoln Park Primary" },
      { time: "Mar 11", text: "Auto-triaged: P2 content issue. Routed to curriculum team for review." },
      { time: "Mar 12", text: "Curriculum team confirmed diagram ambiguity. Redraw scheduled." },
    ],
  },
];

// ── Priority badge styles ─────────────────────────────────────────────────────

function priorityStyle(p: FbPriority): React.CSSProperties {
  if (p === "P0") return { background: RED, color: "#fff" };
  if (p === "P1") return { background: AMBER, color: "#1a1440" };
  if (p === "P2") return { background: BLUE, color: "#fff" };
  return { background: "rgba(80,232,144,0.2)", color: MINT };
}

function statusStyle(s: FbStatus): React.CSSProperties {
  if (s === "open") return { background: "rgba(245,158,11,0.15)", color: AMBER };
  if (s === "review") return { background: "rgba(37,99,235,0.2)", color: "#60a5fa" };
  return { background: "rgba(80,232,144,0.15)", color: MINT };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function OwnerFeedbackPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  if (!allowed) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <OwnerGate configured={configured} />
      </AppFrame>
    );
  }

  const openCount = FEEDBACK_ITEMS.length;
  const activeItem = FEEDBACK_ITEMS[0];

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main
        style={{
          minHeight: "100vh",
          background: BASE,
          fontFamily: "system-ui,-apple-system,sans-serif",
          paddingBottom: 48,
        }}
      >
        {/* ── Top header bar ──────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(1,4,9,0.97)",
            borderBottom: `1px solid ${BORDER}`,
            padding: "0 28px",
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: TEXT }}>
              WQ <span style={{ color: MINT }}>Console</span>
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: TEXT,
                letterSpacing: "0.04em",
              }}
            >
              💬 Feedback Workbench
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                background: AMBER,
                color: "#1a1440",
                borderRadius: 4,
                padding: "1px 6px",
              }}
            >
              {openCount} open
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link
              href="/owner"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: VIOLET,
                textDecoration: "none",
              }}
            >
              ← Dashboard
            </Link>
            <Link
              href="/owner/routes"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: MUTED,
                textDecoration: "none",
              }}
            >
              Route Health
            </Link>
            <Link
              href="/owner/release"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: MUTED,
                textDecoration: "none",
              }}
            >
              Release Gate
            </Link>
          </div>
        </div>

        {/* ── 2-panel workbench ────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            maxWidth: 1100,
            margin: "0 auto",
            minHeight: "calc(100vh - 52px)",
          }}
        >
          {/* ── Left: queue ─────────────────────────────────────────────── */}
          <div
            style={{
              width: 320,
              borderRight: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Queue header + filters */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: TEXT,
                  marginBottom: 10,
                }}
              >
                Feedback Queue{" "}
                <span style={{ color: MUTED, fontWeight: 400 }}>
                  ({openCount} open)
                </span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(
                  [
                    { label: "All open", active: true, tone: "mint" },
                    { label: "P0/P1", active: false, tone: "red" },
                    { label: "Bugs", active: false, tone: "muted" },
                    { label: "Features", active: false, tone: "muted" },
                  ] as const
                ).map((f) => (
                  <span
                    key={f.label}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background:
                        f.tone === "mint"
                          ? MINT
                          : f.tone === "red"
                            ? "rgba(248,81,73,0.2)"
                            : "rgba(255,255,255,0.07)",
                      color:
                        f.tone === "mint"
                          ? "#010409"
                          : f.tone === "red"
                            ? RED
                            : MUTED,
                    }}
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Feedback list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {FEEDBACK_ITEMS.map((item, idx) => {
                const isActive = idx === 0;
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "11px 14px",
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                      cursor: "pointer",
                      background: isActive
                        ? "rgba(80,232,144,0.06)"
                        : "transparent",
                      borderLeft: isActive ? `3px solid ${MINT}` : "3px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          ...priorityStyle(item.priority),
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "1px 5px",
                          borderRadius: 4,
                        }}
                      >
                        {item.priority}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: "rgba(255,255,255,0.3)",
                          fontWeight: 700,
                        }}
                      >
                        {item.type}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: "rgba(255,255,255,0.2)",
                          marginLeft: "auto",
                        }}
                      >
                        {item.timeAgo}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.3,
                        marginBottom: 4,
                      }}
                    >
                      {item.summary}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.25)",
                        marginBottom: 5,
                      }}
                    >
                      {item.school} · {item.screen}
                    </div>
                    <span
                      style={{
                        ...statusStyle(item.status),
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {item.statusLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: detail panel ──────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 24px",
              background: BASE,
            }}
          >
            {/* Detail header card */}
            <div
              style={{
                background: SURFACE,
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 14,
                border: `1px solid rgba(255,255,255,0.05)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    ...priorityStyle(activeItem.priority),
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "1px 6px",
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {activeItem.priority} {activeItem.type}
                </span>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: TEXT,
                    lineHeight: 1.3,
                  }}
                >
                  {activeItem.summary} ({activeItem.screen})
                </div>
              </div>

              {/* Meta chips */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                {(
                  [
                    {
                      label: activeItem.school,
                      bg: "rgba(255,255,255,0.08)",
                      color: MUTED,
                    },
                    {
                      label: activeItem.screen,
                      bg: "rgba(37,99,235,0.15)",
                      color: "#60a5fa",
                    },
                    {
                      label: activeItem.severity,
                      bg: "rgba(245,158,11,0.15)",
                      color: AMBER,
                    },
                    {
                      label: `Submitted ${activeItem.timeAgo}`,
                      bg: "rgba(255,255,255,0.06)",
                      color: MUTED,
                    },
                  ] as const
                ).map((chip) => (
                  <span
                    key={chip.label}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 5,
                      background: chip.bg,
                      color: chip.color,
                    }}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>

              {/* Feedback body */}
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  border: `1px solid rgba(255,255,255,0.05)`,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{activeItem.body}&rdquo;
              </div>
            </div>

            {/* Product note (feature requests) */}
            {activeItem.productNote && (
              <div
                style={{
                  background: SURFACE,
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 12,
                  border: `1px solid rgba(80,232,144,0.15)`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: MINT,
                    marginBottom: 4,
                  }}
                >
                  PRODUCT NOTE — Avi M.
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.4,
                  }}
                >
                  {activeItem.productNote}
                </div>
              </div>
            )}

            {/* Action row */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              {(
                [
                  {
                    label: "✓ Mark resolved",
                    bg: MINT,
                    color: "#010409",
                    border: "none",
                  },
                  {
                    label: "↑ Bump to P0",
                    bg: BLUE,
                    color: "#fff",
                    border: "none",
                  },
                  {
                    label: "🔔 Escalate to on-call",
                    bg: "rgba(248,81,73,0.15)",
                    color: RED,
                    border: `1px solid rgba(248,81,73,0.3)`,
                  },
                  {
                    label: "✕ Won't fix",
                    bg: "rgba(255,255,255,0.07)",
                    color: MUTED,
                    border: "none",
                  },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.label}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "system-ui",
                    background: btn.bg,
                    color: btn.color,
                    border: btn.border ?? "none",
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Reply to teacher */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: MUTED,
                  marginBottom: 6,
                }}
              >
                Reply to teacher (delivered via platform notification)
              </div>
              <textarea
                readOnly
                value={
                  "Thanks for flagging this — confirmed. The mastery score is cached client-side and not invalidated after a session closes. We're pushing a fix in today's build (#248). You should see accurate mastery on refresh after 6pm."
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  background: SURFACE,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "system-ui",
                  color: "rgba(255,255,255,0.7)",
                  resize: "none",
                  minHeight: 72,
                  outline: "none",
                  display: "block",
                }}
              />
              <button
                style={{
                  marginTop: 6,
                  padding: "6px 14px",
                  background: MINT,
                  color: "#010409",
                  border: "none",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "system-ui",
                }}
              >
                Send reply
              </button>
            </div>

            {/* Upvoted by */}
            {activeItem.upvotedBy && (
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: MUTED,
                    marginBottom: 6,
                  }}
                >
                  Upvoted by
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.8,
                  }}
                >
                  {activeItem.upvotedBy}
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: MUTED,
                  marginBottom: 8,
                }}
              >
                History
              </div>
              {activeItem.history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: "6px 0",
                    borderBottom:
                      i < activeItem.history.length - 1
                        ? `1px solid rgba(255,255,255,0.04)`
                        : "none",
                    fontSize: 11,
                  }}
                >
                  <div
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      flexShrink: 0,
                      width: 70,
                    }}
                  >
                    {h.time}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      flex: 1,
                      lineHeight: 1.4,
                    }}
                  >
                    {h.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Priority auto-triage spec callout */}
            <div
              style={{
                marginTop: 32,
                background: SURFACE,
                borderRadius: 10,
                padding: "14px 16px",
                border: `1px solid rgba(255,255,255,0.05)`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: MUTED,
                  marginBottom: 10,
                }}
              >
                Priority Auto-triage Rules
              </div>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 11,
                }}
              >
                <thead>
                  <tr>
                    {["Severity", "Auto P-level", "Slack alert", "SLA"].map(
                      (h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            padding: "4px 8px",
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "rgba(255,255,255,0.25)",
                            borderBottom: `1px solid rgba(255,255,255,0.06)`,
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Critical (platform unusable)", "P0", "#on-call immediate", "4h"],
                      ["Major (impacts teaching)", "P1", "#engineering", "24h"],
                      ["Moderate (workaround exists)", "P2", "None", "48h"],
                      ["Minor", "P3", "None", "1 week"],
                      ["Feature request", "Feature", "None", "Monthly review"],
                    ] as const
                  ).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          style={{
                            padding: "5px 8px",
                            fontSize: 10,
                            color: "rgba(255,255,255,0.5)",
                            borderBottom:
                              i < 4
                                ? `1px solid rgba(255,255,255,0.04)`
                                : "none",
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer nav */}
            <div
              style={{
                marginTop: 32,
                paddingTop: 16,
                borderTop: `1px solid ${BORDER}`,
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/owner"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: VIOLET,
                  textDecoration: "none",
                }}
              >
                ← Dashboard
              </Link>
              <Link
                href="/owner/routes"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: MUTED,
                  textDecoration: "none",
                }}
              >
                Route Health
              </Link>
              <Link
                href="/owner/release"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: MUTED,
                  textDecoration: "none",
                }}
              >
                Release Gate
              </Link>
              <Link
                href="/owner/analytics"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: MUTED,
                  textDecoration: "none",
                }}
              >
                Command Center
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
