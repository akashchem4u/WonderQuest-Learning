"use client";

import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

const COLORS = {
  base: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#22c55e",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
  green: "#50e890",
};

type ResolutionState = "resolved" | "wontfix" | "escalated";

interface LiveFeedbackItem {
  id: string;
  category: string;
  urgency: string;
  summary: string;
  createdAt: string;
  studentId: string | null;
  guardianId: string | null;
  resolved: string;
}

function useOpenFeedback() {
  const [items, setItems] = useState<LiveFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/owner/feedback?status=open&limit=20")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json() as Promise<{ items: LiveFeedbackItem[] }>;
      })
      .then((data) => {
        setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return { items, loading, error };
}

function urgencyColor(urgency: string) {
  if (urgency === "critical") return "#ef4444";
  if (urgency === "high") return "#f59e0b";
  if (urgency === "medium") return "#38bdf8";
  return "#8b949e";
}

function categoryIcon(category: string) {
  if (category === "bug") return "🐛";
  if (category === "safety") return "🚨";
  if (category === "enhancement") return "✨";
  if (category === "content") return "📝";
  return "💬";
}

function formatRelative(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface LogEntry {
  dot: string;
  text: string;
  time: string;
}

interface FeedbackItem {
  id: string;
  title: string;
  state: ResolutionState;
  bannerIcon: string;
  bannerTitle: string;
  bannerSub: string;
  bannerTime: string;
  priority: string;
  priorityColor: string;
  type: string;
  school: string;
  date: string;
  feedbackTitle: string;
  feedbackBody: string;
  noteLabel: string;
  noteLabelColor: string;
  noteText: string;
  noteAuthor: string;
  replyText: string;
  replyMeta: string;
  log: LogEntry[];
  details: { label: string; value: string; color?: string }[];
  linked?: { label: string; value: string; color?: string }[];
}

const ITEMS: FeedbackItem[] = [
  {
    id: "FB-2041",
    title: "Bug #FB-2041",
    state: "resolved",
    bannerIcon: "✅",
    bannerTitle: "Resolved",
    bannerSub: "SSO token expiry bug fixed in hotfix v2.4.8 · Deployed to production",
    bannerTime: "Today, 11:32 AM",
    priority: "P0",
    priorityColor: COLORS.red,
    type: "Bug",
    school: "🏫 Riverside Elementary · Teacher role",
    date: "Today, 8:14 AM",
    feedbackTitle: "Students can't log in — SSO token expired",
    feedbackBody:
      "Entire class locked out since 8am. SSO keeps saying \"session expired\" immediately after login. We have a live class right now and can't access the platform at all. This is a critical blocker for our lesson today.",
    noteLabel: "Resolution note · Internal only",
    noteLabelColor: `rgba(80,232,144,0.6)`,
    noteText:
      "Root cause: JWT refresh token TTL was inadvertently set to 1h in env vars during last deploy (should be 24h). Fixed in hotfix v2.4.8. Deployed at 11:30 AM. All active sessions invalidated and re-issued. No data loss. Post-mortem scheduled for Thursday.",
    noteAuthor: "Added by: Owner · Today 11:32 AM",
    replyText:
      "Hi, thank you for reporting this immediately. We identified the issue — a configuration error in our last deploy caused SSO sessions to expire too quickly. We've deployed a fix and your students should be able to log in now. We're sorry for the disruption to your lesson. Please let us know if you see any further issues.",
    replyMeta: "✓ Delivered to teacher's notification panel · Today 11:33 AM",
    log: [
      { dot: COLORS.green, text: "Item resolved — hotfix v2.4.8 deployed to production", time: "Today 11:32 AM" },
      { dot: COLORS.violet, text: "Owner reply sent to teacher notification panel", time: "Today 11:31 AM" },
      { dot: COLORS.red, text: "Escalated to on-call engineering via PagerDuty", time: "Today 8:20 AM" },
      { dot: COLORS.amber, text: "Auto-triaged → P0 Critical → #on-call Slack channel", time: "Today 8:15 AM" },
      { dot: "rgba(255,255,255,0.2)", text: "Feedback submitted by teacher at Riverside Elementary", time: "Today 8:14 AM" },
    ],
    details: [
      { label: "ID", value: "FB-2041" },
      { label: "Type", value: "Bug" },
      { label: "Priority", value: "P0 Critical", color: COLORS.red },
      { label: "School", value: "Riverside Elementary" },
      { label: "Role", value: "Teacher" },
      { label: "Status", value: "✅ Resolved" },
      { label: "Time to resolve", value: "3h 18m", color: COLORS.green },
      { label: "SLA target", value: "4h (met)" },
    ],
    linked: [
      { label: "Hotfix", value: "v2.4.8", color: COLORS.violet },
      { label: "Post-mortem", value: "Scheduled Thu" },
      { label: "Duplicate reports", value: "3" },
    ],
  },
  {
    id: "FB-2038",
    title: "Feature #FB-2038",
    state: "wontfix",
    bannerIcon: "🚫",
    bannerTitle: "Won't Fix",
    bannerSub: "Out of scope for current roadmap. Explained to teacher.",
    bannerTime: "Yesterday, 3:44 PM",
    priority: "Feature",
    priorityColor: COLORS.violet,
    type: "Feature Request",
    school: "🏫 Lincoln Academy · Teacher role",
    date: "Yesterday, 10:22 AM",
    feedbackTitle: "Add parent-teacher video call built into the platform",
    feedbackBody:
      "It would be great if parents could book a 15-minute video call with teachers directly inside WonderQuest instead of using a separate tool. Would save so much time managing Zoom links.",
    noteLabel: "Won't fix reason · Internal only",
    noteLabelColor: "rgba(255,255,255,0.3)",
    noteText:
      "Video conferencing is out of scope for WonderQuest's core mission (adaptive learning). Integration with third-party tools (Zoom/Meet) is on the roadmap (Q4) but building our own video infra creates COPPA/FERPA complexity we want to avoid. Pointing teacher to the upcoming calendar integration instead.",
    noteAuthor: "Added by: Owner · Yesterday 3:44 PM",
    replyText:
      "Thank you for the suggestion! We completely understand the need to streamline parent communication. Built-in video conferencing is outside our current scope, but we're planning calendar and scheduling integrations in Q4 that should help connect you with parents more easily. We've noted this request and will keep it in mind as we grow the platform.",
    replyMeta: "✓ Delivered to teacher's notification panel · Yesterday 3:45 PM",
    log: [
      { dot: "rgba(255,255,255,0.3)", text: "Marked as Won't Fix — out of scope", time: "Yesterday 3:44 PM" },
      { dot: COLORS.violet, text: "Owner reply sent to teacher notification panel", time: "Yesterday 3:45 PM" },
      { dot: COLORS.amber, text: "Auto-triaged → Feature request queue", time: "Yesterday 10:23 AM" },
    ],
    details: [
      { label: "ID", value: "FB-2038" },
      { label: "Type", value: "Feature" },
      { label: "Priority", value: "Feature", color: COLORS.violet },
      { label: "School", value: "Lincoln Academy" },
      { label: "Status", value: "🚫 Won't Fix" },
    ],
  },
  {
    id: "FB-2039",
    title: "Bug #FB-2039",
    state: "escalated",
    bannerIcon: "🚨",
    bannerTitle: "Escalated — On-Call Active",
    bannerSub: "PagerDuty incident #PD-4412 open · Engineering on-call acknowledged",
    bannerTime: "Today, 5h ago",
    priority: "P0",
    priorityColor: COLORS.red,
    type: "Bug",
    school: "🏫 Lincoln Academy · Teacher role",
    date: "Today, 6:10 AM",
    feedbackTitle: "Assignment engine silent-failing — no tasks delivered",
    feedbackBody:
      "Assigned skills yesterday, students see empty session today. No error shown to students — just blank session. Checked assignments dashboard — shows as delivered but students confirm nothing appeared. Happening across all students in my class (24 students).",
    noteLabel: "Escalation note · Internal",
    noteLabelColor: `rgba(248,81,73,0.6)`,
    noteText:
      "Escalated to #on-call at 6:15 AM. PagerDuty incident #PD-4412 created. Engineering lead (Sam) acknowledged at 6:22 AM. Root cause under investigation — suspected queue processing failure in assignment delivery service. Multiple schools affected (investigating scope).",
    noteAuthor: "Escalated by: Auto-triage + Owner confirm · Today 6:15 AM",
    replyText:
      "We're aware of an issue affecting assignment delivery and our engineering team is actively investigating. We're sorry your students are experiencing this. We'll send you an update as soon as we have a resolution timeline. Thank you for reporting this so quickly.",
    replyMeta: "✓ Delivered to teacher's notification panel · Today 6:20 AM",
    log: [
      { dot: COLORS.violet, text: "Owner reply sent to teacher notification panel", time: "Today 6:20 AM" },
      { dot: COLORS.red, text: "Escalated → PagerDuty #PD-4412 · Engineering on-call acknowledged", time: "Today 6:15 AM" },
      { dot: COLORS.amber, text: "Auto-triaged → P0 Critical → #on-call Slack channel", time: "Today 6:11 AM" },
    ],
    details: [
      { label: "ID", value: "FB-2039" },
      { label: "Type", value: "Bug" },
      { label: "Priority", value: "P0 Critical", color: COLORS.red },
      { label: "School", value: "Lincoln Academy" },
      { label: "Status", value: "🚨 Escalated" },
      { label: "PagerDuty", value: "PD-4412", color: COLORS.amber },
      { label: "SLA deadline", value: "1h remaining", color: COLORS.amber },
    ],
    linked: [
      { label: "Schools affected", value: "Est. 8–12" },
      { label: "Duplicate reports", value: "6" },
      { label: "Incident level", value: "P0 Incident", color: COLORS.red },
    ],
  },
];

function getBannerStyle(state: ResolutionState) {
  if (state === "resolved") return { background: "rgba(80,232,144,0.08)", border: `1px solid rgba(80,232,144,0.2)` };
  if (state === "escalated") return { background: "rgba(248,81,73,0.08)", border: `1px solid rgba(248,81,73,0.2)` };
  return { background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)` };
}

function getNoteBoxBorder(state: ResolutionState) {
  if (state === "resolved") return `1px solid rgba(80,232,144,0.15)`;
  if (state === "escalated") return `1px solid rgba(248,81,73,0.2)`;
  return `1px solid rgba(255,255,255,0.1)`;
}

function getStateLabel(state: ResolutionState) {
  if (state === "resolved") return "Resolved · 2h ago";
  if (state === "wontfix") return "Won't Fix · 1d ago";
  return "Escalated · P0 · On-Call Active";
}

function getStateLabelColor(state: ResolutionState) {
  return state === "escalated" ? COLORS.red : "rgba(255,255,255,0.25)";
}

export default function FeedbackResolutionPage() {
  const [activeState, setActiveState] = useState<ResolutionState>("resolved");
  const item = ITEMS.find((i) => i.state === activeState)!;
  const { items: liveItems, loading: liveLoading, error: liveError } = useOpenFeedback();

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "system-ui",
    background: active ? "#2563eb" : "rgba(255,255,255,0.08)",
    color: active ? "#fff" : COLORS.muted,
    transition: "all 0.18s",
  });

  return (
    <AppFrame audience="owner" currentPath="/owner/feedback-resolution">
      <div style={{ background: COLORS.base, minHeight: "100vh", padding: 24, fontFamily: "system-ui,-apple-system,sans-serif" }}>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24, maxWidth: 1100 }}>
          {(["resolved", "wontfix", "escalated"] as ResolutionState[]).map((s) => (
            <button key={s} style={tabStyle(activeState === s)} onClick={() => setActiveState(s)}>
              {s === "resolved" ? "Resolved" : s === "wontfix" ? "Won't Fix" : "Escalated"}
            </button>
          ))}
        </div>

        {/* Live open feedback queue */}
        <div style={{ background: "#0d1117", borderRadius: 12, border: `1px solid ${COLORS.border}`, maxWidth: 1100, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.muted }}>Live Open Queue</span>
            {!liveLoading && !liveError && (
              <span style={{ fontSize: 10, fontWeight: 700, color: COLORS.amber, background: "rgba(245,158,11,0.12)", padding: "1px 7px", borderRadius: 10 }}>{liveItems.length} open</span>
            )}
          </div>
          {liveLoading && (
            <div style={{ padding: "14px 16px", fontSize: 11, color: COLORS.muted }}>Loading open feedback…</div>
          )}
          {liveError && (
            <div style={{ padding: "14px 16px", fontSize: 11, color: COLORS.muted }}>Could not load live feedback.</div>
          )}
          {!liveLoading && !liveError && liveItems.length === 0 && (
            <div style={{ padding: "14px 16px", fontSize: 11, color: COLORS.muted }}>No open feedback items — all clear!</div>
          )}
          {!liveLoading && !liveError && liveItems.length > 0 && (
            <div>
              {liveItems.map((fi, idx) => (
                <div key={fi.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", borderBottom: idx < liveItems.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                  <span style={{ fontSize: 14 }}>{categoryIcon(fi.category)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fi.summary || "(no summary)"}</div>
                    <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 1 }}>{fi.category} · {formatRelative(fi.createdAt)}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: urgencyColor(fi.urgency), flexShrink: 0 }}>{fi.urgency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shell */}
        <div style={{ background: "#0d1117", borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.border}`, maxWidth: 1100 }}>
          {/* Header */}
          <div style={{ background: "#010409", padding: "0 24px", height: 52, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, cursor: "pointer" }}>← Feedback Queue</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>{item.title}</span>
            <span style={{ fontSize: 11, color: getStateLabelColor(activeState), marginLeft: "auto" }}>{getStateLabel(activeState)}</span>
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", minHeight: 640 }}>
            {/* Main */}
            <div style={{ padding: 24, borderRight: `1px solid ${COLORS.border}` }}>
              {/* Status banner */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 10, marginBottom: 20, ...getBannerStyle(activeState) }}>
                <span style={{ fontSize: 20 }}>{item.bannerIcon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: activeState === "escalated" ? COLORS.red : COLORS.text }}>{item.bannerTitle}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{item.bannerSub}</div>
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{item.bannerTime}</span>
              </div>

              {/* Section: Original Feedback */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${COLORS.border}` }}>Original Feedback</div>
              <div style={{ background: COLORS.surface, borderRadius: 10, padding: "16px 18px", marginBottom: 18, border: activeState === "escalated" ? `1px solid rgba(248,81,73,0.2)` : `1px solid rgba(255,255,255,0.05)` }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 5, background: activeState === "wontfix" ? "rgba(155,114,255,0.15)" : "rgba(248,81,73,0.2)", color: activeState === "wontfix" ? COLORS.violet : "#f85149" }}>{item.priority}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{item.type}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{item.school}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>{item.date}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text, marginBottom: 6 }}>{item.feedbackTitle}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{item.feedbackBody}</div>
              </div>

              {/* Section: Note */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${COLORS.border}` }}>
                {activeState === "resolved" ? "Resolution Note (Internal)" : activeState === "wontfix" ? "Won't Fix Reason (Internal)" : "Escalation Details"}
              </div>
              <div style={{ background: COLORS.surface, borderRadius: 10, padding: "16px 18px", marginBottom: 18, border: getNoteBoxBorder(activeState) }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: item.noteLabelColor, letterSpacing: "0.06em", marginBottom: 8 }}>{item.noteLabel}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{item.noteText}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>{item.noteAuthor}</div>
              </div>

              {/* Section: Owner Reply */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${COLORS.border}` }}>Owner Reply (Sent to Teacher)</div>
              <div style={{ background: "rgba(80,232,144,0.06)", borderRadius: 10, padding: "16px 18px", marginBottom: 18, border: `1px solid rgba(80,232,144,0.12)` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em", marginBottom: 8 }}>Reply sent via platform notification</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{item.replyText}</div>
                <div style={{ fontSize: 10, color: `rgba(80,232,144,0.5)`, marginTop: 6 }}>{item.replyMeta}</div>
              </div>

              {/* Activity Log */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${COLORS.border}` }}>Activity Log</div>
              <div style={{ background: COLORS.surface, borderRadius: 10, padding: "14px 16px", border: `1px solid rgba(255,255,255,0.05)` }}>
                {item.log.map((entry, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < item.log.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: entry.dot, marginTop: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{entry.text}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{entry.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ padding: 20 }}>
              {/* Item details */}
              <div style={{ background: COLORS.surface, borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: `1px solid rgba(255,255,255,0.05)` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 8 }}>Item Details</div>
                {item.details.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11, borderBottom: i < item.details.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>{d.label}</span>
                    <span style={{ color: d.color || COLORS.text, fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Linked / Scope */}
              {item.linked && (
                <div style={{ background: COLORS.surface, borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: `1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginBottom: 8 }}>
                    {activeState === "escalated" ? "Scope Check" : "Linked Items"}
                  </div>
                  {item.linked.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11, borderBottom: i < item.linked!.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none" }}>
                      <span style={{ color: "rgba(255,255,255,0.35)" }}>{d.label}</span>
                      <span style={{ color: d.color || COLORS.text, fontWeight: 600 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reopen button */}
              {activeState !== "escalated" && (
                <button style={{ width: "100%", padding: 10, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.45)", fontFamily: "system-ui", cursor: "pointer", textAlign: "center", marginTop: 4 }}>
                  ↩ Reopen This Item
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
