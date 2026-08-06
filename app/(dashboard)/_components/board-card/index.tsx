/**
 * @file board-card.tsx
 * @description A card component representing a single board in the board
 * grid. Displays a thumbnail, hover overlay, context menu, and footer
 * with author info and a favorite toggle. Includes a skeleton sub-component
 * for loading states.
 */

"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";

import { Actions } from "@/components/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";

import { Footer } from "./footer";
import { Overlay } from "./overlay";

/**
 * Props for the {@link BoardCard} component.
 *
 * @interface BoardCardProps
 * @property {Id<"boards">} id - The unique Convex document ID of the board.
 * @property {string} title - The display name of the board.
 * @property {string} authorName - The full name of the board's creator.
 * @property {string} authorId - The Clerk user ID of the board's creator.
 * @property {number} createdAt - The board creation timestamp (milliseconds since epoch).
 * @property {string} imageUrl - URL of the board's preview/thumbnail image.
 * @property {string} orgId - The organization ID the board belongs to.
 * @property {boolean} isFavorite - Whether the current user has favorited this board.
 */
interface BoardCardProps {
  id: Id<"boards">;
  title: string;
  authorName: string;
  authorId: string;
  createdAt: number;
  imageUrl: string;
  orgId: string;
  isFavorite: boolean;
}

/**
 * `BoardCard` renders a single board as a card in the board grid.
 *
 * ### Features
 * - **Navigation** – Wraps the card in a `<Link>` that navigates to `/board/:id`.
 * - **Preview image** – Fills the top section of the card with the board's thumbnail.
 * - **Hover overlay** – A semi-transparent overlay appears on hover via the {@link Overlay} component.
 * - **Context actions** – A `MoreHorizontal` button reveals an {@link Actions} menu (rename,
 *   delete, etc.) on hover.
 * - **Footer** – Displays the board title, author, creation time, and a favorite toggle
 *   via the {@link Footer} component.
 * - **Favorite toggle** – Calls `api.board.favorite` or `api.board.unfavorite` depending on
 *   the current `isFavorite` state. Toast notifications communicate success or failure.
 *
 * ### Pending state
 * - The footer's favorite button is disabled while either the `favorite` or `unfavorite`
 *   mutation is in-flight, preventing duplicate requests.
 *
 * ### Static sub-component
 * `BoardCard.Skeleton` renders a placeholder skeleton for use during loading states.
 *
 * @param {BoardCardProps} props - The props for the component.
 * @returns {JSX.Element} A linked, interactive board card.
 *
 * @example
 * ```tsx
 * <BoardCard
 *   id="boards_abc123"
 *   title="Q3 Roadmap"
 *   authorName="Jane Doe"
 *   authorId="user_xyz"
 *   createdAt={1710000000000}
 *   imageUrl="https://example.com/preview.png"
 *   orgId="org_456"
 *   isFavorite={true}
 * />
 * ```
 */
export function BoardCard({
  id,
  title,
  authorId,
  authorName,
  createdAt,
  imageUrl,
  orgId,
  isFavorite,
}: BoardCardProps) {
  /** The currently authenticated Clerk user's ID. */
  const { userId } = useAuth();

  /**
   * Human-readable author label.
   * Displays "You" if the current user is the board author, otherwise the author's name.
   */
  const authorLabel = userId === authorId ? "You" : authorName;

  /**
   * Human-readable relative creation timestamp, e.g. "3 days ago".
   * Computed using `date-fns/formatDistanceToNow`.
   */
  const createdAtLabel = formatDistanceToNow(createdAt, {
    addSuffix: true,
  });

  /**
   * Mutation for favoriting a board.
   * `pendingFavorite` is `true` while the request is in-flight.
   */
  const { mutate: onFavorite, pending: pendingFavorite } = useApiMutation(
    api.board.favorite,
  );

  /**
   * Mutation for unfavoriting a board.
   * `pendingUnfavorite` is `true` while the request is in-flight.
   */
  const { mutate: onUnfavorite, pending: pendingUnfavorite } = useApiMutation(
    api.board.unfavorite,
  );

  /**
   * Toggles the board's favorite status for the current user.
   *
   * - If the board is currently favorited, calls `onUnfavorite` with the board `id`.
   * - If it is not favorited, calls `onFavorite` with the board `id` and `orgId`.
   *
   * Displays an error toast if either mutation fails.
   *
   * @returns {void}
   */
  const toggleFavorite = () => {
    if (isFavorite) {
      onUnfavorite({ id }).catch(() => toast.error("Failed to unfavorite"));
    } else {
      onFavorite({ id, orgId }).catch(() => toast.error("Failed to favorite"));
    }
  };

  return (
    /* Clicking anywhere on the card navigates to the board's canvas page */
    <Link href={`/board/${id}`}>
      <div className="group flex aspect-100/127 flex-col justify-between overflow-hidden rounded-lg border">
        {/* Card image area — fills available space, shows overlay and actions on hover */}
        <div className="relative flex-1 bg-amber-50">
          {/* Board thumbnail / preview image */}
          <Image alt={title} className="object-fill" fill src={imageUrl} />

          {/* Semi-transparent black overlay revealed on group hover */}
          <Overlay />

          {/*
           * Context menu trigger — absolutely positioned top-right.
           * Hidden by default (`opacity-0`), revealed on group hover.
           * Clicking it opens the Actions popover without triggering navigation.
           */}
          <Actions id={id} side="right" title={title}>
            <button className="absolute top-1 right-1 px-3 py-2 opacity-0 transition-opacity outline-none group-hover:opacity-100">
              <MoreHorizontalIcon className="text-white opacity-75 transition-opacity hover:opacity-100" />
            </button>
          </Actions>
        </div>

        {/*
         * Card footer — renders title, author, creation time, and favorite toggle.
         * Disabled while either favorite/unfavorite mutation is pending to
         * prevent duplicate requests.
         */}
        <Footer
          authorLabel={authorLabel}
          createdAtLabel={createdAtLabel}
          disabled={pendingFavorite || pendingUnfavorite}
          isFavorite={isFavorite}
          title={title}
          onClick={toggleFavorite}
        />
      </div>
    </Link>
  );
}

/**
 * `BoardCard.Skeleton` renders a placeholder skeleton card that matches
 * the aspect ratio of a real {@link BoardCard}.
 *
 * Used by `BoardList` during the loading state to preserve grid layout
 * before real data arrives.
 *
 * @returns {JSX.Element} A skeleton placeholder with the board card's dimensions.
 *
 * @example
 * ```tsx
 * // Rendered in the loading state of BoardList
 * <BoardCard.Skeleton />
 * ```
 */
BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="aspect-100/127 overflow-hidden rounded-lg">
      <Skeleton className="h-full w-full" />
    </div>
  );
};
