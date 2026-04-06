import { NextRequest, NextResponse } from "next/server";
import { CHILD_SESSION_COOKIE_NAME } from "@/lib/child-access";

/** GET /api/child/logout — clears the child session cookie and redirects to child login. */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/child", request.url));
  response.cookies.set({
    name: CHILD_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
