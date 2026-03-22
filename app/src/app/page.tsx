import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

export const dynamic = "force-dynamic";

const routeCards = [
  {
    href: "/parent",
    audience: "For parents",
    icon: "👨‍👩‍👧",
    title: "Follow your child's journey",
    description:
      "See what they are learning, celebrate wins, and get simple next-step ideas without turning home into a report card.",
    cta: "Open parent route",
    tone: "parent",
  },
  {
    href: "/teacher",
    audience: "For teachers",
    icon: "🏫",
    title: "Support every learner",
    description:
      "Use class-level visibility, skill drilldowns, and intervention cues to spot where help or stretch work is needed.",
    cta: "Open teacher route",
    tone: "teacher",
  },
  {
    href: "/owner",
    audience: "Platform ops",
    icon: "⚙️",
    title: "System health at a glance",
    description:
      "Track route health, feedback signal, and content readiness across the prototype with operational context.",
    cta: "Open owner route",
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
              Start free
            </Link>
          </div>
        </header>

        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">
              Early access · Ages 2 to 10 · {launchStatus.launchBandCount} live bands
            </span>
            <h1>
              Learning that feels
              <br />
              like a <em>Quest</em>.
            </h1>
            <p>
              Adaptive reading and math built around play, not pressure. Voice-led
              support, low-text child flows, and clear adult visibility in one
              shared product.
            </p>

            <div className="landing-chip-row">
              <span className="landing-chip">Child-first launcher</span>
              <span className="landing-chip">No peer chat</span>
              <span className="landing-chip">
                {launchStatus.source === "supabase"
                  ? "Live learning flows"
                  : "Fallback launch data"}
              </span>
              <span className="landing-chip">Saved progress and badges</span>
            </div>

            <div className="landing-hero-actions">
              <Link className="landing-primary-btn" href="/child">
                Start playing
              </Link>
              <a className="landing-secondary-btn" href="#audiences">
                See who it is for
              </a>
            </div>
          </div>
        </section>

        <section className="landing-launcher-stack" id="audiences">
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
          <div className="landing-status-item">
            <span className="landing-status-dot" aria-hidden="true" />
            <strong>{sourceLabel}</strong>
          </div>
          <div className="landing-status-item">
            <span aria-hidden="true">🧭</span>
            <strong>{launchStatus.launchBandCount}</strong> live learning bands
          </div>
          <div className="landing-status-item">
            <span aria-hidden="true">🧠</span>
            <strong>{launchStatus.skillCount}</strong> seeded skills
          </div>
          <div className="landing-status-item">
            <span aria-hidden="true">🎒</span>
            <strong>{launchStatus.templateCount}</strong> playable templates
          </div>
        </section>

        <section className="landing-trust-strip">
          <span className="landing-trust-item">🔒 COPPA-conscious design</span>
          <span className="landing-trust-item">🎓 Built for home and school</span>
          <span className="landing-trust-item">🚫 No peer chat</span>
          <span className="landing-trust-item">👁️ No public rankings for children</span>
          <span className="landing-trust-item">📱 Ready on phone, tablet, and laptop</span>
        </section>

        {launchStatus.source === "fallback" ? (
          <p className="landing-fallback-note">
            Live launch counts are temporarily unavailable, so this route is
            showing fallback plan values.
          </p>
        ) : null}
      </div>
    </main>
  );
}
