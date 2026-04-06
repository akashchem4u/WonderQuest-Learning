import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const school = searchParams.get("school");

  if (!school) {
    return NextResponse.json({ error: "Missing school parameter" }, { status: 400 });
  }

  try {
    const result = await db.query(
      `
        SELECT id, display_name, email
        FROM public.teacher_profiles
        WHERE school_name = $1
          AND tester_flag = false
        ORDER BY display_name ASC
      `,
      [school],
    );

    const teachers = result.rows.map((row) => ({
      id: row.id as string,
      displayName: row.display_name as string,
      email: row.email as string,
    }));

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error("[api/owner/schools/teachers] error:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}
