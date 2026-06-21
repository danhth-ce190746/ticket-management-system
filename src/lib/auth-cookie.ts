// =============================================================================
// AUTH COOKIE UTILITIES  (Step 13.2)
// =============================================================================
// Four functions that encapsulate every interaction with the auth cookie.
//
// COOKIE SPEC:
//   Name:     auth-token
//   Value:    "authenticated"   (Phase 3: replace with a signed JWT)
//   Lifetime: 7 days
//   Path:     / (available on every route)
//   SameSite: Lax — protects against cross-site request forgery on POST
//             while still allowing normal top-level navigation from external
//             links (e.g. clicking a link in an email).
//
// WHY NOT HttpOnly?
//   HttpOnly cookies cannot be read by JavaScript — they are server-side
//   only. Because this app has no server-side session validation yet (Phase 3
//   will add Next.js middleware), the client must be able to read the cookie
//   to decide whether to show the login page. HttpOnly is the right choice
//   once middleware is in place.
//
// SSR SAFETY:
//   `document` does not exist on the server (Next.js pre-renders client
//   components). Every function checks `typeof document === "undefined"` and
//   returns a safe default so server-side rendering never throws.
//
// PHASE ROADMAP:
//   Phase 1: no cookie  (done)
//   Phase 2: client-readable cookie — THIS FILE  ← you are here
//   Phase 3: HttpOnly cookie set by an API route / server action + middleware
//
// SINGLE SOURCE OF TRUTH:
//   All cookie constants live here. If the cookie name, value, or lifetime
//   changes, there is exactly one file to update.
// =============================================================================

// Step 13.3: COOKIE_NAME and COOKIE_VALUE are exported so proxy.ts can
// import them to check authentication on the server side via
// request.cookies.get(COOKIE_NAME). Exporting constants (not functions)
// keeps the proxy free of browser-only dependencies (document.cookie).
export const COOKIE_NAME    = "auth-token";
export const COOKIE_VALUE   = "authenticated";
const MAX_AGE_DAYS   = 7;
const MAX_AGE_SECONDS = MAX_AGE_DAYS * 24 * 60 * 60; // 604 800

// =============================================================================
// setAuthCookie
// =============================================================================
// Writes the auth cookie to document.cookie.
// Called immediately after a successful credential check in the login handler.
// =============================================================================

export function setAuthCookie(): void {
  if (typeof document === "undefined") return; // SSR guard

  document.cookie = [
    `${COOKIE_NAME}=${COOKIE_VALUE}`,
    `path=/`,
    `max-age=${MAX_AGE_SECONDS}`,
    `SameSite=Lax`,
  ].join("; ");
}

// =============================================================================
// getAuthCookie
// =============================================================================
// Reads the auth cookie value from document.cookie.
// Returns the value string if the cookie exists, null otherwise.
//
// document.cookie is a single string of all cookies in "key=value; key=value"
// format. We split on "; " and find the matching key prefix.
//
// Phase 3 note: once the cookie is HttpOnly, this function will always return
// null from JavaScript (the browser hides HttpOnly cookies from JS). At that
// point the client-side isAuthenticated() check is replaced by a server-side
// middleware check, and this function can be removed.
// =============================================================================

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null; // SSR guard

  const match = document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;

  // Extract the value after the first "=" — values may themselves contain "=".
  return match.slice(COOKIE_NAME.length + 1);
}

// =============================================================================
// clearAuthCookie
// =============================================================================
// Removes the auth cookie by setting max-age=0 (expires immediately).
// Used by the logout flow (Phase 3).
// Exported now so components can import it without a future breaking change.
// =============================================================================

export function clearAuthCookie(): void {
  if (typeof document === "undefined") return; // SSR guard

  document.cookie = [
    `${COOKIE_NAME}=`,
    `path=/`,
    `max-age=0`,
    `SameSite=Lax`,
  ].join("; ");
}

// =============================================================================
// isAuthenticated
// =============================================================================
// Returns true if the auth cookie is present and has the expected value.
//
// Checking the VALUE (not just presence) means a cookie with the wrong value
// (e.g. manually set by the user to anything other than "authenticated") is
// treated as unauthenticated. This is a minimal integrity check, not real
// security — Phase 3 (HttpOnly + signed JWT) provides actual security.
// =============================================================================

export function isAuthenticated(): boolean {
  return getAuthCookie() === COOKIE_VALUE;
}
