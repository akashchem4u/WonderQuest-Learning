"use client";
import { useState } from "react";

interface Props {
  style?: React.CSSProperties;
}

export function GuestStartButton({ style }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/parent/guest", { method: "POST" });
    if (res.ok) {
      window.location.href = "/parent";
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        cursor: loading ? "wait" : "pointer",
        border: "none",
        opacity: loading ? 0.8 : 1,
        ...style,
      }}
    >
      {loading ? "Setting up…" : "Start with a Guest Account →"}
    </button>
  );
}
