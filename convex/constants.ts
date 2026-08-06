/**
 * @file constants.ts
 * @description Centralized constants for the Convex backend functions.
 * All magic numbers and strings used across board management, Stripe
 * integration, and HTTP routing are defined here.
 */

// ---------------------------------------------------------------------------
// Board Limits & Defaults
// ---------------------------------------------------------------------------

/**
 * Maximum number of boards a non-subscribed organization is allowed to
 * have. Organizations with an active subscription are exempt from this
 * limit.
 */
export const ORG_BOARD_LIMIT = 2;

/**
 * Maximum number of characters allowed in a board title.
 * Enforced both on the server (mutation validation) and client (input maxLength).
 */
export const BOARD_TITLE_MAX_LENGTH = 60;

/**
 * Pool of placeholder cover images assigned to newly created boards.
 * A random entry is chosen each time a board is created.
 */
export const BOARD_PLACEHOLDER_IMAGES = [
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
] as const;

/**
 * Fallback author name used when neither the user's name nor email
 * is available from their identity.
 */
export const DEFAULT_AUTHOR_NAME = "Anonymous";

/**
 * Error code thrown (and checked client-side) when a non-subscribed
 * organization attempts to create a board beyond {@link ORG_BOARD_LIMIT}.
 */
export const BOARD_LIMIT_ERROR = "BOARD_LIMIT";

// ---------------------------------------------------------------------------
// Stripe Configuration
// ---------------------------------------------------------------------------

/**
 * Display name of the subscription product shown in Stripe checkout.
 */
export const STRIPE_PRODUCT_NAME = "Board Pro";

/**
 * Description of the subscription product shown in Stripe checkout.
 */
export const STRIPE_PRODUCT_DESCRIPTION =
  "Unlimited boards for your organization";

/**
 * Price in the smallest currency unit (cents for USD) for the Pro
 * subscription. $20.00 = 2000 cents.
 */
export const STRIPE_UNIT_AMOUNT = 2000;

/**
 * ISO 4217 currency code used for Stripe checkout sessions.
 */
export const STRIPE_CURRENCY = "usd" as const;

/**
 * Billing interval for the recurring subscription.
 */
export const STRIPE_RECURRING_INTERVAL = "month" as const;

/**
 * HTTP route path where Stripe webhook events are received.
 */
export const STRIPE_WEBHOOK_PATH = "/stripe";

/**
 * Multiplier for converting Unix timestamps from seconds to milliseconds.
 */
export const MS_PER_SECOND = 1000;

// ---------------------------------------------------------------------------
// HTTP Status Codes
// ---------------------------------------------------------------------------

/**
 * HTTP 200 OK — successful request.
 */
export const HTTP_STATUS_OK = 200;

/**
 * HTTP 400 Bad Request — missing or invalid request data.
 */
export const HTTP_STATUS_BAD_REQUEST = 400;

/**
 * HTTP 500 Internal Server Error — unrecoverable server-side error.
 */
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
