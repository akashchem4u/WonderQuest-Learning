import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireOwnerSession } from "@/lib/owner-session";

export async function GET(request: NextRequest) {
  const auth = requireOwnerSession(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "open";
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

    // Build resolved filter: open = not resolved, resolved = resolved only, all = no filter
    let resolvedClause = "";
    if (status === "open") {
      resolvedClause = "and coalesce(ft.review_status, 'pending') != 'resolved'";
    } else if (status === "resolved") {
      resolvedClause = "and ft.review_status = 'resolved'";
    }
    // "all" — no additional clause

    const result = await db.query(
      `
        select
          fi.id,
          fi.created_at,
          fi.student_id,
          fi.guardian_id,
          ft.ai_category as category,
          ft.urgency,
          ft.summary,
          coalesce(ft.review_status, 'pending') as resolved
        from public.feedback_items fi
        join public.feedback_triage ft
          on ft.feedback_id = fi.id
        left join public.guardian_profiles gp
          on gp.id = fi.guardian_id
        left join public.student_profiles sp
          on sp.id = fi.student_id
        where coalesce(gp.tester_flag, false) = false
          and coalesce(sp.tester_flag, false) = false
          ${resolvedClause}
        order by fi.created_at desc
        limit $1
      `,
      [limit],
    );

    const items = result.rows.map((row) => ({
      id: row.id as string,
      category: (row.category as string | undefined) ?? "product-insight",
      urgency: (row.urgency as string | undefined) ?? "low",
      summary: (row.summary as string | undefined) ?? "",
      createdAt: row.created_at as string,
      studentId: (row.student_id as string | undefined) ?? null,
      guardianId: (row.guardian_id as string | undefined) ?? null,
      resolved: row.resolved as string,
    }));

    return NextResponse.json({ items, total: items.length, status });
  } catch (error) {
    console.error("[api/owner/feedback] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback items" },
      { status: 500 },
    );
  }
}
