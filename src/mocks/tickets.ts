// =============================================================================
// WHY THIS FILE EXISTS
// =============================================================================
// In real applications, data comes from an API or database. But during
// development — before the backend exists — we need something to work with.
// That's what mock data is: realistic, hard-coded data that behaves exactly
// like real data would.
//
// We keep mocks in their own folder (src/mocks/) instead of inside components
// or pages for three reasons:
//   1. SEPARATION OF CONCERNS — components should render data, not own it.
//   2. REPLACEABILITY — when the real API is ready, you only change the import
//      source in one place, not scattered across every component.
//   3. REUSABILITY — multiple pages and tests can import the same mock data
//      without duplicating it.
// =============================================================================

import { Ticket, TicketStatus, TicketPriority } from "@/types/ticket";

// =============================================================================
// TEAM MEMBERS
// =============================================================================
// We define team member IDs as constants so they are reused consistently
// across tickets. In a real app these would be user IDs from your auth system.
// Using constants (instead of raw strings) means a typo is caught at
// development time rather than causing a silent mismatch at runtime.
// =============================================================================

const TEAM = {
  ALICE: "alice.morgan",
  BOB: "bob.chan",
  CAROL: "carol.santos",
  DAVID: "david.okafor",
  EVA: "eva.lindqvist",
} as const;

// =============================================================================
// MOCK TICKETS
// =============================================================================
// WHY REALISTIC DATA MATTERS:
//   • "Lorem ipsum" placeholders hide real layout problems — a 3-word title
//     looks fine, but a 12-word title might break your card component.
//   • Real category names, realistic descriptions, and plausible dates make
//     it easier to spot UX issues during development.
//   • Reviewers and stakeholders can understand what the app is for without
//     needing a demo walkthrough.
//
// WHY Ticket[] (typed array)?
//   TypeScript will check every object in this array against the Ticket
//   interface at compile time. If you add a field that doesn't exist on Ticket,
//   or misspell a status value, you get an error instantly — not a runtime bug.
// =============================================================================

export const mockTickets: Ticket[] = [
  // ── 1. CRITICAL / OPEN ────────────────────────────────────────────────────
  {
    id: "TKT-001",
    title: "Users unable to log in after OAuth token refresh",
    description:
      "Multiple users are reporting that they are being logged out automatically and cannot sign back in. The error occurs after the OAuth access token expires and the refresh flow fails silently. Affects all Google OAuth users on production. First reported at 09:14 UTC.",
    status: TicketStatus.OPEN,
    priority: TicketPriority.CRITICAL,
    category: "Authentication",
    tags: ["oauth", "production", "regression"],
    createdBy: TEAM.BOB,
    assignedTo: TEAM.ALICE,
    createdAt: "2026-06-12T09:14:00Z",
    updatedAt: "2026-06-12T09:45:00Z",
  },

  // ── 2. HIGH / IN_PROGRESS ─────────────────────────────────────────────────
  {
    id: "TKT-002",
    title: "Checkout fails when applying discount codes on mobile Safari",
    description:
      "When a user on iOS Safari applies a discount code during checkout, the price does not update and the 'Place Order' button becomes unresponsive. The issue does not reproduce on Chrome or Firefox. Suspected to be a CSS :focus-within bug causing the submit handler to be blocked.",
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
    category: "Payments",
    tags: ["mobile", "safari", "checkout", "bug"],
    createdBy: TEAM.CAROL,
    assignedTo: TEAM.BOB,
    createdAt: "2026-06-11T14:22:00Z",
    updatedAt: "2026-06-12T08:10:00Z",
  },

  // ── 3. HIGH / OPEN ────────────────────────────────────────────────────────
  {
    id: "TKT-003",
    title: "Dashboard analytics chart causes page crash for large date ranges",
    description:
      "When the user selects a date range longer than 90 days on the analytics dashboard, the browser tab crashes. Likely caused by rendering thousands of SVG nodes without virtualisation. Affects both the bar and line chart components. Needs investigation into chart library limits.",
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    category: "Performance",
    tags: ["dashboard", "charts", "memory", "crash"],
    createdBy: TEAM.ALICE,
    assignedTo: TEAM.DAVID,
    createdAt: "2026-06-10T11:05:00Z",
    updatedAt: "2026-06-11T16:30:00Z",
  },

  // ── 4. MEDIUM / IN_PROGRESS ───────────────────────────────────────────────
  {
    id: "TKT-004",
    title: "Add CSV export functionality to the reports page",
    description:
      "Finance team has requested the ability to export any report table as a CSV file. The export should respect the currently applied filters and date range. Column headers should match the visible table headers. Needs a server-side endpoint and a download-trigger button on the frontend.",
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.MEDIUM,
    category: "Reporting",
    tags: ["feature", "csv", "export", "finance"],
    createdBy: TEAM.EVA,
    assignedTo: TEAM.CAROL,
    createdAt: "2026-06-09T09:00:00Z",
    updatedAt: "2026-06-11T13:45:00Z",
  },

  // ── 5. MEDIUM / OPEN (unassigned) ─────────────────────────────────────────
  {
    id: "TKT-005",
    title: "Implement dark mode toggle with system preference detection",
    description:
      "Users have requested a dark mode option. The implementation should: (1) detect the OS-level prefers-color-scheme setting on first load, (2) provide a manual toggle in the nav bar, (3) persist the user's choice in localStorage. Tailwind's dark: variant should be used for styling.",
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    category: "UI / UX",
    tags: ["dark-mode", "accessibility", "feature", "tailwind"],
    createdBy: TEAM.DAVID,
    // No assignedTo — this ticket has not been picked up yet.
    // Omitting an optional field is valid and intentional here.
    createdAt: "2026-06-08T15:30:00Z",
    updatedAt: "2026-06-08T15:30:00Z",
  },

  // ── 6. CRITICAL / IN_PROGRESS ─────────────────────────────────────────────
  {
    id: "TKT-006",
    title: "Email notification queue backed up — 4,000+ emails not delivered",
    description:
      "The background job processing outbound email notifications has stalled. The queue currently shows 4,213 unprocessed jobs. Root cause appears to be a deadlock in the database transaction used to mark messages as sent. Users are not receiving password reset, invoice, and onboarding emails. Immediate intervention required.",
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.CRITICAL,
    category: "Infrastructure",
    tags: ["email", "queue", "deadlock", "production", "urgent"],
    createdBy: TEAM.ALICE,
    assignedTo: TEAM.EVA,
    createdAt: "2026-06-12T06:00:00Z",
    updatedAt: "2026-06-12T07:15:00Z",
  },

  // ── 7. LOW / OPEN (unassigned) ────────────────────────────────────────────
  {
    id: "TKT-007",
    title: "Settings page input fields misaligned on viewport widths 768–1024px",
    description:
      "On tablet-sized viewports (768px–1024px), the label and input columns in the Account Settings form do not align correctly. Labels wrap to a second line which pushes inputs out of position. This is a CSS flex/grid issue specific to the mid-range breakpoint. Low user impact but visually noticeable.",
    status: TicketStatus.OPEN,
    priority: TicketPriority.LOW,
    category: "UI / UX",
    tags: ["css", "responsive", "settings", "tablet"],
    createdBy: TEAM.BOB,
    createdAt: "2026-06-07T10:20:00Z",
    updatedAt: "2026-06-07T10:20:00Z",
  },

  // ── 8. RESOLVED ───────────────────────────────────────────────────────────
  {
    id: "TKT-008",
    title: "API rate limiting returns 500 instead of 429 on burst traffic",
    description:
      "When the rate limiter threshold is exceeded, the API was returning a generic 500 Internal Server Error instead of the correct 429 Too Many Requests. This confused client-side retry logic. Fixed by moving the rate limit middleware earlier in the Express middleware chain and returning proper JSON error body.",
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.HIGH,
    category: "API",
    tags: ["rate-limiting", "http-status", "middleware", "fixed"],
    createdBy: TEAM.CAROL,
    assignedTo: TEAM.ALICE,
    createdAt: "2026-06-05T08:45:00Z",
    updatedAt: "2026-06-11T17:00:00Z",
  },

  // ── 9. RESOLVED ───────────────────────────────────────────────────────────
  {
    id: "TKT-009",
    title: "Search results not updating when filter is cleared",
    description:
      "After applying a category filter on the search results page, clicking 'Clear Filters' would not re-fetch results — the UI showed stale filtered data. The bug was caused by a missing dependency in a useEffect hook. Adding the filter state to the dependency array resolved the issue.",
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.MEDIUM,
    category: "Search",
    tags: ["useEffect", "bug", "react", "hooks"],
    createdBy: TEAM.EVA,
    assignedTo: TEAM.BOB,
    createdAt: "2026-06-04T13:10:00Z",
    updatedAt: "2026-06-10T09:25:00Z",
  },

  // ── 10. CLOSED ────────────────────────────────────────────────────────────
  {
    id: "TKT-010",
    title: "Improve onboarding checklist UX — add progress indicator",
    description:
      "New users reported feeling lost during onboarding. Added a step-by-step progress bar to the onboarding checklist showing '3 of 6 steps completed'. Also added subtle animations for step completion. User testing showed a 28% improvement in onboarding completion rate. Shipped in v2.4.1.",
    status: TicketStatus.CLOSED,
    priority: TicketPriority.LOW,
    category: "Onboarding",
    tags: ["ux", "onboarding", "shipped", "animation"],
    createdBy: TEAM.DAVID,
    assignedTo: TEAM.CAROL,
    createdAt: "2026-05-28T11:00:00Z",
    updatedAt: "2026-06-06T14:30:00Z",
  },
];

// =============================================================================
// HELPER EXPORTS
// =============================================================================
// Exporting helper functions alongside the data means consumers don't need
// to re-implement common lookups themselves. This is the "don't repeat
// yourself" (DRY) principle applied to data access.
// =============================================================================

// Look up a single ticket by its ID. Returns undefined if not found.
// The return type "Ticket | undefined" is inferred automatically by TypeScript.
export function getTicketById(id: string) {
  return mockTickets.find((ticket) => ticket.id === id);
}

// Filter tickets by status. Returns a new array — never mutates the original.
export function getTicketsByStatus(status: TicketStatus) {
  return mockTickets.filter((ticket) => ticket.status === status);
}

// Filter tickets by priority.
export function getTicketsByPriority(priority: TicketPriority) {
  return mockTickets.filter((ticket) => ticket.priority === priority);
}

// Count tickets grouped by status — useful for a summary dashboard card.
// Record<TicketStatus, number> means: "an object whose keys are TicketStatus
// values and whose values are numbers." This is safer than a plain object
// because TypeScript ensures all statuses are accounted for.
export function getTicketCountByStatus(): Record<TicketStatus, number> {
  return {
    open: getTicketsByStatus(TicketStatus.OPEN).length,
    in_progress: getTicketsByStatus(TicketStatus.IN_PROGRESS).length,
    resolved: getTicketsByStatus(TicketStatus.RESOLVED).length,
    closed: getTicketsByStatus(TicketStatus.CLOSED).length,
  };
}
