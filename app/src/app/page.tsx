import { SectionCard } from "@/components/section-card";
import { buildTracks, launchBands } from "@/lib/launch-plan";
import { getLaunchStatus } from "@/lib/server-launch-status";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const launchStatus = await getLaunchStatus();

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">WonderQuest Learning</span>
          <h1>Local prototype foundation for the next build window.</h1>
          <p>
            This scaffold anchors the new product around lightweight identity,
            adaptive learning, age-specific explainers, and persistent progress.
          </p>
        </div>
        <div className="hero-panel">
          <h2>Launch status</h2>
          <ul>
            <li>Source: {launchStatus.source === "supabase" ? "Supabase live" : "Fallback plan"}</li>
            <li>Launch bands: {launchStatus.launchBandCount}</li>
            <li>Skills: {launchStatus.skillCount}</li>
            <li>Templates: {launchStatus.templateCount}</li>
          </ul>
        </div>
      </section>

      <section className="band-grid">
        {launchBands.map((band) => {
          const liveBand = launchStatus.bands.find((item) => item.code === band.code);

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
        <Link className="secondary-link" href="/owner">
          Owner view
        </Link>
      </section>
    </main>
  );
}
