/**
 * @file http.ts
 * @description Convex HTTP router configuration for the application.
 *
 * Defines HTTP endpoints that can be called by external services.
 * Currently exposes a single POST endpoint at `/stripe` for handling
 * incoming Stripe webhook events.
 *
 * @see {@link https://docs.convex.dev/functions/http-actions} Convex HTTP Actions
 * @see {@link https://stripe.com/docs/webhooks} Stripe Webhooks
 */

import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import {
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_OK,
  STRIPE_WEBHOOK_PATH,
} from "./constants";

/**
 * The Convex HTTP router instance.
 * Routes are registered on this object and exported as the default export,
 * which Convex uses to resolve incoming HTTP requests.
 */
const http = httpRouter();

/**
 * POST /stripe
 *
 * Webhook endpoint for Stripe event notifications.
 *
 * ### Flow
 * 1. Extracts the `stripe-signature` header sent by Stripe to verify authenticity.
 * 2. Returns a `400 Bad Request` immediately if the signature header is absent.
 * 3. Delegates verification and processing to `internal.stripe.fulfill`, passing
 *    the raw request body (`payload`) and the signature string.
 * 4. Returns `200 OK` on successful processing.
 * 5. Returns `500 Internal Server Error` if Stripe signature verification fails
 *    or the fulfillment action throws an error.
 *
 * ### Security
 * The `stripe-signature` header is verified inside `internal.stripe.fulfill`
 * using the Stripe SDK and the webhook signing secret. Requests with a missing
 * or invalid signature are rejected before any business logic runs.
 *
 * @param {Request} request - The incoming HTTP request from Stripe.
 * @returns {Promise<Response>}
 *  - `200` – Webhook received and processed successfully.
 *  - `400` – Missing `stripe-signature` header.
 *  - `500` – Webhook signature verification failed or processing error.
 */
http.route({
  path: STRIPE_WEBHOOK_PATH,
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    /** The Stripe-generated signature used to verify the webhook payload. */
    const signature = request.headers.get("stripe-signature");

    /* Reject requests that do not include a Stripe signature header */
    if (!signature) {
      return new Response(null, { status: HTTP_STATUS_BAD_REQUEST });
    }

    /**
     * Delegate to the internal Stripe fulfillment action.
     * The raw text body is passed to allow the Stripe SDK to verify
     * the HMAC signature against the original, unmodified payload.
     */
    const result = await ctx.runAction(internal.stripe.fulfill, {
      payload: await request.text(),
      signature,
    });

    if (result.success) {
      /* Acknowledge successful receipt of the webhook event */
      return new Response(null, { status: HTTP_STATUS_OK });
    } else {
      /* Signal failure to Stripe so it can retry the webhook delivery */
      return new Response("Webhook verification failed", { status: HTTP_STATUS_INTERNAL_SERVER_ERROR });
    }
  }),
});

/**
 * The configured HTTP router exported as the default export.
 * Convex uses this to map incoming HTTP requests to the correct handler.
 */
export default http;
