"use client";

// =============================================================================
// DASHBOARD PAGE  —  /dashboard  (Step 12)
// =============================================================================
// This page is a pure ORCHESTRATOR — it:
//   1. Reads the full ticket list from TicketsContext (via useTickets)
//   2. Derives all statistics via useTicketAnalytics (useMemo, no side effects)
//   3. Renders the sections using presentational components
//
// This page contains NO arithmetic, NO filter logic, and NO formatting beyond
// the shared formatDate utility. All calculation responsibility lives in
// useTicketAnalytics; all rendering responsibility lives in the components.
//
// REACTIVITY:
//   Because tickets[] comes from TicketsContext (backed by useReducer), any
//   ADD_TICKET / UPDATE_TICKET / DELETE_TICKET action immediately updates the
//   context, which re-renders this page, which causes useTicketAnalytics to
//   recompute its memos — all statistics reflect the live state instantly.
// =============================================================================

import Link from "next/link";
import { useTickets } from "@/hooks/useTickets";
import { useTicketAnalytics, UNASSIGNED_LABEL } from "@/hooks/useTicketAnalytics";
import { formatDate } from "@/lib/format";
import DashboardStatCard from "@/components/DashboardStatCard";
import DashboardSection from "@/components/DashboardSection";
import StatusBadge from "@/components/StatusBadge";
import Skeleton from "@/components/Skeleton";

export default function DashboardPage() {
  // ── Data ────────────────────────────────────────────────────────────────────
  const { tickets, isLoading } = useTickets();
  const {
    totalCount,
    openCount,
    inProgressCount,
    resolvedCount,
    closedCount,
    criticalCount,
    categoryBreakdown,
    assigneeBreakdown,
    recentTickets,
  } = useTicketAnalytics(tickets);

  // ── Skeleton loading state ───────────────────────────────────────────────────
  // Shown while the LOAD useEffect reads localStorage. Mirrors the real layout
  // so there is no CLS (Cumulative Layout Shift) when real data arrives.
  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header placeholder */}
        <div className="mb-6">
          <Skeleton height="h-7" width="w-32" className="mb-2" />
          <Skeleton height="h-4" width="w-64" />
        </div>

        {/* Stat cards grid — 6 cards matching the real Overview section */}
        <DashboardSection title="Overview" subtitle="Loading…">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <Skeleton height="h-3.5" width="w-24" className="mb-3" />
                <Skeleton height="h-8" width="w-12" />
              </div>
            ))}
          </div>
        </DashboardSection>

        {/* Category + Assignee breakdown placeholders */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {["By Category", "By Assignee"].map((title) => (
            <DashboardSection key={title} title={title} subtitle="Loading…">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton height="h-4" width="w-28" />
                    <Skeleton height="h-4" width="w-6" />
                  </div>
                ))}
              </div>
            </DashboardSection>
          ))}
        </div>

        {/* Recent activity placeholder */}
        <DashboardSection title="Recent Activity" subtitle="Loading…">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton height="h-4" width="w-16" />
                <Skeleton height="h-4" width="w-full" />
                <Skeleton height="h-4" width="w-14" />
              </div>
            ))}
          </div>
        </DashboardSection>
      </main>
    );
  }

  // ── Sorted breakdown entries ────────────────────────────────────────────────
  // Object.entries gives [key, count] pairs. We sort descending by count so
  // the most active categories / assignees appear first. This is done here
  // (not in the hook) because sort order is a display concern, not an
  // analytics concern.
  const sortedCategories = Object.entries(categoryBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  const sortedAssignees = Object.entries(assigneeBreakdown).sort(
    ([keyA, a], [keyB, b]) => {
      // Always push "Unassigned" to the bottom, regardless of count.
      if (keyA === UNASSIGNED_LABEL) return 1;
      if (keyB === UNASSIGNED_LABEL) return -1;
      return b - a;
    }
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live overview of all {totalCount} ticket{totalCount !== 1 ? "s" : ""} in the system.
        </p>
      </div>

      {/* ── Section 1: Statistics Cards ─────────────────────────────────────── */}
      <DashboardSection
        title="Overview"
        subtitle="Counts update immediately when tickets are created, edited, or deleted."
      >
        {/*
          Six cards in a responsive grid.
          sm:grid-cols-2  → two columns on tablet
          lg:grid-cols-3  → three columns on desktop
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardStatCard
            label="Total Tickets"
            count={totalCount}
            accent="default"
          />
          <DashboardStatCard
            label="Open"
            count={openCount}
            accent="blue"
          />
          <DashboardStatCard
            label="In Progress"
            count={inProgressCount}
            accent="amber"
          />
          <DashboardStatCard
            label="Resolved"
            count={resolvedCount}
            accent="green"
          />
          <DashboardStatCard
            label="Closed"
            count={closedCount}
            accent="gray"
          />
          <DashboardStatCard
            label="Critical Priority"
            count={criticalCount}
            accent="red"
          />
        </div>
      </DashboardSection>

      {/* ── Sections 2 & 3 side by side on wider screens ────────────────────── */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Section 2: Category Breakdown ─────────────────────────────────── */}
        <DashboardSection
          title="By Category"
          subtitle="Tickets grouped by their category field."
        >
          {sortedCategories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories found.</p>
          ) : (
            <ul className="space-y-2">
              {sortedCategories.map(([category, count]) => (
                <li
                  key={category}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>

        {/* ── Section 3: Assignee Breakdown ─────────────────────────────────── */}
        <DashboardSection
          title="By Assignee"
          subtitle="Tickets grouped by who they are assigned to."
        >
          {sortedAssignees.length === 0 ? (
            <p className="text-sm text-gray-400">No tickets found.</p>
          ) : (
            <ul className="space-y-2">
              {sortedAssignees.map(([assignee, count]) => (
                <li
                  key={assignee}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span
                    className={`text-sm ${
                      assignee === UNASSIGNED_LABEL
                        ? "text-gray-400 italic"
                        : "text-gray-700"
                    }`}
                  >
                    {assignee}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>

      </div>

      {/* ── Section 4: Recent Activity ───────────────────────────────────────── */}
      <DashboardSection
        title="Recent Activity"
        subtitle={`The ${recentTickets.length} most recently updated tickets.`}
      >
        {recentTickets.length === 0 ? (
          <p className="text-sm text-gray-400">No tickets yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentTickets.map((ticket) => (
              /*
                Each row is a Link so the user can click directly to the detail
                page. Using a <li> + <Link> mirrors the pattern in TicketCard.
              */
              <li key={ticket.id}>
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="flex items-center gap-4 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-md transition-colors"
                >
                  {/* Ticket ID — monospaced for visual alignment */}
                  <span className="text-xs font-mono text-gray-400 w-20 shrink-0">
                    {ticket.id}
                  </span>

                  {/* Title — truncated if too long */}
                  <span className="flex-1 text-sm text-gray-800 truncate">
                    {ticket.title}
                  </span>

                  {/* Status badge — reuses the same component as the list/detail */}
                  <StatusBadge status={ticket.status} />

                  {/* Updated date */}
                  <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                    {formatDate(ticket.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

    </main>
  );
}
