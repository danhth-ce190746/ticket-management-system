// =============================================================================
// TicketCardSkeleton COMPONENT  (Step 15)
// =============================================================================
// A loading placeholder that mirrors the exact visual structure of TicketCard.
//
// WHY match TicketCard's layout exactly?
//   If the skeleton has a different height or column structure than the real
//   card, the page layout shifts when real content loads — a jarring CLS
//   (Cumulative Layout Shift). Matching the structure eliminates that shift.
//
// COMPOSITION:
//   Built entirely from <Skeleton> primitives — no new CSS, no magic numbers
//   that could drift out of sync with TicketCard's actual dimensions.
//
// USAGE:
//   Render 3–5 of these inside a <ul> while isLoading is true.
//   Replace with real <TicketCard> instances when isLoading becomes false.
// =============================================================================

import Skeleton from "@/components/Skeleton";

export default function TicketCardSkeleton() {
  return (
    <li
      aria-hidden="true"
      className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm"
    >
      {/* ── Top row: mirrors ID chip + two badge pills ─────────────────────── */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton height="h-4" width="w-16" />
        <Skeleton height="h-4" width="w-14" />
        <Skeleton height="h-4" width="w-14" />
      </div>

      {/* ── Title row ──────────────────────────────────────────────────────── */}
      <Skeleton height="h-5" width="w-3/4" className="mb-2" />

      {/* ── Description preview — two lines ───────────────────────────────── */}
      <Skeleton height="h-4" width="w-full" className="mb-1.5" />
      <Skeleton height="h-4" width="w-5/6" className="mb-4" />

      {/* ── Footer: mirrors assignee + date row ───────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Skeleton height="h-3.5" width="w-28" />
        <Skeleton height="h-3.5" width="w-20" />
      </div>
    </li>
  );
}
