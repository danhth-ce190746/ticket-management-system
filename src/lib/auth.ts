// =============================================================================
// MOCK AUTHENTICATION  (Step 13 — Phase 1)
// =============================================================================
// Provides a thin credential-check function used by the login page.
//
// WHY A SEPARATE FILE?
//   The login page should not contain raw credential strings — that couples
//   the UI to the auth mechanism. Extracting the check here means:
//     • Phase 2 (real backend) only changes THIS file, not the page.
//     • The mock credentials are defined in exactly one place.
//
// WHAT THIS IS NOT:
//   This is NOT a real authentication system. There are no cookies, no JWTs,
//   no sessions, and no server-side validation. This is a front-end stub
//   that mimics the SHAPE of a credential check so the UI can be built and
//   tested before the backend exists.
// =============================================================================

// Mock credentials — Phase 2 will replace these with an API call.
const MOCK_USERNAME = "admin";
const MOCK_PASSWORD = "123456";

// -----------------------------------------------------------------------------
// validateCredentials
// -----------------------------------------------------------------------------
// Returns true if the supplied username + password match the mock credentials.
// In Phase 2, this function becomes an async API call:
//   async function validateCredentials(username, password): Promise<boolean>
// The call site in the login page uses await, so the change is transparent.
// -----------------------------------------------------------------------------

export function validateCredentials(username: string, password: string): boolean {
  return username === MOCK_USERNAME && password === MOCK_PASSWORD;
}
