import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

export const dynamic = "force-dynamic";

const roleCards = [
  {
    href: "/child",
    emoji: "🧒",
    name: "Child",
    tagline: "Quests, rewards & adventure",
    tone: "child",
  },
  {
    href: "/parent",
    emoji: "👨‍👩‍👧",
    name: "Parent",
    tagline: "Progress & family hub",
    tone: "parent",
  },
  {
    href: "/teacher",
    emoji: "🏫",
    name: "Teacher",
    tagline: "Classroom & interventions",
    tone: "teacher",
  },
  {
    href: "/owner",
    emoji: "⚙️",
    name: "Platform",
    tagline: "Ops & launch readiness",
    tone: "owner",
  },
] as const;

const trustItems = [
  "🔒 COPPA-safe",
  "🎓 Home + school",
  "🚫 No chat",
  "👁️ No child rankings",
  "📱 Phone / tablet / desktop",
];

export default async function HomePage() {
  const launchStatus = await getLaunchStatus();
  const sourceLabel =
    launchStatus.source === "supabase" ? "All systems operational" : "Fallback plan values";

  return (
    <main className="home-launcher">
      {/* Ambient glows */}
      <div className="home-glow home-glow-violet" aria-hidden="true" />
      <div className="home-glow home-glow-teal" aria-hidden="true" />

      {/* Top bar */}
      <header className="home-topbar">
        <Link className="home-logo" href="/">
          Wonder<span>Quest</span>
        </Link>

        <nav className="home-topbar-links" aria-label="Primary">
          <Link href="/parent">For families</Link>
          <Link href="/teacher">For teachers</Link>
          <Link href="/owner">Platform ops</Link>
        </nav>

        <div className="home-topbar-actions">
          <DisplayModeToggle />
          <Link className="home-start-btn" href="/child">
            Start learning
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="home-hero">
        <span className="home-badge">
          Early access · Ages 2–10 · {launchStatus.launchBandCount} live bands
        </span>
        <h1 className="home-title">
          Wonder<span>Quest</span>
        </h1>
        <p className="home-sub">
          Adaptive learning for every child, every day.
        </p>
      </section>

      {/* Role selection */}
      <section className="home-role-section">
        <p className="home-role-label">Choose your experience</p>
        <div className="home-role-grid">
          {roleCards.map((card) => (
            <Link
              className={`home-role-card rc-${card.tone}`}
              href={card.href}
              key={card.href}
            >
              <span className="rc-emoji" aria-hidden="true">{card.emoji}</span>
              <span className="rc-name">{card.name}</span>
              <span className="rc-tagline">{card.tagline}</span>
              <span className="rc-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <div className="home-trust-strip">
        {trustItems.map((item) => (
          <span className="home-trust-item" key={item}>{item}</span>
        ))}
      </div>

      {/* Live status */}
      <div className="home-status-bar">
        <span className="home-status-dot" aria-hidden="true" />
        <span>{sourceLabel}</span>
        <span className="home-status-sep" aria-hidden="true">·</span>
        <span>{launchStatus.launchBandCount} bands live</span>
        <span className="home-status-sep" aria-hidden="true">·</span>
        <span>{launchStatus.templateCount >= 8 ? "Deep question bank" : "Building content"}</span>
      </div>

      {launchStatus.source === "fallback" && (
        <p className="home-fallback-note">
          Live counts temporarily unavailable — showing fallback values.
        </p>
      )}
    </main>
  );
}
