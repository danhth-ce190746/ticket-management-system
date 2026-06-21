"use client";

// =============================================================================
// EDIT TICKET PAGE  —  /tickets/[id]/edit
// =============================================================================
// Allows the user to update any editable field on an existing ticket.
//
// KEY DIFFERENCES from the create form:
//
//   1. PRE-FILLED STATE
//      All useState initializers use the existing ticket's current values
//      (e.g. useState(ticket.title) not useState("")). The user sees what
//      the ticket currently says and can change only what they need to.
//
//   2. updateTicket(), NOT createTicket()
//      On submit we call updateTicket(id, changes) from TicketsContext.
//      The reducer handles merging the changes into the existing ticket and
//      stamping updatedAt — this page does not touch timestamps.
//
//   3. REDIRECT TO DETAIL, not list
//      After saving, we go to /tickets/[id] so the user can immediately
//      see the updated ticket with its new values. Going to the list would
//      make it harder to verify the change.
//
//   4. READ-ONLY: id, createdAt, createdBy
//      These fields are never editable — the form does not render inputs
//      for them. UpdateTicketInput (defined in ticket.ts) does not include
//      them, so TypeScript prevents accidental writes.
//
// ROUTE PARAMS:
//   In a Client Component, use useParams() — not async props.params.
//   This was established in Step 8 when the detail page was converted.
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { TicketStatus, TicketPriority } from "@/types/ticket";
import type { UpdateTicketInput } from "@/types/ticket";
import TicketFormFields from "@/components/TicketFormFields";
import Link from "next/link";

export default function EditTicketPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const { tickets, updateTicket } = useTickets();
  const ticket = tickets.find((t) => t.id === id);

  // ── Controlled form state — pre-filled from the existing ticket ────────────
  // We initialise every field from the ticket's current value so the user
  // sees what already exists and only needs to change what's wrong.
  //
  // These hooks are declared unconditionally (before the null-guard below)
  // because React requires hooks to be called in the same order on every
  // render. The values will be overwritten once the ticket is found.
  //
  // When ticket is undefined (not found), we use safe fallback strings.
  // The null-guard return below ensures these values are never used in that
  // case — TypeScript narrows ticket to Ticket after the guard.
  const [title, setTitle] = useState(ticket?.title ?? "");
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [priority, setPriority] = useState<string>(ticket?.priority ?? TicketPriority.MEDIUM);
  const [status, setStatus] = useState<string>(ticket?.status ?? TicketStatus.OPEN);
  const [category, setCategory] = useState(ticket?.category ?? "Authentication");
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo ?? "");

  // ── Ticket not found guard ─────────────────────────────────────────────────
  // Render an error state if the ID doesn't match any ticket.
  // This can happen if: the URL is typed manually, or the ticket was deleted
  // and the user navigated back using the browser's forward button.
  if (!ticket) {
    return (
      <main className="max-w-xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Ticket not found
        </h1>
        <p className="text-gray-600 mb-6">
          No ticket exists with ID: <span className="font-mono">{id}</span>
        </p>
        <Link href="/tickets" className="text-blue-600 hover:underline text-sm">
          ← Back to tickets
        </Link>
      </main>
    );
  }

  // ── Submit handler ─────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Build the changes object — only the fields the user can edit.
    // UpdateTicketInput is Partial<Pick<Ticket, ...>>, so all fields are
    // optional. We always send all six to keep the logic simple; the reducer
    // merges them into the existing ticket regardless.
    const changes: UpdateTicketInput = {
      title: title.trim(),
      description: description.trim(),
      priority: priority as typeof TicketPriority[keyof typeof TicketPriority],
      status: status as typeof TicketStatus[keyof typeof TicketStatus],
      category,
      assignedTo: assignedTo || undefined,
    };

    // Dispatch UPDATE_TICKET via the context wrapper.
    // The reducer merges `changes` into the ticket and sets updatedAt.
    updateTicket(id, changes);

    // Redirect to the detail page so the user can verify the changes.
    // We go to the detail page (not the list) because the user is in a
    // single-ticket context and should see the result of their edit.
    router.push(`/tickets/${id}`);
  }

  return (
    <main className="max-w-xl mx-auto p-8">

      {/* ── Back link ──────────────────────────────────────────────────────── */}
      <Link
        href={`/tickets/${id}`}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Back to ticket
      </Link>

      {/* ── Page heading ───────────────────────────────────────────────────── */}
      <h1 className="text-2xl font-bold mt-4 mb-1 text-gray-900">
        Edit Ticket
      </h1>
      <p className="text-xs font-mono text-gray-400 mb-6">
        {ticket.id}
      </p>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/*
          <TicketFormFields> renders the six shared field groups.
          All state + setters are passed down — this page owns the state,
          the component owns the markup.
        */}
        <TicketFormFields
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          priority={priority}
          setPriority={setPriority}
          status={status}
          setStatus={setStatus}
          category={category}
          setCategory={setCategory}
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
        />

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => router.push(`/tickets/${id}`)}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

      </form>
    </main>
  );
}
