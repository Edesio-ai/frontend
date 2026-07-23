import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";
import { locales, defaultLocale, LOCALE_COOKIE, type Locale } from "./lib/i18n/config";

const PREPROD_AUTH_COOKIE = "preprod_auth";

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Preprod"',
    },
  });
}

/** Constant-time string compare (Edge-compatible). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function sessionToken(user: string, password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`preprod:${user}:${password}`),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function attachSessionCookie(
  response: NextResponse,
  token: string,
  request: NextRequest,
): void {
  // Session cookie (no maxAge): cleared when the browser is closed.
  response.cookies.set(PREPROD_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
  });
}

type AuthResult =
  | { ok: true; setCookieToken?: string }
  | { ok: false; response: NextResponse };

async function enforcePreprodAuth(request: NextRequest): Promise<AuthResult> {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !password) {
    return { ok: true };
  }

  const expected = await sessionToken(user, password);
  const existing = request.cookies.get(PREPROD_AUTH_COOKIE)?.value;
  if (existing && safeEqual(existing, expected)) {
    return { ok: true };
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return { ok: false, response: unauthorized() };
  }

  let decoded: string;
  try {
    decoded = atob(authorization.slice("Basic ".length));
  } catch {
    return { ok: false, response: unauthorized() };
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return { ok: false, response: unauthorized() };
  }

  const providedUser = decoded.slice(0, separatorIndex);
  const providedPassword = decoded.slice(separatorIndex + 1);

  if (!safeEqual(providedUser, user) || !safeEqual(providedPassword, password)) {
    return { ok: false, response: unauthorized() };
  }

  return { ok: true, setCookieToken: expected };
}

function getLocale(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const headers = { "accept-language": acceptLanguage };
  const languages = new Negotiator({ headers }).languages();

  try {
    const matched = match(languages, [...locales], defaultLocale);
    return matched as Locale;
  } catch {
    return defaultLocale;
  }
}

export async function proxy(request: NextRequest) {
  const auth = await enforcePreprodAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  let response: NextResponse;

  if (request.nextUrl.pathname.startsWith("/api")) {
    response = NextResponse.next();
  } else {
    const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value;

    if (existingLocale && locales.includes(existingLocale as Locale)) {
      response = NextResponse.next({
        request: {
          headers: new Headers({
            ...Object.fromEntries(request.headers),
            "x-locale": existingLocale,
          }),
        },
      });
    } else {
      const locale = getLocale(request);
      response = NextResponse.next({
        request: {
          headers: new Headers({
            ...Object.fromEntries(request.headers),
            "x-locale": locale,
          }),
        },
      });

      response.cookies.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
  }

  if (auth.setCookieToken) {
    attachSessionCookie(response, auth.setCookieToken, request);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
