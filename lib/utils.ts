/**
 * @file utils.ts
 * @description Provides shared utility functions used throughout the canvas
 * board application, including class name merging, connection-based color
 * assignment for collaborative participants, coordinate conversion, color
 * serialization, and SVG path generation from freehand stroke data.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { Camera, Color } from "@/types/canvas";

/**
 * A predefined palette of colors used to visually distinguish participants
 * in a collaborative session. Colors are assigned based on a participant's
 * `connectionId` modulo the palette length to ensure consistent, repeatable
 * color mapping within a session.
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
 * Used to color participant cursors, avatars, and selection highlights
 * throughout the collaborative canvas.
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

/**
 * Converts a pointer event's client-space coordinates to canvas-space
 * coordinates by subtracting the current camera (pan) offset.
 *
 * This is used wherever a pointer position needs to be translated into the
 * coordinate system of the canvas content rather than the browser viewport.
 *
 * @param {React.PointerEvent} e - The pointer event whose `clientX` and
 *   `clientY` values are to be converted.
 * @param {Camera} camera - The current camera offset `{ x, y }` representing
 *   how far the canvas has been panned from the origin.
 * @returns {{ x: number; y: number }} The rounded canvas-space point
 *   corresponding to the pointer's position.
 *
 * @example
 * const canvasPoint = pointerEventToCanvasPoint(pointerEvent, { x: -200, y: -100 });
 * // If the pointer is at clientX=300, canvasPoint.x => 500
 */
export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera,
) {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
}

/**
 * Converts a {@link Color} object (with `r`, `g`, `b` components in the
 * range 0–255) to a CSS hex color string (e.g. `"#ff0000"`).
 *
 * Each channel is zero-padded to two hexadecimal digits to ensure a valid
 * 6-character hex string is always produced.
 *
 * @param {Color} color - The color object to convert, with `r`, `g`, and `b`
 *   properties as integers in the range 0–255.
 * @returns {string} A CSS hex color string in the format `"#rrggbb"`.
 *
 * @example
 * colorToCss({ r: 255, g: 0, b: 0 })   // => "#ff0000"
 * colorToCss({ r: 0, g: 128, b: 255 }) // => "#0080ff"
 * colorToCss({ r: 0, g: 0, b: 0 })     // => "#000000"
 */
export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

/**
 * Converts an array of outline points produced by `perfect-freehand`'s
 * `getStroke` function into an SVG path `d` attribute string.
 *
 * The algorithm:
 * 1. Returns an empty string for empty input, producing no visible path.
 * 2. Uses a `reduce` to build a sequence of quadratic Bézier curve commands
 *    (`M … Q … x y mx my`) where each control point is an original outline
 *    vertex and each anchor point is the midpoint between consecutive vertices.
 * 3. Closes the path with a `Z` command to ensure the stroke outline is fully
 *    enclosed and can be filled.
 *
 * @param {number[][]} stroke - An array of `[x, y]` points representing the
 *   computed stroke outline, as returned by `perfect-freehand`'s `getStroke`.
 * @returns {string} An SVG path `d` attribute string, or an empty string if
 *   the input array is empty.
 *
 * @example
 * const stroke = getStroke(points, { size: 16 });
 * const d = getSvgPathFromStroke(stroke);
 * // => "M x0 y0 Q x0 y0 mx01 my01 x1 y1 mx12 my12 … Z"
 * <path d={d} fill="#000" />
 */
export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}
