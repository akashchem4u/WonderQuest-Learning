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
};

type Priority = "P0" | "P1" | "P2";
type IssueType = "bug" | "ux" | "content";

const priorityColor: Record<Priority, string> = {
  P0: C.red,
  P1: C.amber,
  P2: C.blue,
};

const priorityBg: Record<Priority, string> = {
  P0: "rgba(248,81,73,0.15)",
  P1: "rgba(240,160,48,0.15)",
  P2: "rgba(56,189,248,0.12)",
};

interface OpenItem {
  id: string;
  priority: Priority;
  title: string;
  type: IssueType;
  daysOpen: number;
  assignee: string;
}

interface ResolvedItem {
  id: string;
  priority: Priority;
  title: string;
  type: IssueType;
  resolvedAt: string;
  resolutionNote: string;
}

const OPEN_ITEMS: OpenItem[] = [
  { id: "FB-2039", priority: "P0", title: "Assignment engine silent-failing — no tasks delivered to students", type: "bug", daysOpen: 1, assignee: "Sam Rivera" },
  { id: "FB-2047", priority: "P0", title: "Audio clips fail to load on Android 13 devices (Chromebook)", type: "bug", daysOpen: 0, assignee: "Jordan Lee" },
  { id: "FB-2044", priority: "P1", title: "Hint button tap target too small on iPhone SE — misses 30% of taps", type: "ux", daysOpen: 3, assignee: "Priya Nair" },
  { id: "FB-2042", priority: "P1", title: "Parent progress email shows wrong student name when siblings share device", type: "bug", daysOpen: 4, assignee: "Maya Chen" },
  { id: "FB-2045", priority: "P1", title: "P3 Social Studies content has incorrect answer for community helpers question", type: "content", daysOpen: 2, assignee: "Jordan Lee" },
  { id: "FB-2046", priority: "P2", title: "Theme transition causes 1–2s blank flash on older iPads", type: "bug", daysOpen: 5, assignee: "Sam Rivera" },
  { id: "FB-2040", priority: "P2", title: "Band label text overflows card on narrow screens (320px)", type: "ux", daysOpen: 6, assignee: "Priya Nair" },
  { id: "FB-2043", priority: "P2", title: "Space Pack — two planet descriptions are duplicated", type: "content", daysOpen: 3, assignee: "Maya Chen" },
];

const RESOLVED_ITEMS: ResolvedItem[] = [
  { id: "FB-2041", priority: "P0", title: "SSO token expiry — entire class locked out", type: "bug", resolvedAt: "Today, 11:32 AM", resolutionNote: "JWT refresh TTL misconfigured in deploy. Fixed in hotfix v2.4.8. All sessions re-issued." },
  { id: "FB-2036", priority: "P1", title: "Voice coach Orbit not audible on iPad mini at 50% volume", type: "bug", resolvedAt: "Yesterday, 4:15 PM", resolutionNote: "Audio normalization updated. Volume floor raised to 65% for voice-coach channel." },
  { id: "FB-2033", priority: "P1", title: "Teacher assignment panel showed stale cached counts", type: "bug", resolvedAt: "2 days ago", resolutionNote: "Cache TTL reduced to 30s. Force-refresh trigger added on assignment save." },
  { id: "FB-2029", priority: "P2", title: "Ocean pack thumbnail appears blurry on Retina displays", type: "content", resolvedAt: "3 days ago", resolutionNote: "2x asset re-exported and deployed. All theme pack thumbnails now ship @2x." },
  { id: "FB-2025", priority: "P2", title: "Progress bar animation jank on low-end Android devices", type: "ux", resolvedAt: "4 days ago", resolutionNote: "Replaced CSS animation with requestAnimationFrame implementation. 60fps on target devices." },
];

const typeIcon: Record<IssueType, string> = { bug: "🐛", ux: "🖌️", content: "📝" };

export default async function FeedbackResolutionPage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  const openP0 = OPEN_ITEMS.filter((i) => i.priority === "P0").length;
  const resolvedThisWeek = RESOLVED_ITEMS.length;
  const avgResolutionHours = 18;

  return (
    <AppFrame audience="owner" currentPath="/owner/feedback-resolution">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px 60px", fontFamily: "system-ui,-apple-system,sans-serif", color: C.text }}>
        {!allowed ? (
          <OwnerGate configured={configured} />
        ) : (
          <div style={{ maxWidth: 1100 }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, marginBottom: 6 }}>🔧 Feedback Resolution</h1>
              <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Track and close user-reported issues</p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
              {[
                { label: "Open Items", value: OPEN_ITEMS.length, sub: `${openP0} P0 critical`, valueColor: openP0 > 0 ? C.red : C.text },
                { label: "Resolved This Week", value: resolvedThisWeek, sub: "last 7 days", valueColor: C.accent },
                { label: "Avg Resolution Time", value: `${avgResolutionHours}h`, sub: "P0 SLA: 4h", valueColor: C.amber },
              ].map((s) => (
                <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.valueColor, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: C.muted, alignSelf: "center", marginRight: 4 }}>Filter:</span>
              {(["All", "P0 Critical", "P1 High", "P2 Medium"] as const).map((label) => {
                const active = label === "All";
                return (
                  <span
                    key={label}
                    style={{
                      display: "inline-block",
                      padding: "5px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: active ? "rgba(80,232,144,0.12)" : "rgba(255,255,255,0.05)",
                      color: active ? C.accent : C.muted,
                      border: `1px solid ${active ? "rgba(80,232,144,0.3)" : C.border}`,
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>

            {/* Open Items */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Open Items</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(248,81,73,0.15)", color: C.red, padding: "2px 8px", borderRadius: 10 }}>
                  {OPEN_ITEMS.length}
                </span>
              </div>
              {OPEN_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "13px 20px",
                    borderBottom: idx < OPEN_ITEMS.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  {/* Priority badge */}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: priorityBg[item.priority],
                      color: priorityColor[item.priority],
                      flexShrink: 0,
                      minWidth: 30,
                      textAlign: "center",
                    }}
                  >
                    {item.priority}
                  </span>

                  {/* Type icon */}
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{typeIcon[item.type]}</span>

                  {/* Title */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {item.id} · {item.type}
                    </div>
                  </div>

                  {/* Days open */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.daysOpen === 0 ? C.accent : item.daysOpen > 3 ? C.amber : C.text }}>
                      {item.daysOpen === 0 ? "Today" : `${item.daysOpen}d open`}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{item.assignee}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recently Resolved */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 32, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Recently Resolved</span>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(80,232,144,0.12)", color: C.accent, padding: "2px 8px", borderRadius: 10 }}>
                  {RESOLVED_ITEMS.length} this week
                </span>
              </div>
              {RESOLVED_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "13px 20px",
                    borderBottom: idx < RESOLVED_ITEMS.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  {/* Priority badge */}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: priorityBg[item.priority],
                      color: priorityColor[item.priority],
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {item.priority}
                  </span>

                  {/* Checkmark */}
                  <span style={{ fontSize: 14, flexShrink: 0, color: C.accent, marginTop: 1 }}>✓</span>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{item.title}</div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.muted,
                        background: "rgba(80,232,144,0.05)",
                        border: `1px solid rgba(80,232,144,0.1)`,
                        borderRadius: 6,
                        padding: "6px 10px",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.resolutionNote}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                      {item.id} · {item.type} · {item.resolvedAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 20, borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
              <Link href="/owner/feedback" style={{ fontSize: 13, color: C.muted, textDecoration: "none" }}>
                ← Feedback Queue
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
