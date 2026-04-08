import { redirect } from "next/navigation";
import { hasOwnerAccess, isOwnerAccessConfigured } from "@/lib/owner-access";
import { AppFrame } from "@/components/app-frame";
import OwnerGate from "../owner-gate";
import { OwnerReleaseView } from "./_view";

export const dynamic = "force-dynamic";

export default async function OwnerReleasePage() {
  const configured = isOwnerAccessConfigured();
  const allowed = configured && (await hasOwnerAccess());

  if (!allowed) {
    if (!configured) {
      redirect("/owner/login");
    }
    return (
      <AppFrame audience="owner" currentPath="/owner">
        <OwnerGate configured={configured} />
      </AppFrame>
    );
  }

  return <OwnerReleaseView />;
}
