import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/owner/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  );
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  return response;
}
