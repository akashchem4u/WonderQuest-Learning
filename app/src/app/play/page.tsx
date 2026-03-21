import { Suspense } from "react";
import { AppFrame } from "@/components/app-frame";
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
    <AppFrame audience="kid" currentPath="/child">
      <main className="page-shell page-shell-split">
        <section className="page-hero">
          <div>
            <span className="eyebrow">Play route</span>
            <h1>Preparing your next challenge.</h1>
            <p>Loading the first playable question set from the live prototype.</p>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
