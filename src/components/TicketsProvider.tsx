"use client";

// =============================================================================
// TicketsProvider COMPONENT
// =============================================================================
// This component's only job is to:
//   1. Run useTicketsReducer() to get the current state + actions.
//   2. Wrap its children in <TicketsContext.Provider> with that value.
//
// WHY IS THIS A SEPARATE FILE FROM useTickets.tsx?
//   useTickets.tsx defines the context and hook — it's pure logic.
//   TicketsProvider.tsx is a React component that renders JSX.
//   Separating them makes both files easier to read and reason about.
//   It also means if we ever add server-side data fetching in the future,
//   we can change just this file without touching the hook logic.
//
// WHERE DOES THIS COMPONENT LIVE IN THE TREE?
//   It's placed in src/app/layout.tsx — the ROOT of the component tree.
//   This means EVERY page and every component in the app can call
//   useTickets() and get the same shared tickets state. This is the
//   "lift state up to where it needs to be shared" principle taken to
//   its logical conclusion.
//
// PERFORMANCE NOTE:
//   All consumers of TicketsContext will re-render when tickets changes.
//   For a list of ~10–100 tickets this is fine. If the list grew to
//   thousands, you would split the context into a "read" context and a
//   "dispatch" context so that action-only consumers don't re-render.
//   We'll address that optimisation if and when it becomes necessary.
// =============================================================================

import { TicketsContext, useTicketsReducer } from "@/hooks/useTickets";

interface TicketsProviderProps {
  children: React.ReactNode;
}

export default function TicketsProvider({ children }: TicketsProviderProps) {
  // useTicketsReducer() wires together useReducer + the createTicket action.
  // The returned object is exactly what TicketsContext.Provider expects.
  const value = useTicketsReducer();

  return (
    <TicketsContext.Provider value={value}>
      {children}
    </TicketsContext.Provider>
  );
}
