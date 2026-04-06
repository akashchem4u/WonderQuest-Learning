import Link from "next/link";
import { AppFrame } from "@/components/app-frame";
import { ShellCard } from "@/components/ui";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { getOwnerOverview } from "@/lib/prototype-service";
import OwnerGate from "../owner-gate";

export const dynamic = "force-dynamic";

// ── Palette ─────────────────────────────────────────────────────────────────
const BASE = "#100b2e";
const MINT = "#58e8c1";
const VIOLET = "#9b72ff";
const GOLD = "#ffd166";
const CORAL = "#ff7b6b";

// ── Helpers ──────────────────────────────────────────────────────────────────

function urgencyColor(urgency: string): string {
  const u = urgency.toLowerCase();
  if (u === "critical") return CORAL;
  if (u === "high") return GOLD;
  if (u === "medium") return VIOLET;
  return MINT;
}

function urgencyBg(urgency: string): string {
  const u = urgency.toLowerCase();
  if (u === "critical") return "rgba(255,123,107,0.13)";
  if (u === "high") return "rgba(255,209,102,0.13)";
  if (u === "medium") return "rgba(155,114,255,0.13)";
  return "rgba(88,232,193,0.13)";
}

function categoryColor(category: string): string {
  const c = (category ?? "").toLowerCase();
  if (c === "bug") return CORAL;
  if (c === "content") return GOLD;
  if (c === "ux" || c === "ui") return VIOLET;
  if (c === "praise") return MINT;
  return "#bdcade";
}

function reviewStatusColor(status: string): string {
  if (status === "resolved") return MINT;
  if (status === "pending") return GOLD;
  if (status === "reviewed") return VIOLET;
  return "rgba(189,204,221,0.55)";
}

function reviewStatusBg(status: string): string {
  if (status === "resolved") return "rgba(88,232,193,0.13)";
  if (status === "pending") return "rgba(255,209,102,0.13)";
  if (status === "reviewed") return "rgba(155,114,255,0.13)";
  return "rgba(255,255,255,0.07)";
}

function routeLabel(target: string): string {
  if (target === "content") return "Content";
  if (target === "engineering") return "Engineering";
  return "Product";
}

function routeColor(target: string): string {
  if (target === "content") return GOLD;
  if (target === "engineering") return CORAL;
  return VIOLET;
}

function routeBg(target: string): string {
  if (target === "content") return "rgba(255,209,102,0.12)";
  if (target === "engineering") return "rgba(255,123,107,0.12)";
  return "rgba(155,114,255,0.12)";
}

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

// ── Static trend data (prototype — weekly resolution rate bars) ──────────────
const WEEKLY_TREND = [
  { week: "W1", rate: 68 },
  { week: "W2", rate: 74 },
  { week: "W3", rate: 71 },
  { week: "W4", rate: 82 },
  { week: "W5", rate: 79 },
  { week: "W6", rate: 88 },
];

const MAX_TREND_RATE = Math.max(...WEEKLY_TREND.map((w) => w.rate));

export default async function OwnerFeedbackPage() {
  const configured = isOwnerAccessConfigured();
  const unlocked = await hasOwnerAccess();

  if (!unlocked) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <main className="page-shell page-shell-split">
          <section className="page-hero">
            <div>
              <span className="eyebrow">Feedback</span>
              <h1>Sign in to view feedback analytics.</h1>
              <small>Protected console. Sign in with an existing owner code.</small>
            </div>
          </section>
          <ShellCard
            className="shell-card-emphasis"
            eyebrow="Owner"
            title="Existing owner sign-in"
          >
            <OwnerGate configured={configured} />
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  let overview: Awaited<ReturnType<typeof getOwnerOverview>> | null = null;
  let error = "";

  try {
    overview = await getOwnerOverview();
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Feedback data is not available.";
  }

  if (!overview) {
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <main className="page-shell owner-command-shell">
          <ShellCard eyebrow="Feedback" title="Dashboard data is not available">
            <p>{error || "Feedback analytics data is not available yet."}</p>
          </ShellCard>
        </main>
      </AppFrame>
    );
  }

  // ── Derived counts ───────────────────────────────────────────────────────
  const totalItems = overview.counts.feedbackItems;

  const pendingCount =
    overview.feedbackByReviewStatus.find((s) => s.reviewStatus === "pending")
      ?.count ?? 0;

  const resolvedCount =
    overview.feedbackByReviewStatus.find(
      (s) => s.reviewStatus === "resolved" || s.reviewStatus === "reviewed",
    )?.count ?? 0;

  const openBugs = overview.feedbackByCategory.find(
    (c) => c.category.toLowerCase() === "bug",
  )?.count ?? 0;

  const resolutionRate =
    totalItems > 0 ? Math.round((resolvedCount / totalItems) * 100) : 0;

  // ── Category breakdown (bug, content, ux, praise + rest) ─────────────────
  const knownCategories = ["bug", "content", "ux", "praise"];
  const allCategories = [
    ...overview.feedbackByCategory,
    ...knownCategories
      .filter(
        (c) =>
          !overview!.feedbackByCategory.find(
            (d) => d.category.toLowerCase() === c,
          ),
      )
      .map((c) => ({ category: c, count: 0 })),
  ];

  const categoryRows = knownCategories.map((key) => {
    const found = allCategories.find((c) => c.category.toLowerCase() === key);
    return {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      key,
      count: found?.count ?? 0,
    };
  });

  // ── Urgency distribution ─────────────────────────────────────────────────
  const urgencyLevels = ["critical", "high", "medium", "low"];
  const urgencyMap: Record<string, number> = {};
  for (const item of overview.recentFeedback) {
    const u = (item.urgency ?? "low").toLowerCase();
    urgencyMap[u] = (urgencyMap[u] ?? 0) + 1;
  }

  const urgencyRows = urgencyLevels.map((u) => ({
    label: u.charAt(0).toUpperCase() + u.slice(1),
    key: u,
    count: urgencyMap[u] ?? 0,
  }));

  const maxUrgencyCount = Math.max(...urgencyRows.map((u) => u.count), 1);

  // ── Pending items (top 5 unresolved) ────────────────────────────────────
  const pendingItems = overview.recentFeedback
    .filter((item) => item.reviewStatus !== "resolved")
    .slice(0, 5);

  // ── Stat tiles ───────────────────────────────────────────────────────────
  const statTiles = [
    {
      label: "Total Items",
      value: String(totalItems),
      sub: "all time",
      tone: "neutral",
    },
    {
      label: "Pending",
      value: String(pendingCount),
      sub: "needs action",
      tone: pendingCount > 3 ? "alert" : pendingCount > 0 ? "warn" : "good",
    },
    {
      label: "Resolved",
      value: String(resolvedCount),
      sub: `${resolutionRate}% resolved`,
      tone: "good",
    },
    {
      label: "Open Bugs",
      value: String(openBugs),
      sub: "bug category",
      tone: openBugs > 2 ? "alert" : openBugs > 0 ? "warn" : "good",
    },
  ] as const;

  const tileAccent = (tone: string): string => {
    if (tone === "good") return MINT;
    if (tone === "warn") return GOLD;
    if (tone === "alert") return CORAL;
    return "rgba(244,248,253,0.8)";
  };

  return (
    <AppFrame audience="owner" currentPath="/owner">
      <main
        className="page-shell owner-command-shell"
        style={{ paddingBottom: "48px" }}
      >
        {/* ── Back nav + Hero ──────────────────────────────────────────── */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "28px",
          }}
        >
          <Link
            href="/owner"
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "rgba(189,204,221,0.6)",
              textDecoration: "none",
              letterSpacing: "0.04em",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            ← Owner Console
          </Link>
          <span
            className="eyebrow"
            style={{ color: MINT, letterSpacing: "0.12em" }}
          >
            FEEDBACK
          </span>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.2rem)",
              fontWeight: 900,
              color: "#f4f8fd",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Feedback Summary
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(189,204,221,0.65)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Category breakdown, urgency distribution, routing decisions, and
            resolution trends.
          </p>
        </section>

        {/* ── Stat tiles ───────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          {statTiles.map((tile) => (
            <article
              key={tile.label}
              style={{
                background:
                  "linear-gradient(160deg, rgba(18,26,39,0.97), rgba(12,18,27,0.93))",
                border: `1px solid ${tileAccent(tile.tone)}22`,
                borderRadius: "16px",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(132,157,183,0.7)",
                }}
              >
                {tile.label}
              </span>
              <strong
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                  fontWeight: 900,
                  lineHeight: 0.95,
                  color: tileAccent(tile.tone),
                }}
              >
                {tile.value}
              </strong>
              <small
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(189,204,221,0.55)",
                  lineHeight: 1.3,
                }}
              >
                {tile.sub}
              </small>
            </article>
          ))}
        </div>

        {/* ── Main 2-column grid ───────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* ── LEFT column ─────────────────────────────────────────── */}
          <div style={{ display: "grid", gap: "20px" }}>
            {/* Category Breakdown ─────────────────────────────────── */}
            <section
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,26,39,0.98), rgba(12,18,27,0.95))",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "22px 24px",
              }}
            >
              <header
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(132,157,183,0.65)",
                      marginBottom: "4px",
                    }}
                  >
                    Category breakdown
                  </span>
                  <h2
                    style={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "#f4f8fd",
                      margin: 0,
                    }}
                  >
                    Where is feedback clustering?
                  </h2>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "rgba(132,157,183,0.5)",
                  }}
                >
                  {totalItems} total
                </span>
              </header>

              {/* Stacked donut-style segmented bar */}
              <div
                style={{
                  display: "flex",
                  height: "14px",
                  borderRadius: "7px",
                  overflow: "hidden",
                  gap: "2px",
                  marginBottom: "20px",
                  background: "rgba(255,255,255,0.05)",
                }}
                aria-hidden="true"
              >
                {categoryRows
                  .filter((c) => c.count > 0)
                  .map((c) => (
                    <div
                      key={c.key}
                      style={{
                        flex: c.count,
                        background: categoryColor(c.key),
                        opacity: 0.8,
                        minWidth: "3px",
                      }}
                    />
                  ))}
              </div>

              {/* Per-category bar rows */}
              <div style={{ display: "grid", gap: "14px" }}>
                {categoryRows.map((cat) => {
                  const share = pct(cat.count, totalItems);
                  return (
                    <div key={cat.key} style={{ display: "grid", gap: "6px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: categoryColor(cat.key),
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "rgba(244,248,253,0.85)",
                            }}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "rgba(132,157,183,0.65)",
                            }}
                          >
                            {share}%
                          </span>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              color: categoryColor(cat.key),
                              minWidth: "24px",
                              textAlign: "right",
                            }}
                          >
                            {cat.count}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          height: "6px",
                          borderRadius: "999px",
                          background: "rgba(255,255,255,0.07)",
                        }}
                        aria-hidden="true"
                      >
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            borderRadius: "inherit",
                            background: categoryColor(cat.key),
                            width: `${share}%`,
                            opacity: 0.85,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Urgency Distribution ───────────────────────────────── */}
            <section
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,26,39,0.98), rgba(12,18,27,0.95))",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "22px 24px",
              }}
            >
              <header style={{ marginBottom: "18px" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(132,157,183,0.65)",
                    marginBottom: "4px",
                  }}
                >
                  Urgency distribution
                </span>
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#f4f8fd",
                    margin: 0,
                  }}
                >
                  Pressure by severity level
                </h2>
              </header>

              <div style={{ display: "grid", gap: "12px" }}>
                {urgencyRows.map((u) => {
                  const barPct =
                    maxUrgencyCount > 0
                      ? Math.round((u.count / maxUrgencyCount) * 100)
                      : 0;
                  return (
                    <div
                      key={u.key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "72px 1fr 32px",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          color: urgencyColor(u.key),
                          letterSpacing: "0.03em",
                        }}
                      >
                        {u.label}
                      </span>
                      <div
                        style={{
                          height: "8px",
                          borderRadius: "999px",
                          background: "rgba(255,255,255,0.07)",
                        }}
                        aria-hidden="true"
                      >
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            borderRadius: "inherit",
                            background: urgencyColor(u.key),
                            width: `${barPct}%`,
                            opacity: 0.8,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          color: "rgba(189,204,221,0.7)",
                          textAlign: "right",
                        }}
                      >
                        {u.count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p
                style={{
                  marginTop: "14px",
                  fontSize: "0.72rem",
                  color: "rgba(132,157,183,0.5)",
                  lineHeight: 1.5,
                }}
              >
                Counts drawn from the most recent{" "}
                {overview.recentFeedback.length} feedback items. Critical and
                high urgency items auto-alert engineering.
              </p>
            </section>
          </div>

          {/* ── RIGHT column ────────────────────────────────────────── */}
          <div style={{ display: "grid", gap: "20px" }}>
            {/* Pending Items ─────────────────────────────────────────── */}
            <section
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,26,39,0.98), rgba(12,18,27,0.95))",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "22px 24px",
              }}
            >
              <header
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(132,157,183,0.65)",
                      marginBottom: "4px",
                    }}
                  >
                    Pending items
                  </span>
                  <h2
                    style={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "#f4f8fd",
                      margin: 0,
                    }}
                  >
                    Top 5 unresolved
                  </h2>
                </div>
                {pendingItems[0] ? (
                  <Link
                    href={`/owner/triage/${pendingItems[0].id}`}
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: MINT,
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Open queue →
                  </Link>
                ) : null}
              </header>

              {pendingItems.length > 0 ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  {pendingItems.map((item) => (
                    <article
                      key={item.id}
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${urgencyColor(item.urgency)}22`,
                        borderRadius: "12px",
                        padding: "14px 16px",
                        display: "grid",
                        gap: "8px",
                      }}
                    >
                      {/* Top chips row */}
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {/* Urgency chip */}
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: urgencyBg(item.urgency),
                            color: urgencyColor(item.urgency),
                            border: `1px solid ${urgencyColor(item.urgency)}33`,
                          }}
                        >
                          {item.urgency}
                        </span>
                        {/* Route chip */}
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: routeBg(item.routingTarget),
                            color: routeColor(item.routingTarget),
                          }}
                        >
                          {routeLabel(item.routingTarget)}
                        </span>
                        {/* Date */}
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "0.7rem",
                            color: "rgba(132,157,183,0.5)",
                          }}
                        >
                          {formatShortDate(item.createdAt)}
                        </span>
                      </div>

                      {/* Summary */}
                      <p
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "rgba(244,248,253,0.85)",
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {item.summary || item.message.slice(0, 90)}
                      </p>

                      {/* Meta + triage link */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "rgba(132,157,183,0.55)",
                          }}
                        >
                          {item.category} · {item.submittedByRole}
                        </span>
                        <Link
                          href={`/owner/triage/${item.id}`}
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: MINT,
                            textDecoration: "none",
                            flexShrink: 0,
                          }}
                        >
                          Triage →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "24px 20px",
                    textAlign: "center",
                    color: "rgba(189,204,221,0.5)",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: MINT,
                      fontSize: "0.9rem",
                      marginBottom: "6px",
                    }}
                  >
                    Queue is clear
                  </strong>
                  <span style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
                    All feedback has been reviewed or resolved.
                  </span>
                </div>
              )}
            </section>

            {/* Resolution Rate Trend ─────────────────────────────────── */}
            <section
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,26,39,0.98), rgba(12,18,27,0.95))",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "22px 24px",
              }}
            >
              <header style={{ marginBottom: "18px" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(132,157,183,0.65)",
                    marginBottom: "4px",
                  }}
                >
                  Resolution trend
                </span>
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#f4f8fd",
                    margin: 0,
                  }}
                >
                  Weekly resolution rate
                </h2>
              </header>

              {/* Weekly bar chart */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "flex-end",
                  height: "80px",
                  marginBottom: "8px",
                }}
                aria-hidden="true"
              >
                {WEEKLY_TREND.map((w) => {
                  const barH = Math.max(
                    Math.round((w.rate / MAX_TREND_RATE) * 68),
                    4,
                  );
                  const barColor = w.rate >= 85 ? MINT : w.rate >= 70 ? GOLD : CORAL;
                  return (
                    <div
                      key={w.week}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: `${barH}px`,
                          borderRadius: "3px 3px 0 0",
                          background: barColor,
                          opacity: 0.75,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: "rgba(132,157,183,0.55)",
                        }}
                      >
                        {w.week}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  marginTop: "4px",
                }}
              >
                {[
                  { color: MINT, label: "≥85% on track" },
                  { color: GOLD, label: "70–84% watch" },
                  { color: CORAL, label: "<70% alert" },
                ].map((l) => (
                  <span
                    key={l.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.68rem",
                      color: "rgba(132,157,183,0.6)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "2px",
                        background: l.color,
                        opacity: 0.8,
                        flexShrink: 0,
                      }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>

              {/* Current resolution rate callout */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background:
                    resolutionRate >= 80
                      ? "rgba(88,232,193,0.07)"
                      : "rgba(255,209,102,0.07)",
                  border: `1px solid ${resolutionRate >= 80 ? MINT : GOLD}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "rgba(132,157,183,0.6)",
                      marginBottom: "3px",
                    }}
                  >
                    All-time resolution rate
                  </span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "rgba(189,204,221,0.7)",
                    }}
                  >
                    {resolvedCount} of {totalItems} items resolved
                  </span>
                </div>
                <strong
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 900,
                    color: resolutionRate >= 80 ? MINT : GOLD,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {resolutionRate}%
                </strong>
              </div>
            </section>

            {/* Review Status Breakdown ──────────────────────────────── */}
            <section
              style={{
                background:
                  "linear-gradient(180deg, rgba(18,26,39,0.98), rgba(12,18,27,0.95))",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "20px",
                padding: "22px 24px",
              }}
            >
              <header style={{ marginBottom: "16px" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(132,157,183,0.65)",
                    marginBottom: "4px",
                  }}
                >
                  Routing decisions
                </span>
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: "#f4f8fd",
                    margin: 0,
                  }}
                >
                  Review status breakdown
                </h2>
              </header>

              {/* Stacked status bar */}
              <div
                style={{
                  display: "flex",
                  height: "10px",
                  borderRadius: "5px",
                  overflow: "hidden",
                  gap: "2px",
                  marginBottom: "16px",
                  background: "rgba(255,255,255,0.05)",
                }}
                aria-hidden="true"
              >
                {overview.feedbackByReviewStatus.map((s) => (
                  <div
                    key={s.reviewStatus}
                    style={{
                      flex: s.count || 0,
                      background: reviewStatusColor(s.reviewStatus),
                      opacity: 0.7,
                      minWidth: s.count > 0 ? "3px" : "0",
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                {overview.feedbackByReviewStatus.map((s) => {
                  const share = pct(s.count, totalItems);
                  return (
                    <div
                      key={s.reviewStatus}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "2px 10px",
                          borderRadius: "6px",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          background: reviewStatusBg(s.reviewStatus),
                          color: reviewStatusColor(s.reviewStatus),
                          minWidth: "80px",
                          flexShrink: 0,
                        }}
                      >
                        {s.reviewStatus}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "5px",
                          borderRadius: "999px",
                          background: "rgba(255,255,255,0.07)",
                        }}
                        aria-hidden="true"
                      >
                        <span
                          style={{
                            display: "block",
                            height: "100%",
                            borderRadius: "inherit",
                            background: reviewStatusColor(s.reviewStatus),
                            width: `${share}%`,
                            opacity: 0.75,
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          color: "rgba(189,204,221,0.7)",
                          minWidth: "28px",
                          textAlign: "right",
                        }}
                      >
                        {s.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer nav ───────────────────────────────────────────────── */}
        <section
          style={{
            marginTop: "32px",
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link
            href="/owner"
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: MINT,
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(88,232,193,0.1)",
              border: "1px solid rgba(88,232,193,0.2)",
            }}
          >
            Owner Console
          </Link>
          <Link
            href="/teacher"
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "rgba(189,204,221,0.7)",
              textDecoration: "none",
            }}
          >
            Teacher view
          </Link>
          <Link
            href="/parent"
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "rgba(189,204,221,0.7)",
              textDecoration: "none",
            }}
          >
            Parent hub
          </Link>
        </section>
      </main>
    </AppFrame>
  );
}
