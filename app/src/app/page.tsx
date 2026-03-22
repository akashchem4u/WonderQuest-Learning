import { DisplayModeToggle } from "@/components/display-mode-toggle";
import { launchBands } from "@/lib/launch-plan";
import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";

export const dynamic = "force-dynamic";

const routeCards = [
  {
    href: "/child",
    audience: "Child",
    icon: "⭐",
    title: "Start child access",
    description:
      "Fast PIN entry, big visuals, and playful question loops built to re-enter easily.",
    cta: "Open child path",
    tone: "kid",
    featured: true,
  },
  {
    href: "/parent",
    audience: "Parent",
    icon: "🏡",
    title: "Open parent setup",
    description:
      "Link children, check recent progress, and see clear next-step signals without the noise.",
    cta: "Go to parent view",
    tone: "parent",
    featured: false,
  },
  {
    href: "/teacher",
    audience: "Teacher",
    icon: "📘",
    title: "Teacher dashboard",
    description:
      "Review classroom support lanes, spot strengths, and follow session patterns quickly.",
    cta: "View teacher route",
    tone: "teacher",
    featured: false,
  },
  {
    href: "/owner",
    audience: "Owner",
    icon: "🛠️",
    title: "Owner console",
    description:
      "Track launch health, product signal quality, and operational readiness across the prototype.",
    cta: "Open owner console",
    tone: "owner",
    featured: false,
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
            <span className="landing-eyebrow">Web-first prototype</span>
            <h1>
              Adaptive learning that <em>feels</em> like a favorite game.
            </h1>
            <p>
              Multi-device WonderQuest prototype with separate child, parent,
              teacher, and owner paths built on live Supabase flows.
            </p>

            <div className="landing-chip-row">
              <span className="landing-chip">Child-first launcher</span>
              <span className="landing-chip">Mobile-first UI</span>
              <span className="landing-chip">
                {launchStatus.source === "supabase"
                  ? "Supabase live flows"
                  : "Fallback launch data"}
              </span>
              <span className="landing-chip">Saved progress</span>
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
            <span className="landing-panel-label">Launch command</span>
            <h2>One platform, tuned for child play and adult clarity.</h2>
            <p>
              The current build is already wired for live profile creation, play
              sessions, linked parent views, and gated teacher and owner routes.
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

        <section className="landing-launcher-stack">
          {routeCards
            .filter((card) => card.featured)
            .map((card) => (
              <article
                className={`landing-featured-card tone-${card.tone}`}
                key={card.href}
              >
                <div className="landing-featured-copy">
                  <span className="landing-featured-label">{card.audience} first</span>
                  <h2>{card.title}</h2>
                  <p>{card.description}</p>
                  <div className="landing-chip-row">
                    <span className="landing-chip">Quick PIN entry</span>
                    <span className="landing-chip">Big tap targets</span>
                    <span className="landing-chip">Rewards stay saved</span>
                  </div>
                </div>
                <div className="landing-featured-action">
                  <div className="landing-route-icon landing-route-icon-featured" aria-hidden="true">
                    {card.icon}
                  </div>
                  <Link className="landing-route-link landing-route-link-featured" href={card.href}>
                    {card.cta}
                  </Link>
                </div>
              </article>
            ))}

          <div className="landing-route-grid">
            {routeCards
              .filter((card) => !card.featured)
              .map((card) => (
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
            <span className="landing-panel-label">Live status</span>
            <h2>
              {launchStatus.source === "supabase"
                ? "Ready across phone, tablet, and laptop screens."
                : "Currently showing fallback plan values."}
            </h2>
            <p>
              Launch bands and themes are shown here so adults can orient
              quickly without turning home into a dashboard.
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
