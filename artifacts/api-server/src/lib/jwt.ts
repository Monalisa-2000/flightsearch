import crypto from "crypto";

const JWT_SECRET = process.env["JWT_SECRET"] || "flight-platform-secret-key-2026";

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString();
}

function sign(data: string): string {
  return crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
}

export function createToken(payload: Record<string, unknown>): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 30 }));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [header, body, signature] = token.split(".");
    const expectedSig = sign(`${header}.${body}`);
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(base64UrlDecode(body)) as Record<string, unknown>;
    const exp = payload["exp"] as number | undefined;
    if (exp && exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", JWT_SECRET).update(password).digest("hex");
}
