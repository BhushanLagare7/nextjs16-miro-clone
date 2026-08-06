"use node";

import { v } from "convex/values";
import Stripe from "stripe";

import { requireEnvVar } from "../lib/utils";

import { internal } from "./_generated/api";
import { action, ActionCtx, internalAction } from "./_generated/server";
import {
  MS_PER_SECOND,
  STRIPE_CURRENCY,
  STRIPE_PRODUCT_DESCRIPTION,
  STRIPE_PRODUCT_NAME,
  STRIPE_RECURRING_INTERVAL,
  STRIPE_UNIT_AMOUNT,
} from "./constants";

const url = requireEnvVar("NEXT_PUBLIC_APP_URL");
const stripeSecretKey = requireEnvVar("STRIPE_API_KEY");

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-07-29.dahlia" });

/**
 * Ensures the caller is authenticated and that an organization ID was provided.
 *
 * @param ctx - The Convex action context.
 * @param orgId - The organization ID to validate.
 * @returns The authenticated user's identity.
 * @throws {Error} "Unauthorized" if there is no authenticated identity.
 * @throws {Error} "No orgId provided" if `orgId` is falsy.
 */
async function requireAuthorizedOrgAccess(ctx: ActionCtx, orgId: string) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized");
  }

  if (!orgId) {
    throw new Error("No orgId provided");
  }

  return identity;
}

/**
 * Retrieves the Stripe subscription referenced by a checkout session.
 *
 * @param session - The Stripe checkout session containing the subscription ID.
 * @returns The full Stripe subscription object.
 */
async function retrieveSubscriptionFromSession(
  session: Stripe.Checkout.Session,
) {
  return await stripe.subscriptions.retrieve(session.subscription as string);
}

/**
 * Converts a Stripe subscription's current period end (seconds) into
 * milliseconds, as expected by the application's data model.
 *
 * @param subscription - The Stripe subscription to read the period end from.
 * @returns The current period end timestamp, in milliseconds.
 */
function getCurrentPeriodEndMillis(subscription: Stripe.Subscription): number {
  return subscription.items.data[0].current_period_end * MS_PER_SECOND;
}

/**
 * Creates a Stripe billing portal session for the given organization,
 * allowing the org owner to manage their existing subscription.
 *
 * @param orgId - The ID of the organization requesting the portal session.
 * @returns The URL of the Stripe billing portal session.
 * @throws {Error} If the caller is unauthorized, `orgId` is missing, or no
 *                 subscription exists for the organization.
 */
export const portal = action({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, { orgId }) => {
    await requireAuthorizedOrgAccess(ctx, orgId);

    const orgSubscription = await ctx.runQuery(internal.subscriptions.get, {
      orgId,
    });
    if (!orgSubscription) {
      throw new Error("No subscription found");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: orgSubscription.stripeCustomerId,
      return_url: url,
    });

    return session.url!;
  },
});

/**
 * Creates a Stripe checkout session for a new "Board Pro" monthly
 * subscription, scoped to the given organization.
 *
 * @param orgId - The ID of the organization purchasing the subscription.
 * @returns The URL of the Stripe checkout session.
 * @throws {Error} If the caller is unauthorized or `orgId` is missing.
 */
export const pay = action({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, { orgId }) => {
    const identity = await requireAuthorizedOrgAccess(ctx, orgId);

    const session = await stripe.checkout.sessions.create({
      success_url: url,
      cancel_url: url,
      customer_email: identity.email,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CURRENCY,
            product_data: {
              name: STRIPE_PRODUCT_NAME,
              description: STRIPE_PRODUCT_DESCRIPTION,
            },
            unit_amount: STRIPE_UNIT_AMOUNT,
            recurring: {
              interval: STRIPE_RECURRING_INTERVAL,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        orgId,
      },
      mode: "subscription",
    });

    return session.url!;
  },
});

/**
 * Internal action that handles incoming Stripe webhook events.
 *
 * Verifies the webhook signature, then:
 * - On `checkout.session.completed`, creates a new organization subscription record.
 * - On `invoice.payment_succeeded`, updates the existing subscription's current period end.
 *
 * Any error encountered while processing the event (after signature
 * verification) is logged and reported via the returned result rather than
 * thrown, so Stripe does not receive a failure response for handled errors.
 *
 * @param payload - The raw request body received from Stripe.
 * @param signature - The `Stripe-Signature` header value used to verify authenticity.
 * @returns `{ success: true }` if the event was processed without error,
 *          otherwise `{ success: false }`.
 * @throws {Error} If `STRIPE_WEBHOOK_SECRET` is not set (before processing begins).
 */
export const fulfill = internalAction({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, { payload, signature }) => {
    const webhookSecret = requireEnvVar("STRIPE_WEBHOOK_SECRET");

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      const session = event.data.object as Stripe.Checkout.Session;

      if (event.type === "checkout.session.completed") {
        const subscription = await retrieveSubscriptionFromSession(session);

        if (!session?.metadata?.orgId) {
          throw new Error("orgId not found");
        }

        await ctx.runMutation(internal.subscriptions.create, {
          orgId: session.metadata.orgId as string,
          stripeSubscriptionId: subscription.id as string,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id as string,
          stripeCurrentPeriodEnd: getCurrentPeriodEndMillis(subscription),
        });
      }

      if (event.type === "invoice.payment_succeeded") {
        const subscription = await retrieveSubscriptionFromSession(session);

        await ctx.runMutation(internal.subscriptions.update, {
          stripeSubscriptionId: subscription.id as string,
          stripeCurrentPeriodEnd: getCurrentPeriodEndMillis(subscription),
        });
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  },
});
