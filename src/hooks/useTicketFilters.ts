// =============================================================================
// useTicketFilters HOOK
// =============================================================================
// Owns all filter state for the tickets list page and derives the filtered,
// sorted result via useMemo.
//
// INPUTS:  tickets: Ticket[]  — the full list from TicketsContext
// OUTPUTS: see TicketFiltersResult below
//
// WHY A SEPARATE HOOK (not inline in page.tsx)?
//   The filtering + sorting logic is ~60 lines of pure computation. If it
//   lived directly in the page component, the component would become hard
//   to read and impossible to unit-test in isolation.
//   Extracting it here means:
//     • page.tsx stays a lean orchestrator (call hook, render components)
//     • This file can be tested independently of React rendering
//     • The same hook could power a future "My Tickets" page with zero
//       changes — just pass a different tickets[] input
//
// WHY NOT IN TicketsContext?
//   Filter state belongs to the LIST VIEW, not the whole application.
//   Putting it in context would cause the entire app to re-render on every
//   keystroke in the search box. Keeping it local is both simpler and faster.
//
// FILE EXTENSION: .ts not .tsx
//   This file contains no JSX — it is pure TypeScript logic.
//   The .ts extension signals this clearly to the reader and the toolchain.
// =============================================================================

import { useState, useMemo } from "react";
import {
  Ticket,
  TicketPriority,
  TicketFilters,
  StatusFilter,
  PriorityFilter,
  SortOption,
} from "@/types/ticket";

// =============================================================================
// CONSTANTS
// =============================================================================

// The default filter state — "show everything, newest first".
// Exported so the UI component can compare against it (e.g. to decide
// whether a given filter is "active" and should be highlighted).
export const DEFAULT_FILTERS: TicketFilters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "createdAt_desc",
};

// Priority weight map used for the sort step.
// Maps each TicketPriority value to a numeric weight so comparison is a
// simple subtraction (no string ordering, no switch statement in the sort).
// Higher number = higher urgency.
const PRIORITY_WEIGHT: Record<TicketPriority, number> = {
  [TicketPriority.CRITICAL]: 4,
  [TicketPriority.HIGH]: 3,
  [TicketPriority.MEDIUM]: 2,
  [TicketPriority.LOW]: 1,
};

// =============================================================================
// RETURN TYPE
// =============================================================================
// Explicitly naming the return type serves as documentation: any reader can
// see exactly what the hook provides without tracing through the implementation.
// =============================================================================

export interface TicketFiltersResult {
  // Current filter state — passed to <TicketFilters> to keep UI in sync.
  filters: TicketFilters;

  // Individual setters — fine-grained control for each filter control.
  setSearch: (value: string) => void;
  setStatus: (value: StatusFilter) => void;
  setPriority: (value: PriorityFilter) => void;
  setSort: (value: SortOption) => void;

  // One-shot reset — restores DEFAULT_FILTERS.
  resetFilters: () => void;

  // The derived output — the list to render.
  // This is the ONLY place filteredTickets is produced; it is NEVER stored
  // in state (doing so would create two sources of truth that could diverge).
  filteredTickets: Ticket[];

  // Count of non-default active filters (search counts as 1 when non-empty).
  // Used to show the "X filters active" badge and the "Clear" button.
  activeFilterCount: number;
}

// =============================================================================
// HOOK
// =============================================================================

export function useTicketFilters(tickets: Ticket[]): TicketFiltersResult {

  // ── Filter state ────────────────────────────────────────────────────────────
  // We use a single state object (not four separate useStates) so that a reset
  // is a single setState call — no risk of partial resets or stale closures.
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_FILTERS);

  // ── Individual setters ──────────────────────────────────────────────────────
  // Each setter only touches its own field, preserving the rest.
  // Defined outside useMemo so they are stable references (no recreation on
  // every render) — this matters if they are ever passed as props to memoised
  // child components.
  function setSearch(value: string) {
    setFilters((prev) => ({ ...prev, search: value }));
  }

  function setStatus(value: StatusFilter) {
    setFilters((prev) => ({ ...prev, status: value }));
  }

  function setPriority(value: PriorityFilter) {
    setFilters((prev) => ({ ...prev, priority: value }));
  }

  function setSort(value: SortOption) {
    setFilters((prev) => ({ ...prev, sort: value }));
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  // ── Derived: activeFilterCount ──────────────────────────────────────────────
  // Counts how many filter dimensions are non-default.
  // Recalculates only when `filters` changes (not on every render).
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim() !== "") count++;
    if (filters.status !== "all") count++;
    if (filters.priority !== "all") count++;
    // Sort is NOT counted — it's a display preference, not a data filter.
    return count;
  }, [filters]);

  // ── Derived: filteredTickets ────────────────────────────────────────────────
  // This is the heart of the hook. The pipeline is:
  //   1. Search  — substring match on title + description (case-insensitive)
  //   2. Status  — exact match; skipped when "all"
  //   3. Priority — exact match; skipped when "all"
  //   4. Sort    — determined by the SortOption string
  //
  // useMemo caches the result. React only re-runs this function when `tickets`
  // or `filters` changes — not on unrelated parent re-renders.
  //
  // We call .slice() before .sort() because Array.sort() mutates in place.
  // Mutating a derived array that shares references with the source array
  // would cause subtle, hard-to-trace bugs (the sorted order would "leak"
  // into the original context state).
  const filteredTickets = useMemo(() => {
    // ── Step 1: Search ──────────────────────────────────────────────────────
    const searchTerm = filters.search.trim().toLowerCase();

    let result = tickets.filter((ticket) => {
      // If no search term, every ticket passes this step.
      if (searchTerm === "") return true;

      // Check title first (most likely to match), then description.
      // toLowerCase() on both sides makes the comparison case-insensitive
      // without needing a regex or locale-specific collation.
      return (
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm)
      );
    });

    // ── Step 2: Status filter ───────────────────────────────────────────────
    if (filters.status !== "all") {
      result = result.filter((ticket) => ticket.status === filters.status);
    }

    // ── Step 3: Priority filter ─────────────────────────────────────────────
    if (filters.priority !== "all") {
      result = result.filter((ticket) => ticket.priority === filters.priority);
    }

    // ── Step 4: Sort ────────────────────────────────────────────────────────
    // .slice() creates a shallow copy so we don't mutate `result` in place.
    return result.slice().sort((a, b) => {
      switch (filters.sort) {
        case "createdAt_desc":
          // Newest first: larger (more recent) timestamp wins.
          // ISO 8601 strings sort correctly with localeCompare.
          return b.createdAt.localeCompare(a.createdAt);

        case "createdAt_asc":
          // Oldest first.
          return a.createdAt.localeCompare(b.createdAt);

        case "title_asc":
          // A → Z: standard alphabetical, case-insensitive.
          return a.title.toLowerCase().localeCompare(b.title.toLowerCase());

        case "title_desc":
          // Z → A.
          return b.title.toLowerCase().localeCompare(a.title.toLowerCase());

        case "priority_desc":
          // High → Low: subtract so higher weight (critical=4) sorts first.
          return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];

        case "priority_asc":
          // Low → High: reverse the subtraction.
          return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      }
    });
  }, [tickets, filters]);

  // ── Return ──────────────────────────────────────────────────────────────────
  return {
    filters,
    setSearch,
    setStatus,
    setPriority,
    setSort,
    resetFilters,
    filteredTickets,
    activeFilterCount,
  };
}
