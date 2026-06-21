// =============================================================================
// PriorityBadge COMPONENT
// =============================================================================
// Same pattern as StatusBadge — one job, one file, one source of truth for
// priority colour logic. The two badge components are intentionally kept
// separate (not merged into one generic "Badge") because:
//   • Status and Priority have different colour palettes and different types.
//   • If the Priority badge later needs an icon (e.g. a flame for CRITICAL),
//     we only change this file without touching StatusBadge.
//   • Small, single-purpose files are easier to read, test, and maintain.
// =============================================================================

import { TicketPriority } from "@/types/ticket";

// =============================================================================
// PROPS INTERFACE
// =============================================================================

interface PriorityBadgeProps {
  priority: TicketPriority;
}

// =============================================================================
// HELPER — colour mapping
// =============================================================================

function getPriorityClasses(priority: TicketPriority): string {
  switch (priority) {
    case "low":      return "bg-green-100 text-green-700";
    case "medium":   return "bg-blue-100 text-blue-700";
    case "high":     return "bg-orange-100 text-orange-700";
    case "critical": return "bg-red-100 text-red-700";
  }
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityClasses(priority)}`}
    >
      {formatLabel(priority)}
    </span>
  );
}
