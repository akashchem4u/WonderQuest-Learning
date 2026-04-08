"use client";

import { useEffect } from "react";
import { RouteErrorView } from "@/components/route-error-view";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ChildRouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteErrorView
      audience="kid"
      currentPath="/child"
      title="Your adventure paused."
      message="The child hub hit a snag. You can try loading it again, or head back to the child home screen and continue from there."
      homeHref="/child"
      homeLabel="Back to child home"
      icon="🧭"
      accent="#58e8c1"
      onRetry={reset}
    />
  );
}
