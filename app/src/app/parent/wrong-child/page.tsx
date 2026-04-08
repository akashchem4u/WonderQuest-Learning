"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  surface: "#161b22",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)",
  violet: "#9b72ff",
  violetDim: "rgba(155,114,255,0.14)",
  violetBorder: "rgba(155,114,255,0.28)",
  mint: "#22c55e",
  mintDim: "rgba(34,197,94,0.12)",
  gold: "#ffd166",
  amber: "#f59e0b",
  amberDim: "rgba(245,158,11,0.12)",
  red: "#ef4444",
  text: "#f0f6ff",
  muted: "#8b949e",
  faint: "rgba(255,255,255,0.08)",
} as const;

// ── Types ─────────────────────────────────────────────────────────────────
interface LinkedChild {
  id: string;
  displayName: string;
  avatarKey: string;
  launchBandCode: string;
  currentLevel: number;
  totalPoints: number;
}

interface ParentSession {
  guardian: { id: string; displayName: string };
  linkedChildren: LinkedChild[];
  linkedChild: LinkedChild | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function getAvatarSymbol(avatarKey: string): string {
  if (avatarKey.includes("bunny")) return "🐰";
  if (avatarKey.includes("bear")) return "🐻";
  if (avatarKey.includes("lion")) return "🦁";
  if (avatarKey.includes("fox")) return "🦊";
  if (avatarKey.includes("panda")) return "🐼";
  if (avatarKey.includes("owl")) return "🦉";
  return "✨";
}

function getBandColor(bandCode: string): string {
  if (bandCode === "PREK" || bandCode === "P0" || bandCode.startsWith("pre")) return "#ffd166";
  if (bandCode === "K1" || bandCode === "P1" || bandCode.startsWith("k1")) return "#9b72ff";
  if (bandCode === "G23" || bandCode === "P2" || bandCode.startsWith("g2") || bandCode.startsWith("g3")) return "#58e8c1";
  if (bandCode === "G45" || bandCode === "P3" || bandCode.startsWith("g4") || bandCode.startsWith("g5")) return "#ff7b6b";
  return "#9b72ff";
}

function getBandLabel(bandCode: string): string {
  if (bandCode === "PREK" || bandCode === "P0" || bandCode.startsWith("pre")) return "Pre-K";
  if (bandCode === "K1" || bandCode === "P1" || bandCode.startsWith("k1")) return "K–1";
  if (bandCode === "G23" || bandCode === "P2" || bandCode.startsWith("g2") || bandCode.startsWith("g3")) return "G2–3";
  if (bandCode === "G45" || bandCode === "P3" || bandCode.startsWith("g4") || bandCode.startsWith("g5")) return "G4–5";
  return bandCode;
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function WrongChildPage() {
  const router = useRouter();
  const [session, setSession] = useState<ParentSession | null>(null);
  const [activeChildId, setActiveChildIdState] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ParentSession | null) => {
        if (data) {
          setSession(data);
          // Read persisted active child
          const stored = typeof window !== "undefined"
            ? localStorage.getItem("wq_active_child_id") || localStorage.getItem("wq_active_student_id")
            : null;
          const resolved = stored
            ? (data.linkedChildren.find((c) => c.id === stored)?.id ?? data.linkedChild?.id ?? data.linkedChildren[0]?.id ?? null)
            : (data.linkedChild?.id ?? data.linkedChildren[0]?.id ?? null);
          setActiveChildIdState(resolved);
        }
      })
      .catch(() => {/* no session */})
      .finally(() => setLoading(false));
  }, []);

  async function switchToChild(childId: string) {
    setSwitching(childId);
    try {
      // Persist to DB
      await fetch("/api/parent/account-context", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeChildId: childId }),
      });
      // Update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("wq_active_child_id", childId);
        localStorage.setItem("wq_active_student_id", childId);
      }
      setActiveChildIdState(childId);
      // Brief pause so user sees the confirmation, then go back
      setTimeout(() => router.push("/parent"), 600);
    } catch {
      setSwitching(null);
    }
  }

  const children = session?.linkedChildren ?? [];
  const activeChild = children.find((c) => c.id === activeChildId) ?? children[0] ?? null;

  // ── Not logged in ─────────────────────────────────────────────────────
  if (!loading && !session) {
    return (
      <AppFrame audience="parent" currentPath="/parent">
        <div style={{ minHeight: "100vh", background: C.base, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
          <div style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Sign in to manage children</div>
            <Link href="/parent" style={{ color: C.violet, textDecoration: "none", fontWeight: 600 }}>Go to parent sign-in →</Link>
          </div>
        </div>
      </AppFrame>
    );
  }

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div style={{ minHeight: "100vh", background: C.base, fontFamily: "system-ui", paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#9b72ff,#5a30d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🌟</div>
            <span style={{ font: "800 1rem system-ui", background: "linear-gradient(135deg,#c3aaff,#9b72ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>WonderQuest</span>
          </div>
          <Link href="/parent" style={{ font: "600 0.8rem system-ui", color: C.muted, textDecoration: "none" }}>← Back to dashboard</Link>
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px 0" }}>

          {/* Page title */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Not the right child?</div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55 }}>No problem — switch to the correct profile below. Progress is always saved.</div>
          </div>

          {loading && (
            <div style={{ background: C.surfaceAlt, borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, color: C.muted, fontSize: 14, textAlign: "center" }}>
              Loading your family…
            </div>
          )}

          {/* Currently active child */}
          {!loading && activeChild && (
            <div style={{ background: C.surface, borderRadius: 16, padding: "16px 20px", border: `1px solid ${C.violetBorder}`, marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: C.muted, marginBottom: 12 }}>Currently viewing</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${getBandColor(activeChild.launchBandCode)}22`,
                  border: `2px solid ${getBandColor(activeChild.launchBandCode)}55`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
                }}>
                  {getAvatarSymbol(activeChild.avatarKey)}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{activeChild.displayName}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                    {getBandLabel(activeChild.launchBandCode)} · Level {activeChild.currentLevel}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.violetDim, border: `1px solid ${C.violetBorder}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700, color: C.violet, marginTop: 5 }}>
                    ⭐ {activeChild.totalPoints} stars
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Switch to another child */}
          {!loading && children.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 12 }}>Switch to a different child:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {children
                  .filter((c) => c.id !== activeChildId)
                  .map((child) => {
                    const bandColor = getBandColor(child.launchBandCode);
                    const isSwitching = switching === child.id;
                    return (
                      <div
                        key={child.id}
                        style={{
                          background: C.surfaceAlt,
                          borderRadius: 14,
                          padding: "14px 16px",
                          border: `1px solid ${C.border}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <div style={{
                          width: 44, height: 44, borderRadius: 10,
                          background: `${bandColor}22`,
                          border: `2px solid ${bandColor}44`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                        }}>
                          {getAvatarSymbol(child.avatarKey)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{child.displayName}</div>
                          <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
                            {getBandLabel(child.launchBandCode)} · Level {child.currentLevel} · ⭐ {child.totalPoints}
                          </div>
                        </div>
                        <button
                          onClick={() => switchToChild(child.id)}
                          disabled={isSwitching || switching !== null}
                          style={{
                            padding: "9px 18px",
                            background: isSwitching ? C.violetDim : C.violet,
                            color: isSwitching ? C.violet : "#fff",
                            border: isSwitching ? `1.5px solid ${C.violet}` : "none",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: isSwitching || switching !== null ? "not-allowed" : "pointer",
                            fontFamily: "system-ui",
                            minHeight: 40,
                            touchAction: "manipulation",
                            WebkitTapHighlightColor: "transparent",
                            flexShrink: 0,
                            opacity: switching !== null && !isSwitching ? 0.5 : 1,
                            transition: "all .15s",
                          }}
                        >
                          {isSwitching ? "Switching…" : `Switch to ${child.displayName}`}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Only 1 child — no switching available */}
          {!loading && children.length === 1 && (
            <div style={{ background: C.amberDim, borderLeft: `4px solid ${C.amber}`, borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#fbbf24", lineHeight: 1.55 }}>
              You only have one linked child. If this isn&apos;t the right profile, you can add another child below.
            </div>
          )}

          {/* Progress guarantee */}
          <div style={{ background: C.mintDim, borderLeft: `4px solid ${C.mint}`, borderRadius: "0 12px 12px 0", padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#4ade80", lineHeight: 1.55 }}>
            🔒 <strong style={{ color: C.mint }}>Progress is never deleted.</strong> All sessions, stars, and badges are saved permanently on each child&apos;s profile.
          </div>

          {/* Add another child */}
          <div style={{ background: C.surfaceAlt, borderRadius: 14, padding: "16px 20px", border: `2px dashed rgba(155,114,255,0.2)`, marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 24 }}>👶</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>Add another child</div>
              <div style={{ fontSize: 12, color: C.muted }}>Family plan supports unlimited children.</div>
            </div>
            <Link
              href="/parent#add-child"
              style={{
                padding: "9px 16px",
                background: C.violetDim,
                border: `1.5px solid ${C.violetBorder}`,
                color: C.violet,
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
                minHeight: 40,
                display: "flex",
                alignItems: "center",
              }}
            >
              + Add child
            </Link>
          </div>

          {/* Back link */}
          <div style={{ textAlign: "center", paddingTop: 8 }}>
            <Link href="/parent" style={{ fontSize: 14, color: C.violet, fontWeight: 600, textDecoration: "none" }}>
              ← Back to dashboard
            </Link>
          </div>

        </div>
      </div>
    </AppFrame>
  );
}
