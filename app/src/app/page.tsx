import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

export const dynamic = "force-dynamic";

// ─── Static data ──────────────────────────────────────────────────────────────

const BAND_META: Record<string, { label: string; ages: string; icon: string; color: string }> = {
  PREK: { label: "Pre-K",      ages: "Ages 2–5",  icon: "🌱", color: "#ffd166" },
  K1:   { label: "K–1",       ages: "Ages 5–7",  icon: "🌟", color: "#9b72ff" },
  G23:  { label: "Grades 2–3", ages: "Ages 7–9", icon: "🚀", color: "#58e8c1" },
  G45:  { label: "Grades 4–5", ages: "Ages 9–11",icon: "⚡", color: "#38bdf8" },
  G6:   { label: "Grade 6",    ages: "Ages 11+", icon: "🔬", color: "#ff7b6b" },
};

const PROOF_ITEMS = [
  { icon: "🧠", stat: "AI-adaptive",  label: "Every question adjusts to the child's pace, band, and mastery in real time" },
  { icon: "🏆", stat: "3 000+",       label: "Questions across reading, math, phonics, science, logic & more" },
  { icon: "🔒", stat: "COPPA-safe",   label: "No chat, no ads, no rankings — privacy-first from the ground up" },
  { icon: "📱", stat: "Any device",   label: "Phone, tablet, and desktop — same seamless experience everywhere" },
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Set up in 60 seconds",
    body: "A parent creates the family account, adds a child, and picks the right learning band. No long forms, no credit card.",
  },
  {
    num: "02",
    title: "Child starts a quest",
    body: "Each session is a short quest — 5 to 8 adaptive questions with audio support, rewards, and Coach Leo's help when the child gets stuck.",
  },
  {
    num: "03",
    title: "Progress surfaces automatically",
    body: "Parents get a plain-language weekly report. Teachers see class-wide mastery trends. Everyone always knows what's next.",
  },
];

const AUDIENCE_CARDS = [
  {
    tone:  "tone-kid",
    emoji: "🧒",
    href:  "/child",
    label: "For children",
    title: "Quests, rewards & adventure",
    body:  "Short adaptive quests keep children engaged. Earn badges, level up, and unlock trophies — all without a single ad or leaderboard.",
    cta:   "Start a quest",
    chips: ["Audio-first for early learners", "Coach Leo explains mistakes", "Streaks & badges"],
  },
  {
    tone:  "tone-parent",
    emoji: "👨‍👩‍👧",
    href:  "/parent",
    label: "For families",
    title: "Clear progress, no homework stress",
    body:  "A weekly AI digest tells you exactly what your child worked on, what's improving, and what to practice next — in plain language.",
    cta:   "Open family hub",
    chips: ["Weekly AI digest", "Multi-child households", "PIN-based child access"],
  },
  {
    tone:  "tone-teacher",
    emoji: "🏫",
    href:  "/teacher",
    label: "For teachers",
    title: "Class insights without extra work",
    body:  "See who is on track, who needs support, and which skills are slipping — without building a single spreadsheet.",
    cta:   "Open teacher dashboard",
    chips: ["Intervention queue", "Mastery by skill", "AI archetype detection"],
  },
] as const;

const SAFETY_ITEMS = [
  "🔒 COPPA-compliant",
  "📵 Zero ads",
  "💬 No chat",
  "👁️ No child rankings",
  "🤖 No data sold",
  "📱 Phone · tablet · desktop",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const status = await getLaunchStatus();
  const isLive  = status.source === "supabase";

  const bandList = status.bands.length > 0
    ? status.bands
    : [
        { code: "PREK", theme: "Seedling Grove" },
        { code: "K1",   theme: "Star Valley" },
        { code: "G23",  theme: "Explorer Ridge" },
        { code: "G45",  theme: "Lightning Peak" },
      ];

  return (
    <main className="landing-page">
      <div className="landing-page-shell">

        {/* ── Nav ─────────────────────────────────────────────────────────── */}
        <header className="landing-topbar">
          <Link className="landing-brand" href="/">
            Wonder<span>Quest</span>
          </Link>

          <nav className="landing-topbar-center" aria-label="Primary">
            <Link className="landing-mini-link" href="/parent">For families</Link>
            <Link className="landing-mini-link" href="/teacher">For teachers</Link>
            <Link className="landing-mini-link" href="/owner">Platform ops</Link>
          </nav>

          <div className="landing-topbar-actions">
            <DisplayModeToggle />
            <Link className="landing-topbar-cta" href="/child">
              Start learning →
            </Link>
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              Early access · Ages 2–10 · {status.launchBandCount || bandList.length} live bands
            </span>

            <h1>
              Learning that feels like an <em>adventure.</em>
            </h1>

            <p>
              WonderQuest is an AI-powered adaptive learning platform for children aged 2–10.
              Short quests, real-time parent insights, and classroom-ready teacher tools —
              all in one safe, ad-free environment.
            </p>

            <div className="landing-chip-row">
              <span className="landing-chip">🎮 Gamified quests</span>
              <span className="landing-chip">🤖 AI coaching</span>
              <span className="landing-chip">📊 Parent &amp; teacher insights</span>
            </div>

            <div className="landing-hero-actions">
              <Link className="landing-primary-btn" href="/child">
                Start a free quest →
              </Link>
              <Link className="landing-secondary-btn" href="/parent">
                For parents
              </Link>
            </div>
          </div>

          {/* Right — product preview */}
          <div className="landing-hero-visual">
            <div className="landing-hero-visual-frame">
              <div className="landing-hero-visual-top">
                <span>Live platform</span>
                <strong>Three audiences. One product.</strong>
              </div>

              <div className="landing-hero-visual-grid">
                <div className="landing-hero-visual-card is-child">
                  <span aria-hidden="true">🧒</span>
                  <strong>Child</strong>
                  <p>Quests · Badges · Coach Leo</p>
                  <div className="landing-hero-visual-art" aria-hidden="true">
                    <span className="is-one" />
                    <span className="is-two" />
                    <span className="is-three" />
                    <span className="is-bar" />
                  </div>
                </div>

                <div className="landing-hero-visual-card is-family">
                  <span aria-hidden="true">👨‍👩‍👧</span>
                  <strong>Family</strong>
                  <p>Reports · Progress · Alerts</p>
                  <div className="landing-hero-visual-art" aria-hidden="true">
                    <span className="is-bar" />
                    <span className="is-three" />
                    <span className="is-two" />
                    <span className="is-one" />
                  </div>
                </div>

                <div className="landing-hero-visual-card is-ops">
                  <span aria-hidden="true">🏫</span>
                  <strong>Teacher</strong>
                  <p>Roster · Mastery · Interventions</p>
                  <div className="landing-hero-visual-art" aria-hidden="true">
                    <span className="is-two" />
                    <span className="is-bar" />
                    <span className="is-one" />
                    <span className="is-three" />
                  </div>
                </div>
              </div>

              <div className="landing-hero-visual-strip">
                {bandList.slice(0, 4).map((band) => {
                  const meta = BAND_META[band.code];
                  return (
                    <span key={band.code} style={{ color: meta?.color }}>
                      {meta?.icon ?? "📚"} {meta?.label ?? band.code}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Why WonderQuest ─────────────────────────────────────────────── */}
        <section className="landing-proof-card">
          <span className="landing-panel-label">Why WonderQuest</span>
          <h2>Built for real learning moments</h2>
          <div className="landing-proof-grid">
            {PROOF_ITEMS.map((item) => (
              <div className="landing-metric-card" key={item.stat}>
                <span aria-hidden="true">{item.icon}</span>
                <strong>{item.stat}</strong>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured — child experience ──────────────────────────────────── */}
        <section className="landing-featured-card tone-kid">
          <div className="landing-featured-copy">
            <span className="landing-featured-label">Child experience</span>
            <h2>A quest, not a worksheet.</h2>
            <p>
              Every session is 5–8 adaptive questions wrapped in a short quest.
              Children earn points, badges, and trophies. When they struggle,
              Coach Leo steps in with a visual explanation — never a red X.
            </p>
            <div className="landing-chip-row">
              <span className="landing-chip">Audio replay at any time</span>
              <span className="landing-chip">Guided early-learner mode</span>
              <span className="landing-chip">Daily streaks build habits</span>
            </div>
            <div className="landing-hero-actions">
              <Link className="landing-primary-btn" href="/child">
                Try a quest →
              </Link>
            </div>
          </div>
          <div className="landing-featured-action">
            <div className="landing-route-icon-featured" aria-hidden="true">🧒</div>
            <Link className="landing-route-link-featured" href="/child">
              Open child home
            </Link>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="landing-proof-card">
          <span className="landing-panel-label">How it works</span>
          <h2>From setup to progress in three steps</h2>
          <div className="landing-proof-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {HOW_IT_WORKS.map((step) => (
              <div className="landing-metric-card" key={step.num}>
                <span aria-hidden="true">{step.num}</span>
                <strong style={{ fontSize: "1.05rem" }}>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Audience cards ───────────────────────────────────────────────── */}
        <div className="landing-route-grid">
          {AUDIENCE_CARDS.map((card) => (
            <Link className={`landing-route-card ${card.tone}`} href={card.href} key={card.href}>
              <div className="landing-route-icon" aria-hidden="true">{card.emoji}</div>
              <div className="landing-route-copy">
                <span>{card.label}</span>
                <h2>{card.title}</h2>
                <p>{card.body}</p>
                <div className="landing-chip-row" style={{ marginTop: 6 }}>
                  {card.chips.map((chip) => (
                    <span className="landing-chip" key={chip} style={{ fontSize: "0.77rem", minHeight: 28 }}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <span className="landing-route-link">{card.cta} →</span>
            </Link>
          ))}
        </div>

        {/* ── Learning bands ───────────────────────────────────────────────── */}
        <section className="landing-status-strip">
          <div className="landing-status-copy">
            <span className="landing-panel-label">Learning bands</span>
            <h2>One platform, every stage.</h2>
            <p>
              WonderQuest adapts to the child&apos;s grade band — not just their age.
              Each band has its own skill ladder, question pool, and theme world.
            </p>
          </div>
          <div className="landing-band-row">
            {bandList.slice(0, 4).map((band) => {
              const meta = BAND_META[band.code] ?? { label: band.code, ages: "", icon: "📚", color: "#f0f6ff" };
              return (
                <div className="landing-band-pill" key={band.code}>
                  <strong style={{ color: meta.color }}>{meta.icon} {meta.label}</strong>
                  <span>{meta.ages}</span>
                  <small>{band.theme}</small>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Safety ───────────────────────────────────────────────────────── */}
        <div className="landing-safety-row">
          {SAFETY_ITEMS.map((item) => (
            <span className="landing-safety-pill" key={item}>{item}</span>
          ))}
        </div>

        {/* ── Live status footer ───────────────────────────────────────────── */}
        <div className="landing-trust-strip">
          <span className="landing-trust-item">
            <span className="landing-status-dot" aria-hidden="true" />
            {isLive ? "All systems operational" : "Fallback mode"}
          </span>
          <span className="landing-trust-item">
            {status.launchBandCount || bandList.length} bands live
          </span>
          {status.skillCount > 0 && (
            <span className="landing-trust-item">{status.skillCount} skills tracked</span>
          )}
          <span className="landing-trust-item">
            {status.templateCount >= 8 ? "Full question bank" : "Question bank active"}
          </span>
        </div>

        {status.source === "fallback" && (
          <p className="landing-fallback-note">
            Live data temporarily unavailable — showing fallback values.
          </p>
        )}

      </div>
    </main>
  );
}
