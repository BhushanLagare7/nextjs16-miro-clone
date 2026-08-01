"use client";

import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { BoardCard } from "./board-card";
import { EmptyBoards } from "./empty-boards";
import { EmptyFavorites } from "./empty-favorites";
import { EmptySearch } from "./empty-search";
import { NewBoardButton } from "./new-board-button";

/**
 * Props for the BoardList component.
 *
 * @interface BoardListProps
 * @property {string} orgId - The unique identifier of the organization whose boards are displayed.
 * @property {object} query - Optional query filters applied when fetching boards.
 * @property {string} [query.search] - A search string used to filter boards by name or content.
 * @property {string} [query.favorites] - When present, filters the board list to show only favorited boards.
 */
interface BoardListProps {
  orgId: string;
  query: {
    search?: string;
    favorites?: string;
  };
}

/**
 * `BoardList` renders a responsive grid of boards for a given organization.
 *
 * It handles four distinct UI states:
 * 1. **Loading** – Displays skeleton placeholders while data is being fetched.
 * 2. **Empty Search** – Shown when a search query yields no results.
 * 3. **Empty Favorites** – Shown when the favorites filter yields no results.
 * 4. **Empty Boards** – Shown when the organization has no boards at all.
 * 5. **Populated** – Renders the full list of `BoardCard` components alongside a `NewBoardButton`.
 *
 * @param {BoardListProps} props - The props for the component.
 * @param {string} props.orgId - The organization ID used to scope the board query.
 * @param {{ search?: string; favorites?: string }} props.query - Query filters forwarded to the Convex API.
 * @returns {JSX.Element} The rendered board list or an appropriate empty/loading state.
 *
 * @example
 * // Render all boards for an organization
 * <BoardList orgId="org_123" query={{}} />
 *
 * @example
 * // Render only favorite boards
 * <BoardList orgId="org_123" query={{ favorites: "true" }} />
 *
 * @example
 * // Render boards matching a search term
 * <BoardList orgId="org_123" query={{ search: "design" }} />
 */
export function BoardList({ orgId, query }: BoardListProps) {
  /**
   * Fetch boards from the Convex backend.
   * `data` is `undefined` while the query is loading, and an array (possibly empty) once resolved.
   */
  const data = useQuery(api.boards.get, {
    orgId,
    ...query,
  });

  /**
   * Loading state: `data` is `undefined` while the initial query is in-flight.
   * Render a skeleton layout to preserve visual structure during the fetch.
   */
  if (data === undefined) {
    return (
      <div>
        {/* Section heading reflects the active filter */}
        <h2 className="text-3xl">
          {query.favorites ? "Favorite boards" : "Team boards"}
        </h2>

        {/* Skeleton grid — mirrors the populated grid layout */}
        <div className="mt-8 grid grid-cols-1 gap-5 pb-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {/* Disabled while loading to prevent premature board creation */}
          <NewBoardButton disabled orgId={orgId} />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
        </div>
      </div>
    );
  }

  /**
   * Empty search state: The query has resolved but returned no results
   * for the current search term.
   */
  if (!data?.length && query.search) {
    return <EmptySearch />;
  }

  /**
   * Empty favorites state: The query has resolved but the user has not
   * favorited any boards yet.
   */
  if (!data?.length && query.favorites) {
    return <EmptyFavorites />;
  }

  /**
   * Empty boards state: No active filters, but the organization has
   * no boards yet. Prompt the user to create their first board.
   */
  if (!data?.length) {
    return <EmptyBoards />;
  }

  /**
   * Populated state: Render the full, interactive board grid.
   */
  return (
    <div>
      {/* Section heading reflects the active filter */}
      <h2 className="text-3xl">
        {query.favorites ? "Favorite boards" : "Team boards"}
      </h2>

      {/*
       * Responsive grid layout:
       * - 1 column  on mobile
       * - 2 columns on sm
       * - 4 columns on md/lg
       * - 5 columns on xl
       * - 6 columns on 2xl
       */}
      <div className="mt-8 grid grid-cols-1 gap-5 pb-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {/* Entry point for creating a new board */}
        <NewBoardButton orgId={orgId} />

        {/* Render one BoardCard per board returned by the query */}
        {data?.map((board) => (
          <BoardCard
            key={board._id}
            authorId={board.authorId}
            authorName={board.authorName}
            createdAt={board._creationTime}
            id={board._id}
            imageUrl={board.imageUrl}
            isFavorite={board.isFavorite}
            orgId={board.orgId}
            title={board.title}
          />
        ))}
      </div>
    </div>
  );
}
