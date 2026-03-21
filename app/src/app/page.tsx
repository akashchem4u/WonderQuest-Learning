import { AppFrame } from "@/components/app-frame";
import { SectionCard } from "@/components/section-card";
import { StatTile } from "@/components/ui";
import { buildTracks, launchBands } from "@/lib/launch-plan";
import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const launchStatus = await getLaunchStatus();

  return (
    <AppFrame audience="home" currentPath="/">
      <main className="page-shell">
        <section className="hero hero-home">
          <div className="hero-copy hero-home-copy">
            <span className="eyebrow">WonderQuest Learning</span>
            <h1>Adaptive learning that feels like play, not worksheets.</h1>
            <p>
              WonderQuest blends lightweight child access, fast explainers,
              game-style progression, and separate parent, teacher, and owner
              views into one web-first prototype.
            </p>
            <div className="summary-chip-row">
              <span className="summary-chip">Multi-device web prototype</span>
              <span className="summary-chip">Supabase live data</span>
              <span className="summary-chip">Child, parent, teacher, owner</span>
            </div>
            <div className="hero-actions">
              <Link className="primary-link" href="/child">
                Start child access
              </Link>
              <Link className="secondary-link" href="/parent">
                Open parent setup
              </Link>
            </div>
            <div className="hero-focus-grid">
              <article className="hero-focus-card">
                <strong>Play first</strong>
                <p>Large prompts, quick retries, and visible rewards for children.</p>
              </article>
              <article className="hero-focus-card">
                <strong>Adult clarity</strong>
                <p>Parent, teacher, and owner views translate the same system differently.</p>
              </article>
              <article className="hero-focus-card">
                <strong>Live prototype</strong>
                <p>Real persistence, linked flows, and feedback capture already wired.</p>
              </article>
            </div>
            {launchStatus.source === "fallback" ? (
              <p className="status-banner status-error">
                Live launch counts are currently unavailable, so this page is
                showing fallback plan data.
              </p>
            ) : null}
          </div>
          <div className="hero-panel launch-command">
            <span className="panel-label">Prototype readiness</span>
            <h2>Launch command</h2>
            <p>
              The current build is already wired for live profile creation, play
              sessions, linked parent views, and gated teacher and owner routes.
            </p>
            <div className="hero-metric-grid">
              <StatTile
                detail={
                  launchStatus.source === "supabase"
                    ? "Live sync is active"
                    : "Fallback launch plan"
                }
                label="Source"
                value={launchStatus.source === "supabase" ? "Live" : "Plan"}
              />
              <StatTile
                detail="Age and grade launch groups"
                label="Bands"
                value={`${launchStatus.launchBandCount}`}
              />
              <StatTile
                detail="Current seeded question skills"
                label="Skills"
                value={`${launchStatus.skillCount}`}
              />
              <StatTile
                detail="Playable item templates"
                label="Templates"
                value={`${launchStatus.templateCount}`}
              />
            </div>
          </div>
        </section>

        <section className="band-grid">
          {launchBands.map((band) => {
            const liveBand = launchStatus.bands.find(
              (item) => item.code === band.code,
            );

            return (
              <article className="band-card" key={band.code}>
                <span className="band-code">{band.code}</span>
                <h2>{band.label}</h2>
                <p>{band.audience}</p>
                <strong>{liveBand?.theme ?? band.primaryTheme}</strong>
                <ul>
                  {band.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>

        <section className="tracks">
          {buildTracks.map((track) => (
            <SectionCard
              className="track-card"
              key={track.name}
              title={track.name}
              items={track.items}
            />
          ))}
        </section>

        <section className="entry-links">
          <Link className="primary-link" href="/child">
            Child access
          </Link>
          <Link className="secondary-link" href="/parent">
            Parent setup
          </Link>
          <Link className="secondary-link" href="/teacher">
            Teacher view
          </Link>
          <Link className="secondary-link" href="/owner">
            Owner view
          </Link>
        </section>
      </main>
    </AppFrame>
  );
}
