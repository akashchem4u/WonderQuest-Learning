import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (!auth.ok) return auth.response;

  const result = await db.query(
    `SELECT id, name, email, role, rating, message, source, created_at
     FROM public.feedback
     ORDER BY created_at DESC
     LIMIT 200`
  );

  return NextResponse.json({ feedback: result.rows });
}
