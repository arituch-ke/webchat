import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
} from "@/lib/auth/admin-auth";

import { proxy } from "./proxy";

const credentials = { username: "admin", password: "correct-horse" };

describe("admin proxy", () => {
  beforeEach(() => {
    process.env.ADMIN_USERNAME = credentials.username;
    process.env.ADMIN_PASSWORD = credentials.password;
  });

  afterEach(() => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
  });

  it("redirects unauthenticated page requests to login", async () => {
    const response = await proxy(new NextRequest("http://localhost/"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?next=%2F",
    );
  });

  it("returns JSON 401 for unauthenticated conversation API requests", async () => {
    const response = await proxy(
      new NextRequest("http://localhost/api/conversations"),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Authentication required",
    });
  });

  it("allows a valid signed session", async () => {
    const token = await createSessionToken(credentials);
    const request = new NextRequest("http://localhost/", {
      headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
    });

    const response = await proxy(request);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows unauthenticated users to open login", async () => {
    const response = await proxy(new NextRequest("http://localhost/login"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects authenticated users away from login", async () => {
    const token = await createSessionToken(credentials);
    const request = new NextRequest("http://localhost/login", {
      headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}` },
    });

    const response = await proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/");
  });

  it("does not bypass the protected page when admin access is unconfigured", async () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;

    const response = await proxy(new NextRequest("http://localhost/"));
    expect(response.status).toBe(503);
  });
});
