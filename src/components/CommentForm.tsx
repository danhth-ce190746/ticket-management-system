// =============================================================================
// CommentForm COMPONENT  (Step 14)
// =============================================================================
// Renders the "Add Comment" input + button for a ticket.
//
// DESIGN:
//   • Controlled input (useState) — the component owns its own draft text.
//   • Validation: trims whitespace, blocks empty submission.
//   • On successful submit: clears the input so the user can type a new comment.
//   • Receives onSubmit(content: string) as a prop — callers decide what to
//     do with the comment text (dispatch, API call, etc.). This keeps the
//     component reusable and independently testable.
//
// STYLING: mirrors existing form elements (INPUT_CLASS from TicketFormFields).
// =============================================================================

import { useState } from "react";

interface CommentFormProps {
  // Called with the trimmed, non-empty comment text when the user submits.
  onSubmit: (content: string) => void;
}

const INPUT_CLASS =
  "w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none";

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [draft, setDraft] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = draft.trim();

    // Validation: do not allow empty or whitespace-only comments.
    if (!trimmed) return;

    onSubmit(trimmed);

    // Reset the textarea after a successful submit.
    setDraft("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      {/* ── Textarea ────────────────────────────────────────────────────────── */}
      <textarea
        id="comment-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Write a comment…"
        rows={3}
        className={INPUT_CLASS}
        aria-label="Comment text"
      />

      {/* ── Submit ──────────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={!draft.trim()}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Add Comment
      </button>
    </form>
  );
}
