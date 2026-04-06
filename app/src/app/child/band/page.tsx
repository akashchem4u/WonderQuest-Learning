"use client";

import Link from "next/link";
import { useState } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Band data ─────────────────────────────────────────────────────────────────
type BandId = "prek" | "k1" | "g23" | "g45";

type Band = {
  id: BandId;
  icon: string;
  name: string;
  ages: string;
  skills: string;
  nameColor: string;
  checkColor: string;
  bgGradient: string;
};

const BANDS: Band[] = [
  {
    id: "prek",
    icon: "🌈",
    name: "Pre-K Explorers",
    ages: "Ages 3-5 · Early learners",
    skills: "Letters, counting, shapes, colors. Big pictures and voice-first learning!",
    nameColor: "#ffd166",
    checkColor: "#2a2010",
    bgGradient: "linear-gradient(135deg, #2a2010 0%, #1a1408 100%)",
  },
  {
    id: "k1",
    icon: "⚡",
    name: "K-1 Adventurers",
    ages: "Ages 5-7 · Kindergarten-Grade 1",
    skills: "Phonics, first words, simple math. Where the real magic begins!",
    nameColor: "#9b72ff",
    checkColor: "#100b3a",
    bgGradient: "linear-gradient(135deg, #1e1470 0%, #100b3a 100%)",
  },
  {
    id: "g23",
    icon: "🌊",
    name: "G2-3 Questers",
    ages: "Ages 7-9 · Grades 2-3",
    skills: "Reading comprehension, multiplication, problem solving. More challenge unlocked!",
    nameColor: "#58e8c1",
    checkColor: "#0a2a28",
    bgGradient: "linear-gradient(135deg, #0a2a28 0%, #061a18 100%)",
  },
  {
    id: "g45",
    icon: "🔥",
    name: "G4-5 Champions",
    ages: "Ages 9-11 · Grades 4-5",
    skills: "Complex math, reading mastery, reasoning. For bold adventurers!",
    nameColor: "#ff7b6b",
    checkColor: "#2a1010",
    bgGradient: "linear-gradient(135deg, #2a1010 0%, #1a0808 100%)",
  },
];

// ── Compare table data ────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { label: "Ages", prek: "3-5", k1: "5-7", g23: "7-9", g45: "9-11" },
  { label: "Reading", prek: "Letters, ABCs", k1: "Phonics, words", g23: "Comprehension", g45: "Mastery" },
  { label: "Math", prek: "Counting, shapes", k1: "+/- basics", g23: "x/div, fractions", g45: "Multi-step" },
  { label: "Voice", prek: "All voice-first", k1: "Voice + text", g23: "Text + voice", g45: "Text-primary" },
  { label: "Questions", prek: "Big picture", k1: "Card choices", g23: "Mixed format", g45: "Complex" },
];

export default function ChildBandPage() {
  const [selectedBand, setSelectedBand] = useState<BandId | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const selectedBandData = BANDS.find((b) => b.id === selectedBand);

  return (
    <AppFrame audience="kid" currentPath="/child">
      <main
        style={{
          minHeight: "100vh",
          background: "#100b2e",
          fontFamily: "'Nunito', sans-serif",
          color: "#fff",
          padding: "32px 16px 60px",
        }}
      >
        {/* ── Back nav ───────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 900, margin: "0 auto 20px" }}>
          <Link
            href="/child"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(184,160,232,0.8)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            ← Home
          </Link>
        </div>

        {/* ── Page wrap ─────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#fff",
              textAlign: "center",
              margin: "0 0 8px",
            }}
          >
            {showCompare ? "Not sure which to pick? 🤔" : "What kind of quester are you? ⚡"}
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#b8a0e8",
              fontWeight: 700,
              textAlign: "center",
              margin: "0 0 28px",
            }}
          >
            {showCompare
              ? "Here is what each level covers — pick whatever feels right!"
              : "Pick your adventure level — you can always change it later!"}
          </p>

          {/* ── Compare toggle ──────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setShowCompare((v) => !v)}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                border: "2px solid #2e2a50",
                background: showCompare ? "#9b72ff" : "#1e1a40",
                color: showCompare ? "#fff" : "#aaa",
                fontFamily: "'Nunito', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {showCompare ? "Back to cards" : "Compare levels"}
            </button>
          </div>

          {/* ── Compare table ───────────────────────────────────────────── */}
          {showCompare && (
            <div
              style={{
                background: "#1a1060",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 28,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "10px 14px",
                        fontSize: 11,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        borderBottom: "2px solid #2a2060",
                        textAlign: "left",
                        color: "#7a6090",
                      }}
                    >
                      Level
                    </th>
                    {[
                      { label: "🌈 Pre-K", color: "#ffd166" },
                      { label: "⚡ K-1", color: "#9b72ff" },
                      { label: "🌊 G2-3", color: "#58e8c1" },
                      { label: "🔥 G4-5", color: "#ff7b6b" },
                    ].map(({ label, color }) => (
                      <th
                        key={label}
                        style={{
                          padding: "10px 14px",
                          fontSize: 11,
                          fontWeight: 900,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          borderBottom: "2px solid #2a2060",
                          textAlign: "left",
                          color,
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td
                        style={{
                          padding: "8px 14px",
                          borderBottom: "1px solid #1a1060",
                          color: "#7a6090",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {row.label}
                      </td>
                      {[row.prek, row.k1, row.g23, row.g45].map((val, i) => (
                        <td
                          key={i}
                          style={{
                            padding: "8px 14px",
                            borderBottom: "1px solid #1a1060",
                            color: "#c4a0ff",
                            fontWeight: 700,
                          }}
                        >
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Band grid ───────────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {BANDS.map((band) => {
              const isSelected = selectedBand === band.id;
              return (
                <button
                  key={band.id}
                  type="button"
                  onClick={() => setSelectedBand(band.id)}
                  style={{
                    background: band.bgGradient,
                    borderRadius: 24,
                    padding: "28px 24px",
                    cursor: "pointer",
                    border: isSelected ? "3px solid #fff" : "3px solid transparent",
                    transform: isSelected ? "scale(1.02)" : "none",
                    transition: "all 0.2s",
                    position: "relative",
                    overflow: "hidden",
                    textAlign: "left",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {/* Checkmark badge */}
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        width: 28,
                        height: 28,
                        background: "rgba(255,255,255,0.9)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 900,
                        color: band.checkColor,
                      }}
                    >
                      ✓
                    </div>
                  )}

                  <span style={{ fontSize: 52, marginBottom: 12, display: "block", lineHeight: 1 }}>
                    {band.icon}
                  </span>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: band.nameColor,
                      marginBottom: 4,
                    }}
                  >
                    {band.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      opacity: 0.75,
                      marginBottom: 8,
                    }}
                  >
                    {band.ages}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#fff",
                      opacity: 0.65,
                      lineHeight: 1.5,
                    }}
                  >
                    {band.skills}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── No selection hint ───────────────────────────────────────── */}
          {!selectedBand && (
            <div
              style={{
                textAlign: "center",
                fontSize: 14,
                fontWeight: 700,
                color: "#5a4080",
              }}
            >
              Tap a card to choose your level
            </div>
          )}

          {/* ── CTA (shown when band selected) ──────────────────────────── */}
          {selectedBand && selectedBandData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: 16,
                    borderRadius: 16,
                    border: "none",
                    background: "linear-gradient(135deg, #9b72ff, #7c4ddb)",
                    color: "#fff",
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 18,
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(155,114,255,0.4)",
                  }}
                >
                  {selectedBandData.name} it is! {selectedBandData.icon}
                </button>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "#5a4080",
                  fontWeight: 700,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                Your parent can change this from their app at any time
              </p>
            </div>
          )}
        </div>
      </main>
    </AppFrame>
  );
}
