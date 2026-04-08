// GET /api/owner/route-health
// Checks health of critical route groups by querying recent DB activity patterns.
// Returns: { routes, activity, checkedAt }

import { NextRequest, NextResponse } from "next/server";
import { db, isDatabaseConnectionError } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export const dynamic = "force-dynamic";

type RouteStatus = "healthy" | "degraded" | "down";

interface RouteHealth {
  path: string;
  label: string;
  status: RouteStatus;
  lastCheck: string;
  notes: string;
}

// Wrap a promise with a 2-second timeout
function withTimeout<T>(p: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), 2000)),
  ]);
}

async function countRows(sql: string): Promise<number | null> {
  try {
    const result = await db.query(sql);
    const raw = result.rows[0]?.cnt ?? result.rows[0]?.count ?? null;
    if (raw === null || raw === undefined) return null;
    return Number(raw);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (!auth.ok) return auth.response;

  const checkedAt = new Date().toISOString();
  const routes: RouteHealth[] = [];

  // ── 1. Child play loop ─────────────────────────────────────────────────────
  const sessionResults24h = await withTimeout(
    countRows(`SELECT COUNT(*) as cnt FROM public.session_results WHERE created_at >= NOW() - INTERVAL '24 hours'`),
    null,
  );
  const sessionResults1h = await withTimeout(
    countRows(`SELECT COUNT(*) as cnt FROM public.session_results WHERE created_at >= NOW() - INTERVAL '1 hour'`),
    null,
  );
  {
    let status: RouteStatus = "down";
    let notes = "No session results in last 24h";
    if (sessionResults24h === null) {
      status = "down";
      notes = "DB query timed out or failed";
    } else if (sessionResults24h > 0) {
      status = "healthy";
      notes = `${sessionResults24h} results in 24h · ${sessionResults1h ?? 0} in last 1h`;
    } else {
      status = "degraded";
      notes = "No activity in last 24h — may be off-hours";
    }
    routes.push({ path: "/api/play/*", label: "Child play loop", status, lastCheck: checkedAt, notes });
  }

  // ── 2. Question bank ────────────────────────────────────────────────────────
  const [skillsCount, bandsCount] = await Promise.all([
    withTimeout(countRows(`SELECT COUNT(*) as cnt FROM public.skills WHERE active = true`), null),
    withTimeout(countRows(`SELECT COUNT(*) as cnt FROM public.launch_bands`), null),
  ]);
  {
    let status: RouteStatus = "down";
    let notes = "Skills or bands missing";
    if (skillsCount === null || bandsCount === null) {
      status = "down";
      notes = "DB query timed out or failed";
    } else if (skillsCount > 0 && bandsCount > 0) {
      status = "healthy";
      notes = `${skillsCount} active skills · ${bandsCount} launch bands`;
    } else {
      status = "degraded";
      notes = `skills=${skillsCount} bands=${bandsCount} — content may be missing`;
    }
    routes.push({ path: "/api/child/assignments", label: "Question bank", status, lastCheck: checkedAt, notes });
  }

  // ── 3. Parent portal ────────────────────────────────────────────────────────
  const guardiansCount = await withTimeout(
    countRows(`SELECT COUNT(*) as cnt FROM public.guardian_profiles`),
    null,
  );
  {
    let status: RouteStatus = "healthy";
    let notes = "";
    if (guardiansCount === null) {
      status = "down";
      notes = "DB query timed out or failed";
    } else if (guardiansCount > 0) {
      status = "healthy";
      notes = `${guardiansCount} guardian profiles registered`;
    } else {
      status = "degraded";
      notes = "No guardian profiles — parent portal may be empty";
    }
    routes.push({ path: "/api/parent/*", label: "Parent portal", status, lastCheck: checkedAt, notes });
  }

  // ── 4. Teacher portal ───────────────────────────────────────────────────────
  const teachersCount = await withTimeout(
    countRows(`SELECT COUNT(*) as cnt FROM public.teacher_profiles`),
    null,
  );
  {
    let status: RouteStatus = "healthy";
    let notes = "";
    if (teachersCount === null) {
      status = "down";
      notes = "DB query timed out or failed";
    } else if (teachersCount > 0) {
      status = "healthy";
      notes = `${teachersCount} teacher profiles registered`;
    } else {
      status = "degraded";
      notes = "No teacher profiles — teacher portal may be empty";
    }
    routes.push({ path: "/api/teacher/*", label: "Teacher portal", status, lastCheck: checkedAt, notes });
  }

  // ── 5. Database connectivity ─────────────────────────────────────────────────
  const dbStart = Date.now();
  const dbOk = await withTimeout(
    db.query("SELECT 1").then(() => true).catch(() => false),
    false,
  );
  const dbMs = Date.now() - dbStart;
  {
    const status: RouteStatus = dbOk ? (dbMs < 1500 ? "healthy" : "degraded") : "down";
    const notes = dbOk
      ? `Connected · responded in ${dbMs}ms`
      : "Connection failed or timed out after 2s";
    routes.push({ path: "/api/health", label: "Database", status, lastCheck: checkedAt, notes });
  }

  // ── Activity pulse ───────────────────────────────────────────────────────────
  const sessions1h = await withTimeout(
    countRows(`SELECT COUNT(*) as cnt FROM public.session_results WHERE created_at >= NOW() - INTERVAL '1 hour'`),
    null,
  );
  const sessions24h = sessionResults24h; // reuse from above

  return NextResponse.json({
    routes,
    activity: {
      sessionsLast1h: sessions1h ?? 0,
      sessionsLast24h: sessions24h ?? 0,
    },
    checkedAt,
  });
}
