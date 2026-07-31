/**
 * List Component
 *
 * Renders a vertical list of organizations that the current user is a member of.
 * Each organization is represented by an `Item` component.
 *
 * - Uses infinite loading to fetch all user memberships from Clerk.
 * - Returns `null` if the user has no organization memberships,
 *   preventing an empty list from being rendered in the sidebar.
 *
 * @returns {JSX.Element | null} An unordered list of organization Item components,
 * or null if the user has no memberships
 */

"use client";

import { useOrganizationList } from "@clerk/nextjs";

import { Item } from "./item";

export function List() {
  /**
   * Fetches the list of organizations the current user is a member of.
   * `infinite: true` enables continuous/paginated loading of memberships.
   */
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  // Render nothing if the user has no organization memberships
  if (!userMemberships.data?.length) return null;

  return (
    <ul className="space-y-4">
      {userMemberships.data?.map((mem) => (
        /**
         * Renders an Item for each organization membership.
         * Uses the organization's ID as the unique key for React's reconciliation.
         */
        <Item
          key={mem.organization.id}
          id={mem.organization.id}
          imageUrl={mem.organization.imageUrl}
          name={mem.organization.name}
        />
      ))}
    </ul>
  );
}
