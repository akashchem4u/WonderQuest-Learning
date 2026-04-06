"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  mint: "#58e8c1",
  gold: "#ffd166",
  coral: "#ff7b6b",
  green: "#22c55e",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(155,114,255,0.15)",
} as const;

type Tab = "overview" | "multi" | "settings";

// ── Band helpers ──────────────────────────────────────────────────────────────
function bandFriendly(code: string): string {
  if (code === "PREK" || code === "P0") return "Pre-K (P0)";
  if (code === "K1" || code === "P1") return "K–1 (P1)";
  if (code === "G23" || code === "P2") return "G2–3 (P2)";
  if (code === "G45" || code === "P3") return "G4–5 (P3)";
  return code;
}

function bandColorFor(code: string): string {
  if (code === "PREK" || code === "P0") return "#ffd166";
  if (code === "K1" || code === "P1") return "#9b72ff";
  if (code === "G23" || code === "P2") return "#58e8c1";
  if (code === "G45" || code === "P3") return "#ff7b6b";
  return "#9b72ff";
}

function bandEmoji(code: string): string {
  if (code === "PREK" || code === "P0") return "🦁";
  if (code === "K1" || code === "P1") return "🦊";
  if (code === "G23" || code === "P2") return "🐸";
  if (code === "G45" || code === "P3") return "🦅";
  return "🌟";
}

// ── API types ─────────────────────────────────────────────────────────────────
interface LinkedChild {
  id: string;
  displayName: string;
  username: string;
  launchBandCode: string;
  currentLevel: number;
  totalPoints: number;
  badgeCount: number;
}

interface ParentSession {
  guardian: { id: string; username: string; displayName: string };
  linkedChildren: LinkedChild[];
}

export default function ParentFamilyPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [session, setSession] = useState<ParentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/session")
      .then((r) => r.ok ? r.json() : null)
      .then((data: ParentSession | null) => {
        setSession(data);
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, []);

  const children = session?.linkedChildren ?? [];
  const firstChild = children[0] ?? null;
  const guardianName = session?.guardian?.displayName ?? "there";

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 4 }}>Parent</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>
            👋 Good morning, {loading ? "…" : (firstChild ? firstChild.displayName + "'s family" : guardianName)}
          </h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Week of April 7 – April 13, 2026</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["overview", "multi", "settings"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "system-ui", background: tab === t ? C.violet : "rgba(255,255,255,0.06)", color: tab === t ? "#fff" : C.muted }}>
              {t === "overview" ? "Overview" : t === "multi" ? "All Children" : "Settings"}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div style={{ maxWidth: 760 }}>
            {/* Child hero card */}
            {loading && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: C.border, borderWidth: 1, borderStyle: "solid", borderRadius: 20, padding: 28, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
                <span style={{ color: C.muted, fontSize: 13 }}>Loading…</span>
              </div>
            )}
            {!loading && firstChild && (() => {
              const emoji = bandEmoji(firstChild.launchBandCode);
              const friendly = bandFriendly(firstChild.launchBandCode);
              const bColor = bandColorFor(firstChild.launchBandCode);
              return (
                <div style={{ background: "rgba(255,255,255,0.04)", border: C.border, borderWidth: 1, borderStyle: "solid", borderRadius: 20, padding: 28, marginBottom: 20, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, rgba(155,114,255,0.2), rgba(90,48,208,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>{emoji}</div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>{firstChild.displayName}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 16, background: `${bColor}1a`, border: `1.5px solid ${bColor}4d`, fontSize: 11, fontWeight: 700, color: bColor, marginBottom: 12 }}>
                      {friendly} · Level {firstChild.currentLevel}
                    </div>
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                      {[[`⭐ ${firstChild.totalPoints}`, "Total stars", C.gold], [`🏅 ${firstChild.badgeCount}`, "Badges earned", C.violet]].map(([val, label, color]) => (
                        <div key={label as string}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: color as string }}>{val}</div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link href="/parent/report" style={{ padding: "10px 18px", background: C.violet, color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none", textAlign: "center" }}>📊 See full report →</Link>
                    <button style={{ padding: "9px 18px", background: "rgba(255,255,255,0.04)", color: C.muted, border: `1.5px solid rgba(255,255,255,0.1)`, borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui", whiteSpace: "nowrap" }}>⚙️ Child settings</button>
                  </div>
                </div>
              );
            })()}
            {!loading && !firstChild && (
              <div style={{ background: "rgba(255,255,255,0.04)", border: C.border, borderWidth: 1, borderStyle: "solid", borderRadius: 20, padding: 28, marginBottom: 20, color: C.muted, fontSize: 13 }}>
                No children linked yet. Add a child to get started.
              </div>
            )}

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { icon: "⭐", val: loading ? "—" : String(firstChild?.totalPoints ?? 0), label: "Total stars", delta: "all time", up: true },
                { icon: "🏅", val: loading ? "—" : String(firstChild?.badgeCount ?? 0), label: "Badges earned", delta: "all time", up: true },
                { icon: "📚", val: loading ? "—" : String(firstChild?.currentLevel ?? 0), label: "Current level", delta: "keep going!", up: true },
                { icon: "🌟", val: loading ? "—" : String(children.length), label: "Children linked", delta: "on family plan", up: false },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 20, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.text, display: "block", marginBottom: 2 }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{s.label}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: s.up ? C.mint : C.muted }}>{s.delta}</div>
                </div>
              ))}
            </div>

            {/* 2-col: skills + streak + activity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
              {/* Skills */}
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Skills practiced this week</span>
                  <Link href="/parent/skills/phonics-blending" style={{ fontSize: 11, fontWeight: 700, color: C.violet, textDecoration: "none" }}>See all →</Link>
                </div>
                {[["Rhyming words", 88, C.violet], ["Letter sounds", 74, C.violet], ["Counting objects", 60, C.gold], ["First words", 45, C.gold]].map(([name, pct, color]) => (
                  <div key={name as string} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color as string, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: C.muted, width: 32, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(88,232,193,0.08)", borderRadius: 8, border: "1px solid rgba(88,232,193,0.2)", fontSize: 12, color: C.mint, lineHeight: 1.4 }}>
                  💡 <strong>Support tip:</strong> {firstChild ? `${firstChild.displayName} is building great skills` : "Keep practicing"} — try pointing out rhymes in bedtime books!
                </div>
              </div>

              {/* Streak + Activity */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "linear-gradient(135deg, #1a1240, #2a1860)", borderRadius: 16, padding: 22, color: C.text }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(192,176,240,0.8)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Current streak</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: C.gold }}>🔥 —</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>days in a row!</span>
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: i < 4 ? "rgba(255,209,102,0.15)" : i === 4 ? C.gold : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i < 5 ? (i === 4 ? "#1a1240" : C.gold) : "rgba(255,255,255,0.3)" }}>{d}</div>
                    ))}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 22, border: "1px solid rgba(255,255,255,0.06)", flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Recent activity</div>
                  {[
                    { dot: C.gold, text: <>{firstChild?.displayName ?? "Your child"} is on a learning streak!</>, time: "Today" },
                    { dot: C.violet, text: <>{firstChild?.displayName ?? "Your child"} has earned {firstChild?.totalPoints ?? 0} total stars</>, time: "This week" },
                    { dot: C.mint, text: <>{firstChild?.displayName ?? "Your child"} reached Level {firstChild?.currentLevel ?? "—"}</>, time: "Recently" },
                  ].map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: i < 2 ? 12 : 0, borderBottom: i < 2 ? "1px solid rgba(155,114,255,0.08)" : "none", marginBottom: i < 2 ? 12 : 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: a.dot, flexShrink: 0, marginTop: 4 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{a.text}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "multi" && (
          <div style={{ maxWidth: 760 }}>
            {/* Family stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
              {[
                ["⭐", loading ? "—" : String(children.reduce((sum, c) => sum + c.totalPoints, 0)), "Total stars (family)"],
                ["🏅", loading ? "—" : String(children.reduce((sum, c) => sum + c.badgeCount, 0)), "Badges combined"],
                ["👶", loading ? "—" : String(children.length), "Children linked"],
              ].map(([icon, val, label]) => (
                <div key={label as string} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 2 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Child cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
              {loading && (
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.06)", color: C.muted, fontSize: 13 }}>
                  Loading…
                </div>
              )}
              {children.map((child) => {
                const emoji = bandEmoji(child.launchBandCode);
                const bColor = bandColorFor(child.launchBandCode);
                const friendly = bandFriendly(child.launchBandCode);
                const maxPoints = Math.max(...children.map((c) => c.totalPoints), 1);
                const barWidth = `${Math.round((child.totalPoints / maxPoints) * 100)}%`;
                return (
                  <div key={child.id} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(155,114,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{emoji}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{child.displayName}</div>
                        <div style={{ fontSize: 11, color: bColor }}>{friendly} · Level {child.currentLevel}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                      {[[`⭐ ${child.totalPoints}`, "Stars", C.gold], [`🏅 ${child.badgeCount}`, "Badges", bColor], [`Lv ${child.currentLevel}`, "Level", C.coral]].map(([val, label, color]) => (
                        <div key={label as string}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: color as string }}>{val}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 12 }}>
                      <div style={{ height: "100%", width: barWidth, background: bColor, borderRadius: 2 }} />
                    </div>
                    <Link href="/parent/report" style={{ display: "block", padding: "10px 0", background: bColor, color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>
                      See {child.displayName}&apos;s report →
                    </Link>
                  </div>
                );
              })}
              {!loading && children.length < 3 && (
                <div style={{ background: "rgba(155,114,255,0.04)", borderRadius: 16, padding: 20, border: "2px dashed rgba(155,114,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 130 }}>
                  <div style={{ fontSize: 32, opacity: 0.5 }}>👶</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.violet }}>Add another child</div>
                  <div style={{ fontSize: 11, color: C.muted }}>Family plan: unlimited children</div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div style={{ maxWidth: 520 }}>
            {["Notifications", "Practice", "Privacy"].map((section) => (
              <div key={section} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{section}</div>
                {[["Weekly report email", "Every Sunday morning"], ["Badge alerts", `When ${firstChild?.displayName ?? "your child"} earns a new badge`], ["Streak reminder", `If ${firstChild?.displayName ?? "your child"} misses a day`]].map(([label, sub]) => (
                  <div key={label as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{label}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{sub}</div>
                    </div>
                    <div style={{ width: 40, height: 22, borderRadius: 11, background: C.violet, cursor: "pointer", position: "relative", flexShrink: 0 }}>
                      <div style={{ position: "absolute", left: 20, top: 2, width: 18, height: 18, borderRadius: "50%", background: "#fff" }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Footer nav */}
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { href: "/parent", label: "← Dashboard" },
            { href: "/parent/report", label: "Weekly Report" },
            { href: "/parent/practice", label: "Practice Plan" },
            { href: "/parent/notifications", label: "Notifications" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, fontWeight: 700, color: C.violet, textDecoration: "none" }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}
