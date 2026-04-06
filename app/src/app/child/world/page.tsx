"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#50e890",
  gold: "#ffd166",
  coral: "#ff7b6b",
  cyan: "#58e8c1",
  surface: "#1a1540",
  surface2: "#12103a",
  border: "#2a2060",
  text: "#e8e0ff",
  muted: "#9b8ec4",
} as const;

type NodeState = "complete" | "active" | "locked";
type World = { id: string; emoji: string; name: string; theme: string; color: string; nodes: number; done: number };
type Node = { id: number; emoji: string; name: string; state: NodeState; stars: number; maxStars: number };

const WORLDS: World[] = [
  { id: "cosmic", emoji: "🏰", name: "Cosmic Castle", theme: "Reading · Phonics", color: C.violet, nodes: 12, done: 7 },
  { id: "math", emoji: "🌊", name: "Number Reef", theme: "Math · Counting", color: C.cyan, nodes: 10, done: 3 },
  { id: "science", emoji: "🌋", name: "Science Summit", theme: "Science · Nature", color: C.coral, nodes: 8, done: 0 },
];

const NODES: Node[] = [
  { id: 1, emoji: "🌟", name: "First Steps", state: "complete", stars: 9, maxStars: 9 },
  { id: 2, emoji: "📚", name: "Story Seeds", state: "complete", stars: 8, maxStars: 9 },
  { id: 3, emoji: "🎵", name: "Sound Safari", state: "complete", stars: 9, maxStars: 9 },
  { id: 4, emoji: "🔤", name: "Letter Land", state: "complete", stars: 7, maxStars: 9 },
  { id: 5, emoji: "🎯", name: "Aim High", state: "complete", stars: 6, maxStars: 9 },
  { id: 6, emoji: "🌙", name: "Night Reader", state: "complete", stars: 9, maxStars: 9 },
  { id: 7, emoji: "⚡", name: "Bolt Words", state: "complete", stars: 8, maxStars: 9 },
  { id: 8, emoji: "🌊", name: "River Rush", state: "active", stars: 2, maxStars: 9 },
  { id: 9, emoji: "🏆", name: "Champion Arc", state: "locked", stars: 0, maxStars: 9 },
  { id: 10, emoji: "🦅", name: "Sky High", state: "locked", stars: 0, maxStars: 9 },
  { id: 11, emoji: "💎", name: "Diamond Mind", state: "locked", stars: 0, maxStars: 9 },
  { id: 12, emoji: "🏰", name: "Castle Master", state: "locked", stars: 0, maxStars: 9 },
];

const BAND_TRACK = [
  { key: "PREK", label: "Pre-K", icon: "🌈" },
  { key: "K1",   label: "K–1",   icon: "⚡" },
  { key: "G23",  label: "G2–3",  icon: "🌊" },
  { key: "G45",  label: "G4–5",  icon: "🔥" },
];

type ChildStats = {
  currentLevel: number;
  masteredSkillsCount: number;
  streakDays: number;
};

type ChildSession = {
  student: { launchBandCode: string };
};

export default function ChildWorldPage() {
  const [selectedWorld, setSelectedWorld] = useState("cosmic");
  const [childSession, setChildSession] = useState<ChildSession | null>(null);
  const [childStats, setChildStats] = useState<ChildStats | null>(null);
  const world = WORLDS.find((w) => w.id === selectedWorld) ?? WORLDS[0];
  const totalStars = NODES.reduce((s, n) => s + n.stars, 0);

  useEffect(() => {
    fetch("/api/child/session")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ChildSession | null) => { if (d) setChildSession(d); })
      .catch(() => {});
    fetch("/api/child/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ChildStats | null) => { if (d) setChildStats(d); })
      .catch(() => {});
  }, []);

  const currentBandCode = childSession?.student?.launchBandCode ?? "K1";
  const currentBandIdx = BAND_TRACK.findIndex((b) => b.key === currentBandCode);
  const masteredSkillsCount = childStats?.masteredSkillsCount ?? 0;

  return (
    <AppFrame audience="kid" currentPath="/child">
      <style>{`@keyframes active-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(155,114,255,0.5); } 50% { box-shadow: 0 0 0 8px rgba(155,114,255,0); } }`}</style>
      <div style={{ minHeight: "100vh", background: C.base, fontFamily: "'Nunito', system-ui, sans-serif", padding: "24px 24px 60px" }}>

        {/* Band progress track */}
        <div style={{ maxWidth: 1100, margin: "0 auto 24px", background: C.surface2, border: `2px solid ${C.border}`, borderRadius: 16, padding: "16px 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Learning Journey</div>
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {BAND_TRACK.map((band, idx) => {
              const isDone = idx < currentBandIdx;
              const isActive = idx === currentBandIdx;
              const isLocked = idx > currentBandIdx;
              return (
                <div key={band.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ textAlign: "center", flex: "0 0 auto" }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%",
                      background: isDone ? C.mint : isActive ? C.violet : C.surface,
                      border: `2px solid ${isDone ? C.mint : isActive ? C.violet : C.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                      opacity: isLocked ? 0.4 : 1,
                      margin: "0 auto 4px",
                    }}>
                      {isDone ? "✓" : band.icon}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: isActive ? C.violet : isDone ? C.mint : C.muted }}>{band.label}</div>
                  </div>
                  {idx < BAND_TRACK.length - 1 && (
                    <div style={{ flex: 1, height: 3, background: isDone ? C.mint : C.border, borderRadius: 2, margin: "0 4px", marginBottom: 18 }} />
                  )}
                </div>
              );
            })}
          </div>
          {masteredSkillsCount > 0 && (
            <div style={{ marginTop: 12, textAlign: "center", fontSize: 13, fontWeight: 700, color: C.mint }}>
              You&apos;ve mastered {masteredSkillsCount} skill{masteredSkillsCount !== 1 ? "s" : ""} so far!
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, maxWidth: 1100, margin: "0 auto", alignItems: "start" }}>

          {/* Left panel */}
          <div style={{ background: C.surface2, border: `2px solid ${C.border}`, borderRadius: 16, padding: 20, position: "sticky", top: 24 }}>
            <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #1e1470, #3b28cc)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 14 }}>
              {world.emoji}
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 4 }}>{world.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{world.theme}</div>

            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: C.gold }}>⭐ {totalStars}</div><div style={{ fontSize: 10, color: C.muted }}>Stars earned</div></div>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: C.mint }}>{world.done}/{world.nodes}</div><div style={{ fontSize: 10, color: C.muted }}>Nodes done</div></div>
            </div>

            {/* Progress bar */}
            <div style={{ background: C.border, borderRadius: 4, height: 6, marginBottom: 20 }}>
              <div style={{ height: 6, borderRadius: 4, background: C.violet, width: `${(world.done / world.nodes) * 100}%` }} />
            </div>

            {/* World switcher */}
            <div style={{ fontSize: 10, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Worlds</div>
            {WORLDS.map((w) => (
              <div
                key={w.id}
                onClick={() => setSelectedWorld(w.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10,
                  background: selectedWorld === w.id ? "rgba(155,114,255,0.12)" : "transparent",
                  border: `1px solid ${selectedWorld === w.id ? C.violet : "transparent"}`,
                  cursor: "pointer", marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{w.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedWorld === w.id ? C.text : C.muted }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{w.done}/{w.nodes} nodes</div>
                </div>
              </div>
            ))}
          </div>

          {/* Main node grid */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>World Journey</div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0 }}>{world.name}</h1>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>⭐ {totalStars} total stars</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {NODES.map((node) => {
                const isDone = node.state === "complete";
                const isActive = node.state === "active";
                const isLocked = node.state === "locked";
                return (
                  <div
                    key={node.id}
                    style={{
                      background: isDone ? "linear-gradient(135deg, #0e2a10, #1a3a20)" : isActive ? C.surface : "#0d0b22",
                      border: `2px solid ${isDone ? "#50e890" : isActive ? C.violet : C.border}`,
                      borderRadius: 14,
                      padding: 16,
                      cursor: isLocked ? "default" : "pointer",
                      opacity: isLocked ? 0.45 : 1,
                      animation: isActive ? "active-pulse 2s ease-in-out infinite" : undefined,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 28 }}>{node.emoji}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: isDone ? C.mint : isActive ? C.violet : C.muted, background: isDone ? "rgba(80,232,144,0.12)" : isActive ? "rgba(155,114,255,0.12)" : "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 10 }}>
                        {isDone ? "✓ Done" : isActive ? "▶ Active" : "🔒"}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: isDone ? "#c0e8c0" : C.text, marginBottom: 4 }}>{node.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Node {node.id}</div>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ fontSize: 14, opacity: Math.floor(node.stars / 3) > i || (node.stars % 3 > 0 && i === Math.floor(node.stars / 3)) ? 1 : 0.2 }}>⭐</span>
                      ))}
                      {node.stars > 0 && <span style={{ fontSize: 10, color: C.muted, marginLeft: 4, alignSelf: "center" }}>{node.stars}/9</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <Link href="/child" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>← Home</Link>
              <Link href="/child/quest" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>Start Quest</Link>
              <Link href="/child/map" style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>Map View</Link>
            </div>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}
