// =============================================================================
// CommentList COMPONENT  (Step 14)
// =============================================================================
// Renders the list of comments on a ticket detail page.
//
// PRESENTATIONAL ONLY: receives comments as a prop, renders them.
// All data fetching and action dispatching belongs in the parent (detail page).
//
// DISPLAY ORDER: comments are shown in the order they arrive — the reducer
// prepends new comments, so the list is newest-first by default.
//
// EMPTY STATE: when there are no comments, shows a neutral prompt rather
// than a blank space, so users know the section is intentional.
// =============================================================================

import { Comment } from "@/types/ticket";
import { formatDate } from "@/lib/format";

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-2">
        No comments yet. Be the first to add one.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li
          key={comment.id}
          className="bg-gray-50 border border-gray-100 rounded-lg p-4"
        >
          {/* ── Author + timestamp ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">
              {comment.author}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* ── Comment body ───────────────────────────────────────────────── */}
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        </li>
      ))}
    </ul>
  );
}
