"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  violetDim: "rgba(155,114,255,0.14)",
  blue: "#38bdf8",
  blueDim: "rgba(56,189,248,0.12)",
  blueBorder: "rgba(56,189,248,0.28)",
  mint: "#22c55e",
  mintDim: "rgba(34,197,94,0.12)",
  gold: "#ffd166",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  redDim: "rgba(239,68,68,0.10)",
  text: "#f0f6ff",
  muted: "#8b949e",
  faint: "rgba(255,255,255,0.08)",
  faintBorder: "rgba(255,255,255,0.10)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────
type FeedbackType = "bug" | "feature" | "content" | "question";
type Tab = "form" | "submitted" | "notifs";

// ── Stub Data ──────────────────────────────────────────────────────────────
const FEEDBACK_ITEMS = [
  {
    type: "bug" as const,
    severity: "Moderate",
    date: "Today · 9:14am",
    title: "Mastery bar not updating after session ends",
    preview: "Stale mastery bar on student detail page until page refresh. Workaround exists.",
    status: "Under review",
    statusColor: "#f59e0b",
  },
  {
    type: "feature" as const,
    severity: "",
    date: "Mar 18",
    title: "Export class progress as PDF for parent-teacher conferences",
    preview: "Would love a printable 1-page summary per student I can share at parent-teacher night.",
    status: "In review by product team",
    statusColor: "#38bdf8",
  },
  {
    type: "content" as const,
    severity: "",
    date: "Mar 10",
    title: "Fractions question — ambiguous diagram in P2 question set",
    preview: "One question in the Fractions: Comparing set has a diagram that could be read two ways. Students keep selecting wrong answer.",
    status: "Resolved — question updated Mar 14",
    statusColor: "#22c55e",
  },
];

const NOTIFS = [
  {
    icon: "🚀",
    title: "WonderQuest v2.4 — New features released",
    body: "New: Teacher assignment system, parent message center, and class health board are now live. Check the What's New guide for a walkthrough.",
    date: "Today · 8:00am",
    unread: true,
  },
  {
    icon: "🔧",
    title: "Scheduled maintenance — Sunday Mar 30, 2am–4am",
    body: "Brief platform downtime for database upgrades. Student sessions will be unavailable during this window. No data will be lost.",
    date: "Mar 22 · 10:00am",
    unread: false,
  },
  {
    icon: "📚",
    title: "Content update — P3 question bank expanded",
    body: "14 new questions added to Long Division and Fractions: Mixed Numbers. Students will see these automatically in adaptive sessions.",
    date: "Mar 19 · 2:00pm",
    unread: false,
  },
  {
    icon: "✅",
    title: "Your feedback resolved — content issue Mar 10",
    body: "The ambiguous Fractions: Comparing diagram you flagged has been updated. The question now displays clearly. Thank you for the report!",
    date: "Mar 14 · 11:30am",
    unread: false,
  },
];

const TYPE_OPTIONS: { id: FeedbackType; icon: string; label: string; sub: string }[] = [
  { id: "bug", icon: "🐛", label: "Bug report", sub: "Something isn't working" },
  { id: "feature", icon: "💡", label: "Feature request", sub: "Suggest an improvement" },
  { id: "content", icon: "📚", label: "Content issue", sub: "Problem with a question" },
  { id: "question", icon: "❓", label: "Question", sub: "How does something work?" },
];

const TYPE_BADGE: Record<FeedbackType, { label: string; bg: string; color: string }> = {
  bug: { label: "Bug", bg: C.redDim, color: "#f87171" },
  feature: { label: "Feature request", bg: C.blueDim, color: C.blue },
  content: { label: "Content issue", bg: C.amberDim, color: "#fbbf24" },
  question: { label: "Question", bg: C.mintDim, color: "#4ade80" },
};

export default function FeedbackPanelPage() {
  const [tab, setTab] = useState<Tab>("form");
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
  const [rating, setRating] = useState(4);

  const tabs: { id: Tab; label: string }[] = [
    { id: "form", label: "Submit Feedback" },
    { id: "submitted", label: "My Feedback" },
    { id: "notifs", label: "Notifications" },
  ];

  return (
    <AppFrame audience="teacher">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        {/* Page header */}
        <div style={{ marginBottom: 24, maxWidth: 860 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 4 }}>Feedback &amp; Notifications</div>
          <div style={{ fontSize: 14, color: C.muted }}>Report issues, suggest improvements, or check platform updates.</div>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", maxWidth: 860 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: tab === t.id ? `1.5px solid ${C.blue}` : `1.5px solid ${C.border}`,
                background: tab === t.id ? C.blueDim : C.surfaceAlt,
                color: tab === t.id ? C.blue : C.muted,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui",
                transition: "all .15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Submit Feedback tab ───────────────────────────────────── */}
        {tab === "form" && (
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap", maxWidth: 860 }}>
            {/* Main form card */}
            <div style={{ flex: "1 1 320px", background: C.surface, borderRadius: 16, padding: "22px 24px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted, marginBottom: 18 }}>💬 Send Feedback</div>

              {/* Type selector */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.muted, marginBottom: 10 }}>What type of feedback?</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {TYPE_OPTIONS.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setFeedbackType(opt.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: feedbackType === opt.id ? `2px solid ${C.blue}` : `2px solid ${C.border}`,
                      background: feedbackType === opt.id ? C.blueDim : C.surfaceAlt,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{opt.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{opt.label}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{opt.sub}</div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.muted, marginBottom: 6 }}>Summary</div>
                <input
                  defaultValue="Mastery bar not updating after session ends"
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.blueBorder}`, borderRadius: 10, fontSize: 13, fontFamily: "system-ui", background: C.surfaceAlt, color: C.text, outline: "none" }}
                />
              </div>

              {/* Details */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.muted, marginBottom: 6 }}>Details</div>
                <textarea
                  defaultValue="I viewed a student's profile after their session ended but the mastery bar for Long Division still shows the old value. Refreshing the page fixes it but the stale state is confusing."
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.blueBorder}`, borderRadius: 10, fontSize: 13, fontFamily: "system-ui", background: C.surfaceAlt, color: C.text, outline: "none", resize: "vertical", minHeight: 90 }}
                />
              </div>

              {/* Where */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.muted, marginBottom: 6 }}>Where did this happen?</div>
                <select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.blueBorder}`, borderRadius: 10, fontSize: 13, fontFamily: "system-ui", background: C.surface, color: C.text, outline: "none" }}>
                  <option>Student detail page</option>
                  <option>Teacher home</option>
                  <option>Support queue</option>
                  <option>Command center</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Severity */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.muted, marginBottom: 6 }}>Severity</div>
                <select style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.blueBorder}`, borderRadius: 10, fontSize: 13, fontFamily: "system-ui", background: C.surface, color: C.text, outline: "none" }}>
                  <option>Minor — doesn't block my work</option>
                  <option>Moderate — causes confusion but workaround exists</option>
                  <option>Major — significantly impacts my teaching</option>
                  <option>Critical — platform is unusable</option>
                </select>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>Critical = P0, gets immediate response. Major = P1, reviewed within 24h.</div>
              </div>

              <button style={{ width: "100%", padding: "12px 16px", background: C.blue, color: "#0c1a27", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>
                Submit feedback
              </button>
            </div>

            {/* Right column */}
            <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {/* How we use feedback */}
              <div style={{ background: C.surface, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted, marginBottom: 14 }}>📊 How we use feedback</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.75 }}>
                  <div>🐛 <strong style={{ color: C.text }}>Bugs</strong> — investigated within 48h. Critical bugs get same-day response.</div>
                  <div style={{ marginTop: 8 }}>💡 <strong style={{ color: C.text }}>Feature requests</strong> — reviewed monthly. Popular requests get prioritised.</div>
                  <div style={{ marginTop: 8 }}>📚 <strong style={{ color: C.text }}>Content issues</strong> — reviewed by curriculum team within 5 days.</div>
                  <div style={{ marginTop: 8 }}>❓ <strong style={{ color: C.text }}>Questions</strong> — answered within 2 business days.</div>
                </div>
              </div>

              {/* NPS rating */}
              <div style={{ background: C.surface, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: C.muted, marginBottom: 12 }}>⭐ How's WonderQuest?</div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Rate your experience this term</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      style={{ fontSize: 22, cursor: "pointer", opacity: star <= rating ? 1 : 0.28, transition: "opacity .12s" }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{rating} of 5 — What would make it 5?</div>
                <textarea
                  placeholder="Optional comment…"
                  style={{ width: "100%", padding: "8px 10px", border: `1.5px solid ${C.blueBorder}`, borderRadius: 10, fontSize: 12, fontFamily: "system-ui", background: C.surfaceAlt, color: C.text, outline: "none", resize: "vertical", minHeight: 60 }}
                />
                <button style={{ width: "100%", marginTop: 10, padding: "9px 14px", background: "transparent", color: C.blue, border: `1.5px solid ${C.blueBorder}`, borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui" }}>
                  Submit rating
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Submitted Feedback tab ────────────────────────────────── */}
        {tab === "submitted" && (
          <div style={{ maxWidth: 680 }}>
            {FEEDBACK_ITEMS.map((item, i) => {
              const badge = TYPE_BADGE[item.type];
              return (
                <div key={i} style={{ background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}`, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: badge.bg, color: badge.color }}>{badge.label}</span>
                      {item.severity && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 6, background: C.amberDim, color: "#fbbf24" }}>{item.severity}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: C.muted }}>{item.date}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 8 }}>{item.preview}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.statusColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>{item.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Notifications tab ─────────────────────────────────────── */}
        {tab === "notifs" && (
          <div style={{ maxWidth: 680 }}>
            {NOTIFS.map((notif, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: C.surface, borderRadius: 12, padding: "16px 18px", border: `1px solid ${notif.unread ? C.blueBorder : C.border}`, marginBottom: 10 }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{notif.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                    {notif.unread && (
                      <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: C.blue, marginRight: 6, verticalAlign: "middle" }} />
                    )}
                    {notif.title}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 6 }}>{notif.body}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{notif.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppFrame>
  );
}
