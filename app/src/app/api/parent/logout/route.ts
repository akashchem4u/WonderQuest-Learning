import { NextRequest, NextResponse } from "next/server";
import { PARENT_SESSION_COOKIE_NAME } from "@/lib/parent-access";

/** GET /api/parent/logout — clears the parent session cookie and redirects to login. */
export async function GET(request: NextRequest) {
  const loginUrl = new URL("/parent", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set({
    name: PARENT_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
