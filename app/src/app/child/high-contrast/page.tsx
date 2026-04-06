"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

const C = {
  bg:        "#100b2e",
  card:      "#1e1840",
  border:    "#2a2060",
  violet:    "#9b72ff",
  gold:      "#ffd166",
  mint:      "#22c55e",
  text:      "#e8e0ff",
  muted:     "#9080c0",
  toggleOff: "#2a2060",
};

function Toggle({ checked, onChange, id, accentColor = C.gold }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
  accentColor?: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      style={{
        ...FONT,
        width: 60,
        height: 34,
        minHeight: 48,
        borderRadius: 17,
        border: `2px solid ${checked ? accentColor : C.toggleOff}`,
        background: checked ? accentColor : "#13102a",
        position: "relative",
        cursor: "pointer",
        flexShrink: 0,
        transition: "background 0.2s, border-color 0.2s",
        padding: 0,
        alignSelf: "center",
      }}
    >
      <span style={{
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        left: checked ? 30 : 4,
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: checked ? "#fff" : C.muted,
        transition: "left 0.2s",
        display: "block",
      }} />
    </button>
  );
}

function SettingRow({ id, emoji, label, hint, checked, onChange, accentColor }: {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accentColor?: string;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "18px 20px",
      background: C.card,
      borderRadius: 18,
      border: `1.5px solid ${checked ? (accentColor ?? C.gold) + "55" : C.border}`,
      minHeight: 72,
    }}>
      <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>{emoji}</span>
      <label htmlFor={id} style={{ flex: 1, cursor: "pointer" }}>
        <div style={{ ...FONT, fontSize: "1rem", fontWeight: 900, color: C.text, marginBottom: 2 }}>{label}</div>
        <div style={{ ...FONT, fontSize: "0.82rem", fontWeight: 700, color: C.muted, lineHeight: 1.4 }}>{hint}</div>
      </label>
      <Toggle id={id} checked={checked} onChange={onChange} accentColor={accentColor} />
    </div>
  );
}

export default function ChildAccessibilityPage() {
  const router = useRouter();

  const [highContrast, setHighContrast] = useState(false);
  const [largeText,    setLargeText]    = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saved,        setSaved]        = useState(false);

  // Auth check
  useEffect(() => {
    if (!document.cookie.includes("wonderquest-child-session")) {
      router.replace("/child");
    }
  }, [router]);

  // Load saved prefs
  useEffect(() => {
    try {
      setHighContrast(localStorage.getItem("wq_high_contrast") === "true");
      setLargeText(localStorage.getItem("wq_large_text") === "true");
      setReduceMotion(localStorage.getItem("wq_reduce_motion") === "true");
    } catch {
      // ignore
    }
  }, []);

  function handleHighContrast(v: boolean) {
    setHighContrast(v);
    if (typeof document !== "undefined") {
      document.body.classList.toggle("high-contrast", v);
    }
    setSaved(false);
  }

  function handleSave() {
    try {
      localStorage.setItem("wq_high_contrast", String(highContrast));
      localStorage.setItem("wq_large_text", String(largeText));
      localStorage.setItem("wq_reduce_motion", String(reduceMotion));
    } catch {
      // ignore
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>

      <div style={{
        ...FONT,
        background: C.bg,
        minHeight: "100vh",
        padding: "28px 16px 60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          animation: "fade-up 0.4s ease-out both",
        }}>

          {/* Back link */}
          <div>
            <Link href="/child/hub" style={{
              color: C.gold,
              fontWeight: 900,
              fontSize: 14,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              minHeight: 48,
            }}>
              ← Back to Hub
            </Link>
          </div>

          {/* Header */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.8rem", marginBottom: 8 }}>♿</div>
            <h1 style={{
              ...FONT,
              fontSize: "1.8rem",
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              lineHeight: 1.2,
            }}>
              How do you like things to look?
            </h1>
            <p style={{
              ...FONT,
              fontSize: "0.95rem",
              fontWeight: 700,
              color: C.muted,
              marginTop: 8,
              lineHeight: 1.5,
            }}>
              Change these to make WonderQuest feel just right for you!
            </p>
          </div>

          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.3rem" }}>👀</span>
            <span style={{
              ...FONT,
              fontSize: "0.78rem", fontWeight: 900,
              letterSpacing: "0.1em", textTransform: "uppercase" as const, color: C.muted,
            }}>
              How things look
            </span>
          </div>

          <SettingRow
            id="high-contrast"
            emoji="🔲"
            label="High Contrast"
            hint="Makes borders bigger and colours easier to see"
            checked={highContrast}
            onChange={handleHighContrast}
            accentColor={C.gold}
          />
          <SettingRow
            id="large-text"
            emoji="🔡"
            label="Larger Text"
            hint="Makes all the words bigger and easier to read"
            checked={largeText}
            onChange={(v) => { setLargeText(v); setSaved(false); }}
            accentColor={C.violet}
          />
          <SettingRow
            id="reduce-motion"
            emoji="🧘"
            label="Reduce Animations"
            hint="Turns off spinning and bouncing animations"
            checked={reduceMotion}
            onChange={(v) => { setReduceMotion(v); setSaved(false); }}
            accentColor={C.mint}
          />

          {/* Save button */}
          <button
            onClick={handleSave}
            style={{
              ...FONT,
              width: "100%",
              minHeight: 64,
              borderRadius: 20,
              border: "none",
              background: saved
                ? `linear-gradient(135deg, ${C.mint}, #16a34a)`
                : `linear-gradient(135deg, ${C.gold}, #e09000)`,
              color: saved ? "#fff" : "#1a0800",
              fontSize: "1.2rem",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: saved
                ? `0 4px 20px ${C.mint}55`
                : `0 4px 20px ${C.gold}55`,
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          >
            {saved ? "Saved! ✓" : "Save my picks ✨"}
          </button>

          {/* Friendly note */}
          <div style={{
            ...FONT,
            background: "#17133a",
            border: `1.5px solid ${C.border}`,
            borderRadius: 14,
            padding: "14px 18px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: C.muted,
            lineHeight: 1.5,
            textAlign: "center",
          }}>
            💡 A grown-up can also help you change these settings any time!
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
