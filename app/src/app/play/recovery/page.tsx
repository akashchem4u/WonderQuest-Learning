"use client";

import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#100b2e",
  surface: "#0e0a28",
  card: "#1a1440",
  card2: "#221960",
  border: "#2a1f60",
  violet: "#9b72ff",
  violetDim: "#7248e8",
  gold: "#ffd166",
  mint: "#58e8c1",
  correctGreen: "#50e890",
  wrong: "#ff7b6b",
  wrongBg: "#2a0f0f",
  text: "#e8e0ff",
  muted: "#9080c0",
  mutedDark: "#6050a0",
};

const FONT: React.CSSProperties = {
  fontFamily: "'Nunito', system-ui, sans-serif",
};

type RecoveryState = "struggling" | "coach-support" | "simpler-q" | "breakthrough";

const STATE_LABELS: { id: RecoveryState; label: string }[] = [
  { id: "struggling", label: "Struggling" },
  { id: "coach-support", label: "Coach Support" },
  { id: "simpler-q", label: "Simpler Q" },
  { id: "breakthrough", label: "Breakthrough" },
];

function ProgressBar({ segs, wrongAt }: { segs: number[]; wrongAt: number }) {
  return (
    <div style={{ display: "flex", gap: 4, flex: 1 }}>
      {segs.map((seg, i) => (
        <div key={i} style={{
          flex: 1, height: 6, borderRadius: 3,
          background: seg === 1 ? C.violet : seg === 2 ? "rgba(255,107,107,0.33)" : seg === 3 ? C.correctGreen : "#2a2050",
        }} />
      ))}
    </div>
  );
}

function CoachRow({ children, correctStyle }: { children: React.ReactNode; correctStyle?: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      background: correctStyle ? "#0d2018" : "#1e1040",
      border: `1.5px solid ${correctStyle ? "rgba(80,232,144,0.2)" : "rgba(155,114,255,0.27)"}`,
      borderRadius: 14, padding: "12px 14px", flexShrink: 0,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "#1a1040",
        border: `2px solid ${correctStyle ? "rgba(80,232,144,0.4)" : "rgba(155,114,255,0.4)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.4rem", flexShrink: 0,
      }}>🦁</div>
      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: correctStyle ? "#a0e8b8" : "#c8bef0", lineHeight: 1.5 }}>
        <div style={{
          fontSize: "0.68rem", fontWeight: 900,
          color: correctStyle ? C.correctGreen : C.violet,
          letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 3,
        }}>Coach Leo</div>
        {children}
      </div>
    </div>
  );
}

// ─── Struggling state ──────────────────────────────────────────────────────────
function StrugglingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "20px 16px 24px", gap: 12, overflow: "hidden" }}>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <ProgressBar segs={[1, 2, 0, 0, 0]} wrongAt={1} />
        <div style={{
          background: "#1a1440", border: "1.5px solid rgba(155,114,255,0.33)", borderRadius: 20,
          padding: "4px 10px", fontSize: "0.8rem", fontWeight: 900, color: "#c0a8ff", marginLeft: 10,
        }}>⭐ 4</div>
      </div>

      {/* Star-safe badge */}
      <div style={{
        background: "#1a2a15", border: "1.5px solid #50e890",
        borderRadius: 20, padding: "5px 12px",
        fontSize: "0.78rem", fontWeight: 900, color: C.correctGreen,
        display: "flex", alignItems: "center", gap: 5, alignSelf: "center", flexShrink: 0,
      }}>🛡 Your stars are safe!</div>

      {/* Question card — wrong state */}
      <div style={{
        background: C.card, border: "2px solid rgba(255,107,107,0.4)", borderRadius: 16,
        padding: 16, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8, flexShrink: 0,
        animation: "shake 0.4s ease",
      }}>
        <div style={{ fontSize: "3rem" }}>🐝</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 900, color: "#b89eff" }}>
          What letter does "bee" start with?
        </div>
      </div>

      {/* Answer grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
        {[
          { letter: "B", phoneme: "buh", wrong: false },
          { letter: "S", phoneme: "sss", wrong: true },
          { letter: "D", phoneme: "duh", wrong: false },
          { letter: "R", phoneme: "rrr", wrong: false },
        ].map(({ letter, phoneme, wrong }) => (
          <div key={letter} style={{
            background: wrong ? C.wrongBg : C.card,
            border: `2px solid ${wrong ? C.wrong : C.border}`,
            borderRadius: 14, height: 80,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 4,
            fontSize: "2rem", fontWeight: 900,
            color: wrong ? C.wrong : C.text, cursor: "pointer",
          }}>
            <span>{letter}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: wrong ? C.wrong : C.muted }}>{phoneme}</span>
          </div>
        ))}
      </div>

      {/* Recovery banner */}
      <div style={{
        background: "#1e1040", border: "2px solid rgba(155,114,255,0.33)", borderRadius: 16,
        padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>🧭</span>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>Want a little help?</div>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.4 }}>
              Coach Leo has a hint that might help you find it!
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onNext} style={{
            height: 52, borderRadius: 14,
            border: `1.5px solid ${C.violet}`,
            background: `linear-gradient(135deg, ${C.violet}, ${C.violetDim})`,
            color: "#fff", ...FONT, fontSize: "0.9rem", fontWeight: 900, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>💡 Get a hint from Coach Leo</button>
          <button style={{
            height: 52, borderRadius: 14,
            border: "1.5px solid #2a1f60",
            background: "#221960",
            color: "#b89eff", ...FONT, fontSize: "0.9rem", fontWeight: 900, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>↩ Try again on my own</button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

// ─── Coach Support state ───────────────────────────────────────────────────────
function CoachSupportScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "20px 16px 24px", gap: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <ProgressBar segs={[1, 2, 0, 0, 0]} wrongAt={1} />
        <div style={{
          background: "#1a1440", border: "1.5px solid rgba(155,114,255,0.33)", borderRadius: 20,
          padding: "4px 10px", fontSize: "0.8rem", fontWeight: 900, color: "#c0a8ff", marginLeft: 10,
        }}>⭐ 4</div>
      </div>

      {/* Question card */}
      <div style={{
        background: C.card, border: "2px solid rgba(155,114,255,0.27)", borderRadius: 16,
        padding: 16, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <div style={{ fontSize: "3rem" }}>🐝</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 900, color: "#b89eff" }}>
          What letter does "bee" start with?
        </div>
      </div>

      {/* Coach hint */}
      <CoachRow>
        Say "bee" out loud really slowly. What's the very first sound?<br />
        It sounds like <strong style={{ color: "#c9a8ff" }}>"buh"</strong> — find that letter!
      </CoachRow>

      {/* Answer grid with hint highlight */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
        {[
          { letter: "B", phoneme: "buh", hint: true, wrong: false, dimmed: false },
          { letter: "S", phoneme: "sss", hint: false, wrong: true, dimmed: false },
          { letter: "D", phoneme: "duh", hint: false, wrong: false, dimmed: true },
          { letter: "R", phoneme: "rrr", hint: false, wrong: false, dimmed: true },
        ].map(({ letter, phoneme, hint, wrong, dimmed }) => (
          <div key={letter} onClick={hint ? onNext : undefined} style={{
            background: hint ? "#221960" : wrong ? C.wrongBg : C.card,
            border: `2px solid ${hint ? C.violet : wrong ? C.wrong : C.border}`,
            borderRadius: 14, height: 80,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 4,
            fontSize: "2rem", fontWeight: 900,
            color: wrong ? C.wrong : C.text,
            opacity: dimmed ? 0.35 : 1,
            cursor: hint ? "pointer" : "default",
            boxShadow: hint ? "0 0 0 3px rgba(155,114,255,0.13)" : undefined,
          }}>
            <span>{letter}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: wrong ? C.wrong : C.muted }}>{phoneme}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: C.mutedDark, textAlign: "center", marginTop: 4 }}>
        Find the "buh" letter — tap it!
      </div>
    </div>
  );
}

// ─── Simpler Q state ───────────────────────────────────────────────────────────
function SimplerQScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "20px 16px 24px", gap: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <ProgressBar segs={[1, 2, 0, 0, 0]} wrongAt={1} />
        <div style={{
          background: "#1a1440", border: "1.5px solid rgba(155,114,255,0.33)", borderRadius: 20,
          padding: "4px 10px", fontSize: "0.8rem", fontWeight: 900, color: "#c0a8ff", marginLeft: 10,
        }}>⭐ 4</div>
      </div>

      {/* Simpler badge */}
      <div style={{
        background: "#2a1060", border: `1.5px solid ${C.violet}`, borderRadius: 20,
        padding: "4px 12px", fontSize: "0.72rem", fontWeight: 900, color: "#b89eff",
        alignSelf: "center", flexShrink: 0,
      }}>✨ Let's try an easier one first!</div>

      {/* Coach transition */}
      <CoachRow>
        No problem! Let's warm up with something a bit easier — you've got this!
      </CoachRow>

      {/* Simpler question card */}
      <div style={{
        background: C.card, border: "2px solid rgba(155,114,255,0.4)", borderRadius: 16,
        padding: 16, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8, flexShrink: 0,
      }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 900, color: C.violet, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Easier version
        </div>
        <div style={{ fontSize: "3rem" }}>🐱</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fff" }}>"cat" starts with…</div>
        <div style={{ fontSize: "0.8rem", color: C.muted, fontWeight: 700 }}>(Hint: it sounds like "cuh"!)</div>
      </div>

      {/* 2 choices only */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { letter: "C", phoneme: "cuh" },
          { letter: "T", phoneme: "tuh" },
        ].map(({ letter, phoneme }) => (
          <div key={letter} onClick={letter === "C" ? onNext : undefined} style={{
            background: C.card, border: `2px solid ${C.border}`, borderRadius: 14, height: 88,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 4, fontSize: "2.4rem", fontWeight: 900, color: C.text,
            cursor: letter === "C" ? "pointer" : "default",
          }}>
            <span>{letter}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: C.muted }}>{phoneme}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: C.mutedDark, textAlign: "center" }}>
        We'll go back to the harder one after this!
      </div>
    </div>
  );
}

// ─── Breakthrough state ────────────────────────────────────────────────────────
function BreakthroughScreen({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "20px 16px 24px", gap: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <ProgressBar segs={[1, 3, 0, 0, 0]} wrongAt={-1} />
        <div style={{
          background: "#1a1440", border: "1.5px solid rgba(80,232,144,0.27)", borderRadius: 20,
          padding: "4px 10px", fontSize: "0.8rem", fontWeight: 900, color: C.correctGreen, marginLeft: 10,
        }}>⭐ 5</div>
      </div>

      {/* Breakthrough hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, flex: 1, position: "relative" }}>
        {/* Burst rings */}
        <div style={{
          position: "absolute", width: 100, height: 100, borderRadius: "50%",
          border: "3px solid rgba(155,114,255,0.27)",
          animation: "burstRing 1s ease-out forwards",
        }} />
        <div style={{
          position: "absolute", width: 100, height: 100, borderRadius: "50%",
          border: "3px solid rgba(255,209,102,0.2)",
          animation: "burstRing 1s 0.15s ease-out forwards",
        }} />

        {/* Star */}
        <div style={{
          fontSize: "4rem", position: "relative", zIndex: 2,
          animation: "starPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}>⭐</div>

        <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>
          You figured it out! 🎉
        </div>
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#b89eff", textAlign: "center" }}>
          Keeping at it makes you stronger!
        </div>

        <div style={{
          background: `linear-gradient(135deg, ${C.violet}, ${C.violetDim})`,
          borderRadius: 24, padding: "8px 20px",
          fontSize: "0.9rem", fontWeight: 900, color: "#fff",
          animation: "starPop 0.4s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}>+1 ⭐ Earned</div>

        {/* Coach cheer */}
        <CoachRow correctStyle>
          That's the way! Next time you'll know it right away!
        </CoachRow>
      </div>

      <button onClick={onNext} style={{
        height: 56, borderRadius: 28, border: "none", width: "100%",
        fontSize: "1.05rem", fontWeight: 900, cursor: "pointer", flexShrink: 0,
        background: `linear-gradient(135deg, ${C.violet}, ${C.violetDim})`, color: "#fff",
        ...FONT,
      }}>Next question →</button>

      <style>{`
        @keyframes burstRing {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes starPop {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function RecoveryPage() {
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("struggling");

  const advance = () => {
    const order: RecoveryState[] = ["struggling", "coach-support", "simpler-q", "breakthrough"];
    const idx = order.indexOf(recoveryState);
    if (idx < order.length - 1) setRecoveryState(order[idx + 1]);
    else setRecoveryState("struggling");
  };

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0a12", minHeight: "100vh", padding: "24px 16px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

        {/* State tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {STATE_LABELS.map(({ id, label }) => (
            <button key={id} onClick={() => setRecoveryState(id)} style={{
              padding: "7px 14px", borderRadius: 20,
              border: `1.5px solid ${recoveryState === id ? C.violet : "#2a2050"}`,
              background: recoveryState === id ? C.violet : "#14102a",
              color: recoveryState === id ? "#fff" : C.muted,
              ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>

        {/* Phone */}
        <div style={{
          width: 390, height: 700, borderRadius: 40,
          background: "#100b2e", border: `2.5px solid ${C.border}`,
          boxShadow: "0 0 0 1px rgba(155,114,255,0.13), 0 24px 48px rgba(0,0,0,0.53)",
          position: "relative", overflow: "hidden", flexShrink: 0,
        }}>
          {recoveryState === "struggling" && <StrugglingScreen onNext={advance} />}
          {recoveryState === "coach-support" && <CoachSupportScreen onNext={advance} />}
          {recoveryState === "simpler-q" && <SimplerQScreen onNext={advance} />}
          {recoveryState === "breakthrough" && <BreakthroughScreen onNext={advance} />}
        </div>

        {/* Annotation */}
        <div style={{
          background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10,
          padding: "12px 16px", fontSize: "0.78rem", fontWeight: 700, color: "#3a2800",
          lineHeight: 1.6, maxWidth: 390, width: "100%",
        }}>
          {recoveryState === "struggling" && (
            <>
              <strong>Struggling — 2nd Wrong, Recovery Offer</strong><br />
              Child missed same question twice. Recovery banner appears. Star-safe badge reassures. Two options: "Get a hint" or "Try again on my own."
            </>
          )}
          {recoveryState === "coach-support" && (
            <>
              <strong>Coach Support — Personalized Hint</strong><br />
              Child chose "Get a hint." Coach appears with a bigger hint. One answer gets a subtle highlight. No penalty.
            </>
          )}
          {recoveryState === "simpler-q" && (
            <>
              <strong>Simpler Q — Scaffolded Question Offered</strong><br />
              After 3+ misses, system offers a simpler version of the same skill. 2 choices instead of 4. Stars still awarded.
            </>
          )}
          {recoveryState === "breakthrough" && (
            <>
              <strong>Breakthrough — Child Gets It After Recovery</strong><br />
              Bigger celebration than normal correct. Burst rings. "+1 ⭐ Earned" chip. "You figured it out!" framing.
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}
