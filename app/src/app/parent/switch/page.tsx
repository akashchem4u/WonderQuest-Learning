"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppFrame } from "@/components/app-frame";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  base: "#100b2e",
  violet: "#9b72ff",
  violetBorder: "rgba(155,114,255,0.28)",
  mint: "#58e8c1",
  gold: "#ffd166",
  green: "#22c55e",
  surface: "rgba(255,255,255,0.05)",
  surfaceSelected: "rgba(155,114,255,0.14)",
  border: "rgba(155,114,255,0.18)",
  text: "#f0f6ff",
  muted: "rgba(255,255,255,0.5)",
  faint: "rgba(255,255,255,0.10)",
} as const;

// ── Types ──────────────────────────────────────────────────────────────────
type Child = {
  id: string;
  emoji: string;
  avatarBg: string;
  name: string;
  band: string;
  level: string;
  bandColor: string;
  starsThisWeek: number;
};

// ── Band colour helpers ────────────────────────────────────────────────────
const BAND_COLORS: Record<string, string> = {
  "pre-k": C.gold,
  "k-1": C.violet,
  "g2-3": C.mint,
  "g4-5": "#38bdf8",
};

const BAND_LABELS: Record<string, string> = {
  "pre-k": "Pre-K Band",
  "k-1": "K–1 Band",
  "g2-3": "G2–3 Band",
  "g4-5": "G4–5 Band",
};

const AVATAR_EMOJIS = ["🦁", "🐸", "🦋", "🐶", "🐱", "🦊", "🐻", "🐼"];

type ApiStudent = {
  studentId: string;
  displayName: string;
  launchBandCode: string;
  currentLevel?: number;
  starsThisWeek?: number;
};

function apiStudentToChild(s: ApiStudent, idx: number): Child {
  const band = s.launchBandCode?.toLowerCase() ?? "k-1";
  const bandColor = BAND_COLORS[band] ?? C.violet;
  const bandLabel = BAND_LABELS[band] ?? s.launchBandCode;
  const emoji = AVATAR_EMOJIS[idx % AVATAR_EMOJIS.length];
  const avatarAlpha = idx % 2 === 0 ? "0.22" : "0.20";
  const avatarBg =
    band === "pre-k"
      ? `rgba(255,209,102,${avatarAlpha})`
      : band === "g2-3"
      ? `rgba(88,232,193,${avatarAlpha})`
      : `rgba(155,114,255,${avatarAlpha})`;

  return {
    id: s.studentId,
    emoji,
    avatarBg,
    name: s.displayName,
    band: bandLabel,
    level: `Level ${s.currentLevel ?? 1} Explorer`,
    bandColor,
    starsThisWeek: s.starsThisWeek ?? 0,
  };
}

export default function SwitchPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>("");
  const [tab, setTab] = useState<"desktop2" | "desktop3" | "mobile">("desktop2");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("wq_active_student_id") : null;

    fetch("/api/parent/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.students || !Array.isArray(data.students) || data.students.length === 0) {
          setLoading(false);
          return;
        }
        const mapped: Child[] = (data.students as ApiStudent[]).map((s, i) =>
          apiStudentToChild(s, i),
        );
        setChildren(mapped);
        const firstId = stored && mapped.find((c) => c.id === stored) ? stored : mapped[0].id;
        setActiveChildId(firstId);
        if (!stored) {
          localStorage.setItem("wq_active_student_id", firstId);
        }
      })
      .catch(() => {
        /* silently ignore */
      })
      .finally(() => setLoading(false));
  }, []);

  const activeChild = children.find((c) => c.id === activeChildId) ?? children[0];
  const displayChildren = tab === "desktop2" ? children.slice(0, 2) : children;

  const handleSwitch = (id: string) => {
    setActiveChildId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("wq_active_student_id", id);
    }
  };

  return (
    <AppFrame audience="parent" currentPath="/parent">
      <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", color: C.text, padding: "28px 24px", maxWidth: 700, margin: "0 auto" }}>

        {/* Back nav */}
        <div style={{ marginBottom: 20 }}>
          <Link href="/parent" style={{ color: C.violet, fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
            ← Home
          </Link>
        </div>

        {/* Page title */}
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Switch child view</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Viewing dashboard as a different child switches all context — one child at a time</p>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 14 }}>
            Loading children…
          </div>
        )}

        {!loading && children.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 14 }}>
            No children linked to this account.
          </div>
        )}

        {!loading && children.length > 0 && (
          <>
            {/* Tab bar */}
            <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
              {(["desktop2", "desktop3", "mobile"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: "system-ui",
                    background: tab === t ? C.violet : C.surface,
                    color: tab === t ? "#fff" : C.muted,
                    transition: "all .18s",
                  }}
                >
                  {t === "desktop2" ? "🖥 2 Children" : t === "desktop3" ? "🖥 3+ Children" : "📱 Mobile Sheet"}
                </button>
              ))}
            </div>

            {/* ── DESKTOP VARIANTS ─────────────────────────────────────────────── */}
            {(tab === "desktop2" || tab === "desktop3") && activeChild && (
              <div>
                {/* Simulated dashboard header */}
                <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.violet }}>WonderQuest</div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>

                    {/* Switcher trigger (dropdown always shown below) */}
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "rgba(155,114,255,0.10)", border: "1.5px solid " + C.violetBorder, borderRadius: 12, cursor: "pointer" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeChild.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                          {activeChild.emoji}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{activeChild.name}</div>
                          <div style={{ fontSize: 11, color: C.violet }}>{activeChild.band} · {activeChild.level.split(" ")[0]} {activeChild.level.split(" ")[1]}</div>
                        </div>
                        <span style={{ color: C.muted, fontSize: 11 }}>▾</span>
                      </div>

                      {/* Dropdown — always open in this demo */}
                      <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 100, background: "#1a1050", borderRadius: 16, boxShadow: "0 8px 32px rgba(80,40,180,0.35)", border: "1px solid " + C.border, minWidth: 270, overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid " + C.border }}>
                          Switch child view
                        </div>

                        <div style={{ maxHeight: tab === "desktop3" ? 320 : "none", overflowY: "auto" }}>
                          {displayChildren.map((child) => {
                            const isActive = child.id === activeChildId;
                            return (
                              <div
                                key={child.id}
                                onClick={() => handleSwitch(child.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  padding: "12px 16px",
                                  cursor: "pointer",
                                  background: isActive ? "rgba(155,114,255,0.14)" : "transparent",
                                  borderBottom: "1px solid rgba(155,114,255,0.08)",
                                  transition: "background .15s",
                                }}
                              >
                                <div style={{ width: 40, height: 40, borderRadius: "50%", background: child.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                                  {child.emoji}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 14, fontWeight: 700 }}>{child.name}</div>
                                  <div style={{ fontSize: 11, color: child.bandColor, marginTop: 1 }}>{child.band} · {child.level}</div>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginTop: 2 }}>⭐ {child.starsThisWeek} stars this week</div>
                                </div>
                                {isActive && (
                                  <span style={{ color: C.violet, fontSize: 16, flexShrink: 0 }}>✓</span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: "10px 16px", borderTop: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <button style={{ background: "none", border: "none", color: C.violet, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "system-ui", display: "flex", alignItems: "center", gap: 6 }}>
                            ＋ Add another child
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: C.muted }}>Parent</div>
                  </div>
                </div>

                {/* Hint */}
                <div style={{ background: "rgba(155,114,255,0.08)", border: "1px solid " + C.border, borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "#c4aaff", lineHeight: 1.5 }}>
                  {tab === "desktop2"
                    ? "↑ Dropdown shows children. Selecting a child reloads the entire dashboard for that child's data."
                    : "ℹ️ With 3+ children, dropdown max-height is capped at 320px with overflow-y: auto. \"Add another child\" is always pinned at bottom."}
                </div>

                {/* Current context indicator */}
                <div style={{ marginTop: 20, background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    Currently viewing
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: activeChild.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {activeChild.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800 }}>{activeChild.name}</div>
                      <div style={{ fontSize: 13, color: activeChild.bandColor }}>{activeChild.band} · {activeChild.level}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginTop: 4 }}>⭐ {activeChild.starsThisWeek} stars this week</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── MOBILE SHEET VARIANT ─────────────────────────────────────────── */}
            {tab === "mobile" && activeChild && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Phone shell */}
                <div style={{ width: 380, maxWidth: "100%", background: "#0d0a28", borderRadius: 40, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(155,114,255,0.2)", position: "relative" }}>

                  {/* Status bar */}
                  <div style={{ height: 44, display: "flex", alignItems: "flex-end", padding: "0 20px 8px", justifyContent: "space-between", background: "#0d0a28" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>9:41</span>
                    <div style={{ display: "flex", gap: 6, fontSize: 13, color: C.text }}>
                      <span>●●●</span><span>WiFi</span><span>🔋</span>
                    </div>
                  </div>

                  {/* Phone content (behind sheet) */}
                  <div style={{ padding: 16, minHeight: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: C.violet }}>WonderQuest</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(155,114,255,0.12)", border: "1.5px solid " + C.violetBorder, borderRadius: 12 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: activeChild.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                          {activeChild.emoji}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{activeChild.name}</div>
                        <span style={{ color: C.muted, fontSize: 11 }}>▾</span>
                      </div>
                    </div>
                  </div>

                  {/* Scrim */}
                  <div style={{ position: "absolute", inset: 0, background: "rgba(8,5,20,0.55)", zIndex: 10 }} />

                  {/* Bottom sheet */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "#1a1050", borderRadius: "24px 24px 0 0", paddingBottom: 28, zIndex: 20 }}>
                    {/* Drag handle */}
                    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px" }}>
                      <div style={{ width: 36, height: 5, background: C.border, borderRadius: 3 }} />
                    </div>

                    {/* Sheet title */}
                    <div style={{ fontSize: 16, fontWeight: 700, padding: "6px 20px 14px", borderBottom: "1px solid " + C.border }}>
                      Switch child view
                    </div>

                    {/* Children list */}
                    {children.map((child) => {
                      const isActive = child.id === activeChildId;
                      return (
                        <div
                          key={child.id}
                          onClick={() => handleSwitch(child.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "14px 20px",
                            cursor: "pointer",
                            background: isActive ? "rgba(155,114,255,0.14)" : "transparent",
                            borderBottom: "1px solid rgba(155,114,255,0.08)",
                            transition: "background .15s",
                          }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: child.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                            {child.emoji}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{child.name}</div>
                            <div style={{ fontSize: 11, color: child.bandColor, marginTop: 1 }}>{child.band} · {child.level}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginTop: 2 }}>⭐ {child.starsThisWeek} stars this week</div>
                          </div>
                          {isActive && (
                            <span style={{ color: C.violet, fontSize: 16 }}>✓</span>
                          )}
                        </div>
                      );
                    })}

                    {/* Sheet footer */}
                    <div style={{ padding: "12px 20px 0", borderTop: "1px solid " + C.border, marginTop: 4 }}>
                      <button style={{ background: "none", border: "none", color: C.violet, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "system-ui", display: "flex", alignItems: "center", gap: 6 }}>
                        ＋ Add another child
                      </button>
                    </div>
                  </div>

                  {/* Home indicator */}
                  <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0a28", position: "relative", zIndex: 25 }}>
                    <div style={{ width: 120, height: 5, borderRadius: 3, background: "rgba(155,114,255,0.25)" }} />
                  </div>
                </div>

                {/* Caption */}
                <div style={{ marginTop: 20, padding: "12px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, fontSize: 12, color: "#c4aaff", lineHeight: 1.5, maxWidth: 380, width: "100%" }}>
                  Mobile bottom sheet variant — tap the scrim or drag the handle down to dismiss. Child rows are fully interactive above.
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AppFrame>
  );
}
