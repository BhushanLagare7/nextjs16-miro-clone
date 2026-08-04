/**
 * @file utils.ts
 * @description Provides shared utility functions used throughout the canvas
 * board application, including class name merging, connection-based color
 * assignment for collaborative participants, coordinate conversion, color
 * serialization, and SVG path generation from freehand stroke data.
 */

import { LiveMap, LiveObject } from "@liveblocks/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import {
  Camera,
  Color,
  Layer,
  LayerType,
  PathLayer,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";

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
export function cn(...inputs: ClassValue[]): string {
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
): { x: number; y: number } {
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
export function colorToCss(color: Color): string {
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
export function getSvgPathFromStroke(stroke: number[][]): string {
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

/**
 * Computes a new {@link XYWH} bounding box for a layer being resized by
 * dragging one of its corner or edge handles.
 *
 * Each active {@link Side} flag in `corner` independently adjusts the
 * corresponding edge of the bounding box to follow `point`, while ensuring
 * that `width` and `height` remain non-negative (the box "flips" if the
 * pointer crosses the opposing edge):
 *
 * - `Side.Left`   — moves the left edge; `x` is clamped to the right edge and
 *   `width` is the absolute distance between them.
 * - `Side.Right`  — moves the right edge; `x` stays at the original left edge
 *   and `width` is the absolute distance to `point.x`.
 * - `Side.Top`    — moves the top edge; `y` is clamped to the bottom edge and
 *   `height` is the absolute distance between them.
 * - `Side.Bottom` — moves the bottom edge; `y` stays at the original top edge
 *   and `height` is the absolute distance to `point.y`.
 *
 * Corner handles combine two flags (e.g. `Side.Top | Side.Left`) and both
 * axes are updated independently in the same call.
 *
 * @param {XYWH} bounds - The layer's bounding box at the moment the resize
 *   interaction began, used as the fixed reference frame for the opposing
 *   edges.
 * @param {Side} corner - A {@link Side} bitmask identifying which handle is
 *   being dragged. Multiple sides may be combined with the bitwise OR operator
 *   to represent a corner handle.
 * @param {Point} point - The current canvas-space pointer position to which
 *   the active edge(s) are being dragged.
 * @returns {XYWH} A new bounding box reflecting the updated position and
 *   dimensions after the resize, always with non-negative `width` and
 *   `height`.
 *
 * @example
 * // Drag the bottom-right corner to canvas point (250, 300)
 * resizeBounds(
 *   { x: 100, y: 100, width: 100, height: 100 },
 *   Side.Bottom | Side.Right,
 *   { x: 250, y: 300 }
 * );
 * // => { x: 100, y: 100, width: 150, height: 200 }
 *
 * @example
 * // Drag the left edge past the right edge (flipping)
 * resizeBounds(
 *   { x: 100, y: 100, width: 100, height: 100 },
 *   Side.Left,
 *   { x: 250, y: 150 }
 * );
 * // => { x: 200, y: 100, width: 50, height: 100 }
 */
export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

/**
 * Identifies all layers whose axis-aligned bounding boxes intersect with a
 * rectangular selection region defined by two canvas-space corner points.
 *
 * The selection rectangle is normalised from the two diagonal corner points
 * `a` and `b` so that the function is order-independent (i.e. `a` may be
 * any corner, not necessarily the top-left). Intersection is tested using the
 * standard AABB (Axis-Aligned Bounding Box) overlap check: two rectangles
 * overlap if and only if neither is entirely to the left, right, above, or
 * below the other.
 *
 * Layers backed by a Liveblocks {@link LiveObject} are transparently
 * deserialised via `toJSON()` before their geometry is read, so the function
 * works with both plain {@link ReadonlyMap} stores and live Liveblocks
 * {@link LiveMap} stores without any change to the call-site.
 *
 * Layers whose ID is present in `layerIds` but cannot be found in `layers`
 * (i.e. `layers.get(layerId)` returns `null` or `undefined`) are silently
 * skipped.
 *
 * @param {readonly string[]} layerIds - An ordered list of layer IDs that
 *   defines the set of layers to test. Only IDs present in this array are
 *   evaluated; the ordering does not affect the result.
 * @param {ReadonlyMap<string, Layer> | LiveMap<string, LiveObject<Layer>>} layers -
 *   A map from layer ID to layer data. Accepts either a plain read-only map
 *   (e.g. a snapshot) or a live Liveblocks map used during an active
 *   collaborative session.
 * @param {Point} a - The first corner of the selection rectangle in
 *   canvas-space coordinates.
 * @param {Point} b - The diagonally opposite corner of the selection rectangle
 *   in canvas-space coordinates.
 * @returns {string[]} An array of layer IDs whose bounding boxes overlap with
 *   the selection rectangle. The array preserves the relative order of
 *   `layerIds` and is empty when no layers intersect.
 *
 * @example
 * // Select all layers that fall within a drag-selection rectangle
 * const selected = findIntersectingLayersWithRectangle(
 *   layerIds,
 *   layers,
 *   { x: 50,  y: 50  },  // top-left corner of drag selection
 *   { x: 300, y: 300 },  // bottom-right corner of drag selection
 * );
 * // => ["layer-2", "layer-5"]
 *
 * @example
 * // Works regardless of which corner is passed first
 * findIntersectingLayersWithRectangle(layerIds, layers, { x: 300, y: 300 }, { x: 50, y: 50 });
 * // => same result as above
 */
export function findIntersectingLayersWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer> | LiveMap<string, LiveObject<Layer>>,
  a: Point,
  b: Point,
): string[] {
  // Normalise the two corner points into a well-formed rectangle so that the
  // caller can pass them in any order (top-left → bottom-right or vice-versa).
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids = [];

  for (const layerId of layerIds) {
    const layer = layers.get(layerId);

    // Skip layers that are listed in layerIds but are absent from the map
    // (e.g. they were deleted during the current session).
    if (layer == null) {
      continue;
    }

    // Liveblocks LiveObject instances expose a toJSON() method; plain Layer
    // objects do not. Deserialise accordingly so geometry is always a POJO.
    const { x, y, height, width } =
      "toJSON" in layer && typeof layer.toJSON === "function"
        ? (layer.toJSON() as Layer)
        : (layer as Layer);

    // Standard AABB overlap test: the rectangles intersect when neither is
    // entirely outside the other on either axis.
    if (
      rect.x + rect.width > x &&
      rect.x < x + width &&
      rect.y + rect.height > y &&
      rect.y < y + height
    ) {
      ids.push(layerId);
    }
  }

  return ids;
}

/**
 * Determines whether black or white text will have the best readability
 * against a given background {@link Color} by computing the WCAG 2.x
 * relative luminance and comparing contrast ratios against both candidates.
 *
 * Each sRGB channel is first linearized (inverse gamma), then combined
 * using the ITU-R BT.709 coefficients (`0.2126 R + 0.7152 G + 0.0722 B`)
 * to produce relative luminance. The contrast ratio formula
 * `(L_lighter + 0.05) / (L_darker + 0.05)` is then evaluated for both
 * black (`L = 0`) and white (`L = 1`), and the text color yielding the
 * higher ratio is returned.
 *
 * Used wherever user-chosen or layer fill colors need legible overlaid text,
 * such as sticky-note labels or color-picker previews.
 *
 * @param {Color} color - The background color to evaluate, with `r`, `g`,
 *   and `b` properties as integers in the range 0–255.
 * @returns {"black" | "white"} `"black"` for light backgrounds,
 *   `"white"` for dark backgrounds.
 *
 * @example
 * getContrastingTextColor({ r: 255, g: 255, b: 255 }) // => "black"
 *
 * @example
 * getContrastingTextColor({ r: 0, g: 0, b: 0 })       // => "white"
 *
 * @example
 * // Mid-tone background — WCAG luminance ≈ 0.28 => white text
 * getContrastingTextColor({ r: 100, g: 150, b: 200 })  // => "white"
 */
export function getContrastingTextColor(color: Color): "black" | "white" {
  // sRGB → linear channel conversion per WCAG 2.x
  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  // Relative luminance (ITU-R BT.709)
  const L =
    0.2126 * toLinear(color.r) +
    0.7152 * toLinear(color.g) +
    0.0722 * toLinear(color.b);

  // Contrast ratio: (lighter + 0.05) / (darker + 0.05)
  const contrastWithBlack = (L + 0.05) / 0.05;
  const contrastWithWhite = 1.05 / (L + 0.05);

  return contrastWithWhite > contrastWithBlack ? "white" : "black";
}

/**
 * Converts an array of raw pen/pointer input points (as captured during a
 * freehand drawing gesture) into a {@link PathLayer} ready to be persisted
 * in Liveblocks shared storage.
 *
 * The algorithm performs a single pass over `points` to compute the axis-
 * aligned bounding box (`left`, `top`, `right`, `bottom`) that encloses the
 * entire stroke. Manual comparisons are used instead of `Math.min`/`Math.max`
 * with spread arguments to avoid allocating an intermediate array and to
 * sidestep the engine call-stack limits that spreading large point arrays
 * into `Math.min`/`Math.max` can hit.
 *
 * Once the bounding box is known, each point is re-expressed relative to the
 * top-left corner (`left`, `top`) so the resulting {@link PathLayer} stores
 * points in its own local coordinate space, with `x`/`y` on the layer itself
 * marking where that local space is anchored on the canvas.
 *
 * @param {number[][]} points - An array of `[x, y, pressure]` tuples captured
 *   during a pointer-drawn stroke, in canvas-space coordinates. Must contain
 *   at least 2 points.
 * @param {Color} color - The fill color to assign to the resulting path
 *   layer.
 * @throws {Error} If `points` contains fewer than 2 points, since a path
 *   cannot be meaningfully drawn or bounded with fewer points.
 * @returns {PathLayer} A new path layer with `type: LayerType.Path`, its
 *   bounding box (`x`, `y`, `width`, `height`), the given `fill` color, and
 *   `points` translated into the layer's local coordinate space.
 *
 * @example
 * const layer = penPointsToPathLayer(
 *   [[10, 10, 0.5], [20, 15, 0.6], [15, 25, 0.4]],
 *   { r: 0, g: 0, b: 0 },
 * );
 * // => {
 * //   type: LayerType.Path,
 * //   x: 10, y: 10, width: 10, height: 15,
 * //   fill: { r: 0, g: 0, b: 0 },
 * //   points: [[0, 0, 0.5], [10, 5, 0.6], [5, 15, 0.4]],
 * // }
 */
export function penPointsToPathLayer(
  points: number[][],
  color: Color,
): PathLayer {
  if (points.length < 2) {
    throw new Error("Cannot transform points with less than 2 points");
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const [x, y] = point;

    if (left > x) {
      left = x;
    }

    if (top > y) {
      top = y;
    }

    if (right < x) {
      right = x;
    }

    if (bottom < y) {
      bottom = y;
    }
  }

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    fill: color,
    points: points.map(([x, y, pressure]) => [x - left, y - top, pressure]),
  };
}
