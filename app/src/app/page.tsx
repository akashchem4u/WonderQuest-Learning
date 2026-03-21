import { SectionCard } from "@/components/section-card";
import { buildTracks, launchBands } from "@/lib/launch-plan";
import Link from "next/link";

export default function HomePage() {
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
          <h2>Launch rules</h2>
          <ul>
            <li>One primary theme family per launch band</li>
            <li>Username + 4-digit PIN + avatar access model</li>
            <li>No tester progress resets</li>
            <li>Voice and video explainers before text-heavy correction</li>
          </ul>
        </div>
      </section>

      <section className="band-grid">
        {launchBands.map((band) => (
          <article className="band-card" key={band.code}>
            <span className="band-code">{band.code}</span>
            <h2>{band.label}</h2>
            <p>{band.audience}</p>
            <strong>{band.primaryTheme}</strong>
            <ul>
              {band.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
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
      </section>
    </main>
  );
}
