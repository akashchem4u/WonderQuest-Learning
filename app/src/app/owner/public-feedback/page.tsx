"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const S = "#100b2e";
const SURFACE = "#161b22";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#f0f6ff";
const MUTED = "rgba(255,255,255,0.4)";
const VIOLET = "#9b72ff";
const TEAL = "#2dd4bf";
const AMBER = "#fbbf24";

interface FeedbackRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  rating: number | null;
  message: string;
  source: string;
  created_at: string;
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span style={{ color: MUTED, fontSize: 12 }}>No rating</span>;
  return (
    <span style={{ color: AMBER, fontSize: 14, letterSpacing: 2 }}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

function RolePill({ role }: { role: string | null }) {
  if (!role) return null;
  const color = role === "parent" ? VIOLET : role === "teacher" ? TEAL : MUTED;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
      background: `${color}22`, border: `1px solid ${color}44`, color,
      textTransform: "capitalize",
    }}>
      {role}
    </span>
  );
}

export default function PublicFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/public-feedback")
      .then(r => r.json())
      .then(d => { setRows(d.feedback ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: S, color: TEXT, fontFamily: "system-ui, sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <Link href="/owner" style={{ fontSize: 12, color: MUTED, textDecoration: "none" }}>← Owner</Link>
            <h1 style={{ margin: "6px 0 4px", fontSize: 22, fontWeight: 800 }}>Public Feedback</h1>
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>Submissions from wonderquest-learning.vercel.app/feedback</p>
          </div>
          <div style={{
            fontSize: 28, fontWeight: 900, color: VIOLET,
            background: `${VIOLET}18`, border: `1px solid ${VIOLET}33`,
            borderRadius: 12, padding: "8px 18px",
          }}>
            {rows.length}
          </div>
        </div>

        {loading && (
          <p style={{ color: MUTED, textAlign: "center", padding: 60 }}>Loading…</p>
        )}

        {!loading && rows.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 0", color: MUTED,
            border: `1px dashed ${BORDER}`, borderRadius: 14,
          }}>
            <p style={{ fontSize: 32, margin: "0 0 10px" }}>📭</p>
            <p style={{ margin: 0 }}>No feedback yet</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map(row => (
            <div key={row.id} style={{
              background: SURFACE, border: `1px solid ${BORDER}`,
              borderRadius: 14, padding: "16px 20px",
            }}>
              {/* Top row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <Stars rating={row.rating} />
                <RolePill role={row.role} />
                <span style={{ marginLeft: "auto", fontSize: 11, color: MUTED }}>
                  {new Date(row.created_at).toLocaleString()}
                </span>
              </div>

              {/* Message */}
              <p style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.6, color: TEXT }}>
                {row.message}
              </p>

              {/* Footer */}
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: MUTED }}>
                {row.name && <span>👤 {row.name}</span>}
                {row.email && (
                  <a href={`mailto:${row.email}`} style={{ color: TEAL, textDecoration: "none" }}>
                    ✉ {row.email}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
