"use client";

// =============================================================================
// TICKETS CONTEXT  +  useTickets HOOK
// =============================================================================
// This file is the "brain" of the client-side state layer. It:
//
//   1. Defines the ACTION types that describe every possible state change.
//   2. Defines the REDUCER — a pure function that takes the current state and
//      an action, and returns the next state.  No mutation, no side effects.
//   3. Creates the CONTEXT that makes the state (and dispatch) available
//      anywhere in the component tree without prop-drilling.
//   4. Exports the useTickets() HOOK so components can access the context
//      with a clean API and a helpful error message if misused.
//
// WHY "use client" here?
//   React Context is a client-side feature — it doesn't exist on the server.
//   Marking this file as a Client Module means Next.js won't try to render it
//   on the server, which would throw an error.
//
// WHY useReducer instead of useState?
//   - useState is great for simple, isolated values (one input field).
//   - useReducer is better when multiple pieces of state change together, or
//     when the next state depends on the previous one.
//   - Our tickets array is modified by discrete, named actions (ADD_TICKET).
//     Naming the action makes the intent explicit and keeps the logic testable.
//   - As the app grows (e.g. UPDATE_TICKET, DELETE_TICKET), new cases are
//     added to the reducer without restructuring the rest of the code.
// =============================================================================

import { createContext, useContext, useReducer, useState, useEffect, useRef } from "react";
import { Ticket, Comment, CreateTicketInput, UpdateTicketInput } from "@/types/ticket";
import { mockTickets } from "@/mocks/tickets";
import { generateId } from "@/lib/format";
import { readFromStorage, writeToStorage } from "@/lib/storage";

// =============================================================================
// PERSISTENCE CONSTANTS  (Step 11)
// =============================================================================
// STORAGE_KEY uses a namespaced format ("<app>:<resource>") to avoid collisions
// with other apps or browser extensions that use the same origin.
//
// SCHEMA_VERSION is stored alongside the data. On load, if the version doesn't
// match the current constant, we discard the stored data and fall back to
// INITIAL_STATE. This prevents runtime errors when the Ticket interface gains
// new required fields in a future step.
// =============================================================================

const STORAGE_KEY = "ticket-management:tickets";
const SCHEMA_VERSION = 1;

// The exact shape written to and read from localStorage.
// Kept internal — nothing outside this file needs to know how we persist.
interface PersistedState {
  schemaVersion: number;
  tickets: Ticket[];
}

// =============================================================================
// STATE SHAPE
// =============================================================================

interface TicketsState {
  tickets: Ticket[];
}

// =============================================================================
// ACTIONS
// =============================================================================
// A discriminated union: every action has a "type" string that the reducer
// switches on. The "payload" carries the data the action needs.
//
// Using a union (not a single object with optional fields) means TypeScript
// narrows the type inside each case — you can't accidentally access
// payload.ticket in the wrong branch.
// =============================================================================

// Step 10: expanded to three members.
// Step 11: expanded to four members with LOAD_TICKETS.
// Step 14: expanded to five members with ADD_COMMENT.
// TypeScript narrows the type inside each switch case — the discriminated
// union enforces this at compile time.
type Action =
  | { type: "ADD_TICKET";    payload: Ticket }
  | { type: "UPDATE_TICKET"; payload: { id: string; changes: UpdateTicketInput } }
  | { type: "DELETE_TICKET"; payload: { id: string } }
  | { type: "LOAD_TICKETS";  payload: Ticket[] }
  | { type: "ADD_COMMENT";   payload: { ticketId: string; comment: Comment } };

// =============================================================================
// REDUCER
// =============================================================================
// A pure function: same inputs → same output, no side effects.
// We NEVER mutate state directly — we always return a new object / array.
// This makes state changes predictable and easy to trace in DevTools.
// =============================================================================

function ticketsReducer(state: TicketsState, action: Action): TicketsState {
  switch (action.type) {
    case "ADD_TICKET":
      // Place the new ticket at the FRONT of the list so it's immediately
      // visible without scrolling. The spread operator creates a new array —
      // it does not mutate the existing one.
      return {
        ...state,
        tickets: [action.payload, ...state.tickets],
      };

    case "UPDATE_TICKET": {
      // .map() returns a NEW array. For tickets that don't match the ID we
      // return the SAME object reference (identity, not a copy). React uses
      // referential equality to decide whether a child needs to re-render,
      // so unchanged tickets produce no extra work.
      //
      // updatedAt is stamped HERE, not by the caller. The reducer owns
      // timestamp logic — forms should not know or care about timestamps.
      const now = new Date().toISOString();
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.payload.id
            ? { ...t, ...action.payload.changes, updatedAt: now }
            : t
        ),
      };
    }

    case "DELETE_TICKET":
      // .filter() returns a new array excluding the deleted ticket.
      // The original array (in the previous state snapshot) is not mutated —
      // this is important for time-travel debugging and future undo features.
      return {
        ...state,
        tickets: state.tickets.filter((t) => t.id !== action.payload.id),
      };

    case "LOAD_TICKETS":
      // Step 11: restores state from localStorage after mount.
      // This action is dispatched exactly once, by the LOAD useEffect in
      // useTicketsReducer. It replaces the tickets array entirely (replace
      // strategy — stored state wins over INITIAL_STATE).
      return {
        ...state,
        tickets: action.payload,
      };

    case "ADD_COMMENT": {
      // Step 14: prepends a new comment to the matching ticket's comments array.
      //
      // WHY prepend (newest first)? Comments are displayed newest-first so the
      // most recent reply is always visible without scrolling.
      //
      // updatedAt is stamped on the parent ticket so the ticket moves to the
      // top of the Dashboard "Recent Activity" list after receiving a comment.
      const now = new Date().toISOString();
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.payload.ticketId
            ? {
                ...t,
                comments: [action.payload.comment, ...(t.comments ?? [])],
                updatedAt: now,
              }
            : t
        ),
      };
    }
  }
}

// =============================================================================
// CONTEXT
// =============================================================================
// We separate STATE from DISPATCH into a typed context value object.
// Components that only READ tickets don't need to know about dispatch.
// Components that only WRITE (dispatch) don't need the full state.
// Here we expose a higher-level createTicket() function so consumers never
// touch dispatch directly — this hides the action type string from them.
// =============================================================================

interface TicketsContextValue {
  // The current list of tickets (read)
  tickets: Ticket[];

  // Step 15: true during the initial localStorage read, false once done.
  // Pages use this to show skeleton placeholders instead of an empty list.
  isLoading: boolean;

  // High-level action: create a ticket from user input.
  // The context layer handles ID generation and timestamps — callers don't.
  createTicket: (input: CreateTicketInput) => void;

  // Step 10: update and delete actions.
  // updateTicket merges `changes` into the matching ticket and stamps updatedAt.
  // deleteTicket removes the ticket by ID.
  // Both are high-level wrappers — callers never touch dispatch directly.
  updateTicket: (id: string, changes: UpdateTicketInput) => void;
  deleteTicket: (id: string) => void;

  // Step 14: add a comment to a specific ticket.
  // The helper generates the Comment id + timestamp — the caller supplies only
  // the ticketId and the comment content string.
  addComment: (ticketId: string, content: string) => void;
}

// createContext needs a default value. We use null and handle the null case
// in the hook below. An alternative is to provide a no-op default, but null
// makes it obvious when the Provider is missing.
export const TicketsContext = createContext<TicketsContextValue | null>(null);

// =============================================================================
// INITIAL STATE
// =============================================================================
// We seed the state with mockTickets so the list is populated on first load.
// When a real API exists, you would replace this with an empty array and
// fetch on mount (e.g. inside a useEffect or with Next.js Server Components).
// =============================================================================

const INITIAL_STATE: TicketsState = {
  tickets: mockTickets,
};

// =============================================================================
// PROVIDER HOOK (internal — used by TicketsProvider.tsx)
// =============================================================================
// We expose the raw state + a bound createTicket action.
// TicketsProvider.tsx calls this and passes the result as context value.
// =============================================================================

export function useTicketsReducer() {
  const [state, dispatch] = useReducer(ticketsReducer, INITIAL_STATE);

  // ── isLoading ─────────────────────────────────────────────────────────────
  // Step 15: tracks whether the initial localStorage read has completed.
  // WHY useState and not part of the reducer state?
  //   isLoading is a UI concern, not a ticket-domain concern. The reducer is
  //   a pure function that should only handle ticket data changes. Mixing UI
  //   state into the reducer would require a new action type (SET_LOADING)
  //   that has no meaning in the domain model.
  // Starts true — the very first render shows skeletons.
  // Flipped to false at the end of the LOAD effect (after localStorage read).
  const [isLoading, setIsLoading] = useState(true);

  // ── Persistence guard ────────────────────────────────────────────────────
  // A ref (not state) so flipping it does not trigger a re-render.
  // Starts false; the SAVE effect sets it to true on the first render cycle
  // and skips saving — this prevents overwriting stored data before LOAD has
  // had a chance to dispatch LOAD_TICKETS.
  const hasLoaded = useRef(false);

  // ── LOAD effect ──────────────────────────────────────────────────────────
  // Runs exactly ONCE, after the first client-side render ([] deps).
  // Why not use the useReducer lazy initializer instead?
  //   In Next.js, "use client" components are still pre-rendered on the
  //   server. The lazy initializer runs during server render where
  //   localStorage does not exist, then runs AGAIN on the client during
  //   hydration where it would return stored data — causing a server/client
  //   state mismatch and a React hydration warning.
  //   useEffect is client-only by definition; it never runs on the server.
  //   This guarantees no hydration mismatch.
  //
  // Declaration order matters: React runs effects in declaration order within
  // the same render flush. LOAD before SAVE ensures SAVE sees
  // hasLoaded.current = false and skips on the very first flush.
  useEffect(() => {
    const stored = readFromStorage<PersistedState>(STORAGE_KEY);

    if (
      stored !== null &&
      stored.schemaVersion === SCHEMA_VERSION &&
      Array.isArray(stored.tickets)
    ) {
      // Stored data is valid and schema-compatible — restore it.
      dispatch({ type: "LOAD_TICKETS", payload: stored.tickets });
    }
    // If stored is null (first visit, cleared storage, or storage unavailable),
    // INITIAL_STATE from useReducer remains — no action needed.

    // Step 15: mark loading complete regardless of whether stored data existed.
    // This fires after the first client-side render, flipping isLoading to false
    // and triggering a re-render that replaces skeletons with real content.
    setIsLoading(false);
  }, []);

  // ── SAVE effect ──────────────────────────────────────────────────────────
  // Runs after every state change. Skips the very first render via the
  // hasLoaded guard so we do not overwrite existing stored data with
  // INITIAL_STATE before LOAD has restored the user's previous session.
  //
  // After the first render cycle hasLoaded.current is set to true, so every
  // subsequent state change (ADD, UPDATE, DELETE, and the LOAD re-render)
  // is persisted.
  useEffect(() => {
    if (!hasLoaded.current) {
      // First render: arm the guard and do NOT save.
      hasLoaded.current = true;
      return;
    }

    writeToStorage<PersistedState>(STORAGE_KEY, {
      schemaVersion: SCHEMA_VERSION,
      tickets: state.tickets,
    });
  }, [state]);

  function createTicket(input: CreateTicketInput): void {
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: "ADD_TICKET", payload: newTicket });
  }

  // Step 10: updateTicket dispatches UPDATE_TICKET with the partial changes.
  // The reducer handles merging and stamping updatedAt — nothing to do here
  // except forward the arguments to dispatch.
  function updateTicket(id: string, changes: UpdateTicketInput): void {
    dispatch({ type: "UPDATE_TICKET", payload: { id, changes } });
  }

  // Step 10: deleteTicket dispatches DELETE_TICKET with just the ID.
  function deleteTicket(id: string): void {
    dispatch({ type: "DELETE_TICKET", payload: { id } });
  }

  // Step 14: addComment builds a full Comment object from the raw content
  // string and dispatches ADD_COMMENT. The caller (CommentForm) never touches
  // IDs, timestamps, or the dispatch function directly.
  function addComment(ticketId: string, content: string): void {
    const comment: Comment = {
      id: generateId(),
      author: "Admin", // Phase 1: hardcoded — Phase 2 will derive from session
      content,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_COMMENT", payload: { ticketId, comment } });
  }

  return { tickets: state.tickets, isLoading, createTicket, updateTicket, deleteTicket, addComment };
}

// =============================================================================
// PUBLIC HOOK — useTickets()
// =============================================================================
// Any client component can call useTickets() to get access to the tickets
// array and the createTicket action. The null-guard gives a clear error
// message in development if someone forgets to add <TicketsProvider>.
// =============================================================================

export function useTickets(): TicketsContextValue {
  const ctx = useContext(TicketsContext);
  if (!ctx) {
    throw new Error(
      "useTickets() must be used inside <TicketsProvider>. " +
        "Make sure <TicketsProvider> wraps your component tree in layout.tsx."
    );
  }
  return ctx;
}
