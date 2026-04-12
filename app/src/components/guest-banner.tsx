"use client";
import { useState } from "react";

interface Props {
  onConvert: () => void;
  sessionCount?: number;
}

export function GuestBanner({ onConvert, sessionCount = 0 }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const hasProgress = sessionCount > 0;

  return (
    <div style={{
      width: "100%",
      background: hasProgress
        ? "linear-gradient(90deg, rgba(155,114,255,0.18) 0%, rgba(88,232,193,0.10) 100%)"
        : "rgba(245,158,11,0.12)",
      borderBottom: hasProgress
        ? "1px solid rgba(155,114,255,0.30)"
        : "1px solid rgba(245,158,11,0.28)",
      padding: "12px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 240 }}>
        <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>
          {hasProgress ? "🎉" : "👀"}
        </span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f6ff", marginBottom: 2 }}>
            {hasProgress
              ? `${sessionCount} quest${sessionCount !== 1 ? "s" : ""} completed — save your child's progress`
              : "Guest mode — exploring WonderQuest"}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.50)" }}>
            {hasProgress
              ? "Free account keeps stars, badges, skill progress & streaks. Takes 30 seconds."
              : "Progress resets in 24 hours unless you create a free account."}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button
          onClick={onConvert}
          style={{
            fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 10,
            background: hasProgress
              ? "linear-gradient(135deg, #9b72ff, #5a30d0)"
              : "rgba(245,158,11,0.85)",
            color: "#fff", border: "none", cursor: "pointer",
            boxShadow: hasProgress ? "0 2px 12px rgba(155,114,255,0.35)" : "none",
            whiteSpace: "nowrap",
          }}
        >
          {hasProgress ? "Save progress — free →" : "Create free account →"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none", border: "none",
            color: "rgba(255,255,255,0.35)", cursor: "pointer",
            fontSize: "1rem", padding: "4px", lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
