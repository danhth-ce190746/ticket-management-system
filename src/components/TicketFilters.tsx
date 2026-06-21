"use client";

// =============================================================================
// TicketFilters COMPONENT
// =============================================================================
// Renders the filter bar above the ticket list.
//
// This is a CONTROLLED, DUMB COMPONENT:
//   • "Controlled" — every input is driven by props (filter state from the hook).
//     It has no internal state.
//   • "Dumb" — it contains ZERO filtering logic. It only calls the setters
//     passed in from useTicketFilters. Logic lives in the hook; rendering lives
//     here. This separation makes both files easy to read and test in isolation.
//
// PROPS DESIGN:
//   Rather than accepting the whole TicketFiltersResult object as a single prop,
//   we destructure what we need. This makes the component's dependencies
//   explicit and allows future refactoring without touching the prop signature.
// =============================================================================

// Pure types — only needed for type annotations (props interface).
// "import type" ensures these are erased at compile time and never bundled.
import type {
  TicketFilters as TicketFiltersState,
  StatusFilter,
  PriorityFilter,
  SortOption,
} from "@/types/ticket";

// Runtime values — TicketStatus and TicketPriority are const objects used
// in JSX <option value={TicketStatus.OPEN}> expressions. They cannot be
// imported with "import type" because they must exist at runtime.
import { TicketStatus, TicketPriority } from "@/types/ticket";

// =============================================================================
// PROPS
// =============================================================================

interface TicketFiltersProps {
  filters: TicketFiltersState;

  // Individual setters from useTicketFilters
  setSearch: (value: string) => void;
  setStatus: (value: StatusFilter) => void;
  setPriority: (value: PriorityFilter) => void;
  setSort: (value: SortOption) => void;
  resetFilters: () => void;

  // Counts for the result summary line
  totalCount: number;     // total tickets (unfiltered)
  filteredCount: number;  // tickets after applying filters
  activeFilterCount: number;
}

// =============================================================================
// SHARED STYLES
// =============================================================================
// Defined once here so every <select> and <input> is visually consistent.
// Changing the look of all controls means editing one string.
// =============================================================================

const INPUT_CLASS =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent " +
  "transition-colors";

// =============================================================================
// COMPONENT
// =============================================================================

export default function TicketFilters({
  filters,
  setSearch,
  setStatus,
  setPriority,
  setSort,
  resetFilters,
  totalCount,
  filteredCount,
  activeFilterCount,
}: TicketFiltersProps) {

  const isFiltered = activeFilterCount > 0;

  return (
    <div className="mb-6 space-y-3">

      {/* ── Row 1: Search ───────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Search icon — purely decorative, referenced via aria-hidden */}
        <span
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none select-none"
        >
          🔍
        </span>

        <input
          id="ticket-search"
          type="text"
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tickets by title or description…"
          aria-label="Search tickets"
          className={`${INPUT_CLASS} pl-9`}
        />

        {/* Inline clear button — only shown when search is non-empty */}
        {filters.search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Row 2: Status / Priority / Sort selects ─────────────────────────── */}
      <div className="flex flex-wrap gap-2">

        {/* Status filter */}
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filter by status"
          className={`${INPUT_CLASS} flex-1 min-w-[140px]`}
        >
          <option value="all">All Statuses</option>
          {/*
            Values come from TicketStatus — the same constants used everywhere
            else. Changing a status value in ticket.ts is automatically reflected
            here, with no string literals to hunt down.
          */}
          <option value={TicketStatus.OPEN}>Open</option>
          <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
          <option value={TicketStatus.RESOLVED}>Resolved</option>
          <option value={TicketStatus.CLOSED}>Closed</option>
        </select>

        {/* Priority filter */}
        <select
          id="filter-priority"
          value={filters.priority}
          onChange={(e) => setPriority(e.target.value as PriorityFilter)}
          aria-label="Filter by priority"
          className={`${INPUT_CLASS} flex-1 min-w-[150px]`}
        >
          <option value="all">All Priorities</option>
          <option value={TicketPriority.CRITICAL}>Critical</option>
          <option value={TicketPriority.HIGH}>High</option>
          <option value={TicketPriority.MEDIUM}>Medium</option>
          <option value={TicketPriority.LOW}>Low</option>
        </select>

        {/* Sort order */}
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          aria-label="Sort tickets"
          className={`${INPUT_CLASS} flex-1 min-w-[180px]`}
        >
          {/*
            Each option value matches a SortOption literal from ticket.ts.
            The label describes the user-facing intent; the value encodes the
            implementation detail (field + direction).
          */}
          <option value="createdAt_desc">Newest first</option>
          <option value="createdAt_asc">Oldest first</option>
          <option value="title_asc">Title A → Z</option>
          <option value="title_desc">Title Z → A</option>
          <option value="priority_desc">Priority: High → Low</option>
          <option value="priority_asc">Priority: Low → High</option>
        </select>

      </div>

      {/* ── Row 3: Result summary + Clear button ────────────────────────────── */}
      <div className="flex items-center justify-between text-sm">

        {/* Result count — changes based on whether filters are active */}
        <p className="text-gray-500">
          {isFiltered ? (
            <>
              Showing{" "}
              <span className="font-medium text-gray-700">{filteredCount}</span>
              {" "}of{" "}
              <span className="font-medium text-gray-700">{totalCount}</span>
              {" "}ticket{totalCount !== 1 ? "s" : ""}
              {" "}
              {/* Active filter count badge */}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active
              </span>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-700">{totalCount}</span>
              {" "}ticket{totalCount !== 1 ? "s" : ""} total
            </>
          )}
        </p>

        {/* Clear all filters — only visible when at least one filter is active */}
        {isFiltered && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}

      </div>

    </div>
  );
}
