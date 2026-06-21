// =============================================================================
// SHARED FORMATTING UTILITIES
// =============================================================================
// These helpers were previously duplicated (or anticipated) in individual
// components. Moving them here follows the DRY principle: write once, import
// everywhere. If the date format or ID scheme ever changes, there is exactly
// ONE place to update.
//
// Why src/lib/ and not src/utils/?
//   "lib" is the conventional Next.js location for project-level helpers that
//   don't belong to a single component. It's already listed in the standard
//   scaffold (you can see the empty folder from Step 2).
// =============================================================================

// -----------------------------------------------------------------------------
// formatDate
// -----------------------------------------------------------------------------
// Converts an ISO 8601 string (e.g. "2026-06-12T09:14:00Z") into a
// human-readable date like "Jun 12, 2026".
//
// We use Intl.DateTimeFormat (built into every modern JS engine) rather than
// a third-party library like date-fns. This keeps the bundle lean while still
// giving us locale-aware formatting.
//
// "en-US" is used for consistency across environments. In a real app you might
// derive this from the user's locale or a settings store.
// -----------------------------------------------------------------------------

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoString));
}

// -----------------------------------------------------------------------------
// generateId
// -----------------------------------------------------------------------------
// Produces a ticket ID in the same format as the mock data: "TKT-001".
//
// In a real app the backend/database would generate IDs (e.g. UUID, auto-
// increment). Here we derive a sequential-style ID from the current timestamp
// so we don't need a counter stored somewhere. The timestamp approach is:
//   1. Fast — no network call.
//   2. Collision-resistant for a single-user in-memory store.
//   3. Still readable / debuggable (not a raw UUID).
//
// The ID is prefixed with "TKT-" and padded to at least 3 digits so it blends
// with the existing mock ticket IDs (TKT-001 … TKT-010).
// -----------------------------------------------------------------------------

export function generateId(): string {
  // Date.now() returns milliseconds since epoch — large enough to be unique
  // within a single browser session without needing a random component.
  const suffix = Date.now().toString().slice(-5); // last 5 digits of ms timestamp
  return `TKT-${suffix}`;
}
