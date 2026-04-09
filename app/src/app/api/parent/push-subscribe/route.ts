import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  ParentAccessSessionError,
  requireParentAccessSession,
} from "@/lib/parent-access";

export async function POST(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json() as {
      endpoint?: string;
      p256dh?: string;
      auth?: string;
    };

    const { endpoint, p256dh, auth } = body;
    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    await db.query(
      `INSERT INTO public.push_subscriptions (guardian_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (guardian_id, endpoint) DO UPDATE
         SET p256dh = EXCLUDED.p256dh,
             auth   = EXCLUDED.auth`,
      [guardianId, endpoint, p256dh, auth],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save subscription." },
      { status },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { guardianId } = await requireParentAccessSession(request);
    const body = await request.json() as { endpoint?: string };

    const { endpoint } = body;
    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint." }, { status: 400 });
    }

    await db.query(
      `DELETE FROM public.push_subscriptions WHERE guardian_id = $1 AND endpoint = $2`,
      [guardianId, endpoint],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof ParentAccessSessionError ? 401 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove subscription." },
      { status },
    );
  }
}
