/**
 * @file navbar.tsx
 * @description The top navigation bar component for the application,
 * providing search functionality, organization switching, member
 * invitation, and user account management.
 */

"use client";

import {
  OrganizationSwitcher,
  useOrganization,
  UserButton,
} from "@clerk/nextjs";

import { InviteButton } from "./invite-button";
import { SearchInput } from "./search-input";

/**
 * Navbar Component
 *
 * Renders the top navigation bar with responsive layout adjustments
 * for different screen sizes. Integrates with Clerk for organization
 * and user management.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage within a layout
 * <Navbar />
 * ```
 *
 * @remarks
 * ### Layout Behavior:
 * - **Large screens (lg and above):**
 *   - Displays the `SearchInput` component for searching boards.
 *   - Hides the `OrganizationSwitcher` (it is shown in the sidebar instead).
 * - **Small screens (below lg):**
 *   - Hides the `SearchInput`.
 *   - Shows the `OrganizationSwitcher` for switching between organizations.
 *
 * ### Conditional Rendering:
 * - The `InviteButton` is only rendered when the user belongs to an
 *   active organization (`organization` is truthy).
 * - The `UserButton` is always visible for account management.
 *
 * ### OrganizationSwitcher Appearance (Mobile):
 * - Styled to span the full width with consistent border and padding.
 * - Personal accounts are hidden (`hidePersonal`) to focus on
 *   organization-level access.
 *
 * @returns {JSX.Element} A responsive navigation bar with search,
 * organization switching, invite, and user controls.
 */
export function Navbar() {
  /**
   * Retrieves the current organization context from Clerk.
   * `organization` will be `null` if the user is not part of any organization.
   */
  const { organization } = useOrganization();

  return (
    <div className="flex items-center gap-x-4 p-5">
      {/* Search input: visible only on large screens */}
      <div className="hidden lg:flex lg:flex-1">
        <SearchInput />
      </div>

      {/*
       * Organization switcher: visible only on small screens.
       * Styled to span the full available width with a clean bordered look.
       */}
      <div className="block flex-1 lg:hidden">
        <OrganizationSwitcher
          appearance={{
            elements: {
              rootBox: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                maxWidth: "376px",
              },
              organizationSwitcherTrigger: {
                padding: "6px",
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                justifyContent: "space-between",
                backgroundColor: "white",
              },
            },
          }}
          hidePersonal
        />
      </div>

      {/*
       * InviteButton: conditionally rendered only when an active
       * organization context exists.
       */}
      {organization && <InviteButton />}

      {/* UserButton: always visible for user account management */}
      <UserButton />
    </div>
  );
}
