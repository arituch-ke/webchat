import { describe, expect, it } from "vitest";

import { PATCH } from "./route";

describe("PATCH /api/conversations/:lineUserId", () => {
  it("rejects an invalid LINE user ID before accessing the database", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/conversations/not-a-user", {
        method: "PATCH",
      }),
      { params: Promise.resolve({ lineUserId: "not-a-user" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request",
    });
  });
});
