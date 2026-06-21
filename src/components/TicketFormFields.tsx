// =============================================================================
// TicketFormFields COMPONENT
// =============================================================================
// Renders the six shared field groups used by both the Create and Edit forms:
//   Title, Description, Priority, Status, Category, Assigned To
//
// WHY THIS COMPONENT EXISTS:
//   The create form and the edit form need identical fields. Without this
//   component, any change to a label, option list, or CSS class would need
//   to be applied in two separate files. One file to update = one place to
//   make mistakes.
//
// WHAT THIS COMPONENT DOES NOT DO:
//   • No submit button — the parent page owns the submit action and label
//     ("Create Ticket" vs "Save Changes").
//   • No page heading or layout wrapper — those differ between pages.
//   • No form validation beyond the "required" HTML attribute — the browser
//     handles this and it is consistent across both forms.
//   • No submit handler — fully controlled; the parent passes state + setters.
//
// PATTERN: Controlled, Dumb Component
//   Every input is driven by props (value + setter). This component has no
//   internal state. It is a pure function of its props, identical to how
//   <TicketFilters> was designed in Step 9.
// =============================================================================

import { TicketStatus, TicketPriority } from "@/types/ticket";

// =============================================================================
// PROPS
// =============================================================================
// Each field is a value + setter pair — the standard React controlled input
// pattern. We use plain `string` types for the select values because the
// parent pages cast them to the typed constants at submit time, keeping this
// component free of type-assertion complexity.
// =============================================================================

export interface TicketFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;

  description: string;
  setDescription: (value: string) => void;

  priority: string;
  setPriority: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  assignedTo: string;
  setAssignedTo: (value: string) => void;
}

// =============================================================================
// SHARED STYLES
// =============================================================================

const LABEL_CLASS = "block mb-2 text-sm font-medium text-gray-700";
const INPUT_CLASS =
  "w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const SELECT_CLASS =
  "w-full border border-gray-300 rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

// =============================================================================
// COMPONENT
// =============================================================================

export default function TicketFormFields({
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  status,
  setStatus,
  category,
  setCategory,
  assignedTo,
  setAssignedTo,
}: TicketFormFieldsProps) {
  return (
    <>
      {/* ── Title ──────────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="title" className={LABEL_CLASS}>
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter ticket title..."
          className={INPUT_CLASS}
          required
        />
      </div>

      {/* ── Description ────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="description" className={LABEL_CLASS}>
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          className={`${INPUT_CLASS} h-32 resize-none`}
          required
        />
      </div>

      {/* ── Priority ───────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="priority" className={LABEL_CLASS}>
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={SELECT_CLASS}
        >
          {/*
            Values come from TicketPriority — the same constants used
            everywhere else. A typo here is a compile-time error, not a
            silent runtime mismatch.
          */}
          <option value={TicketPriority.LOW}>Low</option>
          <option value={TicketPriority.MEDIUM}>Medium</option>
          <option value={TicketPriority.HIGH}>High</option>
          <option value={TicketPriority.CRITICAL}>Critical</option>
        </select>
      </div>

      {/* ── Status ─────────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="status" className={LABEL_CLASS}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value={TicketStatus.OPEN}>Open</option>
          <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
          <option value={TicketStatus.RESOLVED}>Resolved</option>
          <option value={TicketStatus.CLOSED}>Closed</option>
        </select>
      </div>

      {/* ── Category ───────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="category" className={LABEL_CLASS}>
          Category
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={SELECT_CLASS}
        >
          <option>Authentication</option>
          <option>Payments</option>
          <option>Reporting</option>
          <option>UI / UX</option>
          <option>Performance</option>
          <option>Infrastructure</option>
          <option>API</option>
          <option>Search</option>
          <option>Onboarding</option>
        </select>
      </div>

      {/* ── Assigned To ────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="assignedTo" className={LABEL_CLASS}>
          Assigned To
        </label>
        <select
          id="assignedTo"
          name="assignedTo"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Unassigned</option>
          <option value="alice.morgan">Alice Morgan</option>
          <option value="bob.chan">Bob Chan</option>
          <option value="carol.santos">Carol Santos</option>
          <option value="david.okafor">David Okafor</option>
          <option value="eva.lindqvist">Eva Lindqvist</option>
        </select>
      </div>
    </>
  );
}
