"use client";

import { useCallback, useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#06071a",
  card: "#12152e",
  border: "rgba(255,255,255,0.07)",
  text: "#f0f6ff",
  muted: "rgba(240,246,255,0.45)",
  dimmed: "rgba(240,246,255,0.25)",
  violet: "#9b72ff",
  teal: "#2dd4bf",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface FunnelData {
  totalStudents: number;
  hadFirstSession: number;
  activeByDay7: number;
  activeByDay30: number;
  firstSessionRate: number;
}

interface GuardianData {
  total: number;
  linked: number;
  active7d: number;
}

interface SchoolRow {
  school: string;
  teachers: number;
  students: number;
  totalSessions: number;
  sessions7d: number;
  lastActivityAt: string | null;
}

interface TeacherRow {
  id: string;
  name: string;
  username: string;
  school: string;
  sessionCount: number;
  activeStudents: number;
  sessions7d: number;
  lastSessionAt: string | null;
}

interface AdoptionData {
  fetchedAt: string;
  funnel: FunnelData;
  guardians: GuardianData;
  bySchool: SchoolRow[];
  byTeacher: TeacherRow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString();
}

function pct(num: number, den: number): string {
  if (den === 0) return "—";
  return Math.round((100 * num) / den) + "%";
}

function relTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function teacherStatus(row: TeacherRow): { label: string; color: string } {
  if (row.sessions7d > 0) return { label: "Active", color: C.green };
  if (row.lastSessionAt) {
    const days = Math.floor((Date.now() - new Date(row.lastSessionAt).getTime()) / 86400000);
    if (days < 14) return { label: "Idle", color: C.amber };
  }
  return { label: "Dormant", color: C.red };
}

function schoolStatus(row: SchoolRow): { label: string; color: string } {
  if (row.sessions7d > 0) return { label: "Active", color: C.green };
  if (row.lastActivityAt) {
    const days = Math.floor((Date.now() - new Date(row.lastActivityAt).getTime()) / 86400000);
    if (days < 30) return { label: "Dormant", color: C.amber };
  }
  return { label: "New", color: C.teal };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 16, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "rgba(255,255,255,0.06)",
        animation: "pulse 1.4s ease-in-out infinite",
      }}
    />
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 700,
        color,
        background: color + "1a",
        border: `1px solid ${color}33`,
        borderRadius: 5,
        padding: "2px 8px",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── Funnel Bar ────────────────────────────────────────────────────────────────
function FunnelStep({
  label,
  count,
  total,
  convRate,
  color,
  isFirst,
}: {
  label: string;
  count: number;
  total: number;
  convRate: string;
  color: string;
  isFirst: boolean;
}) {
  const barPct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>{fmt(count)}</span>
          {!isFirst && (
            <span style={{ fontSize: 11, fontWeight: 700, color }}>
              {convRate}
            </span>
          )}
        </div>
      </div>
      <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${barPct}%`,
            background: color,
            borderRadius: 5,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdoptionPage() {
  const [data, setData] = useState<AdoptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setLoading(false);
      setError("Request timed out. Check your connection and retry.");
    }, 12000);
    fetch("/api/owner/adoption")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((d: AdoptionData & { error?: string }) => {
        clearTimeout(timer);
        if (d?.error) {
          setError(d.error);
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch((e: Error) => {
        clearTimeout(timer);
        setError(e.message ?? "Failed to load adoption data.");
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  const updatedLabel = data
    ? new Date(data.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <th
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        color: C.dimmed,
        padding: "10px 14px",
        textAlign: right ? "right" : "left",
        borderBottom: `1px solid ${C.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );

  const TD = ({
    children,
    right,
    muted,
  }: {
    children: React.ReactNode;
    right?: boolean;
    muted?: boolean;
  }) => (
    <td
      style={{
        padding: "10px 14px",
        fontSize: 13,
        color: muted ? C.muted : C.text,
        textAlign: right ? "right" : "left",
        borderBottom: `1px solid rgba(255,255,255,0.03)`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );

  return (
    <AppFrame audience="owner" currentPath="/owner/adoption">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <main
        style={{
          minHeight: "100vh",
          background: C.bg,
          padding: "20px 24px 40px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: C.text,
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.4px" }}>Adoption</div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              background: C.violet + "22",
              color: C.violet,
              border: `1px solid ${C.violet}44`,
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            Owner Only
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {updatedLabel && (
              <span style={{ fontSize: 12, color: C.dimmed }}>Updated {updatedLabel}</span>
            )}
            <button
              onClick={load}
              disabled={loading}
              style={{
                background: loading ? "rgba(255,255,255,0.05)" : "rgba(155,114,255,0.12)",
                border: `1px solid ${loading ? C.border : C.violet + "55"}`,
                color: loading ? C.muted : C.violet,
                fontSize: 12,
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: 7,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* ── Error state ─────────────────────────────────────────────────── */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: 10,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 13, color: "#fca5a5" }}>{error}</span>
            <button
              onClick={load}
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.35)",
                color: "#fca5a5",
                fontSize: 12,
                fontWeight: 700,
                padding: "5px 14px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Activation Funnel ────────────────────────────────────────────── */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "18px 20px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: C.dimmed, marginBottom: 16 }}>
            Activation Funnel
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Skeleton w={120} h={12} />
                    <Skeleton w={60} h={12} />
                  </div>
                  <Skeleton w="100%" h={10} r={5} />
                </div>
              ))}
            </div>
          ) : data ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 28px" }}>
              <FunnelStep
                label="Total Students"
                count={data.funnel.totalStudents}
                total={data.funnel.totalStudents}
                convRate="—"
                color={C.teal}
                isFirst
              />
              <FunnelStep
                label="Had First Session"
                count={data.funnel.hadFirstSession}
                total={data.funnel.totalStudents}
                convRate={pct(data.funnel.hadFirstSession, data.funnel.totalStudents)}
                color={C.violet}
                isFirst={false}
              />
              <FunnelStep
                label="Active by Day 7"
                count={data.funnel.activeByDay7}
                total={data.funnel.totalStudents}
                convRate={pct(data.funnel.activeByDay7, data.funnel.hadFirstSession)}
                color={C.amber}
                isFirst={false}
              />
              <FunnelStep
                label="Active by Day 30"
                count={data.funnel.activeByDay30}
                total={data.funnel.totalStudents}
                convRate={pct(data.funnel.activeByDay30, data.funnel.activeByDay7)}
                color={C.green}
                isFirst={false}
              />
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 13 }}>
              No adoption data yet
            </div>
          )}
        </div>

        {/* ── Guardian Engagement ──────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {(
            [
              {
                label: "Total Guardians",
                value: data?.guardians.total,
                sub: "All registered",
                color: C.teal,
              },
              {
                label: "Linked to a Child",
                value: data?.guardians.linked,
                sub: data ? `${pct(data.guardians.linked, data.guardians.total)} of total` : "—",
                color: C.violet,
              },
              {
                label: "Active This Week",
                value: data?.guardians.active7d,
                sub: data ? `${pct(data.guardians.active7d, data.guardians.linked)} of linked` : "—",
                color: C.green,
              },
            ] as { label: string; value: number | undefined; sub: string; color: string }[]
          ).map((card) => (
            <div
              key={card.label}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "16px 18px",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: C.dimmed, marginBottom: 8 }}>
                {card.label}
              </div>
              {loading ? (
                <Skeleton w={80} h={28} r={4} />
              ) : (
                <div style={{ fontSize: 28, fontWeight: 800, color: card.color, letterSpacing: "-0.5px", lineHeight: 1 }}>
                  {card.value !== undefined ? fmt(card.value) : "—"}
                </div>
              )}
              <div style={{ fontSize: 11, color: C.dimmed, marginTop: 6 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ── By School ────────────────────────────────────────────────────── */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 16px 0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: C.dimmed }}>
            By School
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <TH>School</TH>
                  <TH right>Teachers</TH>
                  <TH right>Students</TH>
                  <TH right>Sessions (7d)</TH>
                  <TH right>Last Activity</TH>
                  <TH right>Status</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      {[160, 50, 50, 70, 80, 70].map((w, j) => (
                        <td key={j} style={{ padding: "12px 14px" }}>
                          <Skeleton w={w} h={12} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data && data.bySchool.length > 0 ? (
                  data.bySchool.map((row) => {
                    const st = schoolStatus(row);
                    return (
                      <tr key={row.school} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                        <TD>
                          <span style={{ fontWeight: 600 }}>{row.school}</span>
                        </TD>
                        <TD right muted>{fmt(row.teachers)}</TD>
                        <TD right muted>{fmt(row.students)}</TD>
                        <TD right>
                          <span style={{ fontWeight: 700, color: row.sessions7d > 0 ? C.teal : C.muted }}>
                            {fmt(row.sessions7d)}
                          </span>
                        </TD>
                        <TD right muted>{relTime(row.lastActivityAt)}</TD>
                        <TD right>
                          <StatusBadge label={st.label} color={st.color} />
                        </TD>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: 13 }}>
                      No school data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── By Teacher ───────────────────────────────────────────────────── */}
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 16px 0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: C.dimmed }}>
            By Teacher
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <TH>Teacher</TH>
                  <TH>School</TH>
                  <TH right>Active Students</TH>
                  <TH right>Sessions (7d)</TH>
                  <TH right>Last Session</TH>
                  <TH right>Status</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[140, 120, 60, 70, 80, 70].map((w, j) => (
                        <td key={j} style={{ padding: "12px 14px" }}>
                          <Skeleton w={w} h={12} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data && data.byTeacher.length > 0 ? (
                  data.byTeacher.map((row) => {
                    const st = teacherStatus(row);
                    return (
                      <tr key={row.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                        <TD>
                          <div style={{ fontWeight: 600 }}>{row.name || row.username}</div>
                          {row.name && (
                            <div style={{ fontSize: 11, color: C.dimmed, marginTop: 1 }}>@{row.username}</div>
                          )}
                        </TD>
                        <TD muted>{row.school}</TD>
                        <TD right muted>{fmt(row.activeStudents)}</TD>
                        <TD right>
                          <span style={{ fontWeight: 700, color: row.sessions7d > 0 ? C.teal : C.muted }}>
                            {fmt(row.sessions7d)}
                          </span>
                        </TD>
                        <TD right muted>{relTime(row.lastSessionAt)}</TD>
                        <TD right>
                          <StatusBadge label={st.label} color={st.color} />
                        </TD>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px 0", textAlign: "center", color: C.muted, fontSize: 13 }}>
                      No teacher data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
