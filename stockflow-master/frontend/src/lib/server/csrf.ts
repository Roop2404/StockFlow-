import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getFrontendOrigin, runtimeEnvironment, sessionCookieConfiguration, validateServerConfiguration } from "@/lib/server/runtime-config";

const environment = runtimeEnvironment();
const cookieConfiguration = sessionCookieConfiguration(environment);
export const csrfCookieName = cookieConfiguration.csrfName;

function origin(request?: NextRequest): string {
  if (request) {
    const originHeader = request.headers.get("origin");
    if (originHeader) return originHeader;
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || "http";
    if (host) return `${proto}://${host}`;
  }
  validateServerConfiguration();
  return getFrontendOrigin();
}

function signature(nonce: string, targetOrigin?: string): string {
  validateServerConfiguration();
  const secret = process.env.CSRF_SECRET!;
  return createHmac("sha256", secret)
    .update(`${targetOrigin || origin()}\n${nonce}`)
    .digest("base64url");
}

export function makeCsrfToken(request?: NextRequest): string {
  const nonce = randomBytes(32).toString("base64url");
  const targetOrigin = request ? origin(request) : origin();
  return `${nonce}.${signature(nonce, targetOrigin)}`;
}

export function isValidCsrfToken(token: string | undefined, request?: NextRequest): token is string {
  if (!token) return false;
  const [nonce, supplied, extra] = token.split(".");
  if (!nonce || !supplied || extra !== undefined) return false;
  try {
    const actual = Buffer.from(supplied, "base64url");
    if (request) {
      const expectedReq = Buffer.from(signature(nonce, origin(request)), "base64url");
      if (actual.length === expectedReq.length && timingSafeEqual(actual, expectedReq)) {
        return true;
      }
    }
    const expected = Buffer.from(signature(nonce), "base64url");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function validateCsrfRequest(request: NextRequest): NextResponse | null {
  const originHeader = request.headers.get("origin");
  const configuredOrigin = origin();
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const requestOrigin = host ? `${proto}://${host}` : null;

  const isOriginAllowed =
    originHeader === configuredOrigin ||
    (originHeader && originHeader === requestOrigin) ||
    (!originHeader && request.headers.get("sec-fetch-site") === "same-origin");

  if (!isOriginAllowed) {
    return NextResponse.json({ detail: "Request origin rejected" }, { status: 403 });
  }
  const cookieToken = request.cookies.get(csrfCookieName)?.value;
  const headerToken = request.headers.get("x-csrf-token");
  if (
    !cookieToken ||
    !headerToken ||
    cookieToken !== headerToken ||
    !isValidCsrfToken(cookieToken, request)
  ) {
    return NextResponse.json({ detail: "CSRF validation failed" }, { status: 403 });
  }
  return null;
}

export function csrfCookieOptions() {
  return {
    httpOnly: false,
    secure: cookieConfiguration.secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24,
  };
}
