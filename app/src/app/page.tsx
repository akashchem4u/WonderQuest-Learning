import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

export const dynamic = "force-dynamic";

const routeCards = [
  {
    href: "/parent",
    audience: "For families",
    icon: "👨‍👩‍👧",
    title: "See the week at a glance",
    description: "Calm wins, simple signals, and one next step.",
    cta: "Open family hub",
    tone: "parent",
  },
  {
    href: "/teacher",
    audience: "For teachers",
    icon: "🏫",
    title: "Spot support fast",
    description: "Progress, cues, and next moves in one view.",
    cta: "Open classroom view",
    tone: "teacher",
  },
  {
    href: "/owner",
    audience: "Platform management",
    icon: "⚙️",
    title: "Track launches in one place",
    description: "Content status, feedback, and readiness stay separate.",
    cta: "Open ops console",
    tone: "owner",
  },
] as const;

export default async function HomePage() {
  const launchStatus = await getLaunchStatus();
  const sourceLabel =
    launchStatus.source === "supabase" ? "All systems operational" : "Fallback plan values";

  return (
    <main className="landing-page">
      <div className="landing-page-shell">
        <header className="landing-topbar">
          <Link className="landing-brand" href="/">
            WonderQuest <span>Learning</span>
          </Link>

          <div className="landing-topbar-center">
            <Link className="landing-mini-link" href="/parent">
              For families
            </Link>
            <Link className="landing-mini-link" href="/teacher">
              For teachers
            </Link>
            <Link className="landing-mini-link" href="/owner">
              Platform ops
            </Link>
          </div>

          <div className="landing-topbar-actions">
            <DisplayModeToggle />
            <Link className="landing-topbar-cta" href="/child">
              Start learning
            </Link>
          </div>
        </header>

        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              Early access · Ages 2 to 10 · {launchStatus.launchBandCount} live bands
            </span>
            <h1>
              Child-first learning
              <br />
              with real <em>clarity</em>.
            </h1>
            <p>
              WonderQuest keeps the child front and center while families, teachers,
              and ops each get a focused view around them.
            </p>

            <div className="landing-chip-row">
              <span className="landing-chip">Child-first</span>
              <span className="landing-chip">Separate views</span>
              <span className="landing-chip">
                {launchStatus.source === "supabase"
                  ? "Live data"
                  : "Demo data"}
              </span>
              <span className="landing-chip">Saved progress</span>
            </div>

            <div className="landing-hero-actions">
              <Link className="landing-primary-btn" href="/child">
                Start child journey
              </Link>
              <a className="landing-secondary-btn" href="#audiences">
                See who it's for
              </a>
            </div>
          </div>

          <div className="landing-hero-visual" aria-label="WonderQuest preview">
            <div className="landing-hero-visual-frame">
              <div className="landing-hero-visual-top">
                <span>Product snapshot</span>
                <strong>Clear layers for child, family, and ops.</strong>
              </div>

              <div className="landing-hero-visual-grid">
                <article className="landing-hero-visual-card is-child">
                  <span aria-hidden="true">🧒</span>
                  <strong>Child</strong>
                  <p>Big visuals, short prompts, saved progress.</p>
                </article>
                <article className="landing-hero-visual-card is-family">
                  <span aria-hidden="true">🏠</span>
                  <strong>Family</strong>
                  <p>Calm summaries and one clear next step.</p>
                </article>
                <article className="landing-hero-visual-card is-ops">
                  <span aria-hidden="true">⚙️</span>
                  <strong>Ops</strong>
                  <p>Status, readiness, and launch notes stay separate.</p>
                </article>
              </div>

              <div className="landing-hero-visual-strip" aria-hidden="true">
                <span>Images</span>
                <span>Audio</span>
                <span>Progress</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-launcher-stack" id="audiences">
          <article className="landing-featured-card tone-kid">
            <div className="landing-featured-copy">
              <span className="landing-featured-label">Kid journey</span>
              <h2>The child path stays front and center.</h2>
              <p>
                Families, teachers, and ops each get a separate space that supports
                the child without crowding the experience.
              </p>
              <div className="landing-chip-row">
                <span className="landing-chip">Quick child access</span>
                <span className="landing-chip">Voice + visuals</span>
                <span className="landing-chip">Badges and trophies</span>
              </div>
            </div>

            <div className="landing-featured-action">
              <div className="landing-route-icon landing-route-icon-featured" aria-hidden="true">
                🚀
              </div>
              <Link className="landing-route-link landing-route-link-featured" href="/child">
                Start learning
              </Link>
            </div>
          </article>

          <div className="landing-proof-grid">
            <article className="landing-metric-card">
              <span>Launch bands</span>
              <strong>{launchStatus.launchBandCount}</strong>
              <p>Age-appropriate learning pathways for children ages 2–10.</p>
            </article>
            <article className="landing-metric-card">
              <span>Question bank</span>
              <strong>{launchStatus.templateCount >= 8 ? "100+" : "Building"}</strong>
              <p>Real practice across multiple ages and subjects.</p>
            </article>
            <article className="landing-metric-card">
              <span>Saved progress</span>
              <strong>Live</strong>
              <p>Points, badges, and trophies carry over automatically.</p>
            </article>
            <article className="landing-metric-card">
              <span>Adult views</span>
              <strong>3</strong>
              <p>Families, teachers, and platform admins stay separated.</p>
            </article>
          </div>

          <div className="landing-route-grid">
            {routeCards.map((card) => (
              <article
                className={`landing-route-card tone-${card.tone}`}
                key={card.href}
              >
                <div className="landing-route-icon" aria-hidden="true">
                  {card.icon}
                </div>
                <div className="landing-route-copy">
                  <span>{card.audience}</span>
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                </div>
                <Link className="landing-route-link" href={card.href}>
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-status-strip">
          <div className="landing-status-copy">
            <div className="landing-status-item">
              <span className="landing-status-dot" aria-hidden="true" />
              <strong>{sourceLabel}</strong>
            </div>
            <h2>Live product, not a mock.</h2>
            <p>These routes connect to the real app experience.</p>
          </div>

          <div className="landing-band-row">
            <article className="landing-band-pill">
              <strong>Child</strong>
              <span>Quick access</span>
              <small>Low-text entry, saved progress</small>
            </article>
            <article className="landing-band-pill">
              <strong>Parent</strong>
              <span>Family dashboard</span>
              <small>Weekly progress and next-step ideas</small>
            </article>
            <article className="landing-band-pill">
              <strong>Teacher</strong>
              <span>Command center</span>
              <small>Student support and skill breakdowns</small>
            </article>
            <article className="landing-band-pill">
              <strong>Owner</strong>
              <span>Ops console</span>
              <small>Launch readiness and platform status</small>
            </article>
          </div>
        </section>

        <section className="landing-trust-strip">
          <span className="landing-trust-item">🔒 COPPA-conscious design</span>
          <span className="landing-trust-item">🎓 Built for home and school</span>
          <span className="landing-trust-item">🚫 No peer chat</span>
          <span className="landing-trust-item">👁️ No public rankings for children</span>
          <span className="landing-trust-item">📱 Shared UI across phone, tablet, and desktop</span>
        </section>

        {launchStatus.source === "fallback" ? (
          <p className="landing-fallback-note">
            Live launch counts are temporarily unavailable — showing fallback plan values.
          </p>
        ) : null}
      </div>
    </main>
  );
}
