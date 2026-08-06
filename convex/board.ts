import type { UserIdentity } from "convex/server";
import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  BOARD_LIMIT_ERROR,
  BOARD_PLACEHOLDER_IMAGES,
  BOARD_TITLE_MAX_LENGTH,
  DEFAULT_AUTHOR_NAME,
  ORG_BOARD_LIMIT,
} from "./constants";

/**
 * Convex backend functions for managing `boards` and their per-user
 * favorites (`userFavorites`).
 *
 * All mutations require an authenticated caller; the `get` query is
 * publicly readable.
 */

/**
 * Picks a random placeholder cover image from the `BOARD_PLACEHOLDER_IMAGES` pool.
 *
 * @returns A randomly selected image path.
 */
function getRandomImage(): string {
  return BOARD_PLACEHOLDER_IMAGES[
    Math.floor(Math.random() * BOARD_PLACEHOLDER_IMAGES.length)
  ];
}

/**
 * Verifies that the current request is authenticated and returns the
 * caller's identity.
 *
 * @param ctx - The Convex mutation context.
 * @returns The authenticated user's identity.
 * @throws {Error} `"Unauthorized"` if there is no authenticated user.
 */
async function requireIdentity(ctx: MutationCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  return identity;
}

/**
 * Looks up a user's `userFavorites` entry for a specific board, if any.
 *
 * @param ctx - The Convex mutation context.
 * @param userId - The id (subject) of the user.
 * @param boardId - The id of the board.
 * @returns The matching `userFavorites` document, or `null` if none exists.
 */
async function getFavorite(
  ctx: MutationCtx,
  userId: string,
  boardId: Id<"boards">,
) {
  return ctx.db
    .query("userFavorites")
    .withIndex("by_user_board", (q) =>
      q.eq("userId", userId).eq("boardId", boardId),
    )
    .unique();
}

/**
 * Determines whether an organization currently has an active, non-expired
 * subscription.
 *
 * @param ctx - The Convex mutation context.
 * @param orgId - The id of the organization to check.
 * @returns `true` if the organization has a subscription whose current
 * billing period has not yet ended; otherwise `false`.
 */
async function isOrgSubscribed(
  ctx: MutationCtx,
  orgId: string,
): Promise<boolean> {
  const orgSubscription = await ctx.db
    .query("orgSubscriptions")
    .withIndex("by_org", (q) => q.eq("orgId", orgId))
    .unique();

  const periodEnd = orgSubscription?.stripeCurrentPeriodEnd;

  return !!(periodEnd && periodEnd > Date.now());
}

/**
 * Creates a new board owned by the authenticated user within the given
 * organization, assigning it a random placeholder cover image.
 *
 * The existing-board-count check and the subscription check are
 * independent of each other (both only require `args.orgId`), so they are
 * performed concurrently. The board count query is capped at
 * `ORG_BOARD_LIMIT` entries, since only whether the count meets or exceeds
 * that limit is ever needed.
 *
 * @throws {Error} If the caller is not authenticated, or if the
 * organization is not subscribed and has already reached
 * `ORG_BOARD_LIMIT` boards.
 */
export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const [existingBoards, isSubscribed] = await Promise.all([
      ctx.db
        .query("boards")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .take(ORG_BOARD_LIMIT),
      isOrgSubscribed(ctx, args.orgId),
    ]);

    if (!isSubscribed && existingBoards.length >= ORG_BOARD_LIMIT) {
      throw new Error(BOARD_LIMIT_ERROR);
    }

    const board = await ctx.db.insert("boards", {
      title: args.title,
      orgId: args.orgId,
      authorId: identity.subject,
      authorName: identity.name ?? identity.email ?? DEFAULT_AUTHOR_NAME,
      imageUrl: getRandomImage(),
    });

    return board;
  },
});

/**
 * Deletes a board, along with the authenticated user's favorite entry for
 * it, if one exists.
 *
 * All favorite entries and the board itself are deleted concurrently,
 * since none of these deletions depend on one another.
 *
 * @throws {Error} If the caller is not authenticated.
 */
export const remove = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);

    const allFavorites = await ctx.db
      .query("userFavorites")
      .withIndex("by_board", (q) => q.eq("boardId", args.id))
      .collect();

    await Promise.all([
      ...allFavorites.map((fav) => ctx.db.delete(fav._id)),
      ctx.db.delete(args.id),
    ]);
  },
});

/**
 * Updates a board's title after validation.
 *
 * Note: the title is trimmed only for the purpose of validation (must be
 * non-empty and at most `BOARD_TITLE_MAX_LENGTH` characters); the original, untrimmed value
 * supplied by the caller is what gets persisted.
 *
 * @throws {Error} If the caller is not authenticated, the trimmed title is
 * empty, or the trimmed title exceeds `BOARD_TITLE_MAX_LENGTH` characters.
 */
export const update = mutation({
  args: { id: v.id("boards"), title: v.string() },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);

    const title = args.title.trim();

    if (!title) {
      throw new Error("Title is required");
    }

    if (title.length > BOARD_TITLE_MAX_LENGTH) {
      throw new Error(`Title cannot be longer than ${BOARD_TITLE_MAX_LENGTH} characters`);
    }

    const board = await ctx.db.patch(args.id, {
      title: args.title,
    });

    return board;
  },
});

/**
 * Marks a board as a favorite of the authenticated user.
 *
 * The board lookup and the existing-favorite lookup are independent of
 * each other (both only require `args.id` and the caller's identity), so
 * they are performed concurrently.
 *
 * @throws {Error} If the caller is not authenticated, the board does not
 * exist, or the board is already favorited by the user.
 */
export const favorite = mutation({
  args: { id: v.id("boards"), orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const [board, existingFavorite] = await Promise.all([
      ctx.db.get(args.id),
      getFavorite(ctx, userId, args.id),
    ]);

    if (!board) {
      throw new Error("Board not found");
    }

    if (existingFavorite) {
      throw new Error("Board already favorited");
    }

    await ctx.db.insert("userFavorites", {
      userId,
      boardId: board._id,
      orgId: board.orgId,
    });

    return board;
  },
});

/**
 * Removes a board from the authenticated user's favorites.
 *
 * The board lookup and the existing-favorite lookup are independent of
 * each other (both only require `args.id` and the caller's identity), so
 * they are performed concurrently.
 *
 * @throws {Error} If the caller is not authenticated, the board does not
 * exist, or the board was not previously favorited by the user.
 */
export const unfavorite = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const [board, existingFavorite] = await Promise.all([
      ctx.db.get(args.id),
      getFavorite(ctx, userId, args.id),
    ]);

    if (!board) {
      throw new Error("Board not found");
    }

    if (!existingFavorite) {
      throw new Error("Favorited board not found");
    }

    await ctx.db.delete(existingFavorite._id);

    return board;
  },
});

/**
 * Fetches a single board by id.
 *
 * @returns The board document, or `null` if it does not exist.
 * No authentication is required.
 */
export const get = query({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.id);

    return board;
  },
});
