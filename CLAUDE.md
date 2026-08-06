<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CLAUDE.md

## Project Overview

This repository is a real-time collaborative whiteboard application (Miro clone) built with Next.js 16 (App Router), React 19, TypeScript, Convex, Liveblocks, Clerk, and Stripe.

- **Framework:** Next.js 16 (App Router) with React 19
- **Real-Time Collaboration:** Liveblocks (`@liveblocks/client`, `@liveblocks/react`, `@liveblocks/node`) for multi-user canvas state, active cursors, presence, and selection bounds
- **Backend & Database:** Convex (`convex/` folder with reactive queries, mutations, database schema, and HTTP endpoints)
- **Authentication:** Clerk (`@clerk/nextjs`) integrated with Convex (`ConvexProviderWithClerk`)
- **Billing & Subscriptions:** Stripe webhooks integrated with Convex (`convex/stripe.ts`, `convex/http.ts`)
- **Styling & UI:** Tailwind CSS v4 (`@tailwindcss/postcss`), Radix UI primitives, Shadcn UI, Lucide icons, Sonner toasts
- **State Management:** Zustand, `usehooks-ts`, Convex React hooks
- **Drawing Engine:** `perfect-freehand` for smooth vector drawing strokes

---

## Setup & Development Commands

### 1. Installation

```bash
npm install
```

### 2. Development Workflow

Start the Next.js frontend development server:

```bash
npm run dev
```

Start the Convex backend sync service (in a separate terminal):

```bash
npx convex dev
```

Listen for local Stripe webhook events (if testing payments):

```bash
npm run stripe:listen
```

Trigger a simulated Stripe checkout completed event:

```bash
npm run stripe:trigger
```

### 3. Production Build & Execution

```bash
npm run build
npm run start
```

### 4. Linting & Type Checking

```bash
npm run lint         # Run ESLint check
npm run lint:fix     # Automatically fix lint issues
npx tsc --noEmit     # TypeScript type checking
```

---

## Code Quality & Coding Standards

### Core Rules & Magic Values

- **No Magic Numbers:** Replace unexplained numeric literals (e.g., canvas dimensions, zoom levels, timeouts, retry counts, HTTP status codes) with named `const` variables or enums.
- **No Magic Strings:** Extract hardcoded string literals (e.g., socket event names, localStorage keys, Liveblocks presence states, Convex table names, role names, tool types) into centralized constants/enums.
- **Exceptions:** Standard initializers like `0`, `1`, or `-1` in loops/arrays/math are allowed. If a literal's meaning is 100% obvious from the immediate context (e.g., `flex-1`), extraction is skipped.
- **Strict Typing:** All extracted constants must have strict TypeScript types. Use `as const` for objects/arrays to preserve literal types. Document constants clearly using JSDoc.

### Naming Conventions & Structure

1. **Function Declarations:**
   - Convert ALL arrow functions (`const A = () => {...}`) to standard function declarations (`function A() {...}`).
   - Applies to default exports, named exports, React components, and utility functions.
2. **Prop Interface Naming:**
   - Interfaces/types for component props MUST follow `[ComponentName]Props` (e.g., `SidebarNavProps`).
3. **Path-Based Component & Layout Naming:**
   - Name Page and Layout components based on their file path for global uniqueness.
   - Ignore route groups wrapped in parentheses `(...)` and convert remaining path segments to PascalCase.
   - _Example:_ `app/(dashboard)/page.tsx` -> `DashboardPage`
   - _Example:_ `app/board/[boardId]/page.tsx` -> `BoardBoardIdPage`
4. **Skeleton Component Naming:**
   - Any component designed as a Suspense fallback (skeleton) MUST have `Skeleton` appended to the end of its name (e.g., `BoardBoardIdPageSkeleton`).

---

## Environment Variables

All required environment variables should be validated using `requireEnvVar` from `lib/utils.ts`.

Key variables expected in `.env.local`:

- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `LIVEBLOCKS_SECRET_KEY`: Liveblocks API key
- `STRIPE_API_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signature secret

---

## Directory Architecture

- **`app/`**: Next.js App Router routes (`(dashboard)`, `board/[boardId]`, `api/`), global layout, CSS, `sitemap.ts`, `robots.ts`.
- **`components/`**: React UI components (canvas elements, modals, board controls, toolbar, sidebar, user button).
- **`convex/`**: Convex backend schema (`schema.ts`), queries/mutations (`board.ts`, `boards.ts`, `subscriptions.ts`), HTTP handlers (`http.ts`).
- **`hooks/`**: Custom React hooks (e.g., API mutation state hooks, canvas hooks).
- **`lib/`**: Common utilities (`utils.ts`), shared constants (`lib/constants/site.ts`).
- **`providers/`**: App providers (`convex-client-provider.tsx`, `modal-provider.tsx`).
- **`store/`**: Zustand stores for client-side modal & canvas state.
- **`types/`**: Custom TypeScript declarations & types (canvas layer objects, tool types, presence).
