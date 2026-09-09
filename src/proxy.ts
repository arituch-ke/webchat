import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  getAdminAuthConfig,
  verifySessionToken,
} from "@/lib/auth/admin-auth";

export async function proxy(request: NextRequest) {
  const authConfig = getAdminAuthConfig();
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!authConfig) {
    if (isLoginPage) return NextResponse.next();
    return Response.json(
      { error: "Admin access is not configured" },
      { status: 503 },
    );
  }

  const authenticated = await verifySessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    authConfig,
  );

  if (isLoginPage) {
    return authenticated
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (!authenticated) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/api/conversations/:path*"],
};
