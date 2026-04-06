"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ───────────────────────────────────────────────────────────────────
const BASE    = "#100b2e";
const SHELL   = "#0d1117";
const SHELL2  = "#010409";
const SURFACE = "#161b22";
const BORDER  = "rgba(255,255,255,0.05)";
const BORDER2 = "rgba(255,255,255,0.04)";
const TEXT    = "#f0f6ff";
const MUTED   = "rgba(255,255,255,0.45)";
const MUTED2  = "rgba(255,255,255,0.3)";
const MUTED3  = "rgba(255,255,255,0.25)";
const MINT    = "#50e890";
const AMBER   = "#f59e0b";
const RED     = "#f85149";
const BLUE    = "#2563eb";
const BLUE2   = "#60a5fa";

// ── Stub Data ─────────────────────────────────────────────────────────────────

interface FeedbackItem {
  id: string;
  priority: string;
  priorityBg: string;
  priorityColor: string;
  type: string;
  time: string;
  summary: string;
  meta: string;
  status: string;
  statusType: "open" | "review" | "resolved";
}

const FEEDBACK_ITEMS: FeedbackItem[] = [
  {
    id: "bug-1",
    priority: "P1", priorityBg: AMBER, priorityColor: "#1a1440",
    type: "Bug", time: "2h ago",
    summary: "Mastery bar not updating after session ends",
    meta: "Maple Ridge Elementary · Teacher home",
    status: "Under review", statusType: "review",
  },
  {
    id: "feat-1",
    priority: "Feature", priorityBg: "rgba(80,232,144,.2)", priorityColor: MINT,
    type: "Request", time: "Mar 18",
    summary: "Export class progress as PDF for parent-teacher conferences",
    meta: "Sunnybrook K-5 · Command center",
    status: "In review · Product team", statusType: "review",
  },
  {
    id: "cont-1",
    priority: "P2", priorityBg: BLUE, priorityColor: "#fff",
    type: "Content", time: "Mar 10",
    summary: "Ambiguous diagram in P2 Fractions: Comparing question set",
    meta: "Lincoln Park Primary · Play session",
    status: "Curriculum review", statusType: "review",
  },
];

interface DetailPanel {
  id: string;
  priority: string;
  priorityBg: string;
  priorityColor: string;
  title: string;
  school: string;
  screen: string;
  severity: string;
  submitted: string;
  body: string;
  upvotes?: string;
  productNote?: string;
  history?: { time: string; text: string }[];
  defaultReply: string;
  actions: { label: string; bg: string; color: string }[];
}

const PANELS: Record<string, DetailPanel> = {
  "bug-1": {
    id: "bug-1",
    priority: "P1 Bug", priorityBg: AMBER, priorityColor: "#1a1440",
    title: "Mastery bar not updating after session ends (student detail page)",
    school: "Maple Ridge Elementary",
    screen: "Student detail page",
    severity: "Moderate severity",
    submitted: "Submitted 2h ago",
    body: "\"I viewed Jordan's profile after their session ended but the mastery bar for Long Division still shows the old value. Refreshing the page fixes it but the stale state is confusing. Happened twice this week on the same student's profile.\"",
    defaultReply: "Thanks for flagging this — confirmed. The mastery score is cached client-side and not invalidated after a session closes. We're pushing a fix in today's build (#248). You should see accurate mastery on refresh after 6pm.",
    history: [
      { time: "9:14am",  text: "Feedback submitted by teacher at Maple Ridge Elementary" },
      { time: "9:22am",  text: "Auto-triaged: P1 (Moderate severity bug · Teacher portal). Slack alert sent to #engineering." },
      { time: "10:08am", text: "Kavya R. confirmed bug — cache invalidation missing on session_end event. Fix in progress." },
      { time: "11:05am", text: "Status set to \"Under review\" by Avi M." },
    ],
    actions: [
      { label: "✓ Mark resolved",      bg: MINT,                       color: "#010409" },
      { label: "↑ Bump to P0",         bg: BLUE,                       color: "#fff"    },
      { label: "🔔 Escalate to on-call",bg: "rgba(248,81,73,.15)",      color: RED       },
      { label: "✕ Won't fix",           bg: "rgba(255,255,255,.07)",    color: MUTED     },
    ],
  },
  "feat-1": {
    id: "feat-1",
    priority: "Feature", priorityBg: "rgba(80,232,144,.2)", priorityColor: MINT,
    title: "Export class progress as PDF for parent-teacher conferences",
    school: "Sunnybrook K-5",
    screen: "Command center",
    severity: "",
    submitted: "6 days ago",
    upvotes: "12 upvotes",
    body: "\"Would love a printable one-page class summary I can bring to parent-teacher night. Ideally: student name, band, current skills in progress, streak, and a mastery trend. Parents love having something tangible. Could also use it for my own planning.\"",
    productNote: "This is the #3 most upvoted feature request this month. 12 teachers from 8 schools. Already in Q2 roadmap (teacher-class-summary PDF export). Targeting April release.",
    defaultReply: "Thanks for this — it's a popular request! We're planning a PDF export feature for our April release. I'll notify you when it's live.",
    history: [],
    actions: [
      { label: "📋 Add to roadmap", bg: "rgba(80,232,144,.15)", color: MINT },
      { label: "✕ Won't build",     bg: "rgba(255,255,255,.07)", color: MUTED },
    ],
  },
  "cont-1": {
    id: "cont-1",
    priority: "P2 Content", priorityBg: BLUE, priorityColor: "#fff",
    title: "Ambiguous diagram in P2 Fractions: Comparing question set",
    school: "Lincoln Park Primary",
    screen: "Play session",
    severity: "Low severity",
    submitted: "Submitted Mar 10",
    body: "\"The diagram in the Comparing Fractions question set for Grade 2-3 is unclear. Several students are confused about which fraction is larger. The bar chart labels are too small and overlap on tablet screens.\"",
    defaultReply: "Thank you for flagging this. We've passed it to the curriculum team for diagram review. We'll update you once revised.",
    history: [
      { time: "Mar 10", text: "Feedback submitted. Auto-triaged: P2 Content · Curriculum team notified." },
    ],
    actions: [
      { label: "Send to curriculum",   bg: "rgba(88,232,193,.15)",   color: "#58e8c1" },
      { label: "✓ Mark resolved",      bg: MINT,                     color: "#010409" },
      { label: "✕ Won't fix",          bg: "rgba(255,255,255,.07)",  color: MUTED     },
    ],
  },
};

type FilterType = "all" | "p0p1" | "bugs" | "features";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function FeedbackWorkbenchPage() {
  const [selected,    setSelected]    = useState<string>("bug-1");
  const [filter,      setFilter]      = useState<FilterType>("all");
  const [replyText,   setReplyText]   = useState<Record<string, string>>({});
  const [replySent,   setReplySent]   = useState<Record<string, boolean>>({});

  const panel = PANELS[selected];

  const filteredItems = FEEDBACK_ITEMS.filter((item) => {
    if (filter === "p0p1")    return item.priority === "P0" || item.priority === "P1";
    if (filter === "bugs")    return item.type === "Bug";
    if (filter === "features")return item.type === "Request";
    return true;
  });

  function getReply(id: string): string {
    return replyText[id] !== undefined ? replyText[id] : (PANELS[id]?.defaultReply ?? "");
  }

  function chipColor(type: "open" | "review" | "resolved"): { bg: string; color: string } {
    if (type === "review")   return { bg: "rgba(37,99,235,.2)",    color: BLUE2 };
    if (type === "resolved") return { bg: "rgba(80,232,144,.15)",  color: MINT  };
    return                          { bg: "rgba(245,158,11,.15)",  color: AMBER };
  }

  const FILTERS: { key: FilterType; label: string; active: boolean; red?: boolean }[] = [
    { key: "all",      label: "All open",   active: filter === "all"      },
    { key: "p0p1",     label: "P0/P1",      active: filter === "p0p1",    red: true },
    { key: "bugs",     label: "Bugs",       active: filter === "bugs"     },
    { key: "features", label: "Features",   active: filter === "features" },
  ];

  return (
    <AppFrame audience="owner" currentPath="/owner/feedback-workbench">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", background: BASE, minHeight: "100vh", padding: "24px", color: TEXT }}>

        <p style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "#8a7a6a", marginBottom: "16px", maxWidth: "960px" }}>Feedback workbench — live queue</p>

        {/* Owner shell */}
        <div style={{ display: "flex", maxWidth: "960px", background: SHELL, borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,.5)", height: "640px" }}>

          {/* Sidebar */}
          <div style={{ width: "190px", background: SHELL2, display: "flex", flexDirection: "column", flexShrink: 0, borderRight: `1px solid ${BORDER}` }}>
            <div style={{ padding: "16px 12px 12px", fontSize: "13px", fontWeight: 900, color: TEXT, borderBottom: `1px solid ${BORDER}` }}>
              WQ <span style={{ color: MINT }}>Console</span>
            </div>
            <div style={{ padding: "10px 8px 4px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: MUTED3 }}>Ops</div>
            {[
              { icon: "🏠", label: "Home" },
              { icon: "📡", label: "Route Health" },
              { icon: "🚀", label: "Release Gate" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "6px", margin: "1px 4px", fontSize: "12px", fontWeight: 600, color: MUTED }}>
                <span style={{ fontSize: "13px", width: "16px", textAlign: "center" }}>{item.icon}</span>{item.label}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "6px", margin: "1px 4px", fontSize: "12px", fontWeight: 600, color: MINT, background: "rgba(80,232,144,.1)" }}>
              <span style={{ fontSize: "13px", width: "16px", textAlign: "center" }}>💬</span>
              Feedback
              <span style={{ fontSize: "9px", fontWeight: 800, padding: "1px 4px", borderRadius: "4px", background: AMBER, color: "#1a1440", marginLeft: "auto" }}>3</span>
            </div>
            <div style={{ padding: "10px 8px 4px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: MUTED3 }}>Analytics</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 8px", borderRadius: "6px", margin: "1px 4px", fontSize: "12px", fontWeight: 600, color: MUTED }}>
              <span style={{ fontSize: "13px", width: "16px", textAlign: "center" }}>📊</span>Command Center
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ padding: "10px", borderTop: `1px solid ${BORDER}`, fontSize: "10px", color: MUTED3 }}>Avi M. · Owner</div>
          </div>

          {/* Main area */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

            {/* Left panel — queue list */}
            <div style={{ width: "320px", borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
              {/* List header */}
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: 800, color: TEXT, marginBottom: "8px" }}>
                  Feedback Queue <span style={{ color: MUTED2, fontWeight: 400 }}>({FEEDBACK_ITEMS.length} open)</span>
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {FILTERS.map((f) => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{ fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "8px", cursor: "pointer", border: "none", fontFamily: "inherit", background: f.active ? MINT : f.red ? "rgba(248,81,73,.2)" : "rgba(255,255,255,.07)", color: f.active ? "#010409" : f.red ? RED : MUTED }}>{f.label}</button>
                  ))}
                </div>
              </div>
              {/* List items */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {filteredItems.map((item) => {
                  const isActive = selected === item.id;
                  const cs = chipColor(item.statusType);
                  return (
                    <div key={item.id} onClick={() => setSelected(item.id)} style={{ padding: "11px 14px", borderBottom: `1px solid ${BORDER2}`, cursor: "pointer", background: isActive ? "rgba(80,232,144,.06)" : "transparent", borderLeft: isActive ? `3px solid ${MINT}` : "3px solid transparent" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "9px", fontWeight: 800, padding: "1px 5px", borderRadius: "4px", background: item.priorityBg, color: item.priorityColor }}>{item.priority}</span>
                        <span style={{ fontSize: "9px", color: MUTED2, fontWeight: 700 }}>{item.type}</span>
                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,.2)", marginLeft: "auto" }}>{item.time}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,.7)", lineHeight: 1.3, marginBottom: "4px" }}>{item.summary}</div>
                      <div style={{ fontSize: "10px", color: MUTED3 }}>{item.meta}</div>
                      <div style={{ display: "flex", gap: "5px", marginTop: "4px" }}>
                        <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "4px", ...cs }}>{item.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right panel — detail */}
            {panel && (
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", background: SHELL }}>

                {/* Detail header */}
                <div style={{ background: SURFACE, borderRadius: "10px", padding: "14px 16px", marginBottom: "12px", border: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, padding: "1px 5px", borderRadius: "4px", flexShrink: 0, background: panel.priorityBg, color: panel.priorityColor }}>{panel.priority}</span>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: TEXT, flex: 1, lineHeight: 1.3, marginLeft: "8px" }}>{panel.title}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", background: "rgba(255,255,255,.08)", color: MUTED }}>{panel.school}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", background: "rgba(37,99,235,.15)", color: BLUE2 }}>{panel.screen}</span>
                    {panel.severity && <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", background: "rgba(245,158,11,.15)", color: AMBER }}>{panel.severity}</span>}
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.4)" }}>{panel.submitted}</span>
                    {panel.upvotes && <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "5px", background: "rgba(80,232,144,.12)", color: MINT }}>{panel.upvotes}</span>}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,.6)", lineHeight: 1.6, background: "rgba(255,255,255,.03)", borderRadius: "6px", padding: "8px 10px", border: `1px solid ${BORDER}` }}>{panel.body}</div>
                </div>

                {/* Product note */}
                {panel.productNote && (
                  <div style={{ background: SURFACE, borderRadius: "10px", padding: "10px 14px", marginBottom: "10px", border: "1px solid rgba(80,232,144,.15)" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: MINT, marginBottom: "4px" }}>PRODUCT NOTE — Avi M.</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,.6)", lineHeight: 1.4 }}>{panel.productNote}</div>
                  </div>
                )}

                {/* Action row */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                  {panel.actions.map((action) => (
                    <button key={action.label} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: "none", background: action.bg, color: action.color }}>{action.label}</button>
                  ))}
                </div>

                {/* Owner reply */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED3, marginBottom: "6px" }}>Reply to teacher (delivered via platform notification)</div>
                  <textarea
                    value={replySent[panel.id] ? "" : getReply(panel.id)}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [panel.id]: e.target.value }))}
                    placeholder="Write a note to the teacher..."
                    style={{ width: "100%", padding: "8px 10px", background: SURFACE, border: "1px solid rgba(255,255,255,.1)", borderRadius: "8px", fontSize: "11px", fontFamily: "system-ui", color: "rgba(255,255,255,.7)", resize: "none", minHeight: "70px", outline: "none", boxSizing: "border-box" }}
                  />
                  <button
                    onClick={() => setReplySent((prev) => ({ ...prev, [panel.id]: true }))}
                    style={{ padding: "6px 14px", background: MINT, color: "#010409", border: "none", borderRadius: "7px", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: "5px" }}
                  >
                    {replySent[panel.id] ? "Sent!" : "Send reply"}
                  </button>
                </div>

                {/* History */}
                {panel.history && panel.history.length > 0 && (
                  <>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED3, marginBottom: "6px" }}>History</div>
                    {panel.history.map((h, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", padding: "6px 0", borderBottom: i < panel.history!.length - 1 ? `1px solid ${BORDER2}` : "none", fontSize: "11px" }}>
                        <div style={{ color: "rgba(255,255,255,.2)", flexShrink: 0, width: "70px" }}>{h.time}</div>
                        <div style={{ color: "rgba(255,255,255,.5)", flex: 1, lineHeight: 1.4 }}>{h.text}</div>
                      </div>
                    ))}
                  </>
                )}

                {/* Feature upvoted-by */}
                {panel.id === "feat-1" && (
                  <>
                    <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: MUTED3, marginBottom: "6px", marginTop: "4px" }}>Upvoted by</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,.4)", lineHeight: 1.8 }}>12 teachers across 8 schools · Sunnybrook K-5 (3) · Maple Ridge (2) · Lincoln Park (2) · 5 others</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
