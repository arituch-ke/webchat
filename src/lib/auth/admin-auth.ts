export const ADMIN_SESSION_COOKIE = "webchat_session";
export const ADMIN_SESSION_DURATION_SECONDS = 8 * 60 * 60;

type AdminCredentials = {
  username: string;
  password: string;
};

type SessionPayload = {
  subject: string;
  expiresAt: number;
};

function encode(value: string | Uint8Array) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decode(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  return new TextDecoder().decode(
    Uint8Array.from(atob(base64), (character) => character.charCodeAt(0)),
  );
}

async function sign(value: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value),
  );
  return encode(new Uint8Array(signature));
}

async function safeEquals(actual: string, expected: string) {
  const encoder = new TextEncoder();
  const [actualHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(actual)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const actualBytes = new Uint8Array(actualHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < actualBytes.length; index += 1) {
    difference |= actualBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

export async function credentialsMatch(
  supplied: AdminCredentials,
  expected: AdminCredentials,
) {
  const [usernameMatches, passwordMatches] = await Promise.all([
    safeEquals(supplied.username, expected.username),
    safeEquals(supplied.password, expected.password),
  ]);
  return usernameMatches && passwordMatches;
}

export async function createSessionToken(
  credentials: AdminCredentials,
  now = Date.now(),
) {
  const payload: SessionPayload = {
    subject: credentials.username,
    expiresAt: now + ADMIN_SESSION_DURATION_SECONDS * 1000,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${await sign(encodedPayload, credentials.password)}`;
}

export async function verifySessionToken(
  token: string | undefined,
  credentials: AdminCredentials,
  now = Date.now(),
) {
  if (!token) return false;
  const [encodedPayload, suppliedSignature, extra] = token.split(".");
  if (!encodedPayload || !suppliedSignature || extra) return false;

  try {
    const expectedSignature = await sign(encodedPayload, credentials.password);
    if (!(await safeEquals(suppliedSignature, expectedSignature))) return false;

    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    return (
      payload.subject === credentials.username &&
      Number.isFinite(payload.expiresAt) &&
      payload.expiresAt > now
    );
  } catch {
    return false;
  }
}
