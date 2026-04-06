import { type NextRequest, NextResponse } from "next/server";

// Routes under /parent/** (excluding the login page itself and API routes)
const PARENT_PROTECTED_PREFIX = "/parent/";
const PARENT_LOGIN_PATH = "/parent";
const PARENT_SESSION_COOKIE = "wonderquest-parent-session";

// Public parent sub-routes that don't require auth
const PARENT_PUBLIC_PATHS = new Set([
  "/parent",
  "/parent/link",
  "/parent/linking-recovery",
  "/parent/wrong-child",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate /parent/* routes (not API routes — those handle their own auth)
  if (!pathname.startsWith(PARENT_PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  // Don't gate public paths
  if (PARENT_PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Don't gate API routes
  if (pathname.startsWith("/parent/api/")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(PARENT_SESSION_COOKIE);

  // If no session cookie, redirect to /parent login
  if (!sessionCookie?.value) {
    const loginUrl = new URL(PARENT_LOGIN_PATH, request.url);
    // Preserve the intended destination so user can be sent back after login
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/parent/:path+"],
};
