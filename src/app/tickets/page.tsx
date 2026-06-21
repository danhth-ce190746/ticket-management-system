"use client";

// =============================================================================
// TICKET LIST PAGE  —  /tickets
// =============================================================================
// This page is the ORCHESTRATOR for the ticket list feature. It:
//   1. Reads the full tickets array from TicketsContext (Step 8)
//   2. Passes it to useTicketFilters to get the filtered/sorted result (Step 9)
//   3. Renders <TicketFilters> (controls) and the filtered <TicketCard> list
//
// The page implements NO filtering logic and NO display logic for individual
// tickets. Those concerns live in their respective files:
//   • useTicketFilters (src/hooks) → all filter + sort computation
//   • TicketFilters   (src/components) → filter bar UI
//   • TicketCard      (src/components) → individual ticket card UI
// =============================================================================

import { useTickets } from "@/hooks/useTickets";
import { useTicketFilters } from "@/hooks/useTicketFilters";
import TicketCard from "@/components/TicketCard";
import TicketFilters from "@/components/TicketFilters";
import TicketCardSkeleton from "@/components/TicketCardSkeleton";
import ErrorCard from "@/components/ErrorCard";

export default function TicketsPage() {
  // ── Step 8: Full ticket list from context ──────────────────────────────────
  const { tickets, isLoading } = useTickets();

  // ── Step 9: Filter / sort state + derived result ───────────────────────────
  // useTicketFilters takes the full list and returns everything the filter
  // bar and the list need. The page just connects them — no logic here.
  const {
    filters,
    setSearch,
    setStatus,
    setPriority,
    setSort,
    resetFilters,
    filteredTickets,
    activeFilterCount,
  } = useTicketFilters(tickets);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────────────── */}
      {/*
        All filter state and setters come from the hook above.
        totalCount / filteredCount are passed so the component can render
        "Showing X of Y tickets" without needing to know about tickets itself.
      */}
      <TicketFilters
        filters={filters}
        setSearch={setSearch}
        setStatus={setStatus}
        setPriority={setPriority}
        setSort={setSort}
        resetFilters={resetFilters}
        totalCount={tickets.length}
        filteredCount={filteredTickets.length}
        activeFilterCount={activeFilterCount}
      />

      {/* ── Ticket List ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        // Show 5 skeleton cards while localStorage is being read.
        // Using a fixed count (not tickets.length) because we don't know the
        // real count yet. 5 is a reasonable viewport-filling estimate.
        <ul className="space-y-4" aria-label="Loading tickets">
          {Array.from({ length: 5 }).map((_, i) => (
            <TicketCardSkeleton key={i} />
          ))}
        </ul>
      ) : tickets.length === 0 ? (
        // No tickets exist at all (empty context state)
        <ErrorCard
          title="No tickets yet"
          message="Create your first ticket using the + New Ticket button above."
        />
      ) : filteredTickets.length === 0 ? (
        // Tickets exist but none match the current filters
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm mb-2">
            No tickets match your current filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </ul>
      )}

    </main>
  );
}
