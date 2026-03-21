import { Suspense } from "react";
import PlayClient from "./play-client";

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayLoading />}>
      <PlayClient />
    </Suspense>
  );
}

function PlayLoading() {
  return (
    <main className="page-shell page-shell-split">
      <section className="page-hero">
        <div>
          <span className="eyebrow">WonderQuest Learning</span>
          <h1>Preparing your next challenge.</h1>
          <p>Loading the first playable question set from the live prototype.</p>
        </div>
      </section>
    </main>
  );
}
