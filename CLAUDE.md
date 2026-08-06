@AGENTS.md

# Core Rules: Code Quality & Magic Values
- **No Magic Numbers:** Replace unexplained numeric literals (e.g., canvas dimensions, zoom levels, timeouts, retry counts, HTTP status codes) with named `const` variables or enums.
- **No Magic Strings:** Extract hardcoded string literals (e.g., socket event names, localStorage keys, Liveblocks presence states, Convex table names, role names, tool types) into centralized constants/enums.
- **Exceptions:** Standard initializers like `0`, `1`, or `-1` in loops/arrays/math are allowed. If a literal's meaning is 100% obvious from the immediate context (e.g., `flex-1`), extraction is skipped.
- **Strict Typing:** All extracted constants must have strict TypeScript types. Use `as const` for objects/arrays to preserve literal types. Document constants clearly using JSDoc.
