"use client";

// =============================================================================
// Navbar COMPONENT  (updated Step 13.4 — Logout + Auth UI)
// =============================================================================
// A persistent top navigation bar rendered once in the root layout.
// It appears on EVERY page of the application — tickets list, detail view,
// create form, dashboard, and any future pages.
//
// WHY "use client"?
//   We use usePathname() for active-link highlighting and useState/useEffect
//   to read the auth cookie client-side. All of these are hook-based APIs that
//   require a Client Component.
//
// AUTH UI DESIGN:
//   isAuthenticated() reads document.cookie — a browser-only API. Next.js
//   server-renders client components, so we cannot call it at render time
//   (document is undefined on the server). The pattern is:
//
//     useState(false)          → server renders "unauthenticated" UI (safe)
//     useEffect → reads cookie → client updates to "authenticated" UI
//
//   This keeps server HTML and client hydration in sync (no hydration mismatch),
//   then immediately shows the correct state after hydration. The effect fires
//   so quickly after first paint that no flicker is perceptible in practice.
//
// LOGOUT:
//   clearAuthCookie() sets max-age=0 on the cookie (immediate expiry).
//   router.push("/login") navigates away. On the next protected route visit,
//   proxy.ts finds no cookie and redirects to /login.
// =============================================================================

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated, clearAuthCookie } from "@/lib/auth-cookie";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // ── Auth state ──────────────────────────────────────────────────────────────
  // Initial value is false so the server render and client hydration produce
  // identical HTML. The effect reads the real cookie value after hydration.
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);
  // WHY pathname as a dependency?
  //   router.push() (used by both login and logout) is a soft navigation —
  //   the Navbar stays mounted across route changes. The empty [] form would
  //   only fire on mount. By depending on pathname, the effect re-runs on
  //   every route change, re-reads the cookie, and reflects the current auth
  //   state immediately:
  //     login:  /login → /tickets  → pathname changes → cookie now exists   → authed = true
  //     logout: setAuthed(false) fires synchronously first (no flicker needed),
  //             then pathname changes on navigation → effect re-confirms false.

  // ── Logout handler ──────────────────────────────────────────────────────────
  function handleLogout() {
    clearAuthCookie();  // erases auth-token immediately (max-age=0)
    setAuthed(false);   // update local state NOW — hides greeting/logout in the
                        // same render, before the navigation fires. Without this,
                        // router.push() does a soft navigation that keeps the
                        // Navbar mounted, so the useEffect never re-runs and
                        // authed stays true until a hard page refresh.
    router.push("/login");
  }

  // Helper: returns true if the current URL exactly matches (or starts with)
  // the given href. Used to apply the active link style.
  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <Link
          href="/tickets"
          className="text-base font-semibold text-gray-900 tracking-tight hover:text-blue-600 transition-colors"
        >
          🎫 Ticket Manager
        </Link>

        {/* ── Right side: nav links + auth UI ───────────────────────────── */}
        <div className="flex items-center gap-3">

          {/* Dashboard link — exact match so it doesn't activate on sub-routes */}
          <Link
            href="/dashboard"
            className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
              pathname === "/dashboard"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Dashboard
          </Link>

          {/* All Tickets link — highlighted when on the list page */}
          <Link
            href="/tickets"
            className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
              isActive("/tickets") && pathname === "/tickets"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            All Tickets
          </Link>

          {/* New Ticket — styled as a primary button (the main CTA) */}
          <Link
            href="/tickets/create"
            className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
              isActive("/tickets/create")
                ? "bg-blue-700 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            + New Ticket
          </Link>

          {/* ── Auth UI — only shown when authenticated ──────────────────── */}
          {/*
            The authed flag is false during SSR and hydration (see comment at
            the top). It flips to true in the useEffect after hydration, so
            this block appears immediately after the first client render.
            On the /login page, proxy.ts redirects authenticated users away, so
            authed will always be false when the login page renders — this
            block correctly stays hidden there.
          */}
          {authed && (
            <>
              {/* Greeting — separated from links by a subtle divider */}
              <span className="text-sm text-gray-500 pl-2 border-l border-gray-200">
                Hi, admin 👋
              </span>

              {/* Logout — styled as a plain text button, not a nav link */}
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </nav>
    </header>
  );
}
