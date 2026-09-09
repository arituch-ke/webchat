import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_DURATION_SECONDS,
  createSessionToken,
  credentialsMatch,
  getAdminAuthConfig,
  getAdminSessionCookieOptions,
} from "@/lib/auth/admin-auth";

const loginSchema = z.object({
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  const authConfig = getAdminAuthConfig();
  if (!authConfig) {
    return Response.json(
      { error: "Admin access is not configured" },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!(await credentialsMatch(parsed.data, authConfig))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createSessionToken(authConfig),
    {
      ...getAdminSessionCookieOptions(),
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
    },
  );
  return response;
}
