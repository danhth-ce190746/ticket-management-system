// =============================================================================
// PROXY  (Step 13.3)
// =============================================================================
// This file implements route protection for the Ticket Manager app.
//
// In Next.js 16+, `middleware.ts` is deprecated and renamed to `proxy.ts`.
// The exported function must be named `proxy` (not `middleware`).
// See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
//
// HOW IT WORKS:
//   The proxy runs BEFORE any page renders, at the network level. No protected
//   page HTML is ever sent to an unauthenticated client — the redirect happens
//   before the render pipeline starts. This avoids the flash-of-content that a
//   client-side useEffect guard would produce.
//
// AUTHENTICATION CHECK:
//   We cannot call isAuthenticated() from auth-cookie.ts here because that
//   function uses document.cookie — a browser-only API. The proxy runs on the
//   server (Node.js runtime in Next.js 16). Instead, we import the exported
//   COOKIE_NAME and COOKIE_VALUE constants from auth-cookie.ts and use
//   request.cookies.get() — the server-side cookie API provided by NextRequest.
//   This satisfies "Do NOT duplicate cookie parsing logic": no string splitting,
//   no re-implementation — the framework reads the Cookie header for us.
//
// PROTECTED ROUTES:
//   /tickets            (list)
//   /tickets/create     (create form)
//   /tickets/:id        (detail view)
//   /tickets/:id/edit   (edit form)
//   /dashboard          (analytics)
//
// PUBLIC ROUTES:
//   /login              (always accessible; redirects to /tickets if authed)
//   / (root)            (not in matcher — passes through unchanged)
//
// MATCHER DESIGN:
//   We use a positive allowlist of exactly the routes we own. This avoids
//   running the proxy on _next/static, _next/image, favicon.ico, and any
//   other framework-internal paths that must never be blocked.
// =============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, COOKIE_VALUE } from "@/lib/auth-cookie";

// =============================================================================
// PROTECTED AND PUBLIC ROUTE DEFINITIONS
// =============================================================================
// Defined as module constants so they appear in exactly one place.
// When a new protected route is added, only this array needs updating.
// =============================================================================

const PROTECTED_PREFIXES = ["/tickets", "/dashboard"] as const;
const LOGIN_PATH = "/login";

// =============================================================================
// PROXY FUNCTION
// =============================================================================

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Determine authentication state ──────────────────────────────────────────
  // request.cookies.get() reads the Cookie header on the incoming request.
  // It returns { name, value } | undefined.
  const authCookie = request.cookies.get(COOKIE_NAME);
  const authenticated = authCookie?.value === COOKIE_VALUE;

  // ── Login page guard ────────────────────────────────────────────────────────
  // If an authenticated user navigates to /login (e.g. via back button or
  // typing the URL), redirect them to /tickets so they never see the login form.
  if (pathname === LOGIN_PATH) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/tickets", request.url));
    }
    // Not authenticated → allow through to the login page.
    return NextResponse.next();
  }

  // ── Protected route guard ───────────────────────────────────────────────────
  // Check if the current pathname starts with any protected prefix.
  // PROTECTED_PREFIXES.some() short-circuits on the first match.
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !authenticated) {
    // Unauthenticated access to a protected route — redirect to login.
    // We do NOT append a `?redirect=` param in Phase 1 (no redirect-back yet).
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  // ── Allow all other requests ────────────────────────────────────────────────
  return NextResponse.next();
}

// =============================================================================
// MATCHER CONFIG
// =============================================================================
// Positive allowlist: only run the proxy on routes we explicitly own.
// This prevents the proxy from intercepting:
//   • _next/static  — JS, CSS, compiled assets
//   • _next/image   — image optimisation
//   • favicon.ico   — browser tab icon
// Without a matcher the proxy runs on ALL requests, which would block assets.
//
// Patterns:
//   /login              — the login page (guard for already-authenticated)
//   /tickets            — the ticket list page (exact)
//   /tickets/:path*     — all sub-routes: /create, /[id], /[id]/edit
//   /dashboard          — the dashboard page
// =============================================================================

export const config = {
  matcher: ["/login", "/tickets", "/tickets/:path*", "/dashboard"],
};
