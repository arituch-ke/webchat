import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_DURATION_SECONDS,
  createSessionToken,
  credentialsMatch,
} from "@/lib/auth/admin-auth";

const loginSchema = z.object({
  username: z.string().min(1).max(200),
  password: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
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

  const expected = { username, password };
  if (!(await credentialsMatch(parsed.data, expected))) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    await createSessionToken(expected),
    {
      httpOnly: true,
      maxAge: ADMIN_SESSION_DURATION_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );
  return response;
}
