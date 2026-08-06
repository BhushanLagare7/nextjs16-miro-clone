<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Core Rules: Code Quality & Magic Values
- **No Magic Numbers:** Replace unexplained numeric literals (e.g., canvas dimensions, zoom levels, timeouts, retry counts, HTTP status codes) with named `const` variables or enums.
- **No Magic Strings:** Extract hardcoded string literals (e.g., socket event names, localStorage keys, Liveblocks presence states, Convex table names, role names, tool types) into centralized constants/enums.
- **Exceptions:** Standard initializers like `0`, `1`, or `-1` in loops/arrays/math are allowed. If a literal's meaning is 100% obvious from the immediate context (e.g., `flex-1`), extraction is skipped.
- **Strict Typing:** All extracted constants must have strict TypeScript types. Use `as const` for objects/arrays to preserve literal types. Document constants clearly using JSDoc.
# Coding Standards & Naming Conventions

## 1. Function Declarations

- Convert ALL arrow functions (`const A = () => {...}`) to standard function declarations (`function A() {...}`).
- This applies to default exports, named exports, React components, and standard utility functions.

## 2. Prop Interface Naming

- Any interface or type defining component props must follow the `[ComponentName]Props` naming convention.
- _Example:_ `SidebarNav` component props interface must be `SidebarNavProps`.

## 3. Path-Based Component & Layout Naming

- Rename all Page and Layout components based on their file path to ensure global uniqueness.
- **Rule:** Ignore route groups (folders wrapped in parentheses `(...)`) and convert remaining path segments into PascalCase.
- _Example 1:_ `src/app/(app)/(tenants)/tenants/[slug]/(home)/products/[productId]/page.tsx` -> `TenantsSlugProductsProductIdPage`
- _Example 2:_ `src/app/(app)/(tenants)/tenants/[slug]/(checkout)/layout.tsx` -> `TenantsSlugLayout`

## 4. Skeleton Component Naming

- Any component designed as a Suspense fallback (skeleton) must have `Skeleton` appended to the very end of its finalised name.
- _Example:_ `TenantsProductIdPageSkeleton`
