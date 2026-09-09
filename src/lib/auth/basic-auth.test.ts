import { describe, expect, it } from "vitest";

import { isAuthorized } from "./basic-auth";

const expected = { username: "admin", password: "correct-horse" };

function basic(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

describe("isAuthorized", () => {
  it("accepts matching credentials", () => {
    expect(isAuthorized(basic("admin", "correct-horse"), expected)).toBe(true);
  });

  it("rejects missing and incorrect credentials", () => {
    expect(isAuthorized(null, expected)).toBe(false);
    expect(isAuthorized(basic("admin", "wrong"), expected)).toBe(false);
  });
});
