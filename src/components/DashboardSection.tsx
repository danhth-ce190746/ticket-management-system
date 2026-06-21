// =============================================================================
// DashboardSection COMPONENT  (Step 12)
// =============================================================================
// A consistent section wrapper used throughout the dashboard page.
//
// Every section on the dashboard has the same structure:
//   • A section heading (h2)
//   • An optional subtitle / description
//   • A content area (children)
//
// Centralising this wrapper means:
//   • All sections look identical without copying CSS classes four times.
//   • A visual change (e.g. adding a divider, changing heading size) is a
//     one-line edit here, not a find-and-replace across the dashboard page.
//   • The dashboard page stays focused on WHAT to show, not HOW sections look.
//
// PRESENTATIONAL ONLY: no state, no hooks, no logic.
// =============================================================================

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function DashboardSection({
  title,
  subtitle,
  children,
}: DashboardSectionProps) {
  return (
    <section className="mt-8">

      {/* ── Section header ────────────────────────────────────────────────── */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* ── Content slot ──────────────────────────────────────────────────── */}
      {children}

    </section>
  );
}
