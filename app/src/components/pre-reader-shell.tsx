"use client";
import { useEffect } from "react";
import { useTTS } from "@/hooks/use-tts";

interface PreReaderShellProps {
  children: React.ReactNode;
  bandCode: string;
  pageTitle?: string;
  pageIntro?: string; // Text to auto-read on load
}

export function PreReaderShell({ children, bandCode, pageTitle: _pageTitle, pageIntro }: PreReaderShellProps) {
  const { speak } = useTTS();

  useEffect(() => {
    if (bandCode !== "PREK" && bandCode !== "K1") return;
    if (!pageIntro) return;
    // Small delay so UI renders first
    const t = setTimeout(() => speak(pageIntro), 600);
    return () => clearTimeout(t);
  }, [bandCode, pageIntro, speak]);

  if (bandCode !== "PREK" && bandCode !== "K1") return <>{children}</>;

  return (
    <div style={{ position: "relative" }}>
      {children}
      {/* Floating read-aloud button */}
      <button
        onClick={() => pageIntro && speak(pageIntro)}
        aria-label="Read this page aloud"
        style={{
          position: "fixed", bottom: 80, right: 16,
          width: 52, height: 52, borderRadius: "50%",
          background: "linear-gradient(135deg, #9b72ff, #7c3aed)",
          border: "none", color: "#fff", fontSize: 22,
          cursor: "pointer", zIndex: 100,
          boxShadow: "0 4px 16px rgba(155,114,255,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        🔊
      </button>
    </div>
  );
}
