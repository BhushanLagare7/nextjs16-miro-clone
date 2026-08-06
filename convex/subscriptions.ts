import { v } from "convex/values";

import {
  internalMutation,
  internalQuery,
  query,
  QueryCtx,
} from "./_generated/server";

/**
 * Retrieves the subscription document associated with the given organization ID.
 * Shared helper to avoid duplicating query logic across `get` and `getIsSubscribed`.
 *
 * @param ctx - The Convex query context.
 * @param orgId - The organization ID to look up.
 * @returns The matching subscription document, or `null` if none exists.
 */
async function getSubscriptionByOrgId(ctx: QueryCtx, orgId: string) {
  return await ctx.db
    .query("orgSubscriptions")
    .withIndex("by_org", (q) => q.eq("orgId", orgId))
    .unique();
}

/**
 * Internal query to fetch an organization's subscription record.
 *
 * @param orgId - The ID of the organization.
 * @returns The subscription document, or `null` if the organization has no subscription.
 */
export const get = internalQuery({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, { orgId }) => {
    return await getSubscriptionByOrgId(ctx, orgId);
  },
});

/**
 * Public query that checks whether an organization currently has an active,
 * non-expired subscription.
 *
 * @param orgId - The ID of the organization (optional; returns `false` if omitted).
 * @returns `true` if the organization has a subscription whose current period
 *          has not yet ended; otherwise `false`.
 */
export const getIsSubscribed = query({
  args: {
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, { orgId }) => {
    if (!orgId) return false;

    const subscription = await getSubscriptionByOrgId(ctx, orgId);
    const periodEnd = subscription?.stripeCurrentPeriodEnd;

    return !!(periodEnd && periodEnd > Date.now());
  },
});

/**
 * Internal mutation that creates a new organization subscription record.
 *
 * @param orgId - The ID of the organization.
 * @param stripeCustomerId - The Stripe customer ID associated with the organization.
 * @param stripeSubscriptionId - The Stripe subscription ID.
 * @param stripePriceId - The Stripe price ID for the subscribed plan.
 * @param stripeCurrentPeriodEnd - Timestamp (ms) marking the end of the current billing period.
 * @returns The ID of the newly created `orgSubscriptions` document.
 */
export const create = internalMutation({
  args: {
    orgId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    stripeCurrentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orgSubscriptions", args);
  },
});

/**
 * Internal mutation that updates the current billing period end date for an
 * existing subscription, identified by its Stripe subscription ID.
 *
 * On failure (subscription not found, or an unexpected error), the error is
 * logged and `{ success: false }` is returned rather than throwing.
 *
 * @param stripeSubscriptionId - The Stripe subscription ID to look up.
 * @param stripeCurrentPeriodEnd - The new timestamp (ms) for the end of the current billing period.
 * @returns `{ success: true }` if the update succeeded, otherwise `{ success: false }`.
 */
export const update = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripeCurrentPeriodEnd: v.number(),
  },
  handler: async (ctx, { stripeSubscriptionId, stripeCurrentPeriodEnd }) => {
    try {
      const existingSubscription = await ctx.db
        .query("orgSubscriptions")
        .withIndex("by_subscription", (q) =>
          q.eq("stripeSubscriptionId", stripeSubscriptionId),
        )
        .unique();

      if (!existingSubscription) {
        throw new Error("Subscription not found");
      }

      await ctx.db.patch(existingSubscription._id, {
        stripeCurrentPeriodEnd,
      });

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  },
});
