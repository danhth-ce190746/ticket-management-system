// =============================================================================
// DashboardStatCard COMPONENT  (Step 12)
// =============================================================================
// Renders a single summary statistics card on the dashboard.
//
// PRESENTATIONAL ONLY:
//   This component has no logic, no state, no hooks. It receives a label,
//   a count, and a colour accent and renders them. All decisions about which
//   numbers to show and what they mean live in useTicketAnalytics and the
//   dashboard page — not here.
//
// ACCENT COLOURS:
//   Each card accepts an optional "accent" prop that selects a colour theme.
//   Using a union type (not a raw string) means misspellings are caught at
//   compile time. New accents can be added by extending the union and adding
//   a matching entry to ACCENT_STYLES.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

export type StatCardAccent =
  | "default"   // Neutral grey  — Total Tickets
  | "blue"      // Blue          — Open Tickets
  | "amber"     // Amber/yellow  — In Progress
  | "green"     // Green         — Resolved
  | "gray"      // Muted gray    — Closed
  | "red";      // Red           — Critical Priority

export interface DashboardStatCardProps {
  label: string;
  count: number;
  accent?: StatCardAccent;
}

// =============================================================================
// STYLE MAPS
// =============================================================================
// Centralised here so changing the colour of all "blue" cards is a one-liner.
// Using a lookup object (not a switch or inline ternaries) keeps the JSX clean.
// =============================================================================

const ACCENT_STYLES: Record<
  StatCardAccent,
  { card: string; count: string; dot: string }
> = {
  default: {
    card: "bg-white border-gray-200",
    count: "text-gray-900",
    dot: "bg-gray-400",
  },
  blue: {
    card: "bg-blue-50 border-blue-200",
    count: "text-blue-700",
    dot: "bg-blue-500",
  },
  amber: {
    card: "bg-amber-50 border-amber-200",
    count: "text-amber-700",
    dot: "bg-amber-500",
  },
  green: {
    card: "bg-green-50 border-green-200",
    count: "text-green-700",
    dot: "bg-green-500",
  },
  gray: {
    card: "bg-gray-50 border-gray-200",
    count: "text-gray-600",
    dot: "bg-gray-400",
  },
  red: {
    card: "bg-red-50 border-red-200",
    count: "text-red-700",
    dot: "bg-red-500",
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function DashboardStatCard({
  label,
  count,
  accent = "default",
}: DashboardStatCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={`rounded-lg border p-5 flex flex-col gap-2 ${styles.card}`}
    >
      {/* ── Accent dot + label ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`inline-block w-2 h-2 rounded-full shrink-0 ${styles.dot}`}
        />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* ── Count ───────────────────────────────────────────────────────────── */}
      <p className={`text-3xl font-bold leading-none ${styles.count}`}>
        {count}
      </p>
    </div>
  );
}
