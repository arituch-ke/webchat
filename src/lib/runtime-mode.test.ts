import { describe, expect, it } from "vitest";

import { getConnectionState } from "./runtime-mode";

describe("getConnectionState", () => {
  it("uses demo data only when explicitly enabled", () => {
    expect(getConnectionState({ DEMO_MODE: "true" })).toBe("demo");
  });

  it("is ready only when the database and both LINE credentials exist", () => {
    expect(
      getConnectionState({
        DATABASE_URL: "postgres://database",
        LINE_CHANNEL_SECRET: "secret",
        LINE_CHANNEL_ACCESS_TOKEN: "token",
      }),
    ).toBe("ready");
    expect(getConnectionState({ DATABASE_URL: "postgres://database" })).toBe(
      "misconfigured",
    );
  });
});
