// =============================================================================
// ErrorCard COMPONENT  (Step 15)
// =============================================================================
// A reusable card for displaying errors or empty states.
//
// PROPS:
//   title   — Short heading, e.g. "Not Found", "Something went wrong"
//   message — Explanatory body text shown below the title
//
// DESIGN:
//   Styled to match the existing card pattern (white bg, border, rounded-lg,
//   shadow-sm). Uses a red left-border accent to signal an error state
//   at a glance. Intentionally has no icon dependency — text alone is
//   sufficient for the scale of this app.
//
// USAGE EXAMPLES:
//   <ErrorCard title="Ticket not found" message="No ticket exists with this ID." />
//   <ErrorCard title="Something went wrong" message="Please try again." />
// =============================================================================

interface ErrorCardProps {
  title: string;
  message: string;
}

export default function ErrorCard({ title, message }: ErrorCardProps) {
  return (
    <div
      role="alert"
      className="border border-red-200 border-l-4 border-l-red-500 rounded-lg p-5 bg-white shadow-sm"
    >
      <p className="text-sm font-semibold text-red-700 mb-1">{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
    </div>
  );
}
