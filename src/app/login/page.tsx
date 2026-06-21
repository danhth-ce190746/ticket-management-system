"use client";

// =============================================================================
// LOGIN PAGE  —  /login  (Step 13 — Phase 1 + 2)
// =============================================================================
// Provides a username + password form backed by React Hook Form + Zod.
//
// VALIDATION LAYERS (three, in sequence):
//
//   1. ZOD SCHEMA (field-level)
//      Runs on every blur/submit. Reports inline per-field errors:
//        • username: required
//        • password: required, min length 6
//
//   2. REACT HOOK FORM
//      zodResolver connects the schema to RHF. RHF owns form state, tracks
//      isSubmitting, and exposes the errors object to the JSX.
//
//   3. validateCredentials() (form-level)
//      Runs ONLY after schema validation passes. A failed credential check
//      sets setError("root") — a single "Invalid credentials" message
//      displayed below the form, not attached to a specific field.
//
// WHY setError("root") AND NOT useState?
//   Using RHF's built-in error mechanism means the "Invalid credentials"
//   message is automatically cleared the next time the user submits —
//   no manual cleanup code needed. It also keeps all form error state
//   in one place (formState.errors) instead of split across RHF + useState.
//
// PHASE CONSTRAINTS (by design):
//   Phase 1 (done): no cookies — redirect only
//   Phase 2 (this): set client-readable auth cookie before redirect
//   Phase 3 (next): HttpOnly cookie via server action + middleware route guard
// =============================================================================

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { validateCredentials } from "@/lib/auth";
import { setAuthCookie } from "@/lib/auth-cookie";

// =============================================================================
// ZOD SCHEMA
// =============================================================================
// Defines the validation rules for the two fields.
// z.string().trim() removes leading/trailing whitespace before validation —
// a username of "  admin  " still works; "  " (spaces only) fails "required".
// =============================================================================

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "Username is required." }),

  password: z
    .string()
    .min(1, { message: "Password is required." })
    .min(6, { message: "Password must be at least 6 characters." }),
});

// TypeScript type inferred from the schema — no duplicate type definition.
type LoginFormValues = z.infer<typeof loginSchema>;

// =============================================================================
// SHARED STYLES (mirrors TicketFormFields.tsx)
// =============================================================================

const LABEL_CLASS = "block mb-2 text-sm font-medium text-gray-700";
const INPUT_BASE  = "w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 transition-colors";
const INPUT_VALID = "border-gray-300 focus:ring-blue-500";
const INPUT_ERROR = "border-red-400 focus:ring-red-400 bg-red-50";
const ERROR_CLASS = "mt-1.5 text-xs text-red-600";

// =============================================================================
// COMPONENT
// =============================================================================

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    // mode: "onBlur" — validate each field when the user leaves it.
    // This gives immediate feedback without being intrusive while typing.
    mode: "onBlur",
  });

  // ── Submit handler ─────────────────────────────────────────────────────────
  // handleSubmit() ensures this only runs when schema validation passes.
  // If any field fails its Zod rule, this function is not called at all.
  async function onSubmit(data: LoginFormValues) {
    // Phase 1: validateCredentials is synchronous.
    // Phase 2: change to `await validateCredentials(...)` — page unchanged.
    const ok = validateCredentials(data.username, data.password);

    if (!ok) {
      // Set a form-level error (not tied to a specific field).
      // RHF clears this automatically on the next successful submit attempt.
      setError("root", {
        message: "Invalid username or password. Please try again.",
      });
      return;
    }

    // Phase 2: set the auth cookie so other pages can read authentication
    // state without requiring the user to re-enter credentials.
    // Phase 3: replace with an HttpOnly cookie set by a server action.
    setAuthCookie();
    router.push("/tickets");
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      {/*
        Full-height centred layout.
        min-h subtracts the Navbar height (3.5rem = h-14) so the card sits
        in the visual centre of the remaining viewport.
      */}

      <div className="w-full max-w-sm">

        {/* ── Card ────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">

          {/* ── Heading ───────────────────────────────────────────────────── */}
          <div className="mb-8 text-center">
            <div className="text-3xl mb-2" aria-hidden="true">🎫</div>
            <h1 className="text-xl font-bold text-gray-900">
              Sign in to Ticket Manager
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to continue.
            </p>
          </div>

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* ── Username ────────────────────────────────────────────────── */}
            <div>
              <label htmlFor="username" className={LABEL_CLASS}>
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="admin"
                className={`${INPUT_BASE} ${errors.username ? INPUT_ERROR : INPUT_VALID}`}
                {...register("username")}
              />
              {errors.username && (
                <p role="alert" className={ERROR_CLASS}>
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* ── Password ────────────────────────────────────────────────── */}
            <div>
              <label htmlFor="password" className={LABEL_CLASS}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
                className={`${INPUT_BASE} ${errors.password ? INPUT_ERROR : INPUT_VALID}`}
                {...register("password")}
              />
              {errors.password && (
                <p role="alert" className={ERROR_CLASS}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* ── Root / credential error ──────────────────────────────────── */}
            {/*
              errors.root is set by setError("root") when credentials don't
              match. It is displayed as a full-width alert below the fields
              so it's clearly separate from individual field errors.
            */}
            {errors.root && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errors.root.message}
              </div>
            )}

            {/* ── Submit ──────────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>

          </form>

          {/* ── Dev hint ─────────────────────────────────────────────────── */}
          {/*
            Phase 1 development hint — remove this block in Phase 2 when
            real credentials are in use.
          */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Demo credentials: <span className="font-mono">admin</span> /{" "}
            <span className="font-mono">123456</span>
          </p>

        </div>
      </div>
    </main>
  );
}
