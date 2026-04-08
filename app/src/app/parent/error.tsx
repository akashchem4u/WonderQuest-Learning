"use client";

import { useEffect } from "react";
import { RouteErrorView } from "@/components/route-error-view";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ParentRouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteErrorView
      audience="parent"
      currentPath="/parent"
      title="Family Hub needs a quick reload."
      message="The parent area ran into a temporary issue. Retry the page, or go back to the family home screen and try again from there."
      homeHref="/parent"
      homeLabel="Back to family home"
      icon="🏠"
      accent="#ffd166"
      onRetry={reset}
    />
  );
}
