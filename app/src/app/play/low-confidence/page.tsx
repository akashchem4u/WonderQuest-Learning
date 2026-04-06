"use client";

import { useState } from "react";
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
  coral: "#ff7b6b",
  correct: "#50e890",
  text: "#e8e0ff",
  muted: "#9080c0",
  dimBorder: "#2a1f60",
};

type TabId = "review" | "practice" | "done";

// ─── Shared sub-components ────────────────────────────────────────────────────
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

function AnnoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fffbea", border: "2px solid #f0c040", borderRadius: 10,
      padding: "12px 16px", fontSize: "0.78rem", fontWeight: 700, color: "#3a2800",
      lineHeight: 1.6, maxWidth: 390, width: "100%",
    }}>
      <div style={{ fontSize: "0.82rem", marginBottom: 6, color: "#7a4800", fontWeight: 700 }}>{title}</div>
      {children}
    </div>
  );
}

function ConfidenceMeter({ fillWidth, gradient, height = 10 }: { fillWidth: string; gradient: string; height?: number }) {
  return (
    <div style={{ height, background: "#1a1440", borderRadius: 5, overflow: "hidden" }}>
      <div style={{ height: "100%", width: fillWidth, borderRadius: 5, background: gradient }} />
    </div>
  );
}

// ─── Stub question choices (In Practice tab) ─────────────────────────────────
const PRACTICE_CHOICES = [
  { letter: "C", phoneme: "cuh" },
  { letter: "T", phoneme: "tuh" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PlayLowConfidencePage() {
  const [activeTab, setActiveTab] = useState<TabId>("review");
  const [selected, setSelected] = useState<number | null>(null);

  const handleChoice = (i: number) => setSelected(i);

  return (
    <AppFrame audience="kid">
      <div style={{ ...FONT, background: "#0a0a12", minHeight: "100vh", padding: "24px 16px 48px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <style>{`
          @keyframes pop {
            from { transform: scale(0.3); opacity: 0; }
            60%  { transform: scale(1.15); }
            to   { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <p style={{ fontSize: "1rem", fontWeight: 900, color: C.muted, letterSpacing: "0.04em" }}>
          play-low-confidence-retry-v2 · WonderQuest Design System
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {([
            { id: "review", label: "Skill Review" },
            { id: "practice", label: "In Practice" },
            { id: "done", label: "Practice Done" },
          ] as { id: TabId; label: string }[]).map(({ id, label }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSelected(null); }} style={{
              padding: "7px 14px", borderRadius: 20,
              border: `1.5px solid ${activeTab === id ? C.violet : "#2a2050"}`,
              background: activeTab === id ? C.violet : "#14102a",
              color: activeTab === id ? "#fff" : C.muted,
              ...FONT, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Skill Review ── */}
        {activeTab === "review" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <AnnoBox title="Skill Review — Practice Mode Offer">
              Shown at session start when system detects low confidence on a skill.
              Confidence meter shows current level (low = red-to-gold gradient).
              Practice plan: 3 scaffolded questions. Child opts in — never forced.
              Stars awarded for practice questions too.
            </AnnoBox>

            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                padding: "24px 20px 28px", gap: 14,
              }}>
                {/* Practice banner */}
                <div style={{
                  background: "linear-gradient(135deg, #1a1040, #221960)",
                  border: `2px solid ${C.violet}44`, borderRadius: 16,
                  padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, flexShrink: 0,
                }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase", color: C.violet }}>
                    🎯 Practice Mode
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff" }}>Let's practice one skill!</div>
                  <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#b0a0e0", lineHeight: 1.4 }}>
                    You've been working on Beginning Sounds. A little practice now will make it easier!
                  </div>
                </div>

                {/* Skill card */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  background: C.card2, border: `1.5px solid ${C.violet}44`,
                  borderRadius: 14, padding: "14px 16px", flexShrink: 0,
                }}>
                  <span style={{ fontSize: "2.4rem", flexShrink: 0 }}>🔤</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: "0.96rem", fontWeight: 900, color: "#fff" }}>Beginning Sounds</div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: C.muted }}>K-1 · Phonics · 3 practice questions</div>
                  </div>
                </div>

                {/* Confidence meter */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700, color: "#6050a0" }}>
                    <span>Your confidence</span>
                    <span style={{ color: "#ff9b6b" }}>Building up… 💪</span>
                  </div>
                  <ConfidenceMeter fillWidth="22%" gradient="linear-gradient(90deg, #ff7b6b, #ffd166)" />
                </div>

                {/* Practice plan */}
                <div style={{
                  background: "#14102a", border: `1.5px solid ${C.border}`,
                  borderRadius: 12, padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 8, flexShrink: 0,
                }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6050a0" }}>
                    Today's practice plan
                  </div>
                  {[
                    "Start with easy words (2 choices)",
                    "Try normal words (4 choices)",
                    "One challenge word! (4 choices)",
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.violet, flexShrink: 0 }} />
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#b0a0e0" }}>{item}</div>
                    </div>
                  ))}
                </div>

                <CoachRow message="This will only take a minute — and you'll feel so much more confident after!" />

                <button onClick={() => setActiveTab("practice")} style={{
                  height: 54, borderRadius: 27, border: "none",
                  background: "linear-gradient(135deg, #9b72ff, #7248e8)", color: "#fff",
                  ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer", flexShrink: 0,
                }}>
                  Start 3-question practice! ▶
                </button>
                <button style={{
                  height: 44, borderRadius: 22, background: "none",
                  border: `1.5px solid ${C.border}`, color: C.muted,
                  ...FONT, fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", flexShrink: 0,
                }}>
                  Skip to regular session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: In Practice ── */}
        {activeTab === "practice" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <AnnoBox title="In Practice — Easier Questions, Clear Mode Label">
              Practice topbar shows mode label + dot progress (3 dots for 3 Qs).
              Questions are scaffolded: 2 choices instead of 4, picture/phoneme hints shown.
              Stars awarded normally. No timer. Practice mode badge persistent at top.
            </AnnoBox>

            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                padding: "24px 20px 28px", gap: 14,
              }}>
                {/* Practice topbar */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#1a1040", border: `1.5px solid ${C.violet}33`,
                  borderRadius: 12, padding: "8px 12px", flexShrink: 0,
                }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 900, color: C.violet }}>
                    🎯 Practice — Beginning Sounds
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[true, "current", false].map((state, i) => (
                      <div key={i} style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: state === true ? C.violet : state === "current" ? `${C.violet}55` : "#2a2050",
                        border: state === "current" ? `2px solid ${C.violet}` : "none",
                      }} />
                    ))}
                  </div>
                </div>

                {/* Question hero */}
                <div style={{
                  background: "#1a1440", border: `2px solid ${C.violet}44`,
                  borderRadius: 16, padding: 18,
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 8, flexShrink: 0,
                }}>
                  <span style={{ fontSize: "3rem" }}>🐱</span>
                  <div style={{ fontSize: "1rem", fontWeight: 900, color: "#fff" }}>"cat" starts with…</div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: C.muted }}>(Hint: it sounds like "cuh"!)</div>
                </div>

                {/* 2-choice grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
                  {PRACTICE_CHOICES.map((choice, i) => {
                    const isSelected = selected === i;
                    const isCorrect = i === 0; // "C" is correct
                    const showResult = isSelected;

                    let borderColor = "#2a2060";
                    let bg = "#1a1440";
                    let letterColor = C.text;

                    if (showResult && isCorrect) {
                      borderColor = C.correct; bg = "#0d2a1a"; letterColor = C.correct;
                    } else if (showResult && !isCorrect) {
                      borderColor = C.coral; bg = "#2a0e0e"; letterColor = C.coral;
                    }

                    return (
                      <div key={i} onClick={() => handleChoice(i)} style={{
                        background: bg, border: `2px solid ${borderColor}`,
                        borderRadius: 14, height: 86,
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: 4,
                        fontSize: "2.4rem", fontWeight: 900,
                        cursor: "pointer", color: letterColor,
                        transition: "all 0.15s",
                      }}>
                        {choice.letter}
                        <span style={{ fontSize: "0.7rem", color: isSelected ? letterColor : C.muted, fontWeight: 700 }}>
                          {choice.phoneme}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6050a0", textAlign: "center", flexShrink: 0 }}>
                  Question 2 of 3 · ⭐ 1 star earned
                </div>

                <CoachRow message='Say "cat" slowly — "cuh-aaa-t" — what letter do you hear first?' />

                {selected !== null && (
                  <button onClick={() => setActiveTab("done")} style={{
                    height: 54, borderRadius: 27, border: "none",
                    background: "linear-gradient(135deg, #9b72ff, #7248e8)", color: "#fff",
                    ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer", flexShrink: 0,
                  }}>
                    Next question →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Practice Done ── */}
        {activeTab === "done" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
            <AnnoBox title="Practice Done — Confidence Increased">
              Confidence meter shows before/after (from 22% to 55%). Big celebration. "Now let's try the real session!" CTA. Stars earned in practice are KEPT. Coach sends off encouragingly.
            </AnnoBox>

            <div style={{
              width: 390, height: 700, borderRadius: 40,
              background: C.bg, border: `2.5px solid ${C.dimBorder}`,
              boxShadow: `0 0 0 1px ${C.violet}22, 0 24px 48px #00000088`,
              position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                padding: "24px 20px 28px", gap: 14,
              }}>
                {/* Done hero */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: 1, justifyContent: "center" }}>
                  <div style={{ fontSize: "4rem", animation: "pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>🌟</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", textAlign: "center" }}>
                    Practice complete!
                  </div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#b0a0e0", textAlign: "center", lineHeight: 1.4 }}>
                    You got all 3 practice questions right — your skills are growing!
                  </div>

                  {/* Confidence before/after */}
                  <div style={{
                    background: "#1a2a15", border: `1.5px solid rgba(80,232,144,0.27)`,
                    borderRadius: 12, padding: "10px 16px", width: "100%",
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: C.correct }}>
                      Confidence level
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 700, color: "#6050a0" }}>
                      <span>Before practice</span>
                      <span>After practice</span>
                    </div>
                    {/* Before bar (faint) */}
                    <div style={{ height: 12, background: "#1a1440", borderRadius: 5, overflow: "hidden", position: "relative", marginTop: 2 }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "22%", background: "linear-gradient(90deg, #ff7b6b, #ffd166)", borderRadius: 5, opacity: 0.4 }} />
                      <div style={{ height: "100%", width: "55%", borderRadius: 5, background: "linear-gradient(90deg, #ffd166, #9b72ff)" }} />
                    </div>
                    <div style={{ fontSize: "0.76rem", fontWeight: 700, color: C.correct, textAlign: "right" }}>
                      22% → 55% ✓
                    </div>
                  </div>
                </div>

                <CoachRow message="Look at that confidence jump! Now let's take that into the real session!" />

                <button onClick={() => setActiveTab("review")} style={{
                  height: 54, borderRadius: 27, border: "none",
                  background: "linear-gradient(135deg, #9b72ff, #7248e8)", color: "#fff",
                  ...FONT, fontSize: "1rem", fontWeight: 900, cursor: "pointer", flexShrink: 0,
                }}>
                  Start regular session → ⭐ 1 star earned
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppFrame>
  );
}
