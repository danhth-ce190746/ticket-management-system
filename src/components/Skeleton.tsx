// =============================================================================
// Skeleton COMPONENT  (Step 15)
// =============================================================================
// A single reusable shimmer block used to compose loading placeholders.
//
// WHY NOT a library?
//   The requirement specifies Tailwind only. Tailwind's built-in
//   `animate-pulse` class produces an opacity oscillation — sufficient for
//   a smooth shimmer without any JavaScript animation logic.
//
// COMPOSITION PATTERN:
//   This component is a primitive. Pages and feature-specific skeleton
//   components (e.g. TicketCardSkeleton) compose multiple <Skeleton> blocks
//   to mirror the layout of the real content they replace.
//
// PROPS:
//   height    — Tailwind height class, e.g. "h-4", "h-6". Defaults to "h-4".
//   width     — Tailwind width class, e.g. "w-full", "w-32". Defaults to "w-full".
//   className — Additional classes for spacing, rounding, etc.
//               Applied after the base classes so callers can override anything.
// =============================================================================

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

export default function Skeleton({
  height = "h-4",
  width = "w-full",
  className = "",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-gray-200 rounded ${height} ${width} ${className}`}
    />
  );
}
