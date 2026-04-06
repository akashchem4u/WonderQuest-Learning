"use client";

import Link from "next/link";
import { useState } from "react";
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

export default function ParentFamilyPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div style={{ minHeight: "100vh", background: C.base, padding: "28px 24px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: C.muted, marginBottom: 4 }}>Parent</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>👋 Good morning, Sarah</h1>
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
            <div style={{ background: "rgba(255,255,255,0.04)", border: C.border, borderWidth: 1, borderStyle: "solid", borderRadius: 20, padding: 28, marginBottom: 20, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, rgba(155,114,255,0.2), rgba(90,48,208,0.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0 }}>🦁</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>Maya</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 16, background: "rgba(155,114,255,0.12)", border: "1.5px solid rgba(155,114,255,0.3)", fontSize: 11, fontWeight: 700, color: C.violet, marginBottom: 12 }}>
                  K–1 Band · Kindergarten · Level 2 Star Explorer
                </div>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[["⭐ 42", "Stars this week", C.gold], ["14", "Sessions played", C.violet], ["🔥 5", "Day streak", C.mint], ["8", "Skills explored", C.coral]].map(([val, label, color]) => (
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

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { icon: "⭐", val: "42", label: "Stars this week", delta: "↑ 8 vs last week", up: true },
                { icon: "📚", val: "14", label: "Sessions completed", delta: "↑ 3 vs last week", up: true },
                { icon: "⏱️", val: "3.2h", label: "Learning time", delta: "→ Same as last week", up: false },
                { icon: "🏅", val: "2", label: "New badges", delta: "↑ 2 vs last week", up: true },
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
                  💡 <strong>Support tip:</strong> Maya is building on rhyming — try pointing out rhymes in bedtime books!
                </div>
              </div>

              {/* Streak + Activity */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "linear-gradient(135deg, #1a1240, #2a1860)", borderRadius: 16, padding: 22, color: C.text }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(192,176,240,0.8)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Current streak</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: C.gold }}>🔥 5</span>
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
                    { dot: C.gold, text: <>Maya earned <strong>&ldquo;Rhyme Queen 🎵&rdquo;</strong> badge</>, time: "Today, 8:42 AM" },
                    { dot: C.violet, text: <>Maya completed 3 sessions · ⭐ 9 stars</>, time: "Yesterday" },
                    { dot: C.mint, text: <>Maya leveled up to <strong>Star Explorer ⭐</strong></>, time: "Monday" },
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
              {[["⭐", "76", "Total stars (family)"], ["📚", "28", "Sessions combined"], ["🔥", "5 / 3", "Streaks (Maya / Leo)"]].map(([icon, val, label]) => (
                <div key={label as string} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.text, marginBottom: 2 }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Child cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { emoji: "🦁", name: "Maya", band: "K–1 · Level 2 ⭐", bandColor: C.violet, stars: 42, sessions: 14, streak: 5, barColor: C.violet, barWidth: "70%" },
                { emoji: "🐸", name: "Leo", band: "G2–3 · Level 1 🌱", bandColor: C.mint, stars: 34, sessions: 14, streak: 3, barColor: C.mint, barWidth: "45%" },
              ].map((child) => (
                <div key={child.name} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 20, border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(155,114,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{child.emoji}</div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{child.name}</div>
                      <div style={{ fontSize: 11, color: child.bandColor }}>{child.band}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                    {[[`⭐ ${child.stars}`, "Stars", C.gold], [String(child.sessions), "Sessions", child.bandColor], [`🔥 ${child.streak}`, "Streak", C.coral]].map(([val, label, color]) => (
                      <div key={label as string}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: color as string }}>{val}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 12 }}>
                    <div style={{ height: "100%", width: child.barWidth, background: child.barColor, borderRadius: 2 }} />
                  </div>
                  <Link href="/parent/report" style={{ display: "block", padding: "10px 0", background: child.bandColor, color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: "center", textDecoration: "none" }}>
                    See {child.name}&apos;s report →
                  </Link>
                </div>
              ))}
              <div style={{ background: "rgba(155,114,255,0.04)", borderRadius: 16, padding: 20, border: "2px dashed rgba(155,114,255,0.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", minHeight: 130 }}>
                <div style={{ fontSize: 32, opacity: 0.5 }}>👶</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.violet }}>Add another child</div>
                <div style={{ fontSize: 11, color: C.muted }}>Family plan: unlimited children</div>
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div style={{ maxWidth: 520 }}>
            {["Notifications", "Practice", "Privacy"].map((section) => (
              <div key={section} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 24, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{section}</div>
                {[["Weekly report email", "Every Sunday morning"], ["Badge alerts", "When Maya earns a new badge"], ["Streak reminder", "If Maya misses a day"]].map(([label, sub]) => (
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
