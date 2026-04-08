"use client";

import { useEffect, useState, useCallback } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0d1117",
  surface: "#161b22",
  border: "rgba(255,255,255,0.06)",
  borderFaint: "rgba(255,255,255,0.04)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.4)",
  muted2: "rgba(255,255,255,0.25)",
  mint: "#50e890",
  violet: "#9b72ff",
  red: "#f85149",
  amber: "#f59e0b",
  blue: "#58a6ff",
} as const;

const ACTION_BADGE: Record<string, { bg: string; color: string }> = {
  created:  { bg: "rgba(80,232,144,0.12)",  color: C.mint },
  updated:  { bg: "rgba(88,166,255,0.12)",  color: C.blue },
  flagged:  { bg: "rgba(245,158,11,0.12)",  color: C.amber },
  approved: { bg: "rgba(80,232,144,0.12)",  color: C.mint },
  rejected: { bg: "rgba(248,81,73,0.12)",   color: C.red },
  flag:     { bg: "rgba(245,158,11,0.12)",  color: C.amber },
  approve:  { bg: "rgba(80,232,144,0.12)",  color: C.mint },
  dismiss:  { bg: "rgba(88,166,255,0.12)",  color: C.blue },
};

interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changedBy: string;
  notes: string | null;
  createdAt: string;
}

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AuditLogClient() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/owner/audit-log");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { entries: AuditEntry[] };
      setEntries(data.entries.slice(0, 20));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => { void load(); }, 30_000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div
      style={{
        background: C.surface,
        borderRadius: "12px",
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        marginTop: "6px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 18px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.muted2 }}>
          Content Audit Log
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "9px",
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: "3px",
              background: "rgba(155,114,255,0.12)",
              color: C.violet,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Live · 30s
          </span>
          <span style={{ fontSize: "10px", color: C.muted }}>Last 20 entries</span>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ padding: "32px 18px", textAlign: "center", fontSize: "12px", color: C.muted }}>
          Loading…
        </div>
      ) : error ? (
        <div style={{ padding: "20px 18px", fontSize: "12px", color: C.red }}>
          {error}
        </div>
      ) : entries.length === 0 ? (
        <div
          style={{
            padding: "40px 18px",
            textAlign: "center",
            fontSize: "12px",
            color: C.muted,
          }}
        >
          No audit entries yet
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              {["Timestamp", "Entity", "Action", "Changed By", "Notes"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "8px 14px",
                    fontSize: "9px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: C.muted2,
                    borderBottom: `1px solid ${C.border}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const badge = ACTION_BADGE[entry.action] ?? { bg: "rgba(255,255,255,0.07)", color: C.muted };
              return (
                <tr
                  key={entry.id}
                  style={{
                    borderBottom: i < entries.length - 1 ? `1px solid ${C.borderFaint}` : "none",
                  }}
                >
                  <td style={{ padding: "8px 14px", color: C.muted2, whiteSpace: "nowrap" }}>
                    {formatTs(entry.createdAt)}
                  </td>
                  <td style={{ padding: "8px 14px", color: C.text }}>
                    <span style={{ color: C.muted, marginRight: "4px" }}>{entry.entityType}</span>
                    <span style={{ fontWeight: 600 }}>{entry.entityId}</span>
                  </td>
                  <td style={{ padding: "8px 14px" }}>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: badge.bg,
                        color: badge.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {entry.action}
                    </span>
                  </td>
                  <td style={{ padding: "8px 14px", color: C.muted, whiteSpace: "nowrap" }}>
                    {entry.changedBy}
                  </td>
                  <td style={{ padding: "8px 14px", color: C.muted, maxWidth: "240px" }}>
                    {entry.notes ?? <span style={{ color: C.muted2 }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
