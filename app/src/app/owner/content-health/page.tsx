"use client";

import { AppFrame } from "@/components/app-frame";
import ContentHealthClient from "./content-health-client";

export default function ContentHealthPage() {
  return (
    <AppFrame audience="owner" currentPath="/owner/content-health">
      <ContentHealthClient />
    </AppFrame>
  );
}
