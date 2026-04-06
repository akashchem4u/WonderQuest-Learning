import { AppFrame } from "@/components/app-frame";
import Link from "next/link";

export default function OwnerPage() {
  return (
    <AppFrame audience="owner" currentPath="/owner/schools">
      <div style={{ minHeight: "100vh", background: "#100b2e", padding: "40px 32px", fontFamily: "system-ui,-apple-system,sans-serif", color: "#f0f6ff" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/owner" style={{ fontSize: 12, color: "rgba(155,114,255,0.7)", textDecoration: "none", fontWeight: 600 }}>← Owner</Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>schools</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>This section is under construction — check back soon.</p>
      </div>
    </AppFrame>
  );
}
