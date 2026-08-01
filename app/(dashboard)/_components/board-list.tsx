"use client";

import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";

/**
 * Props for the BoardList component.
 */
interface BoardListProps {
  /** ID of the organization whose boards should be listed. */
  orgId: string;
  /** Query parameters used to filter the board list. */
  query: {
    /** Search term to filter boards by name. */
    search?: string;
    /** Flag to filter only favorited boards. */
    favorites?: string;
  };
}

/**
 * BoardList
 *
 * Fetches and renders the list of boards for a given organization,
 * applying any active search or favorites filters.
 *
 * Renders one of several empty states depending on context:
 * - `EmptySearch` — no boards match the current search term.
 * - `EmptyFavorites` — no boards are marked as favorites.
 * - `EmptyBoards` — the organization has no boards at all.
 *
 * @param props - Component props containing orgId and query filters.
 * @returns The rendered board list or an appropriate empty state.
 */
export function BoardList({ orgId, query }: BoardListProps) {
  // TODO: Replace with actual API call to fetch boards for `orgId`
  // filtered by `query.search` and `query.favorites`.
  const data = [];

  // No results due to an active search filter.
  if (!data?.length && query.search) {
    return <EmptySearch />;
  }

  // No results due to an active favorites filter.
  if (!data?.length && query.favorites) {
    return <EmptyFavorites />;
  }

  // No boards exist at all for this organization.
  if (!data?.length) {
    return <EmptyBoards />;
  }

  // TODO: Replace this placeholder with actual board rendering (e.g., a grid of BoardCard components).
  return (
    <div>
      {orgId} - {query.search} - {query.favorites}
    </div>
  );
}
