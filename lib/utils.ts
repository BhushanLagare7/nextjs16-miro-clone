/**
 * @file utils.ts
 * @description Provides shared utility functions used throughout the canvas
 * board application, including class name merging and connection-based
 * color assignment for collaborative participants.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A predefined palette of colors used to visually distinguish participants
 * in a collaborative session. Colors are assigned based on a participant's
 * `connectionId` to ensure consistent color mapping within a session.
 *
 * @constant {string[]}
 */
const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

/**
 * Merges multiple class name values into a single string, combining
 * `clsx` for conditional class handling and `tailwind-merge` to resolve
 * conflicting Tailwind CSS utility classes.
 *
 * @param {...ClassValue[]} inputs - One or more class values, which can be
 *   strings, arrays, or objects (as supported by `clsx`).
 * @returns {string} A single merged class name string with Tailwind conflicts
 *   resolved.
 *
 * @example
 * // Basic usage
 * cn("px-4 py-2", "bg-blue-500") // => "px-4 py-2 bg-blue-500"
 *
 * @example
 * // Resolving Tailwind conflicts
 * cn("px-4", "px-6") // => "px-6"
 *
 * @example
 * // Conditional classes
 * cn("base-class", isActive && "active-class") // => "base-class active-class"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Maps a Liveblocks connection ID to a consistent color from the {@link COLORS}
 * palette. The color is determined by the connection ID modulo the number of
 * available colors, ensuring every participant receives a unique and stable
 * color within the palette's range.
 *
 * This is used to color participant cursors, avatars, and selection highlights
 * in the collaborative canvas.
 *
 * @param {number} connectionId - The unique numeric connection ID assigned to
 *   a participant by Liveblocks.
 * @returns {string} A hex color string from the {@link COLORS} palette.
 *
 * @example
 * connectionIdToColor(0) // => "#DC2626" (red)
 * connectionIdToColor(1) // => "#D97706" (amber)
 * connectionIdToColor(5) // => "#DC2626" (wraps back to red)
 */
export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length];
}
