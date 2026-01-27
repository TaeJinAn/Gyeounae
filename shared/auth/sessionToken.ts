import type { UserRole } from "@domain/entities/User";
import type { IdentityStatus } from "@domain/value-objects/IdentityStatus";

export type SessionPayload = {
  userId: string;
  role: UserRole;
  identityStatus: IdentityStatus;
  hasAcceptedTerms: boolean;
  hasAcceptedPrivacy: boolean;
};

const secret = (() => {
  const value = process.env.SESSION_SECRET;
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  return value ?? "dev-session-secret";
})();

const cookieName = "gyeowoo_session";
const encoder = new TextEncoder();

const base64UrlEncode = (input: Uint8Array) => {
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(input).toString("base64")
      : btoa(String.fromCharCode(...input));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64UrlDecode = (input: string) => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(padded, "base64"));
  }
  const binary = atob(padded);
  return new Uint8Array([...binary].map((char) => char.charCodeAt(0)));
};

const signHmac = async (value: Uint8Array) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, value);
  return new Uint8Array(signature);
};

const verifyHmac = async (value: Uint8Array, signature: Uint8Array) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  return crypto.subtle.verify("HMAC", key, signature, value);
};

export const createSessionToken = async (payload: SessionPayload) => {
  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const signature = await signHmac(payloadBytes);
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(signature)}`;
};

export const verifySessionToken = async (token: string) => {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return null;
  }
  const payloadBytes = base64UrlDecode(payloadPart);
  const signatureBytes = base64UrlDecode(signaturePart);
  const valid = await verifyHmac(payloadBytes, signatureBytes);
  if (!valid) {
    return null;
  }
  try {
    return JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
  } catch {
    return null;
  }
};

export const sessionCookieName = cookieName;
