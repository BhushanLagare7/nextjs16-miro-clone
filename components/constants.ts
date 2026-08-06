/**
 * @file constants.ts
 * @description Centralized constants for shared components.
 * Contains configuration values used across the Liveblocks Room provider
 * and other shared UI components.
 */

// ---------------------------------------------------------------------------
// Liveblocks Configuration
// ---------------------------------------------------------------------------

/**
 * The API endpoint used by the Liveblocks provider to authenticate users
 * for real-time collaboration sessions.
 */
export const LIVEBLOCKS_AUTH_ENDPOINT = "/api/liveblocks-auth";

/**
 * Throttle interval (in milliseconds) for Liveblocks presence broadcast
 * updates. 16 ms ≈ 60 fps, providing smooth cursor tracking without
 * overwhelming the network.
 */
export const LIVEBLOCKS_THROTTLE_MS = 16;
