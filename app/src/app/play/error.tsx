"use client";

import { useEffect } from "react";
import { RouteErrorView } from "@/components/route-error-view";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PlayRouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteErrorView
      audience="kid"
      currentPath="/play"
      title="The quest lost its way."
      message="Something interrupted play. Try again to reload the session, or return to the play home to start a fresh quest."
      homeHref="/play"
      homeLabel="Back to play home"
      icon="🚀"
      accent="#9b72ff"
      onRetry={reset}
    />
  );
}
