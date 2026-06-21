// =============================================================================
// TicketCard COMPONENT
// =============================================================================
// Renders the complete visual card for a single ticket.
//
// This component sits in the MIDDLE of the component tree:
//   page.tsx (owns the list of tickets)
//     └── TicketCard (owns how ONE ticket looks)
//           ├── StatusBadge (owns how the status pill looks)
//           └── PriorityBadge (owns how the priority pill looks)
//
// Step 8 changes:
//   1. formatDate was extracted to src/lib/format.ts (it's now needed in
//      the detail page too). We import it instead of defining it locally.
//      This follows the rule from the original comment: "If we ever need it
//      elsewhere, we move it to src/lib/format.ts."
//   2. The <li> is now wrapped in a <Link> so clicking the card navigates
//      to the ticket detail page (/tickets/[id]).
// =============================================================================

import Link from "next/link";
import { Ticket } from "@/types/ticket";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { formatDate } from "@/lib/format";

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface TicketCardProps {
  ticket: Ticket;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function TicketCard({ ticket }: TicketCardProps) {
  return (
    // The outer element is a <li> because TicketCard is always rendered inside
    // a <ul> — semantically correct for screen readers.
    // The inner <Link> turns the whole card into a clickable navigation target.
    <li>
      <Link
        href={`/tickets/${ticket.id}`}
        className="block border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
      >

        {/* ── Top row: ID + Badges ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {/* Ticket ID */}
          <span className="text-xs font-mono text-gray-400">
            {ticket.id}
          </span>

          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />

          {/* Category badge — optional field, only shown when present */}
          {ticket.category && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {ticket.category}
            </span>
          )}
        </div>

        {/* ── Title ────────────────────────────────────────────────────────── */}
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          {ticket.title}
        </h2>

        {/* ── Description preview (clamped to 2 lines) ─────────────────────── */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {ticket.description}
        </p>

        {/* ── Footer: assignee + created date ──────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 pt-3 border-t border-gray-100">
          <span>
            <span className="font-medium text-gray-500">Assigned to: </span>
            {ticket.assignedTo ?? "Unassigned"}
          </span>
          <span>Created {formatDate(ticket.createdAt)}</span>
        </div>

      </Link>
    </li>
  );
}
