/**
 * @file constants.ts
 * @description Centralized constants for the dashboard components.
 * Magic numbers and strings used across the board list, search, and
 * board creation UI are defined here.
 */

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Debounce delay (in milliseconds) applied to the search input before
 * updating URL query parameters. Prevents excessive router pushes on
 * every keystroke.
 */
export const SEARCH_DEBOUNCE_MS = 500;

// ---------------------------------------------------------------------------
// Board Creation
// ---------------------------------------------------------------------------

/**
 * Default title assigned to newly created boards when the user has not
 * specified one.
 */
export const DEFAULT_BOARD_TITLE = "Untitled";
