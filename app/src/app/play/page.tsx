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
            <span className="eyebrow">Almost ready</span>
            <h1>Getting your quest ready.</h1>
            <p>Picking the right questions for your band and skill level.</p>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
