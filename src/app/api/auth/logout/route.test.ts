import { describe, expect, it } from "vitest";

import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-auth";

import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  it("clears the session and redirects to login", async () => {
    const response = await POST(
      new Request("http://localhost/api/auth/logout", { method: "POST" }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/login");
    expect(response.headers.get("set-cookie")).toContain(
      `${ADMIN_SESSION_COOKIE}=;`,
    );
    expect(response.headers.get("set-cookie")).toContain(
      "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    );
  });
});
