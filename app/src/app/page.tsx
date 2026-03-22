import { DisplayModeToggle } from "@/components/display-mode-toggle";
import { launchBands } from "@/lib/launch-plan";
import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";

export const dynamic = "force-dynamic";

const routeCards = [
  {
    href: "/child",
    audience: "Child",
    icon: "Play",
    title: "Start child access",
    description:
      "Fast PIN entry, big visuals, and playful question loops built to re-enter easily.",
    cta: "Open child path",
    tone: "kid",
  },
  {
    href: "/parent",
    audience: "Parent",
    icon: "Family",
    title: "Open parent setup",
    description:
      "Link children, check recent progress, and see clear next-step signals without the noise.",
    cta: "Go to parent view",
    tone: "parent",
  },
  {
    href: "/teacher",
    audience: "Teacher",
    icon: "Class",
    title: "Teacher dashboard",
    description:
      "Review classroom support lanes, spot strengths, and follow session patterns quickly.",
    cta: "View teacher route",
    tone: "teacher",
  },
  {
    href: "/owner",
    audience: "Owner",
    icon: "Ops",
    title: "Owner console",
    description:
      "Track launch health, product signal quality, and operational readiness across the prototype.",
    cta: "Open owner console",
    tone: "owner",
  },
] as const;

export default async function HomePage() {
  const launchStatus = await getLaunchStatus();
  const sourceLabel = launchStatus.source === "supabase" ? "Live" : "Plan";

  return (
    <main className="landing-page">
      <div className="landing-page-shell">
        <header className="landing-topbar">
          <Link className="landing-brand" href="/">
            WonderQuest <span>Learning</span>
          </Link>

          <div className="landing-topbar-center">
            <Link className="landing-mini-link is-active" href="/">
              Home
            </Link>
            <Link className="landing-mini-link" href="/child">
              Child
            </Link>
            <Link className="landing-mini-link" href="/parent">
              Parent
            </Link>
            <Link className="landing-mini-link" href="/teacher">
              Teacher
            </Link>
            <Link className="landing-mini-link" href="/owner">
              Owner
            </Link>
          </div>

          <div className="landing-topbar-actions">
            <DisplayModeToggle />
            <Link className="landing-topbar-cta" href="/child">
              Start child access
            </Link>
          </div>
        </header>

        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">Ages 2 to Grade 5</span>
            <h1>
              Learning that <em>feels</em> like wonder.
            </h1>
            <p>
              Adaptive learning for children, calmer visibility for parents,
              actionable insight for teachers, and product signal for owners.
            </p>

            <div className="landing-chip-row">
              <span className="landing-chip">Multi-device web prototype</span>
              <span className="landing-chip">Persistent progress</span>
              <span className="landing-chip">
                {launchStatus.source === "supabase"
                  ? "Supabase live sync"
                  : "Fallback launch data"}
              </span>
              <span className="landing-chip">Child, parent, teacher, owner</span>
            </div>

            <div className="landing-hero-actions">
              <Link className="landing-primary-btn" href="/child">
                Start child access
              </Link>
              <Link className="landing-secondary-btn" href="/parent">
                Open parent setup
              </Link>
            </div>
          </div>

          <div className="landing-proof-card">
            <span className="landing-panel-label">Prototype signal</span>
            <h2>Ready for visible progress, not just static mockups.</h2>
            <p>
              Live profile creation, linked parent views, gated adult routes,
              and seeded content are already wired into the current build.
            </p>

            <div className="landing-proof-grid">
              <article className="landing-metric-card">
                <span>Source</span>
                <strong>{sourceLabel}</strong>
                <p>
                  {launchStatus.source === "supabase"
                    ? "Live sync is active"
                    : "Fallback launch data"}
                </p>
              </article>
              <article className="landing-metric-card">
                <span>Bands</span>
                <strong>{launchStatus.launchBandCount}</strong>
                <p>Age and grade launch groups</p>
              </article>
              <article className="landing-metric-card">
                <span>Skills</span>
                <strong>{launchStatus.skillCount}</strong>
                <p>Current seeded question skills</p>
              </article>
              <article className="landing-metric-card">
                <span>Templates</span>
                <strong>{launchStatus.templateCount}</strong>
                <p>Playable item templates</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-route-grid">
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
        </section>

        <section className="landing-status-strip">
          <div className="landing-status-copy">
            <span className="landing-panel-label">Live status</span>
            <h2>
              {launchStatus.source === "supabase"
                ? "Current data is live."
                : "Current data is running on fallback plan values."}
            </h2>
            <p>
              Launch bands and themes are shown here so adults can orient
              themselves without turning the home route into a dashboard.
            </p>
          </div>

          <div className="landing-band-row">
            {launchBands.map((band) => {
              const liveBand = launchStatus.bands.find(
                (item) => item.code === band.code,
              );

              return (
                <article className="landing-band-pill" key={band.code}>
                  <strong>{band.code}</strong>
                  <span>{band.label}</span>
                  <small>{liveBand?.theme ?? band.primaryTheme}</small>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-safety-row">
          <span className="landing-safety-pill">No peer chat</span>
          <span className="landing-safety-pill">Child-safe content</span>
          <span className="landing-safety-pill">PIN-based access</span>
          <span className="landing-safety-pill">Parent-linked progress</span>
          <span className="landing-safety-pill">School-safe visibility</span>
        </section>

        {launchStatus.source === "fallback" ? (
          <p className="landing-fallback-note">
            Live launch counts are temporarily unavailable, so the home route is
            showing fallback plan data.
          </p>
        ) : null}
      </div>
    </main>
  );
}
