import { describe, expect, it } from "vitest";

import { GET } from "./route";

describe("GET /api/conversations/:lineUserId/messages", () => {
  it("rejects an invalid LINE user ID before accessing the database", async () => {
    const response = await GET(
      new Request("http://localhost/api/conversations/not-a-user/messages"),
      { params: Promise.resolve({ lineUserId: "not-a-user" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid request" });
  });

  it("rejects an invalid pagination limit", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/conversations/U0123456789abcdef0123456789abcdef/messages?limit=101",
      ),
      {
        params: Promise.resolve({
          lineUserId: "U0123456789abcdef0123456789abcdef",
        }),
      },
    );

    expect(response.status).toBe(400);
  });
});
