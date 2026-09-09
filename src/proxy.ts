import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth/admin-auth";

export async function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!username || !password) {
    if (isLoginPage) return NextResponse.next();
    return Response.json(
      { error: "Admin access is not configured" },
      { status: 503 },
    );
  }

  const authenticated = await verifySessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    { username, password },
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

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/api/conversations/:path*"],
};
