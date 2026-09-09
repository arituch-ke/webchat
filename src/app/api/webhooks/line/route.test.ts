import { createHmac } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { POST } from "./route";

const originalEnvironment = { ...process.env };

function sign(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("base64");
}

describe("POST /api/webhooks/line", () => {
  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  it("rejects requests with an invalid LINE signature", async () => {
    process.env.LINE_CHANNEL_SECRET = "test-secret";
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token";

    const response = await POST(
      new Request("http://localhost/api/webhooks/line", {
        method: "POST",
        headers: { "x-line-signature": "invalid" },
        body: JSON.stringify({ events: [] }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Invalid signature" });
  });

  it("accepts a signed webhook verification request", async () => {
    const secret = "test-secret";
    const body = JSON.stringify({ destination: "test", events: [] });
    process.env.LINE_CHANNEL_SECRET = secret;
    process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-token";
    process.env.DATABASE_URL = "postgres://user:password@localhost:5432/webchat";

    const response = await POST(
      new Request("http://localhost/api/webhooks/line", {
        method: "POST",
        headers: { "x-line-signature": sign(body, secret) },
        body,
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      accepted: 0,
      ignored: 0,
    });
  });
});
