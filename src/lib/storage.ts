// =============================================================================
// LOCALSTORAGE UTILITIES  (added in Step 11)
// =============================================================================
// Two pure functions that abstract reading and writing JSON values from/to
// localStorage. These are plain functions — not hooks — because:
//
//   1. readFromStorage is called inside a useReducer lazy initializer, which
//      is a plain function call, not a hook context.
//   2. writeToStorage is called inside a useEffect callback.
//
//   If these were hooks, calling them in those positions would violate React's
//   rules of hooks. Plain functions have no such restriction.
//
// WHY src/lib/ AND NOT INLINE IN useTickets.tsx?
//   The read/write logic is not specific to tickets. Placing it here means:
//   • It can be reused for filter preferences, user settings, etc.
//   • It can be tested independently of the React state layer.
//   • useTickets.tsx stays focused on ticket-domain logic.
//
// ERROR HANDLING:
//   Both functions are wrapped in try/catch and fail silently. localStorage
//   can throw in:
//     • Safari private browsing mode (access denied)
//     • When storage quota is exceeded (QuotaExceededError)
//     • Certain iframe contexts with restricted storage
//   Silent failure is the correct behaviour — the app continues to work with
//   in-memory state when persistence is unavailable.
// =============================================================================

// -----------------------------------------------------------------------------
// readFromStorage<T>
// -----------------------------------------------------------------------------
// Reads and JSON-parses a value from localStorage.
// Returns null on any error: missing key, JSON parse failure, access denied.
//
// The generic type parameter T lets callers specify the expected shape and
// get proper type inference without casting at the call site.
//
// Example:
//   const stored = readFromStorage<PersistedTickets>("ticket-management:tickets");
//   if (stored !== null) { /* use stored.tickets */ }
// -----------------------------------------------------------------------------

export function readFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);

    // getItem returns null when the key does not exist — distinguish this
    // from a stored value of JSON null (which would be the string "null").
    if (raw === null) return null;

    return JSON.parse(raw) as T;
  } catch {
    // Covers: ReferenceError (no window), SyntaxError (corrupt JSON),
    // DOMException (access denied in private browsing).
    return null;
  }
}

// -----------------------------------------------------------------------------
// writeToStorage<T>
// -----------------------------------------------------------------------------
// JSON-serialises a value and writes it to localStorage under the given key.
// Silently no-ops on any error.
//
// Example:
//   writeToStorage("ticket-management:tickets", { schemaVersion: 1, tickets });
// -----------------------------------------------------------------------------

export function writeToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Covers: QuotaExceededError (storage full), DOMException (access denied).
    // We intentionally swallow these — the app works fine without persistence.
  }
}
