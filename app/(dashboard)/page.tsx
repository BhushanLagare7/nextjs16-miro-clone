"use client";

import { use } from "react";

import { useOrganization } from "@clerk/nextjs";

import { BoardList } from "./_components/board-list";
import { EmptyOrg } from "./_components/empty-org";

/**
 * Props for the DashboardPage component.
 */
interface DashboardPageProps {
  /**
   * Next.js dynamic search params, provided as a Promise
   * (Next.js 15+ App Router pattern for async searchParams).
   */
  searchParams: Promise<{
    /** Search query string used to filter boards by name. */
    search?: string;
    /** Flag indicating whether to filter boards marked as favorites. */
    favorites?: string;
  }>;
}

/**
 * DashboardPage
 *
 * The main dashboard route for a user's organization.
 *
 * Responsibilities:
 * - Resolves the async `searchParams` using React's `use` hook.
 * - Retrieves the currently active organization via Clerk's `useOrganization` hook.
 * - Renders `EmptyOrg` if the user has no active organization selected,
 *   prompting them to create one.
 * - Otherwise, renders `BoardList` for the active organization, passing
 *   along search/filter query parameters.
 *
 * @param props - Component props containing the async searchParams.
 * @returns The rendered dashboard page.
 */
export default function DashboardPage({ searchParams }: DashboardPageProps) {
  // Unwrap the async searchParams promise (React 19 `use` API).
  const resolvedSearchParams = use(searchParams);

  // Get the currently active Clerk organization (if any).
  const { organization } = useOrganization();

  return (
    <div className="h-[calc(100vh-80px)] flex-1 p-6">
      {!organization ? (
        // No organization selected — prompt user to create one.
        <EmptyOrg />
      ) : (
        // Organization exists — show its boards, filtered by query params.
        <BoardList orgId={organization.id} query={resolvedSearchParams} />
      )}
    </div>
  );
}
