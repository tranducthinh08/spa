import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "./features/auth/lib/auth-session";

const STAFF_ROLES = ["SUPER_ADMIN", "BRANCH_MANAGER", "RECEPTIONIST", "THERAPIST"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let session = token ? await verifySession(token) : null;

  let response = NextResponse.next();

  // If session is legacy CUSTOMER or invalid role, purge cookie immediately
  if (session && (session.role === "CUSTOMER" || !STAFF_ROLES.includes(session.role))) {
    session = null;
    response = NextResponse.next();
    response.cookies.delete(SESSION_COOKIE_NAME);
  }

  // Protect /admin routes - Only staff allowed
  if (pathname.startsWith("/admin")) {
    if (!session || !STAFF_ROLES.includes(session.role)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const redirectRes = NextResponse.redirect(loginUrl);
      redirectRes.cookies.delete(SESSION_COOKIE_NAME);
      return redirectRes;
    }

    // Role-based route access controls (RBAC)
    if (session.role === "THERAPIST") {
      // Therapist can ONLY access /admin/appointments and /admin/customers
      if (
        pathname.startsWith("/admin/users") ||
        pathname.startsWith("/admin/inventory") ||
        pathname.startsWith("/admin/services") ||
        pathname.startsWith("/admin/dashboard")
      ) {
        return NextResponse.redirect(new URL("/admin/appointments", request.url));
      }
    }

    if (session.role === "RECEPTIONIST") {
      // Receptionist cannot access users, inventory, or executive dashboard (allowed POS view)
      if (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/inventory")) {
        return NextResponse.redirect(new URL("/admin/appointments", request.url));
      }
      if (pathname === "/admin/dashboard" && !request.nextUrl.searchParams.has("view")) {
        return NextResponse.redirect(new URL("/admin/appointments", request.url));
      }
    }

    return response;
  }

  // If on /login and already authenticated, redirect to role's default landing page
  if (pathname === "/login" && session && STAFF_ROLES.includes(session.role)) {
    const landing = (session.role === "RECEPTIONIST" || session.role === "THERAPIST")
      ? "/admin/appointments"
      : "/admin/dashboard";
    return NextResponse.redirect(new URL(landing, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
