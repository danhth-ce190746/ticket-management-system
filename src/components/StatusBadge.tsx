// =============================================================================
// StatusBadge COMPONENT
// =============================================================================
// A small, focused component with one job: display a ticket's status as a
// coloured pill badge.
//
// WHY A SEPARATE COMPONENT?
//   Before refactoring, the status colour logic lived inside page.tsx. That
//   meant if we ever wanted to show a status badge on the ticket detail page,
//   or in a sidebar, we would have to copy-paste the same logic there too.
//   Extracting it into its own component means we write the logic ONCE and
//   reuse it anywhere by just writing <StatusBadge status={ticket.status} />.
// =============================================================================

import { TicketStatus } from "@/types/ticket";

// =============================================================================
// PROPS INTERFACE
// =============================================================================
// "Props" is short for "properties" — they are the inputs a component receives
// from its parent, similar to function arguments.
//
// We define a TypeScript interface for props so that:
//   1. TypeScript will catch mistakes at compile time (e.g. passing a number
//      where a TicketStatus string is expected).
//   2. Any developer reading this file immediately knows what the component
//      needs without reading the implementation.
//
// Rule of thumb: every component that accepts inputs should have a Props
// interface, even if it only has one field.
// =============================================================================

interface StatusBadgeProps {
  status: TicketStatus;
}

// =============================================================================
// HELPER — colour mapping
// =============================================================================
// This logic was previously in page.tsx. Now it lives right next to the
// component that uses it. If the status colours ever change, there is exactly
// ONE place to edit.
// =============================================================================

function getStatusClasses(status: TicketStatus): string {
  switch (status) {
    case "open":        return "bg-blue-100 text-blue-800";
    case "in_progress": return "bg-yellow-100 text-yellow-800";
    case "resolved":    return "bg-green-100 text-green-800";
    case "closed":      return "bg-gray-100 text-gray-600";
  }
}

// Converts "in_progress" → "In Progress", "open" → "Open", etc.
function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// =============================================================================
// COMPONENT
// =============================================================================
// Destructuring in the function signature:
//   ({ status }: StatusBadgeProps)
// is shorthand for:
//   (props: StatusBadgeProps) and then const status = props.status;
//
// It's the most common way to receive props in modern React — clean and direct.
// =============================================================================

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClasses(status)}`}
    >
      {formatLabel(status)}
    </span>
  );
}
