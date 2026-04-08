import { type NextRequest, NextResponse } from "next/server";

const PARENT_SESSION_COOKIE  = "wonderquest-parent-session";
const TEACHER_SESSION_COOKIE = "wonderquest-teacher";
const OWNER_SESSION_COOKIE   = "wonderquest-owner";
const ADMIN_SESSION_COOKIE   = "wonderquest-admin-session";

// Public paths that don't require auth for each section
const PARENT_PUBLIC  = new Set(["/parent", "/parent/link", "/parent/linking-recovery", "/parent/wrong-child"]);
const TEACHER_PUBLIC = new Set(["/teacher"]);  // /teacher itself is the login page
const OWNER_PUBLIC   = new Set(["/owner", "/owner/login", "/owner/setup", "/owner/accept-invite"]);

function redirect(request: NextRequest, to: string, next?: string) {
  const url = new URL(to, request.url);
  if (next) url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Parent ──────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/parent/") && !PARENT_PUBLIC.has(pathname)) {
    if (!request.cookies.get(PARENT_SESSION_COOKIE)?.value) {
      return redirect(request, "/parent", pathname);
    }
  }

  // ── Teacher ─────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/teacher/") && !TEACHER_PUBLIC.has(pathname)) {
    if (!request.cookies.get(TEACHER_SESSION_COOKIE)?.value) {
      return redirect(request, "/teacher", pathname);
    }
  }

  // ── Owner ───────────────────────────────────────────────────────────────────
  if (pathname.startsWith("/owner/") && !OWNER_PUBLIC.has(pathname)) {
    const hasOwner = request.cookies.get(OWNER_SESSION_COOKIE)?.value;
    const hasAdmin = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!hasOwner && !hasAdmin) {
      return redirect(request, "/owner/login", pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/parent/:path+", "/teacher/:path+", "/owner/:path+"],
};
