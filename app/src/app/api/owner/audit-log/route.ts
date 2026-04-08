import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  try {
    const params: string[] = [];
    const conditions: string[] = [];

    if (entityType) {
      params.push(entityType);
      conditions.push(`entity_type = $${params.length}`);
    }
    if (entityId) {
      params.push(entityId);
      conditions.push(`entity_id = $${params.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `SELECT id, entity_type, entity_id, action, changed_by, previous_value, new_value, notes, created_at
       FROM public.content_audit_log
       ${where}
       ORDER BY created_at DESC
       LIMIT 50`,
      params,
    );

    return NextResponse.json({
      entries: result.rows.map((r) => ({
        id: r.id as string,
        entityType: r.entity_type as string,
        entityId: r.entity_id as string,
        action: r.action as string,
        changedBy: r.changed_by as string,
        previousValue: r.previous_value ?? null,
        newValue: r.new_value ?? null,
        notes: (r.notes as string | null) ?? null,
        createdAt: r.created_at as string,
      })),
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[audit-log GET]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireOwnerSession(request);
  if (!session.ok) return session.response;

  try {
    const body = (await request.json()) as {
      entityType?: string;
      entityId?: string;
      action?: string;
      changedBy?: string;
      previousValue?: unknown;
      newValue?: unknown;
      notes?: string;
    };

    const { entityType, entityId, action, changedBy, previousValue, newValue, notes } = body;

    if (!entityType || typeof entityType !== "string") {
      return NextResponse.json({ error: "entityType is required." }, { status: 400 });
    }
    if (!entityId || typeof entityId !== "string") {
      return NextResponse.json({ error: "entityId is required." }, { status: 400 });
    }
    if (!action || typeof action !== "string") {
      return NextResponse.json({ error: "action is required." }, { status: 400 });
    }
    if (!changedBy || typeof changedBy !== "string") {
      return NextResponse.json({ error: "changedBy is required." }, { status: 400 });
    }

    await db.query(
      `INSERT INTO public.content_audit_log
         (entity_type, entity_id, action, changed_by, previous_value, new_value, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entityType,
        entityId,
        action,
        changedBy,
        previousValue !== undefined ? JSON.stringify(previousValue) : null,
        newValue !== undefined ? JSON.stringify(newValue) : null,
        notes ?? null,
      ],
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
    }
    console.error("[audit-log POST]", err);
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
