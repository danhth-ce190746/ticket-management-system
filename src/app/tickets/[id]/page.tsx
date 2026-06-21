"use client";

// =============================================================================
// TICKET DETAIL PAGE  —  /tickets/[id]
// =============================================================================
// Step 8 changes:
//   - Converted from Server Component to Client Component.
//   - Reads from useTickets() context (finds newly created tickets).
//   - Uses shared formatDate() from src/lib/format.ts.
//
// Step 10 additions:
//   - "Edit Ticket" button → navigates to /tickets/[id]/edit.
//   - "Delete Ticket" button → shows an inline two-step confirmation.
//     confirmDelete state is a simple boolean:
//       false → show "Delete Ticket" button
//       true  → show "Are you sure?" + Confirm / Cancel buttons
//     On confirm: deleteTicket(id) + router.push("/tickets")
//     On cancel:  confirmDelete = false (prompt disappears, no action taken)
//
// WHY INLINE CONFIRMATION (not a modal)?
//   A modal requires focus trapping, escape-key handling, scroll locking, and
//   aria attributes. All of that complexity for a single yes/no question is
//   disproportionate. A two-button inline confirmation is simpler, equally
//   accessible, and just as safe against accidental clicks (two separate clicks
//   are required to delete).
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";

export default function TicketDetailPage() {
  const router = useRouter();

  // useParams() returns a plain object — no await needed in client components.
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { tickets, deleteTicket, addComment } = useTickets();
  const ticket = tickets.find((t) => t.id === id);

  // Step 10: drives the inline delete confirmation UI.
  // false = show "Delete Ticket" button
  // true  = show "Are you sure?" prompt with Confirm + Cancel
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ── Ticket not found ───────────────────────────────────────────────────────
  if (!ticket) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Ticket not found
        </h1>

        <p className="text-gray-600 mb-6">
          No ticket exists with ID: <span className="font-mono">{id}</span>
        </p>

        <Link
          href="/tickets"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to tickets
        </Link>
      </main>
    );
  }

  // ── Delete handler ─────────────────────────────────────────────────────────
  function handleDelete() {
    
    // Redirect to the list immediately — the ticket no longer exists in context
    // so staying on this URL would show the "Ticket not found" state.
    router.push("/tickets");
    deleteTicket(id);
  }

  // ── Ticket found ───────────────────────────────────────────────────────────
  return (
    <main className="max-w-4xl mx-auto p-8">

      <Link
        href="/tickets"
        className="text-blue-600 hover:underline text-sm"
      >
        ← Back to tickets
      </Link>

      <div className="mt-6 border border-gray-200 rounded-lg p-6 shadow-sm bg-white">

        {/* ── Ticket ID ───────────────────────────────────────────────────── */}
        <p className="text-xs font-mono text-gray-400">
          {ticket.id}
        </p>

        {/* ── Title + Action buttons ───────────────────────────────────────── */}
        {/*
          The title and action buttons share a row at the top of the card.
          Buttons are right-aligned. This mirrors the pattern used in most
          issue trackers (GitHub Issues, Linear, Jira).
        */}
        <div className="flex items-start justify-between gap-4 mt-2">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug">
            {ticket.title}
          </h1>

          {/* ── Edit / Delete actions ──────────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Edit button — always visible */}
            <Link
              href={`/tickets/${ticket.id}/edit`}
              className="text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit
            </Link>

            {/* Delete — two-step inline confirmation */}
            {!confirmDelete ? (
              // Step 1: Show the "Delete" button
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-sm font-medium px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            ) : (
              // Step 2: Show the confirmation prompt inline
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-600">
                  Are you sure? This action cannot be undone.
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm font-semibold px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Badges ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mt-4">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          {ticket.category && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {ticket.category}
            </span>
          )}
        </div>

        {/* ── Description ─────────────────────────────────────────────────── */}
        <p className="mt-6 text-gray-700 leading-relaxed text-sm">
          {ticket.description}
        </p>

        {/* ── Tags ────────────────────────────────────────────────────────── */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {ticket.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Metadata ────────────────────────────────────────────────────────── */}
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium text-gray-500 block mb-0.5">Created by</span>
            {ticket.createdBy}
          </div>

          <div>
            <span className="font-medium text-gray-500 block mb-0.5">Assigned to</span>
            {ticket.assignedTo ?? "Unassigned"}
          </div>

          <div>
            <span className="font-medium text-gray-500 block mb-0.5">Created</span>
            {formatDate(ticket.createdAt)}
          </div>

          <div>
            <span className="font-medium text-gray-500 block mb-0.5">Last updated</span>
            {formatDate(ticket.updatedAt)}
          </div>
        </div>

        {/* ── Comments section (Step 14) ─────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Comments ({(ticket.comments ?? []).length})
          </h2>

          {/*
            CommentList: purely presentational — receives the comments array.
            Falls back to an empty array so the component never receives undefined.
          */}
          <CommentList comments={ticket.comments ?? []} />

          {/*
            CommentForm: calls addComment(ticketId, content) on submit.
            The form owns its own draft state — the page just wires the callback.
          */}
          <CommentForm
            onSubmit={(content) => addComment(ticket.id, content)}
          />
        </div>

      </div>

    </main>
  );
}