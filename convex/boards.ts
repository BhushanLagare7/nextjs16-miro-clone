import { v } from "convex/values";
import { getAllOrThrow } from "convex-helpers/server/relationships";

import { query } from "./_generated/server";

/**
 * Retrieves boards for a given organization.
 *
 * Behavior:
 * - If `favorites` is provided (truthy), only boards favorited by the
 *   current user within the organization are returned, each marked
 *   with `isFavorite: true`.
 * - Otherwise, boards are fetched either via full-text search on
 *   `title` (when `search` is provided) or by organization listing
 *   (most recent first). Each returned board is annotated with an
 *   `isFavorite` boolean indicating whether the current user has
 *   favorited it.
 *
 * Requires an authenticated user; throws if the request is unauthenticated.
 *
 * @param orgId - The organization whose boards should be listed.
 * @param search - Optional search term to filter boards by title.
 * @param favorites - Optional flag; when truthy, restricts results to
 *                    the user's favorited boards.
 */
export const get = query({
  args: {
    orgId: v.string(),
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    // --- Favorites-only listing -------------------------------------
    if (args.favorites) {
      const favoritedBoards = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", identity.subject).eq("orgId", args.orgId),
        )
        .order("desc")
        .collect();

      const ids = favoritedBoards.map((favorite) => favorite.boardId);
      const boards = await getAllOrThrow(ctx.db, ids);

      return boards.map((board) => ({
        ...board,
        isFavorite: true,
      }));
    }

    // --- General listing (search or org-wide) ------------------------
    // Using a local `const` preserves TypeScript's narrowing of the
    // optional `search` value without resorting to an unsafe cast.
    const searchTitle = args.search;

    const boards = searchTitle
      ? await ctx.db
          .query("boards")
          .withSearchIndex("search_title", (q) =>
            q.search("title", searchTitle).eq("orgId", args.orgId),
          )
          .collect()
      : await ctx.db
          .query("boards")
          .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
          .order("desc")
          .collect();

    // Fetch all of the user's favorited boards for this org in a single
    // query, then use a Set for O(1) membership checks. This avoids the
    // N+1 query pattern of issuing one favorites lookup per board.
    const favorites = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", identity.subject).eq("orgId", args.orgId),
      )
      .collect();

    const favoritedBoardIds = new Set(
      favorites.map((favorite) => favorite.boardId),
    );

    return boards.map((board) => ({
      ...board,
      isFavorite: favoritedBoardIds.has(board._id),
    }));
  },
});
