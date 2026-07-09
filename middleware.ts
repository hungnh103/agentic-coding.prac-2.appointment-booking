import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import {
  applySecurityHeaders,
  consumeRateLimit,
  getClientIdentifier
} from "@/lib/http/rate-limit";

function handleRateLimits(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const path = request.nextUrl.pathname;
  const isBookingMutation = path === "/api/appointments" && request.method === "POST";
  const isAdminLoginSubmission = path === "/admin/login" && request.method !== "GET";
  const isAuthSubmission = path.startsWith("/api/auth") && request.method !== "GET";

  if (!isBookingMutation && !isAdminLoginSubmission && !isAuthSubmission) {
    return null;
  }

  const result = consumeRateLimit({
    key: `${clientId}:${path}`,
    limit: isBookingMutation ? 8 : 12,
    windowMs: 60_000
  });

  if (result.allowed) {
    return null;
  }

  return NextResponse.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait a minute and try again."
      }
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(Math.ceil((result.resetAt - Date.now()) / 1000), 1))
      }
    }
  );
}

export default auth((request) => {
  const rateLimited = handleRateLimits(request);
  if (rateLimited) {
    applySecurityHeaders(rateLimited.headers);
    return rateLimited;
  }

  if (!request.auth && request.nextUrl.pathname.startsWith("/admin") && request.nextUrl.pathname !== "/admin/login") {
    const signInUrl = new URL("/admin/login", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    const response = NextResponse.redirect(signInUrl);
    applySecurityHeaders(response.headers);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const response = NextResponse.next();
  applySecurityHeaders(response.headers);
  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
});

export const config = {
  matcher: ["/admin/:path*", "/api/appointments", "/api/auth/:path*"]
};
