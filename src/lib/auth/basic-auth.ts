import { timingSafeEqual } from "node:crypto";

type Credentials = {
  username: string;
  password: string;
};

function safeEquals(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function isAuthorized(
  authorizationHeader: string | null,
  expected: Credentials,
) {
  if (!authorizationHeader?.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(
      authorizationHeader.slice("Basic ".length),
      "base64",
    ).toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;

    return (
      safeEquals(decoded.slice(0, separator), expected.username) &&
      safeEquals(decoded.slice(separator + 1), expected.password)
    );
  } catch {
    return false;
  }
}
