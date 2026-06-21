// =============================================================================
// useTicketAnalytics HOOK  (Step 12)
// =============================================================================
// Derives all dashboard statistics from a tickets array.
//
// INPUTS:  tickets: Ticket[]  — the full live array from TicketsContext
// OUTPUTS: see TicketAnalytics below
//
// DESIGN PRINCIPLES:
//
//   1. ONE useMemo PER DERIVED VALUE
//      Each calculation is independently memoised. When a single ticket is
//      updated, only the memo values whose computation involves that ticket
//      need to re-run. Grouping everything into one giant useMemo would
//      recalculate all six values on every single state change.
//
//   2. NO SIDE EFFECTS, NO STATE
//      This hook owns no useState, no useEffect, no dispatch. It is a pure
//      transformation: tickets[] → analytics object. This makes it trivially
//      testable and impossible to introduce stale-state bugs.
//
//   3. NEVER MUTATES THE SOURCE ARRAY
//      Sort and slice operations use .slice() before .sort() so the source
//      array (owned by the context reducer) is never mutated.
//
//   4. DYNAMIC BREAKDOWNS — NO HARDCODED CATEGORIES OR ASSIGNEES
//      Category and assignee counts are computed by iterating the actual
//      ticket data. Adding a new category to a ticket automatically makes it
//      appear in the dashboard — no code change required.
//
//   5. "UNASSIGNED" SENTINEL FOR OPTIONAL assignedTo
//      Tickets with no assignedTo are grouped under the label "Unassigned"
//      rather than being silently dropped from the assignee breakdown.
//
// FILE EXTENSION: .ts (not .tsx) — this file contains no JSX.
// =============================================================================

import { useMemo } from "react";
import { Ticket, TicketStatus, TicketPriority } from "@/types/ticket";

// =============================================================================
// CONSTANTS
// =============================================================================

// The label used in the assignee breakdown for tickets with no assignedTo.
// Exported so UI components can apply special styling to this key if desired.
export const UNASSIGNED_LABEL = "Unassigned";

// Number of tickets shown in the Recent Activity section.
const RECENT_TICKET_LIMIT = 5;

// =============================================================================
// RETURN TYPE
// =============================================================================
// Naming the return type explicitly documents exactly what the hook provides.
// The dashboard page imports this type so its own props / variables are typed.
// =============================================================================

export interface TicketAnalytics {
  // ── Summary counts ──────────────────────────────────────────────────────────
  totalCount: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  criticalCount: number;

  // ── Breakdowns ──────────────────────────────────────────────────────────────
  // Record<string, number>: keys are the category / assignee names derived
  // from the ticket data. Order within the object is insertion order (the
  // order tickets are iterated), which is deterministic but not sorted.
  // The UI component is responsible for sorting if needed.
  categoryBreakdown: Record<string, number>;
  assigneeBreakdown: Record<string, number>;

  // ── Recent activity ─────────────────────────────────────────────────────────
  // The 5 most recently updated tickets, sorted newest-first by updatedAt.
  // These are full Ticket objects — the component picks which fields to show.
  recentTickets: Ticket[];
}

// =============================================================================
// HOOK
// =============================================================================

export function useTicketAnalytics(tickets: Ticket[]): TicketAnalytics {

  // ── totalCount ──────────────────────────────────────────────────────────────
  // Simple length — memoised so it doesn't recalculate on unrelated re-renders
  // that don't change the tickets reference.
  const totalCount = useMemo(() => tickets.length, [tickets]);

  // ── Status counts ───────────────────────────────────────────────────────────
  // Each status is a separate memo so they are independently cached. If the
  // only change is a DELETE_TICKET action, only the count for the deleted
  // ticket's status recalculates — not all four.
  const openCount = useMemo(
    () => tickets.filter((t) => t.status === TicketStatus.OPEN).length,
    [tickets]
  );

  const inProgressCount = useMemo(
    () => tickets.filter((t) => t.status === TicketStatus.IN_PROGRESS).length,
    [tickets]
  );

  const resolvedCount = useMemo(
    () => tickets.filter((t) => t.status === TicketStatus.RESOLVED).length,
    [tickets]
  );

  const closedCount = useMemo(
    () => tickets.filter((t) => t.status === TicketStatus.CLOSED).length,
    [tickets]
  );

  // ── criticalCount ───────────────────────────────────────────────────────────
  const criticalCount = useMemo(
    () => tickets.filter((t) => t.priority === TicketPriority.CRITICAL).length,
    [tickets]
  );

  // ── categoryBreakdown ───────────────────────────────────────────────────────
  // Iterates all tickets once and accumulates counts per category string.
  // Tickets with no category are silently skipped — the dashboard only shows
  // categories that at least one ticket belongs to.
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const ticket of tickets) {
      if (!ticket.category) continue; // skip uncategorised tickets
      counts[ticket.category] = (counts[ticket.category] ?? 0) + 1;
    }

    return counts;
  }, [tickets]);

  // ── assigneeBreakdown ───────────────────────────────────────────────────────
  // Like categoryBreakdown, but assignedTo is optional. Tickets without an
  // assignee are bucketed under UNASSIGNED_LABEL ("Unassigned") so they are
  // visible in the dashboard rather than silently missing.
  const assigneeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const ticket of tickets) {
      // Use the assignee name if present, otherwise the sentinel label.
      const key = ticket.assignedTo ?? UNASSIGNED_LABEL;
      counts[key] = (counts[key] ?? 0) + 1;
    }

    return counts;
  }, [tickets]);

  // ── recentTickets ───────────────────────────────────────────────────────────
  // The N most recently updated tickets.
  // .slice() creates a shallow copy before .sort() so the source array owned
  // by the reducer is never mutated. ISO 8601 strings sort correctly as plain
  // string comparisons (lexicographic order = chronological order for UTC).
  const recentTickets = useMemo(
    () =>
      tickets
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, RECENT_TICKET_LIMIT),
    [tickets]
  );

  // ── Return ──────────────────────────────────────────────────────────────────
  return {
    totalCount,
    openCount,
    inProgressCount,
    resolvedCount,
    closedCount,
    criticalCount,
    categoryBreakdown,
    assigneeBreakdown,
    recentTickets,
  };
}
