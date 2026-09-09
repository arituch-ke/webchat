import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  credentialsMatch,
  verifySessionToken,
} from "./admin-auth";

const credentials = { username: "admin", password: "correct-horse" };

describe("admin authentication", () => {
  it("compares both username and password", async () => {
    await expect(credentialsMatch(credentials, credentials)).resolves.toBe(
      true,
    );
    await expect(
      credentialsMatch({ username: "admin", password: "wrong" }, credentials),
    ).resolves.toBe(false);
  });

  it("creates a signed session that expires", async () => {
    const token = await createSessionToken(credentials, 1_000);

    await expect(verifySessionToken(token, credentials, 2_000)).resolves.toBe(
      true,
    );
    await expect(
      verifySessionToken(token, credentials, 1_000 + 8 * 60 * 60 * 1000),
    ).resolves.toBe(false);
  });

  it("rejects tampered sessions", async () => {
    const token = await createSessionToken(credentials);
    await expect(verifySessionToken(`${token}x`, credentials)).resolves.toBe(
      false,
    );
  });
});
