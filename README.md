# Ticket Management System

A modern internal ticket management system built with Next.js, TypeScript and React.

The application allows employees and support teams to create, manage and track internal support tickets through a simple and responsive interface. The system includes authentication, route protection, ticket CRUD operations, dashboard analytics, comment management and persistent local storage.

---

# 1. Prerequisites

Before running the project, make sure the following tools are installed:

- Node.js v18+
- npm
- Git

Check versions:

```bash
node -v
npm -v
git --version
```

---

# 2. Setup Instructions

### Clone repository

```bash
git clone https://github.com/danhth-ce190746/ticket-management-system.git
```

### Move into project folder

```bash
cd ticket-management-system
```

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

### Open browser

```text
http://localhost:3000
```

---

# 3. Demo Account

Use the following credentials:

```text
Username: admin
Password: 123456
```

---

# 4. Features

## Authentication & Authorization

- Login form validation using React Hook Form
- Schema validation using Zod
- Cookie-based authentication
- Protected routes using Next.js Proxy (Middleware)
- Automatic redirect to login page when unauthenticated
- Logout functionality

---

## Ticket Management

Users can:

- Create tickets
- View ticket details
- Edit tickets
- Delete tickets
- Search tickets
- Filter by status
- Filter by priority
- Sort tickets by date

---

## Dashboard Analytics

The dashboard provides:

- Total Tickets
- Open Tickets
- In Progress Tickets
- Resolved Tickets
- Ticket Status Breakdown
- Priority Distribution
- Recent Activity Overview

---

## Comment System

Each ticket supports comments.

Users can:

- Add comments
- View comment history
- Persist comments after page refresh

Comments are stored together with ticket data inside LocalStorage.

---

## Data Persistence

The application uses browser LocalStorage for persistence.

Stored data includes:

- Ticket information
- Ticket status
- Ticket priority
- Comments
- Authentication state

All data remains available after page refresh.

---

## Loading Experience

To improve user experience:

- Skeleton Loading components are displayed while data is loading
- Dashboard placeholders prevent layout shifting
- Ticket card skeletons mimic final content layout

---

# 5. Project Architecture

```text
src/
│
├── app/
│   ├── dashboard/
│   ├── login/
│   └── tickets/
│
├── components/
│   ├── Navbar
│   ├── TicketCard
│   ├── TicketFilters
│   ├── CommentForm
│   ├── CommentList
│   ├── Skeleton
│   └── Dashboard Components
│
├── hooks/
│   ├── useTickets
│   ├── useTicketAnalytics
│   └── useTicketFilters
│
├── lib/
│   ├── auth
│   ├── auth-cookie
│   ├── storage
│   └── format
│
├── mocks/
│   └── tickets.ts
│
├── types/
│   └── ticket.ts
│
└── proxy.ts
```

---

# 6. Application Flow

```text
Login
   ↓
Authentication Check
   ↓
Dashboard / Tickets
   ↓
Create / Update / Delete Ticket
   ↓
Reducer Updates State
   ↓
Save to LocalStorage
   ↓
UI Automatically Re-renders
```

---

# 7. Technologies Used

Frontend:

- Next.js 16
- React 19
- TypeScript

Validation:

- React Hook Form
- Zod

Styling:

- Tailwind CSS

State Management:

- React Context API
- useReducer

Persistence:

- LocalStorage

Authentication:

- Cookie Authentication
- Next.js Proxy (Middleware)

---

# 8. Build & Verification

### TypeScript Validation

```bash
npx tsc --noEmit
```

### Production Build

```bash
npm run build
```

Successful build confirms:

- No TypeScript errors
- No compile errors
- Production-ready deployment

---

# 9. GitHub Repository

Repository URL:

https://github.com/danhth-ce190746/ticket-management-system

---

# Author

Student: Tran Hoang Danh
Student ID: CE190746

Project: Internal Ticket Management System

Built for OJT Assignment using Next.js, TypeScript and React.
