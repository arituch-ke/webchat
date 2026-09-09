export type ConnectionState = "demo" | "ready" | "misconfigured";

type RuntimeEnvironment = Record<string, string | undefined>;

export function getConnectionState(
  environment: RuntimeEnvironment,
): ConnectionState {
  if (environment.DEMO_MODE === "true") return "demo";

  const hasDatabase = Boolean(environment.DATABASE_URL);
  const hasLineCredentials = Boolean(
    environment.LINE_CHANNEL_SECRET && environment.LINE_CHANNEL_ACCESS_TOKEN,
  );

  return hasDatabase && hasLineCredentials ? "ready" : "misconfigured";
}
