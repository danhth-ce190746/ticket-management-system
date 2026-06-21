"use client";

// =============================================================================
// CREATE TICKET PAGE  —  /tickets/create
// =============================================================================
// Step 8 changes:
//   1. Calls createTicket() from TicketsContext instead of console.log().
//   2. Uses TicketStatus / TicketPriority constants for select values.
//   3. Redirects to /tickets after submit.
//   4. createdBy is hardcoded as "admin" — auth not yet implemented.
//
// Step 10 refactor:
//   The six field <div> blocks have been extracted into <TicketFormFields>
//   to avoid duplication with the new edit form. Zero behaviour changes —
//   this page works exactly as before, just with much less JSX.
// =============================================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { TicketStatus, TicketPriority } from "@/types/ticket";
import TicketFormFields from "@/components/TicketFormFields";

export default function CreateTicketPage() {
  const router = useRouter();
  const { createTicket } = useTickets();

  // ── Controlled form state ──────────────────────────────────────────────────
  // Default values for a new ticket. These are all empty / sensible defaults —
  // the edit form uses the ticket's CURRENT values instead (pre-filled).
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>(TicketPriority.MEDIUM);
  const [status, setStatus] = useState<string>(TicketStatus.OPEN);
  const [category, setCategory] = useState("Authentication");
  const [assignedTo, setAssignedTo] = useState("");

  // ── Submit handler ─────────────────────────────────────────────────────────
  // 1. Prevent the default form POST.
  // 2. Call createTicket() — dispatches ADD_TICKET to the reducer.
  // 3. Redirect to /tickets so the new ticket is immediately visible.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    createTicket({
      title: title.trim(),
      description: description.trim(),
      priority: priority as typeof TicketPriority[keyof typeof TicketPriority],
      status: status as typeof TicketStatus[keyof typeof TicketStatus],
      category,
      assignedTo: assignedTo || undefined,
      // Hardcoded until authentication is added in a future step.
      createdBy: "admin",
    });

    router.push("/tickets");
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Create New Ticket</h1>
      <p className="text-sm text-gray-500 mb-8">
        Fill in the details below. Required fields are marked with *.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/*
          <TicketFormFields> renders the six shared field groups.
          Passing controlled state + setters down keeps this page as the
          single owner of form state while the component handles markup.
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

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Ticket
          </button>

          <button
            type="button"
            onClick={() => router.push("/tickets")}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

      </form>
    </main>
  );
}