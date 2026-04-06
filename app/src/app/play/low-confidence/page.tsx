"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg: "#100b2e",
  card: "#1a1440",
  card2: "#221960",
  border: "#2a2060",
  violet: "#9b72ff",
  gold: "#ffd166",
  mint: "#58e8c1",
  correct: "#50e890",
  text: "#e8e0ff",
  muted: "#9080c0",
  dimBorder: "#2a1f60",
};

function CoachRow({ message }: { message: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      background: C.card, border: `1.5px solid ${C.violet}33`, borderRadius: 12,
      padding: "11px 13px", flexShrink: 0,
    }}>
      <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>🦁</span>
      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#c8bef0", lineHeight: 1.4 }}>
        <div style={{ fontSize: "0.66rem", fontWeight: 900, color: C.violet, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
          Coach Leo
        </div>
        {message}
      </div>
    </div>
  );
}

function LowConfidenceInner() {
  const params = useSearchParams();
  const skill = params.get("skill") ?? "this skill";

  return (
    <AppFrame audience="kid">
      <div style={{
        ...FONT, background: "#0a0a12", minHeight: "100vh",
        padding: "32px 16px 48px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        <style>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          @keyframes fade-up {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Hero section */}
        <div style={{
          width: "100%", maxWidth: 390, textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <span style={{
            fontSize: "3.8rem",
            animation: "wiggle 1s ease-in-out infinite",
            display: "inline-block",
          }}>
            🌟
          </span>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
            That was a tough one!
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.5 }}>
            Let's look at it together 🌟
          </div>
        </div>

        {/* Question review card */}
        <div style={{
          width: "100%", maxWidth: 390,
          background: "linear-gradient(180deg, #1a1040 0%, #221960 100%)",
          border: `2px solid ${C.violet}44`, borderRadius: 20,
          padding: "20px 18px",
          display: "flex", flexDirection: "column", gap: 12,
          animation: "fade-up 0.4s 0.1s both",
        }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: C.violet }}>
            📋 Question Review
          </div>

          {/* Skill name badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: C.card, border: `1.5px solid ${C.violet}33`,
            borderRadius: 14, padding: "12px 14px",
          }}>
            <span style={{ fontSize: "2rem", flexShrink: 0 }}>🔤</span>
            <div>
              <div style={{ fontSize: "0.96rem", fontWeight: 900, color: "#fff" }}>{skill}</div>
              <div style={{ fontSize: "0.76rem", fontWeight: 700, color: C.muted, marginTop: 2 }}>
                Let's work through this together
              </div>
            </div>
          </div>

          <div style={{
            fontSize: "0.84rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.6,
            padding: "8px 0",
          }}>
            It's totally okay not to get it right every time — that's how we learn! Let's slow down and think through it together.
          </div>
        </div>

        {/* Tip / hint section */}
        <div style={{
          width: "100%", maxWidth: 390,
          background: "#1a2a15", border: "1.5px solid rgba(80,232,144,0.27)",
          borderRadius: 16, padding: "16px 18px",
          display: "flex", flexDirection: "column", gap: 10,
          animation: "fade-up 0.4s 0.2s both",
        }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: C.correct }}>
            💡 Here's a helpful hint...
          </div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#c8f0c8", lineHeight: 1.6 }}>
            Try saying the word out loud slowly. Break it into little pieces — one sound at a time. Your brain is already working hard on this!
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#0d2a1a", borderRadius: 10, padding: "8px 12px",
          }}>
            <span style={{ fontSize: "1.2rem" }}>🧠</span>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#90d890", lineHeight: 1.4 }}>
              Every try — even a wrong one — helps your brain grow!
            </div>
          </div>
        </div>

        {/* Coach Leo */}
        <div style={{ width: "100%", maxWidth: 390, animation: "fade-up 0.4s 0.3s both" }}>
          <CoachRow message={`You've got this! Let's try "${skill}" again — I'll be right here cheering you on! 🎉`} />
        </div>

        {/* CTA buttons */}
        <div style={{
          width: "100%", maxWidth: 390,
          display: "flex", flexDirection: "column", gap: 12,
          animation: "fade-up 0.4s 0.35s both",
        }}>
          <Link href="/play" style={{ textDecoration: "none" }}>
            <button style={{
              width: "100%", height: 58, borderRadius: 29, border: "none",
              background: "linear-gradient(135deg, #9b72ff, #7248e8)",
              color: "#fff", ...FONT, fontSize: "1.1rem", fontWeight: 900, cursor: "pointer",
              boxShadow: "0 4px 20px rgba(155,114,255,0.35)",
            }}>
              Try it again! 💪
            </button>
          </Link>

          <Link href="/child" style={{
            textAlign: "center", ...FONT,
            fontSize: "0.84rem", fontWeight: 700,
            color: "#6050a0", textDecoration: "underline", textUnderlineOffset: 2,
          }}>
            Skip for now
          </Link>
        </div>
      </div>
    </AppFrame>
  );
}

export default function PlayLowConfidencePage() {
  return (
    <Suspense fallback={
      <AppFrame audience="kid">
        <div style={{
          minHeight: "100vh", background: "#0a0a12",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#9080c0", fontFamily: "'Nunito', system-ui, sans-serif", fontSize: 16, fontWeight: 700,
        }}>
          Loading...
        </div>
      </AppFrame>
    }>
      <LowConfidenceInner />
    </Suspense>
  );
}
