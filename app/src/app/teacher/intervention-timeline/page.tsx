"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";
import { fetchTeacherId } from "@/lib/teacher-identity";
import TeacherGate from "../teacher-gate";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  text: "#f0f6ff",
  muted: "#8b949e",
  violet: "#9b72ff",
  blue: "#38bdf8",
  mint: "#50e890",
  gold: "#ffd166",
  amber: "#f59e0b",
  red: "#ff7b6b",
};

// ── API shape ─────────────────────────────────────────────────────────────────
type ApiIntervention = {
  id: string;
  studentId: string;
  studentName: string;
  skillCode: string | null;
  reason: string;
  interventionType: string;
  status: string;
  teacherNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function typeIcon(interventionType: string): string {
  const t = interventionType.toLowerCase();
  if (t.includes("absence") || t.includes("absent")) return "📅";
  if (t.includes("hint"))    return "💡";
  if (t.includes("parent"))  return "👨‍👩‍👧";
  if (t.includes("prereq"))  return "🔗";
  if (t.includes("custom"))  return "🗒️";
  if (t.includes("band") || t.includes("ceiling")) return "💙";
  return "⚠️";
}

function statusBadgeStyle(status: string): { bg: string; color: string; label: string } {
  if (status === "resolved") return { bg: "rgba(80,232,144,0.15)", color: C.mint, label: "✅ Resolved" };
  return { bg: "rgba(245,158,11,0.15)", color: C.amber, label: "⚠️ Active" };
}

type DateBucket = "Today" | "Yesterday" | "Last 7 days" | "Older";

function dateBucket(iso: string): DateBucket {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff <= 6) return "Last 7 days";
  return "Older";
}

const BUCKET_ORDER: DateBucket[] = ["Today", "Yesterday", "Last 7 days", "Older"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function InterventionTimelinePage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { fetchTeacherId().then(id => setAuthed(!!id)); }, []);

  const [activeTab, setActiveTab] = useState<"all" | "active" | "resolved">("all");
  const [interventions, setInterventions] = useState<ApiIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { void (async () => {
    if (!authed) return;
    const teacherId = await fetchTeacherId();
    const url = `/api/teacher/interventions?teacherId=${encodeURIComponent(teacherId)}&status=all`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { interventions: ApiIntervention[] }) => {
        const all = (data.interventions ?? []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setInterventions(all);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  })(); }, [authed]);

  if (!authed) {
    return (
      <AppFrame audience="teacher" currentPath="/teacher">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px" }}>
          <TeacherGate configured={true} />
        </div>
      </AppFrame>
    );
  }

  const filtered = interventions.filter((iv) => {
    if (activeTab === "active")   return iv.status === "active";
    if (activeTab === "resolved") return iv.status === "resolved";
    return true;
  });

  const activeCount   = interventions.filter((iv) => iv.status === "active").length;
  const resolvedCount = interventions.filter((iv) => iv.status === "resolved").length;

  // Group by date bucket
  const grouped = new Map<DateBucket, ApiIntervention[]>();
  for (const bucket of BUCKET_ORDER) grouped.set(bucket, []);
  for (const iv of filtered) {
    const bucket = dateBucket(iv.createdAt);
    grouped.get(bucket)!.push(iv);
  }

  return (
    <AppFrame audience="teacher" currentPath="/teacher/intervention-overview">
      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Page heading */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.blue, letterSpacing: "-0.3px", marginBottom: 4 }}>
              Intervention Timeline
            </div>
            <div style={{ fontSize: 13, color: C.muted }}>
              {loading
                ? "Loading interventions…"
                : error
                ? "Could not load interventions"
                : `${activeCount} active · ${resolvedCount} resolved`}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${C.border}` }}>
            {([
              { key: "all",      label: "All"      },
              { key: "active",   label: "Active"   },
              { key: "resolved", label: "Resolved" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === tab.key ? C.blue : C.muted,
                  borderBottom: activeTab === tab.key ? `2px solid ${C.blue}` : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.muted, padding: "20px 0" }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                border: `2px solid ${C.blue}`, borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
              }} />
              Loading…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", color: C.muted, fontSize: 13 }}>
              ⚠️ Could not load intervention data. Please refresh and try again.
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No interventions found</div>
              <div style={{ fontSize: 13, color: C.muted }}>
                {activeTab === "active"
                  ? "No active interventions — all students are on track!"
                  : activeTab === "resolved"
                  ? "No resolved interventions yet."
                  : "No interventions on record."}
              </div>
            </div>
          )}

          {/* Grouped timeline */}
          {!loading && !error && filtered.length > 0 && (
            <>
              {BUCKET_ORDER.map((bucket) => {
                const items = grouped.get(bucket) ?? [];
                if (items.length === 0) return null;
                return (
                  <div key={bucket} style={{ marginBottom: 28 }}>
                    {/* Bucket label */}
                    <div style={{
                      fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                      letterSpacing: "0.08em", color: C.muted,
                      marginBottom: 12, paddingLeft: 2,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <span>{bucket}</span>
                      <span style={{ background: "rgba(255,255,255,0.06)", color: C.muted, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                        {items.length}
                      </span>
                    </div>

                    {/* Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {items.map((iv) => {
                        const badge = statusBadgeStyle(iv.status);
                        const icon = typeIcon(iv.interventionType);
                        return (
                          <Link
                            key={iv.id}
                            href={`/teacher/intervention-detail/${iv.id}`}
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            <div style={{
                              background: C.surface,
                              border: `1px solid ${C.border}`,
                              borderLeft: `4px solid ${iv.status === "active" ? C.amber : C.mint}`,
                              borderRadius: 12,
                              padding: "14px 16px",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 14,
                              cursor: "pointer",
                            }}>
                              {/* Type icon */}
                              <div style={{
                                width: 36, height: 36, borderRadius: "50%",
                                background: iv.status === "active" ? "rgba(245,158,11,0.15)" : "rgba(80,232,144,0.12)",
                                border: `2px solid ${iv.status === "active" ? C.amber : C.mint}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16, flexShrink: 0,
                              }}>
                                {icon}
                              </div>

                              {/* Body */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                                  <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                                    {iv.studentName}
                                  </span>
                                  {iv.skillCode && (
                                    <span style={{ fontSize: 11, fontWeight: 700, color: C.violet, background: C.violet + "18", padding: "2px 8px", borderRadius: 10 }}>
                                      {iv.skillCode}
                                    </span>
                                  )}
                                  <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    padding: "2px 10px", borderRadius: 20,
                                    background: badge.bg, color: badge.color,
                                  }}>
                                    {badge.label}
                                  </span>
                                </div>
                                <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, lineHeight: 1.4 }}>
                                  {iv.reason}
                                </div>
                                <div style={{ fontSize: 11, color: C.muted }}>
                                  {formatDateTime(iv.createdAt)}
                                  {iv.resolvedAt && ` → Resolved ${formatDateTime(iv.resolvedAt)}`}
                                </div>
                              </div>

                              {/* Arrow */}
                              <div style={{ color: C.muted, fontSize: 18, flexShrink: 0, alignSelf: "center" }}>›</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Legend */}
          <div style={{ marginTop: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.muted, marginBottom: 12 }}>Intervention Type Icons</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                { icon: "⚠️", label: "General / Confidence" },
                { icon: "📅", label: "Absence" },
                { icon: "💡", label: "Hint pattern" },
                { icon: "💙", label: "Band ceiling" },
                { icon: "🗒️", label: "Custom note" },
                { icon: "👨‍👩‍👧", label: "Parent suggestion" },
                { icon: "✅", label: "Resolved" },
              ].map((leg) => (
                <span key={leg.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", color: C.muted, fontWeight: 600 }}>
                  {leg.icon} {leg.label}
                </span>
              ))}
            </div>
          </div>

          {/* Privacy note */}
          <div style={{ marginTop: 16, fontSize: 12, color: C.muted, background: "rgba(56,189,248,0.05)", border: `1px solid rgba(56,189,248,0.12)`, borderRadius: 8, padding: "10px 14px", lineHeight: 1.6 }}>
            🔒 Teacher notes are private to you. No accuracy %, wrong answers, or session-level data is shown here.
            Resolved interventions are archived for 90 days, then anonymised.
          </div>

          {/* Back link */}
          <div style={{ marginTop: 20 }}>
            <a href="/teacher/support" style={{ fontSize: 13, fontWeight: 600, color: C.blue, textDecoration: "none" }}>← Back to Support Queue</a>
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
