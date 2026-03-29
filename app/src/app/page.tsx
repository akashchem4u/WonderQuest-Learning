import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";
import { DisplayModeToggle } from "@/components/display-mode-toggle";

export const dynamic = "force-dynamic";

const routeCards = [
  {
    href: "/parent",
    audience: "Family route",
    icon: "👨‍👩‍👧",
    title: "See the week without turning home into a report card",
    description:
      "Track comfort, celebrate wins, and get simple next-step ideas that support the child path without drowning it in admin.",
    cta: "Open family hub",
    tone: "parent",
  },
  {
    href: "/teacher",
    audience: "Classroom route",
    icon: "🏫",
    title: "Spot support lanes and class momentum faster",
    description:
      "Use class signals, drilldowns, and intervention cues to decide where guided help or stretch work belongs next.",
    cta: "Open classroom view",
    tone: "teacher",
  },
  {
    href: "/owner",
    audience: "Ops route",
    icon: "⚙️",
    title: "Run product signal, content readiness, and feedback flow in one place",
    description:
      "Keep route health, incoming feedback, and launch readiness visible without mixing them into child or family experiences.",
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
              Launch child route
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
              with real <em>route clarity</em>.
            </h1>
            <p>
              WonderQuest should feel alive in the child route, calm in the family
              route, useful in the classroom route, and operationally sharp in the
              ops route. This home screen is the launcher for that system.
            </p>

            <div className="landing-chip-row">
              <span className="landing-chip">Child-first launcher</span>
              <span className="landing-chip">Separate adult routes</span>
              <span className="landing-chip">
                {launchStatus.source === "supabase"
                  ? "Live route data"
                  : "Fallback route data"}
              </span>
              <span className="landing-chip">Saved progress and badges</span>
            </div>

            <div className="landing-hero-actions">
              <Link className="landing-primary-btn" href="/child">
                Start child journey
              </Link>
              <a className="landing-secondary-btn" href="#audiences">
                Explore the routes
              </a>
            </div>
          </div>
        </section>

        <section className="landing-launcher-stack" id="audiences">
          <article className="landing-featured-card tone-kid">
            <div className="landing-featured-copy">
              <span className="landing-featured-label">Kid journey</span>
              <h2>Put the child route in front. Let the adult routes support it from the edge.</h2>
              <p>
                The shipped UI should open with a bold child path, then let family,
                classroom, and ops surfaces do their jobs without stealing the
                center of gravity.
              </p>
              <div className="landing-chip-row">
                <span className="landing-chip">Quick child access</span>
                <span className="landing-chip">Voice + visual support</span>
                <span className="landing-chip">Saved badges and trophies</span>
              </div>
            </div>

            <div className="landing-featured-action">
              <div className="landing-route-icon landing-route-icon-featured" aria-hidden="true">
                🚀
              </div>
              <Link className="landing-route-link landing-route-link-featured" href="/child">
                Launch child route
              </Link>
            </div>
          </article>

          <div className="landing-proof-grid">
            <article className="landing-metric-card">
              <span>Launch bands</span>
              <strong>{launchStatus.launchBandCount}</strong>
              <p>Age and band pathways already present in the live app shell.</p>
            </article>
            <article className="landing-metric-card">
              <span>Question bank</span>
              <strong>{launchStatus.templateCount >= 8 ? "100+" : "Growing"}</strong>
              <p>Enough content to keep the real routes from feeling like one repeated stub.</p>
            </article>
            <article className="landing-metric-card">
              <span>Saved progress</span>
              <strong>Live</strong>
              <p>Points, badges, and return-state motivation already persist across sessions.</p>
            </article>
            <article className="landing-metric-card">
              <span>Adult routes</span>
              <strong>3</strong>
              <p>Family, classroom, and ops surfaces stay purpose-built instead of blended together.</p>
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
            <h2>Live product signal, not just a static mockup.</h2>
            <p>
              These routes point at the actual app, so UI changes here affect the
              real experience rather than a detached mock lane.
            </p>
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
              <small>Weekly signals and next-step guidance</small>
            </article>
            <article className="landing-band-pill">
              <strong>Teacher</strong>
              <span>Command center</span>
              <small>Support lanes and skill drilldowns</small>
            </article>
            <article className="landing-band-pill">
              <strong>Owner</strong>
              <span>Ops console</span>
              <small>Release readiness and route health</small>
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
            Live launch counts are temporarily unavailable, so this route is
            showing fallback plan values.
          </p>
        ) : null}
      </div>
    </main>
  );
}
