"use client";
import { useState, useEffect } from "react";

interface SessionTimeoutBannerProps {
  sessionExpiresAt: string; // ISO timestamp
  onLogout: () => void;
}

export function SessionTimeoutBanner({ sessionExpiresAt, onLogout }: SessionTimeoutBannerProps) {
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function update() {
      const ms = new Date(sessionExpiresAt).getTime() - Date.now();
      const mins = Math.floor(ms / 60000);
      setMinutesLeft(mins);
    }
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  if (dismissed || minutesLeft === null || minutesLeft > 10 || minutesLeft < 0) return null;

  function handleStayLoggedIn() {
    fetch("/api/child/session").then(() => setDismissed(true));
  }

  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
      background: "#1a1540",
      border: "1px solid rgba(155,114,255,0.3)",
      borderRadius: 12, padding: "12px 20px",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      zIndex: 9999, maxWidth: 480, width: "calc(100% - 32px)",
    }}>
      <span style={{ fontSize: 18 }}>⏱</span>
      <span style={{ flex: 1, fontSize: 13, color: "#e8e0ff" }}>
        Your session expires in <strong>{minutesLeft} min</strong>
      </span>
      <button
        onClick={handleStayLoggedIn}
        style={{ padding: "7px 14px", borderRadius: 8, background: "#9b72ff", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
      >
        Stay logged in
      </button>
      <button
        onClick={onLogout}
        style={{ padding: "7px 12px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer" }}
      >
        Log out
      </button>
    </div>
  );
}
