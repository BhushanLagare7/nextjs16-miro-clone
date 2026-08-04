/**
 * @file use-selection-bounds.ts
 * @description Custom React hook that computes the bounding box for the
 * currently selected layers on the collaborative canvas. Integrates with
 * Liveblocks to reactively derive bounds from shared storage and local
 * user presence data.
 */

import { shallow, useSelf, useStorage } from "@liveblocks/react";

import { Layer, XYWH } from "@/types/canvas";

/**
 * Computes the smallest axis-aligned bounding box (AABB) that fully
 * contains all the given layers.
 *
 * ### Algorithm
 * Iterates through all layers, tracking the minimum/maximum extents on
 * each axis, and returns a single rectangle that contains every layer.
 *
 * ```
 *  ┌──────────────────────────┐  ← top    (min y)
 *  │  ┌──────┐                │
 *  │  │  L1  │  ┌────────┐    │
 *  │  └──────┘  │   L2   │    │
 *  │            └────────┘    │
 *  └──────────────────────────┘  ← bottom (max y + height)
 *  ↑ left (min x)      ↑ right (max x + width)
 * ```
 *
 * @param layers - An array of {@link Layer} objects to compute the
 *   bounding box for. May be empty.
 * @returns An {@link XYWH} rectangle `{ x, y, width, height }` that
 *   tightly encloses all provided layers, or `null` when the array
 *   is empty.
 *
 * @example
 * ```ts
 * const box = boundingBox([
 *   { x: 10, y: 20, width: 100, height: 50 },
 *   { x: 80, y: 10, width: 60,  height: 40 },
 * ]);
 * // → { x: 10, y: 10, width: 130, height: 60 }
 * ```
 */
function boundingBox(layers: Layer[]): XYWH | null {
  const first = layers[0];

  // Guard: return null immediately for an empty input array.
  if (!first) {
    return null;
  }

  // Initialise extents from the first layer so we avoid a separate
  // "infinity sentinel" and keep the types simple.
  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  // Expand the extents to accommodate every subsequent layer.
  for (let i = 1; i < layers.length; i++) {
    const { x, y, width, height } = layers[i];

    if (left > x) left = x;
    if (right < x + width) right = x + width;
    if (top > y) top = y;
    if (bottom < y + height) bottom = y + height;
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

/**
 * Custom hook – returns the axis-aligned bounding box that encloses
 * **all currently selected layers** on the canvas.
 *
 * ### Data flow
 * ```
 * Liveblocks presence  →  local selection (array of layer IDs)
 *                                  │
 * Liveblocks storage   →  layer map (root.layers)
 *                                  │
 *                         selectedLayers (resolved Layer[])
 *                                  │
 *                         boundingBox()  →  XYWH | null
 * ```
 *
 * ### Reactivity & performance
 * - The inner `useStorage` selector is **shallowly compared** via the
 *   `shallow` equality helper from Liveblocks, so the hook only triggers
 *   a re-render when the numeric values of the bounding box actually
 *   change – not merely when a new object reference is produced.
 * - The `useSelf` subscription ensures the hook also re-runs whenever
 *   the local user changes their selection.
 *
 * ### Edge cases
 * | Scenario | Return value |
 * |---|---|
 * | No layers selected | `null` |
 * | Selected layer IDs that don't exist in storage | `null` (filtered out) |
 * | Single layer selected | Bounding box equal to that layer's own XYWH |
 * | Multiple layers selected | Tight AABB around all of them |
 *
 * @returns The {@link XYWH} bounding box of the current selection, or
 *   `null` if nothing is selected or no matching layers are found.
 *
 * @example
 * ```tsx
 * function MyOverlay() {
 *   const bounds = useSelectionBounds();
 *
 *   if (!bounds) return null;
 *
 *   return (
 *     <rect
 *       x={bounds.x}       y={bounds.y}
 *       width={bounds.width} height={bounds.height}
 *     />
 *   );
 * }
 * ```
 */
export function useSelectionBounds(): XYWH | null {
  /**
   * Derive the local user's current selection from their Liveblocks
   * presence. This is a plain array of layer IDs (strings).
   *
   * Re-subscribes automatically whenever the selection changes.
   */
  const selection = useSelf((me) => me.presence.selection);

  return useStorage((root) => {
    // No active selection: nothing to bound.
    if (!selection) {
      return null;
    }

    /**
     * Resolve each selected layer ID to its full {@link Layer} object,
     * silently dropping any IDs that are missing from storage (e.g. a
     * layer deleted by another user mid-session).
     */
    const selectedLayers = selection
      .map((layerId) => root.layers[layerId])
      .filter(Boolean) as Layer[];

    return boundingBox(selectedLayers);
  }, shallow); // Shallow equality prevents spurious re-renders.
}
