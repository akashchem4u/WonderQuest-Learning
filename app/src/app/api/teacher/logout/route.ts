import { NextRequest, NextResponse } from "next/server";

/** GET /api/teacher/logout — clears the teacher identity cookie and redirects to teacher login. */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/teacher", request.url));
  response.cookies.set({
    name: "wonderquest-teacher-id",
    value: "",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
