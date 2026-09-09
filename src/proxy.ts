import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isAuthorized } from "@/lib/auth/basic-auth";

export function proxy(request: NextRequest) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username && !password && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (!username || !password) {
    return Response.json(
      { error: "Admin access is not configured" },
      { status: 503 },
    );
  }

  if (
    !isAuthorized(request.headers.get("authorization"), { username, password })
  ) {
    return new Response("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Webchat Inbox"' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/conversations/:path*"],
};
