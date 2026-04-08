"use client";
import { useEffect, useState } from "react";

export function DegradedBanner() {
  const [degraded, setDegraded] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then(r => r.json())
      .then(d => { setDegraded(!d.ok || d.db === "unavailable"); setChecked(true); })
      .catch(() => { setDegraded(true); setChecked(true); });
  }, []);

  if (!checked || !degraded) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 9998,
      background: "#7c2d12",
      borderBottom: "1px solid rgba(251,113,133,0.4)",
      padding: "10px 20px",
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 13, color: "#fef2f2",
    }}>
      <span>⚠️</span>
      <span style={{ flex: 1 }}>
        <strong>WonderQuest is having connection issues.</strong> Your progress is safe — please try again in a moment.
      </span>
    </div>
  );
}
