import type { NextFetchEvent, NextRequest } from "next/server";

import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk proxy handler, adapted to the Next.js 16 `proxy` convention.
 *
 * Runs passively — manages sessions, handles Clerk internal routes, and
 * attaches auth state to requests. Route protection is handled client-side
 * via Convex's `<Authenticated>` / `<Unauthenticated>` wrappers so that
 * sign-out navigation doesn't trigger RSC fetch errors.
 */
const clerkHandler = clerkMiddleware();

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
