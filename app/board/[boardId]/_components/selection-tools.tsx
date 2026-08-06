"use client";

/**
 * @file selection-tools.tsx
 * @description Provides the {@link SelectionTools} component — a floating
 * contextual toolbar that appears above the current selection on the
 * collaborative canvas. It exposes controls for changing the fill colour of
 * selected layers, reordering them in the stacking order (bring to front /
 * send to back), and deleting them from the board.
 */

import { memo } from "react";

import { useMutation, useSelf } from "@liveblocks/react";
import { BringToFrontIcon, SendToBackIcon, Trash2Icon } from "lucide-react";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { Camera, Color } from "@/types/canvas";

import { ColorPicker } from "./color-picker";
import { SELECTION_TOOLS_Y_OFFSET } from "./constants";

/**
 * Props accepted by the {@link SelectionTools} component.
 */
interface SelectionToolsProps {
  /**
   * The current camera (pan) offset for the canvas viewport.
   * Used to convert canvas-space selection bounds into screen-space
   * coordinates so the toolbar is positioned directly above the selection.
   */
  camera: Camera;

  /**
   * Callback invoked whenever the user picks a new fill colour from the
   * colour picker. Allows the parent to persist the chosen colour so it can
   * be pre-selected the next time the picker is opened.
   *
   * @param {Color} color - The newly selected fill colour.
   */
  setLastUsedColor: (color: Color) => void;
}

/**
 * A memoised floating toolbar rendered above the active layer selection on
 * the collaborative canvas.
 *
 * ### Behaviour
 * - **Visibility** — The toolbar is only rendered when there is at least one
 *   selected layer with a computable bounding box. If `useSelectionBounds`
 *   returns `null` (nothing selected), the component renders `null`.
 * - **Position** — The toolbar is horizontally centred over the selection and
 *   placed 16 px above its top edge, taking the current camera pan offset
 *   into account so it always tracks the selection in screen space.
 * - **Colour picker** — Applies the chosen colour to the `fill` property of
 *   every selected layer via a Liveblocks mutation and notifies the parent
 *   through `setLastUsedColor`.
 * - **Bring to front** — Moves all selected layers to the top of the
 *   `layerIds` ordered list (rendered last → painted on top), preserving
 *   their relative order among themselves.
 * - **Send to back** — Moves all selected layers to the bottom of the
 *   `layerIds` ordered list (rendered first → painted beneath all others),
 *   preserving their relative order among themselves.
 * - **Delete** — Removes all selected layers from the board via the
 *   `useDeleteLayers` hook.
 *
 * The component is wrapped in `React.memo` to avoid unnecessary re-renders
 * when unrelated parts of the parent state change.
 *
 * @component
 * @param {SelectionToolsProps} props - See {@link SelectionToolsProps}.
 * @returns {JSX.Element | null} The floating toolbar, or `null` when there
 *   is no active selection.
 *
 * @example
 * <SelectionTools
 *   camera={camera}
 *   setLastUsedColor={setLastUsedColor}
 * />
 */
export const SelectionTools = memo(
  ({ camera, setLastUsedColor }: SelectionToolsProps) => {
    /** The current user's array of selected layer IDs from Liveblocks presence. */
    const selection = useSelf((me) => me.presence.selection);

    /**
     * Moves all currently selected layers to the front of the stacking order
     * by relocating their IDs to the end of the `layerIds` LiveList.
     *
     * The algorithm collects the indices of all selected layers, then iterates
     * from the last index to the first and moves each entry to its target
     * position at the tail of the list. Iterating in reverse prevents earlier
     * moves from invalidating the indices of layers not yet processed.
     *
     * Exits early if `selection` is empty or undefined.
     */
    const moveToFront = useMutation(
      ({ storage }) => {
        if (!selection) return;

        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = [...liveLayerIds];

        // Collect the current index of every selected layer.
        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        // Move each selected layer to the tail of the list in reverse order
        // so that earlier moves do not shift the indices of later entries.
        for (let i = indices.length - 1; i >= 0; i--) {
          liveLayerIds.move(
            indices[i],
            arr.length - 1 - (indices.length - 1 - i),
          );
        }
      },
      [selection],
    );

    /**
     * Moves all currently selected layers to the back of the stacking order
     * by relocating their IDs to the beginning of the `layerIds` LiveList.
     *
     * The algorithm collects the indices of all selected layers, then iterates
     * from the first index to the last and moves each entry to position `i`
     * (0, 1, 2 …). Forward iteration is correct here because each move shifts
     * subsequent unprocessed indices by exactly one position, which is
     * accounted for by incrementing the target position in lockstep.
     *
     * Exits early if `selection` is empty or undefined.
     */
    const moveToBack = useMutation(
      ({ storage }) => {
        if (!selection) return;

        const liveLayerIds = storage.get("layerIds");
        const indices: number[] = [];

        const arr = [...liveLayerIds];

        // Collect the current index of every selected layer.
        for (let i = 0; i < arr.length; i++) {
          if (selection.includes(arr[i])) {
            indices.push(i);
          }
        }

        // Move each selected layer toward the head of the list, placing the
        // i-th selected layer at position i (0-based).
        for (let i = 0; i < indices.length; i++) {
          liveLayerIds.move(indices[i], i);
        }
      },
      [selection],
    );

    /**
     * Applies a new fill colour to every selected layer.
     *
     * Iterates over the current selection and calls `.set("fill", fill)` on
     * each corresponding Liveblocks LiveObject, then notifies the parent
     * component via `setLastUsedColor` so the colour can be persisted for
     * future use.
     *
     * Exits early if `selection` is empty or undefined.
     *
     * @param {Color} fill - The new fill colour to apply.
     */
    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        if (!selection) return;

        const liveLayers = storage.get("layers");

        // Persist the chosen colour in the parent so it can be pre-selected
        // the next time the colour picker is opened.
        setLastUsedColor(fill);

        selection.forEach((id) => {
          liveLayers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor],
    );

    /** Deletes all currently selected layers from the board. */
    const deleteLayers = useDeleteLayers();

    /**
     * The merged axis-aligned bounding box that encloses all selected layers,
     * expressed in canvas-space coordinates. `null` when nothing is selected.
     */
    const selectionBounds = useSelectionBounds();

    // Render nothing when there is no active selection or the bounding box
    // cannot be determined (e.g. all selected layers have been deleted).
    if (!selectionBounds) {
      return null;
    }

    /**
     * Horizontal centre of the selection in screen space.
     * Computed by taking the canvas-space centre of the bounding box and
     * adding the camera's horizontal pan offset.
     */
    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;

    /**
     * Top edge of the selection in screen space.
     * The toolbar is rendered 16 px above this value (via the CSS transform).
     */
    const y = selectionBounds.y + camera.y;

    return (
      /**
       * Floating container positioned in screen space above the selection.
       * `translate(-50%, -100%)` centres it horizontally and places it above
       * the selection, while the additional `- 16px` on the Y axis adds a
       * small gap between the toolbar and the top edge of the selection.
       */
      <div
        className="absolute flex rounded-xl border bg-white p-3 shadow-sm select-none"
        style={{
          transform: `translate(
          calc(${x}px - 50%),
          calc(${y - SELECTION_TOOLS_Y_OFFSET}px - 100%)
        )`,
        }}
      >
        {/* Colour picker — applies chosen colour to all selected layers */}
        <ColorPicker onChange={setFill} />

        {/* Stacking-order controls */}
        <div className="flex flex-col gap-y-0.5">
          <Hint label="Bring to front">
            <Button size="icon" variant="board" onClick={moveToFront}>
              <BringToFrontIcon />
            </Button>
          </Hint>
          <Hint label="Send to back" side="bottom">
            <Button size="icon" variant="board" onClick={moveToBack}>
              <SendToBackIcon />
            </Button>
          </Hint>
        </div>

        {/* Delete control */}
        <div className="ml-2 flex items-center border-l border-neutral-200 pl-2">
          <Hint label="Delete">
            <Button size="icon" variant="board" onClick={deleteLayers}>
              <Trash2Icon />
            </Button>
          </Hint>
        </div>
      </div>
    );
  },
);

/**
 * Display name used by React DevTools to identify this component in the
 * component tree. Explicitly set because the component is wrapped in
 * `React.memo`, which would otherwise display as `"Memo"`.
 */
SelectionTools.displayName = "SelectionTools";
