import type { UserIdentity } from "convex/server";
import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

/**
 * Convex backend functions for managing `boards` and their per-user
 * favorites (`userFavorites`).
 *
 * All mutations require an authenticated caller; the `get` query is
 * publicly readable.
 */

/**
 * Pool of placeholder cover images assigned to newly created boards.
 * A random entry is chosen each time a board is created.
 */
const images = [
  "/placeholders/1.svg",
  "/placeholders/2.svg",
  "/placeholders/3.svg",
  "/placeholders/4.svg",
  "/placeholders/5.svg",
  "/placeholders/6.svg",
  "/placeholders/7.svg",
  "/placeholders/8.svg",
  "/placeholders/9.svg",
  "/placeholders/10.svg",
];

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
 * Creates a new board owned by the authenticated user within the given
 * organization, assigning it a random placeholder cover image.
 *
 * @throws {Error} If the caller is not authenticated.
 */
export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const randomImage = images[Math.floor(Math.random() * images.length)];

    const board = await ctx.db.insert("boards", {
      title: args.title,
      orgId: args.orgId,
      authorId: identity.subject,
      authorName: identity.name ?? identity.email ?? "Anonymous",
      imageUrl: randomImage,
    });

    return board;
  },
});

/**
 * Deletes a board, along with the authenticated user's favorite entry for
 * it, if one exists.
 *
 * @throws {Error} If the caller is not authenticated.
 */
export const remove = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const existingFavorite = await getFavorite(ctx, userId, args.id);

    if (existingFavorite) {
      await ctx.db.delete(existingFavorite._id);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Updates a board's title after validation.
 *
 * Note: the title is trimmed only for the purpose of validation (must be
 * non-empty and at most 60 characters); the original, untrimmed value
 * supplied by the caller is what gets persisted.
 *
 * @throws {Error} If the caller is not authenticated, the trimmed title is
 * empty, or the trimmed title exceeds 60 characters.
 */
export const update = mutation({
  args: { id: v.id("boards"), title: v.string() },
  handler: async (ctx, args) => {
    await requireIdentity(ctx);

    const title = args.title.trim();

    if (!title) {
      throw new Error("Title is required");
    }

    if (title.length > 60) {
      throw new Error("Title cannot be longer than 60 characters");
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
 * @throws {Error} If the caller is not authenticated, the board does not
 * exist, or the board is already favorited by the user.
 */
export const favorite = mutation({
  args: { id: v.id("boards"), orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const board = await ctx.db.get(args.id);

    if (!board) {
      throw new Error("Board not found");
    }

    const userId = identity.subject;

    const existingFavorite = await getFavorite(ctx, userId, board._id);

    if (existingFavorite) {
      throw new Error("Board already favorited");
    }

    await ctx.db.insert("userFavorites", {
      userId,
      boardId: board._id,
      orgId: args.orgId,
    });

    return board;
  },
});

/**
 * Removes a board from the authenticated user's favorites.
 *
 * @throws {Error} If the caller is not authenticated, the board does not
 * exist, or the board was not previously favorited by the user.
 */
export const unfavorite = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const board = await ctx.db.get(args.id);

    if (!board) {
      throw new Error("Board not found");
    }

    const userId = identity.subject;

    const existingFavorite = await getFavorite(ctx, userId, board._id);

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
    const board = ctx.db.get(args.id);

    return board;
  },
});
