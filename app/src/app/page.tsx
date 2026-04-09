import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";
import { HomeNav } from "@/components/home-nav";
import { GuestStartButton } from "@/components/guest-start-button";

export const dynamic = "force-dynamic";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        "#06071a",
  surface:   "#0e1029",
  card:      "#12152e",
  border:    "rgba(255,255,255,0.07)",
  borderHi:  "rgba(255,255,255,0.13)",
  violet:    "#9b72ff",
  teal:      "#2dd4bf",
  gold:      "#fbbf24",
  coral:     "#fb7185",
  blue:      "#60a5fa",
  text:      "#f1f5f9",
  muted:     "rgba(241,245,249,0.52)",
  dim:       "rgba(241,245,249,0.32)",
} as const;

// ─── Band metadata ─────────────────────────────────────────────────────────────
const BANDS: Record<string, { label: string; ages: string; icon: string; color: string; bg: string }> = {
  PREK: { label: "Pre-K",       ages: "Ages 2–5",   icon: "🌱", color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  K1:   { label: "K–1",        ages: "Ages 5–7",   icon: "⭐", color: "#9b72ff", bg: "rgba(155,114,255,0.1)" },
  G23:  { label: "Grades 2–3", ages: "Ages 7–9",   icon: "🚀", color: "#2dd4bf", bg: "rgba(45,212,191,0.1)"  },
  G45:  { label: "Grades 4–5", ages: "Ages 9–11",  icon: "⚡", color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  G6:   { label: "Grade 6",    ages: "Ages 11–12", icon: "🔬", color: "#fb7185", bg: "rgba(251,113,133,0.1)" },
};

// ─── Feature grid ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "🧠", title: "AI-adaptive engine",   body: "Every question adjusts in real time to the child's pace, band, and current mastery level."      },
  { icon: "🏆", title: "Growing question bank",  body: "Reading, math, phonics, science, logic, geography — across all four learning bands, actively expanding."  },
  { icon: "🎤", title: "Audio-first for Pre-K", body: "Every prompt can be read aloud. Early learners never need to read to start learning."              },
  { icon: "🦁", title: "Coach Leo",             body: "When a child answers wrong twice, Coach Leo steps in with a scaffolded visual explanation."       },
  { icon: "📊", title: "Parent weekly digest",  body: "Plain-language AI report every week — what happened, what improved, what to do next."              },
  { icon: "🏫", title: "Teacher dashboard",     body: "Class mastery, intervention queue, AI archetypes, skill drilldown — no spreadsheets needed."     },
];

// ─── Audience sections ────────────────────────────────────────────────────────
const AUDIENCES = [
  {
    emoji: "🧒", href: "/child",
    label: "For children",
    title: "A quest, not a worksheet.",
    body: "Every session is 5–8 adaptive questions wrapped in a short adventure. Earn points, level up, unlock trophies, and come back for more — without a single ad.",
    accent: "#9b72ff",
    accentBg: "rgba(155,114,255,0.08)",
    accentBorder: "rgba(155,114,255,0.24)",
    highlights: ["🎮 Gamified quests with rewards", "🦁 Coach Leo explains mistakes", "🔥 Daily streaks build habits", "🔊 Audio support at every step"],
    cta: "Start a quest →",
  },
  {
    emoji: "👨‍👩‍👧", href: "/parent",
    label: "Family Hub",
    title: "Know exactly what happened — and what's next.",
    body: "A weekly AI digest tells you what your child practiced, what's improving, and what to focus on at home. Multi-child households, PIN-based access, and full link health visibility.",
    accent: "#2dd4bf",
    accentBg: "rgba(45,212,191,0.08)",
    accentBorder: "rgba(45,212,191,0.24)",
    highlights: ["📬 Weekly AI learning digest", "👨‍👩‍👧 Multi-child household support", "🔐 PIN-based child access", "📈 Skill-level progress tracking"],
    cta: "Go to Family Hub →",
  },
  {
    emoji: "🏫", href: "/teacher",
    label: "Classroom",
    title: "Class insights without the extra work.",
    body: "See who is on track, who needs support, and which skills are slipping — all in one place. Intervention queue, mastery bars, AI student archetypes, and real win streaks.",
    accent: "#60a5fa",
    accentBg: "rgba(96,165,250,0.08)",
    accentBorder: "rgba(96,165,250,0.24)",
    highlights: ["🚨 Automatic intervention queue", "📐 Mastery by skill & band", "🤖 AI student archetype detection", "🏅 Recent wins feed"],
    cta: "Go to Classroom →",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const status = await getLaunchStatus();
  const isLive = status.source === "supabase";
  const bandList = status.bands.length > 0 ? status.bands : [
    { code: "PREK", theme: "Seedling Grove" },
    { code: "K1",   theme: "Star Valley"    },
    { code: "G23",  theme: "Explorer Ridge" },
    { code: "G45",  theme: "Lightning Peak" },
  ];

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, fontFamily: "inherit" }}>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <HomeNav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(64px,10vw,120px) clamp(16px,4vw,48px) clamp(48px,8vw,96px)",
        textAlign: "center",
      }}>
        {/* Background glows */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(155,114,255,0.18) 0%, transparent 70%)",
        }} />
        <div aria-hidden="true" style={{
          position: "absolute", top: "30%", left: "5%", width: 400, height: 400,
          borderRadius: "50%", background: "rgba(45,212,191,0.06)",
          filter: "blur(80px)", pointerEvents: "none",
        }} />
        <div aria-hidden="true" style={{
          position: "absolute", top: "20%", right: "5%", width: 300, height: 300,
          borderRadius: "50%", background: "rgba(251,191,36,0.06)",
          filter: "blur(80px)", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 999,
            background: "rgba(155,114,255,0.12)",
            border: `1px solid rgba(155,114,255,0.28)`,
            fontSize: 13, fontWeight: 700, color: "#c4a8ff",
            marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.teal, display: "inline-block" }} aria-hidden="true" />
            Early access · Ages 2–11 · {status.launchBandCount || bandList.length} bands
          </div>

          {/* Headline */}
          <h1 style={{
            margin: "0 0 24px",
            fontSize: "clamp(2.8rem, 7vw, 5.2rem)",
            fontWeight: 950,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            color: T.text,
          }}>
            Learning that feels<br />
            like an{" "}
            <span style={{
              background: `linear-gradient(135deg, ${T.violet}, ${T.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              adventure.
            </span>
          </h1>

          {/* Sub */}
          <p style={{
            margin: "0 auto 36px",
            maxWidth: 620,
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            lineHeight: 1.7,
            color: T.muted,
          }}>
            WonderQuest is an AI-powered adaptive learning platform for children aged 2–11 — currently in early access.
            Short quests, instant parent insights, and classroom-ready teacher tools —
            all in one safe, ad-free environment.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 36 }}>
            {["🎮 Gamified quests", "🤖 AI coaching", "📊 Real-time insights", "🔒 Privacy-first"].map((chip) => (
              <span key={chip} style={{
                padding: "7px 14px", borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${T.border}`,
                fontSize: 13, fontWeight: 600, color: T.muted,
              }}>
                {chip}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <GuestStartButton style={{
              padding: "15px 32px", borderRadius: 14,
              background: `linear-gradient(135deg, ${T.violet} 0%, ${T.teal} 100%)`,
              color: "#fff", fontSize: 16, fontWeight: 800,
              boxShadow: "0 8px 32px rgba(155,114,255,0.4)",
            }} />
            <Link href="/parent" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "15px 28px", borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${T.borderHi}`,
              color: T.text, fontSize: 16, fontWeight: 700,
              textDecoration: "none",
            }}>
              Family Hub
            </Link>
          </div>

          {/* Already signed up */}
          <div style={{ marginTop: 16, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: T.dim }}>Already have an account?</span>
            {[
              { href: "/child", label: "Child login" },
              { href: "/parent", label: "Parent login" },
              { href: "/teacher", label: "Teacher login" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                fontSize: 13, fontWeight: 700, color: T.muted,
                textDecoration: "underline", textUnderlineOffset: 3,
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Band strip ── */}
        <div style={{
          display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap",
          marginTop: 56,
          position: "relative", zIndex: 1,
        }}>
          {bandList.slice(0, 4).map((band) => {
            const m = BANDS[band.code];
            if (!m) return null;
            return (
              <div key={band.code} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 18px", borderRadius: 14,
                background: m.bg,
                border: `1px solid ${m.color}30`,
              }}>
                <span style={{ fontSize: 18 }} aria-hidden="true">{m.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>{m.ages}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 1,
        borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
        background: T.surface,
      }}>
        {[
          { value: "Growing",    label: "Practice questions"        },
          { value: "4 bands",    label: "Grade-level paths"        },
          { value: "AI-powered", label: "Adaptive engine"          },
          { value: "COPPA",      label: "Designed for compliance"  },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: "1 1 180px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "28px 20px",
            borderRight: i < 3 ? `1px solid ${T.border}` : "none",
            gap: 4,
          }}>
            <span style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: T.text, letterSpacing: "-0.03em" }}>{stat.value}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Features grid ─────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(56px,8vw,96px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: T.teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              WHAT MAKES IT DIFFERENT
            </p>
            <h2 style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.text }}>
              Built for real learning moments
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{
                padding: "28px 24px",
                borderRadius: 18,
                background: T.card,
                border: `1px solid ${T.border}`,
                transition: "border-color 0.2s",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: "rgba(155,114,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 16,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: T.text }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: T.muted }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audience sections ─────────────────────────────────────────────── */}
      <section style={{ padding: "0 clamp(16px,4vw,48px) clamp(56px,8vw,96px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: T.teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              ONE PLATFORM, THREE AUDIENCES
            </p>
            <h2 style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.text }}>
              Every role has its own home.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {AUDIENCES.map((a, i) => (
              <div key={a.href} className={`home-audience-row ${i % 2 === 0 ? "home-audience-even" : "home-audience-odd"}`} style={{
                border: `1px solid ${a.accentBorder}`,
                background: a.accentBg,
              }}>
                {/* Text block */}
                <div className={`home-audience-text ${i % 2 === 0 ? "home-audience-even-text" : "home-audience-odd-text"}`} style={{
                  padding: "clamp(28px,4vw,48px)",
                }}>
                  <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: a.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {a.label}
                  </p>
                  <h3 style={{ margin: "0 0 16px", fontSize: "clamp(1.4rem,2.8vw,2rem)", fontWeight: 900, lineHeight: 1.15, letterSpacing: "-0.03em", color: T.text }}>
                    {a.title}
                  </h3>
                  <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.7, color: T.muted, maxWidth: 480 }}>
                    {a.body}
                  </p>
                  <ul style={{ margin: "0 0 28px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {a.highlights.map((h) => (
                      <li key={h} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: T.muted }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.accent, flexShrink: 0 }} aria-hidden="true" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <Link href={a.href} style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "12px 22px", borderRadius: 12,
                    background: a.accentBg,
                    border: `1px solid ${a.accentBorder}`,
                    color: a.accent, fontSize: 14, fontWeight: 800,
                    textDecoration: "none",
                  }}>
                    {a.cta}
                  </Link>
                </div>

                {/* Visual block */}
                <div className={`home-audience-visual ${i % 2 === 0 ? "home-audience-even-visual" : "home-audience-odd-visual"}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "32px",
                  background: `linear-gradient(135deg, ${a.accentBg}, rgba(6,7,26,0.4))`,
                  borderLeft: i % 2 === 0 ? `1px solid ${a.accentBorder}` : "none",
                  borderRight: i % 2 !== 0 ? `1px solid ${a.accentBorder}` : "none",
                  fontSize: "clamp(80px,12vw,110px)",
                }}>
                  {a.emoji}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section style={{
        padding: "clamp(56px,8vw,96px) clamp(16px,4vw,48px)",
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: T.teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              HOW IT WORKS
            </p>
            <h2 style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.text }}>
              Setup to progress in 3 steps.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 2 }}>
            {[
              { num: "01", title: "Set up in 60 seconds",          body: "A parent creates the account, adds a child, and picks the right learning band. No long forms, no credit card." },
              { num: "02", title: "Child starts a quest",           body: "5–8 adaptive questions, audio support, rewards, and Coach Leo when they get stuck. Feels like a game, builds real skills." },
              { num: "03", title: "Progress surfaces automatically", body: "Weekly AI report for parents, class mastery for teachers, and live badges for kids. Everyone knows what's next." },
            ].map((step, i) => (
              <div key={step.num} style={{
                padding: "36px 32px",
                borderRadius: i === 0 ? "18px 0 0 18px" : i === 2 ? "0 18px 18px 0" : 0,
                background: T.card,
                border: `1px solid ${T.border}`,
                borderLeft: i > 0 ? "none" : `1px solid ${T.border}`,
              }}>
                <div style={{
                  fontSize: 12, fontWeight: 900, color: T.violet,
                  letterSpacing: "0.1em", marginBottom: 18,
                }}>
                  {step.num}
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: T.text }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: T.muted }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety ────────────────────────────────────────────────────────── */}
      <section style={{ padding: "clamp(56px,8vw,96px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="home-safety-grid" style={{
            borderRadius: 24, overflow: "hidden",
            border: `1px solid ${T.border}`,
            background: `linear-gradient(135deg, rgba(45,212,191,0.06) 0%, rgba(155,114,255,0.06) 100%)`,
            padding: "clamp(32px,5vw,56px)",
          }}>
            <div>
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: T.teal, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                BUILT SAFE FROM DAY ONE
              </p>
              <h2 style={{ margin: "0 0 14px", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.text }}>
                Privacy-first. Always.
              </h2>
              <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.7, color: T.muted, maxWidth: 520 }}>
                WonderQuest was designed with children&apos;s safety at the core — not bolted on later.
                No social features, no advertising, no data sold, ever.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["🔒 COPPA-designed", "📵 Zero ads", "💬 No chat", "👁️ No child rankings", "🤖 No data sold", "📱 Any device"].map((item) => (
                  <span key={item} style={{
                    padding: "7px 14px", borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${T.border}`,
                    fontSize: 13, fontWeight: 600, color: T.muted,
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 72, textAlign: "center" }} aria-hidden="true">🔒</div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: "clamp(56px,8vw,96px) clamp(16px,4vw,48px)",
        textAlign: "center",
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, letterSpacing: "-0.03em", color: T.text }}>
            Ready to start the adventure?
          </h2>
          <p style={{ margin: "0 0 36px", fontSize: 16, lineHeight: 1.7, color: T.muted }}>
            Set up in 60 seconds. No credit card. No homework stress.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <GuestStartButton style={{
              padding: "16px 36px", borderRadius: 14,
              background: `linear-gradient(135deg, ${T.violet} 0%, ${T.teal} 100%)`,
              color: "#fff", fontSize: 16, fontWeight: 800,
              boxShadow: "0 8px 32px rgba(155,114,255,0.4)",
            }} />
            <Link href="/teacher" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "16px 28px", borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${T.borderHi}`,
              color: T.text, fontSize: 16, fontWeight: 700,
              textDecoration: "none",
            }}>
              I&apos;m a teacher
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        padding: "32px clamp(16px,4vw,48px) 24px",
        borderTop: `1px solid ${T.border}`,
        display: "flex", flexWrap: "wrap", gap: 24,
        justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.dim }}>
            Wonder<span style={{ color: T.teal }}>Quest</span> · Early Access
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.dim }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? T.teal : T.gold, display: "inline-block" }} aria-hidden="true" />
            {isLive ? "All systems operational" : "Fallback mode"}
          </span>
          <Link href="/owner" style={{ fontSize: 13, color: T.dim, textDecoration: "none" }}>Platform ops</Link>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: T.text, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Portals</div>
          {[
            { href: "/child", label: "Child portal" },
            { href: "/parent", label: "Family Hub" },
            { href: "/teacher", label: "Classroom" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ display: "block", fontSize: 13, color: T.muted, textDecoration: "none", marginBottom: 6 }}>
              {label}
            </Link>
          ))}
        </div>
      </footer>

    </div>
  );
}
