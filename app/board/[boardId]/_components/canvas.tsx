/**
 * @file canvas.tsx
 * @description Provides the main Canvas component for the collaborative board
 * application. It manages canvas state (active tool, camera position, last used
 * color) and integrates with Liveblocks for real-time collaboration features
 * such as shared history, live layer storage, and presence tracking.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import { LiveObject } from "@liveblocks/client";
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useOthersMapped,
  useStorage,
} from "@liveblocks/react";
import { nanoid } from "nanoid";

import {
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  LayerType,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";

import { CursorsPresence } from "./cursors-presence";
import { Info } from "./info";
import { LayerPreview } from "./layer-preview";
import { Participants } from "./participants";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Toolbar } from "./toolbar";

/**
 * The maximum number of layers allowed on the canvas at any given time.
 * Inserting a new layer when this limit is reached will be a no-op.
 *
 * @constant {number}
 */
const MAX_LAYERS = 100;

/**
 * Props for the Canvas component.
 *
 * @interface CanvasProps
 * @property {string} boardId - The unique identifier for the board being
 *   rendered. Used to fetch and display board-specific information via the
 *   {@link Info} panel.
 */
interface CanvasProps {
  boardId: string;
}

/**
 * Canvas component that serves as the main drawing surface for the
 * collaborative board application.
 *
 * Responsibilities:
 * - Manages the local `canvasState` to track the active tool and drawing mode.
 * - Manages the `camera` offset to support panning via the mouse wheel.
 * - Tracks the `lastUsedColor` so newly inserted layers inherit it as their
 *   fill color.
 * - Integrates with the Liveblocks `useHistory` hook to support collaborative
 *   undo/redo functionality across all room participants.
 * - Exposes pointer and wheel event handlers on the SVG surface to drive
 *   camera movement, cursor presence, layer insertion, translation, resizing,
 *   and marquee (selection-net) multi-selection.
 * - Renders the {@link Info} panel, {@link Participants} list, and
 *   {@link Toolbar} as overlays on top of the SVG canvas surface.
 * - Renders each shared layer via {@link LayerPreview} and all remote
 *   participant cursors via {@link CursorsPresence}.
 *
 * This is a **Client Component** (`"use client"`) as it depends on React state
 * and Liveblocks real-time hooks.
 *
 * @param {CanvasProps} props - The props for the Canvas component.
 * @param {string} props.boardId - The unique identifier for the board.
 * @returns {JSX.Element} The full-screen canvas with overlaid UI components.
 *
 * @example
 * // Render the Canvas for a specific board
 * <Canvas boardId="board-123" />
 */
export function Canvas({ boardId }: CanvasProps) {
  /**
   * The ordered list of layer IDs stored in Liveblocks shared storage.
   * Determines the render order of layers on the canvas.
   */
  const layerIds = useStorage((root) => root.layerIds);

  /**
   * Local state representing the current mode and configuration of the canvas
   * (e.g. idle, inserting a shape, drawing with pencil).
   * Initialized to `CanvasMode.None` (selection/idle mode).
   */
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  /**
   * Local state representing the current camera (pan) offset applied to the
   * SVG `<g>` transform. Adjusted by wheel events to pan the canvas.
   */
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });

  /**
   * Local state holding the most recently used fill color. Applied as the
   * `fill` property when a new layer is inserted onto the canvas.
   */
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  /**
   * Liveblocks shared history object, providing `undo` and `redo` methods
   * that are synchronized across all collaborators in the room.
   */
  const history = useHistory();

  /**
   * Whether there are actions available to undo in the shared history.
   * Passed to {@link Toolbar} to disable the undo button when appropriate.
   */
  const canUndo = useCanUndo();

  /**
   * Whether there are actions available to redo in the shared history.
   * Passed to {@link Toolbar} to disable the redo button when appropriate.
   */
  const canRedo = useCanRedo();

  /**
   * Inserts a new layer into the Liveblocks shared storage at the given
   * canvas position. The layer is initialized with a fixed size of 100×100
   * and the current `lastUsedColor` as its fill.
   *
   * Guards against exceeding {@link MAX_LAYERS}. After insertion, the new
   * layer is immediately selected via `setMyPresence` and the canvas mode
   * is reset to `CanvasMode.None`.
   *
   * @param {LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note} layerType
   *   The type of layer to create.
   * @param {Point} position - The canvas-space coordinate at which to place
   *   the top-left corner of the new layer.
   */
  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor],
  );

  /**
   * Moves all currently selected layers by the delta between the previous
   * pointer position stored in `canvasState.current` and the supplied `point`.
   *
   * Only executes when `canvasState.mode` is `CanvasMode.Translating`; returns
   * early otherwise. After applying the offset to every selected layer in
   * Liveblocks shared storage, it updates `canvasState.current` to `point` so
   * the next move event computes a correct incremental delta.
   *
   * @param {Point} point - The current canvas-space pointer position, used to
   *   compute the translation offset relative to the last recorded position.
   */
  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);

        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );

  /**
   * Clears the current user's layer selection by setting their presence
   * `selection` to an empty array. The change is recorded in the shared
   * history so it can be undone via `history.undo`.
   *
   * No-ops when the selection is already empty to avoid unnecessary
   * history entries.
   */
  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  /**
   * Updates the "selection net" (marquee) rectangle while the user drags to
   * multi-select layers, and refreshes the local participant's selection to
   * include every layer currently intersecting that rectangle.
   *
   * Sets (or keeps) `canvasState.mode` as `CanvasMode.SelectionNet` with the
   * supplied `origin` and `current` points defining opposite corners of the
   * marquee rectangle. Uses {@link findIntersectingLayersWithRectangle} against
   * the current `layerIds` and live layer storage to compute which layer IDs
   * fall within that rectangle, then applies the result as the local
   * participant's selection via `setMyPresence`.
   *
   * @param {Point} current - The current canvas-space pointer position,
   *   representing one corner of the selection rectangle.
   * @param {Point} origin - The canvas-space pointer position where the
   *   selection gesture started, representing the opposite corner of the
   *   selection rectangle.
   */
  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get("layers");
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });

      const ids = findIntersectingLayersWithRectangle(
        layerIds ?? [],
        layers,
        origin,
        current,
      );

      setMyPresence({ selection: ids });
    },
    [layerIds],
  );

  /**
   * Determines whether the pointer has moved far enough from its initial
   * "pressing" origin to begin a multi-selection (marquee) gesture and, if
   * so, transitions the canvas into `CanvasMode.SelectionNet`.
   *
   * Uses a Manhattan distance threshold (sum of absolute x/y deltas) of 5
   * pixels between `origin` and `current` to avoid accidentally starting a
   * selection net on a simple click. Below the threshold, the canvas remains
   * in its current mode (typically `CanvasMode.Pressing`).
   *
   * @param {Point} current - The current canvas-space pointer position.
   * @param {Point} origin - The canvas-space pointer position where the
   *   press gesture started.
   */
  const startMultiSelection = useCallback(
    (current: Point, origin: Point) => {
      if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
        setCanvasState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });
        updateSelectionNet(current, origin);
      }
    },
    [updateSelectionNet],
  );

  /**
   * Updates the bounds of the single currently selected layer in Liveblocks
   * shared storage based on the active resize handle corner and the current
   * pointer position.
   *
   * Only executes when `canvasState.mode` is `CanvasMode.Resizing`; returns
   * early otherwise. Computes new bounds via {@link resizeBounds} using the
   * initial bounding box and the active corner stored in `canvasState`, then
   * writes the result back to the live layer object.
   *
   * @param {Point} point - The current canvas-space pointer position used to
   *   compute the updated layer bounds.
   */
  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) {
        layer.update(bounds);
      }
    },
    [canvasState],
  );

  /**
   * Handles a pointer down event on a resize handle of the {@link SelectionBox}.
   * Pauses the shared history so that all subsequent pointer-move resize
   * mutations are batched into a single undoable step, then transitions the
   * canvas into `CanvasMode.Resizing` with the affected corner and the layer's
   * current bounding box.
   *
   * History is resumed in {@link onPointerUp} once the resize interaction ends.
   *
   * @param {Side} corner - A {@link Side} bitmask identifying which corner or
   *   edge handle was grabbed (e.g. `Side.Top | Side.Left`).
   * @param {XYWH} initialBounds - The bounding box of the selected layer at
   *   the moment the resize begins, used as the reference frame for all
   *   subsequent resize calculations.
   */
  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history],
  );

  /**
   * Handles mouse wheel events on the SVG canvas to pan the camera.
   * Subtracts the wheel delta values from the current camera offset so that
   * scrolling moves the canvas content in the expected direction.
   *
   * @param {React.WheelEvent} e - The wheel event fired on the SVG element.
   */
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  /**
   * Handles pointer move events on the SVG canvas. Converts the pointer's
   * client coordinates to canvas-space using the current camera offset, then
   * broadcasts the updated position to other participants via `setMyPresence`.
   *
   * Additionally drives active interactions based on `canvasState.mode`:
   * - `CanvasMode.Pressing`: Delegates to {@link startMultiSelection} to
   *   determine whether a marquee selection gesture should begin.
   * - `CanvasMode.SelectionNet`: Delegates to {@link updateSelectionNet} to
   *   update the marquee rectangle and recompute the intersecting selection.
   * - `CanvasMode.Translating`: Delegates to {@link translateSelectedLayers}
   *   to move the selected layers.
   * - `CanvasMode.Resizing`: Delegates to {@link resizeSelectedLayer} to
   *   update the selected layer's bounds.
   *
   * @param {React.PointerEvent} e - The pointer move event fired on the SVG
   *   element.
   */
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      }

      setMyPresence({ cursor: current });
    },
    [
      camera,
      canvasState,
      resizeSelectedLayer,
      translateSelectedLayers,
      startMultiSelection,
      updateSelectionNet,
    ],
  );

  /**
   * Handles the pointer leave event on the SVG canvas. Clears the local
   * participant's cursor from presence so it is no longer rendered for other
   * collaborators when the pointer exits the canvas area.
   */
  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  /**
   * Handles pointer down events on the SVG canvas background (not on a layer).
   * Converts the client-space pointer position to canvas-space coordinates and,
   * depending on the current canvas mode:
   * - Returns early without changing state when in `CanvasMode.Inserting`,
   *   since the insertion is committed on pointer up.
   * - Otherwise transitions the canvas into `CanvasMode.Pressing` with the
   *   current canvas-space point as the origin, ready to begin a selection or
   *   drag gesture.
   *
   * @param {React.PointerEvent} e - The pointer down event fired on the SVG
   *   element.
   */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      // TODO: Add case for drawing

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, setCanvasState],
  );

  /**
   * Handles pointer up events on the SVG canvas. Converts the pointer
   * position to canvas-space coordinates and, depending on the current
   * `canvasState.mode`, performs one of the following:
   * - `CanvasMode.None` or `CanvasMode.Pressing`: Clears the current layer
   *   selection via {@link unselectLayers} and resets the canvas to idle mode.
   * - `CanvasMode.Inserting`: Commits a new layer at the pointer position by
   *   calling {@link insertLayer} with the active layer type.
   * - Any other mode (e.g. `SelectionNet`, `Translating`, `Resizing`): Resets
   *   the canvas to idle mode without further action, finalizing whatever
   *   selection/translation/resize was already applied incrementally during
   *   pointer move.
   *
   * In all cases, resumes the shared history so the completed operation is
   * recorded as a single undoable step.
   *
   * @param {Record<string, never>} _ - Unused mutation context (destructured
   *   and ignored).
   * @param {React.PointerEvent} e - The pointer up event fired on the SVG
   *   element.
   */
  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      history.resume();
    },
    [camera, canvasState, history, insertLayer, unselectLayers],
  );

  /**
   * A mapped snapshot of every other participant's current layer selection,
   * keyed by their Liveblocks connection ID. Used by
   * {@link layerIdsToColorSelection} to derive per-layer selection highlight
   * colors for remote collaborators.
   */
  const selections = useOthersMapped((other) => other.presence.selection);

  /**
   * Handles pointer down events fired directly on an individual layer element.
   * Pauses shared history so that the subsequent translation mutations are
   * batched into a single undoable step, then:
   * - Returns early without changing state when in `CanvasMode.Pencil` or
   *   `CanvasMode.Inserting`, where layer selection is not applicable.
   * - Adds the targeted layer to the local participant's selection (recorded
   *   in history) if it is not already selected.
   * - Transitions the canvas into `CanvasMode.Translating` with the current
   *   canvas-space pointer position, enabling drag-to-move behaviour.
   *
   * History is resumed in {@link onPointerUp} once the interaction ends.
   *
   * @param {React.PointerEvent} e - The pointer down event fired on the layer
   *   element. Propagation is stopped to prevent the SVG background handler
   *   from also firing.
   * @param {string} layerId - The ID of the layer that received the pointer
   *   down event.
   */
  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode],
  );

  /**
   * Maps each layer id to the color representing the collaborator
   * currently selecting it, used to render remote selection outlines.
   *
   * Derived from {@link selections} by iterating over each remote
   * participant's selection array and mapping every layer ID they have
   * selected to a color produced by {@link connectionIdToColor}.
   * Re-computed only when `selections` changes.
   */
  const layerIdsToColorSelection = useMemo(() => {
    const result: Record<string, string> = {};

    for (const [connectionId, selection] of selections) {
      for (const layerId of selection) {
        result[layerId] = connectionIdToColor(connectionId);
      }
    }

    return result;
  }, [selections]);

  return (
    <main className="relative h-screen w-screen touch-none bg-neutral-100">
      {/* Displays board metadata such as title and organization info */}
      <Info boardId={boardId} />

      {/* Displays avatars of all active participants in the board session */}
      <Participants />

      {/* Primary toolbar for selecting tools and triggering undo/redo */}
      <Toolbar
        canRedo={canRedo}
        canUndo={canUndo}
        canvasState={canvasState}
        redo={history.redo}
        setCanvasState={setCanvasState}
        undo={history.undo}
      />

      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />

      {/*
       * Full-screen SVG surface. Pointer and wheel events are handled here
       * to drive camera panning, cursor presence, layer insertion,
       * translation, resizing, and marquee multi-selection.
       */}
      <svg
        className="h-screen w-screen"
        onPointerDown={onPointerDown}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      >
        {/*
         * Transform group that applies the current camera (pan) offset so
         * that all layers and cursors move together when the canvas is panned.
         */}
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {/* Render each shared layer in storage order */}
          {layerIds?.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              selectionColor={layerIdsToColorSelection[layerId]}
              onLayerPointerDown={onLayerPointerDown}
            />
          ))}

          {/*
           * Renders resize handles and a bounding outline around the
           * currently selected layer(s). Notifies the canvas when a
           * resize handle interaction begins.
           */}
          <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />

          {/*
           * Renders the marquee "selection net" rectangle while the user is
           * actively dragging a multi-selection gesture (`CanvasMode.SelectionNet`).
           * The rectangle spans from `canvasState.origin` to `canvasState.current`.
           */}
          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
              />
            )}

          {/* Render remote participant cursors and pencil drafts */}
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
}
