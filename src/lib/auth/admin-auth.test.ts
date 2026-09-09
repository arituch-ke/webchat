import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  credentialsMatch,
  getAdminAuthConfig,
  verifySessionToken,
} from "./admin-auth";

const authConfig = {
  username: "admin",
  password: "correct-horse",
  sessionSecret: "0123456789abcdef0123456789abcdef",
};

describe("admin authentication", () => {
  it("compares both username and password", async () => {
    await expect(credentialsMatch(authConfig, authConfig)).resolves.toBe(true);
    await expect(
      credentialsMatch({ username: "admin", password: "wrong" }, authConfig),
    ).resolves.toBe(false);
  });

  it("creates a signed session that expires", async () => {
    const token = await createSessionToken(authConfig, 1_000);

    await expect(verifySessionToken(token, authConfig, 2_000)).resolves.toBe(
      true,
    );
    await expect(
      verifySessionToken(token, authConfig, 1_000 + 8 * 60 * 60 * 1000),
    ).resolves.toBe(false);
  });

  it("rejects tampered sessions", async () => {
    const token = await createSessionToken(authConfig);
    await expect(verifySessionToken(`${token}x`, authConfig)).resolves.toBe(
      false,
    );
  });

  it("requires a separate session secret", () => {
    expect(
      getAdminAuthConfig({
        ADMIN_USERNAME: "admin",
        ADMIN_PASSWORD: "correct-horse",
      }),
    ).toBeNull();
    expect(
      getAdminAuthConfig({
        ADMIN_USERNAME: "admin",
        ADMIN_PASSWORD: "correct-horse",
        ADMIN_SESSION_SECRET: "too-short",
      }),
    ).toBeNull();
  });

  it("rejects a session signed with another secret", async () => {
    const token = await createSessionToken(authConfig);
    await expect(
      verifySessionToken(token, { ...authConfig, sessionSecret: "wrong" }),
    ).resolves.toBe(false);
  });
});
