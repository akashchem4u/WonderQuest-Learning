import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!authHeader || authHeader !== process.env.CRON_SECRET?.trim()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await db.query(
      `
        DELETE FROM public.guardian_profiles
        WHERE is_guest = true AND guest_expires_at < now()
        RETURNING id
      `,
    );

    return NextResponse.json({ ok: true, deleted: result.rowCount ?? 0 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed." },
      { status: 500 },
    );
  }
}
