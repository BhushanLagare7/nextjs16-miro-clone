/**
 * @file canvas.tsx
 * @description Provides the main Canvas component for the collaborative board
 * application. It manages canvas state (active tool, camera position, last used
 * color) and integrates with Liveblocks for real-time collaboration features
 * such as shared history, live layer storage, and presence tracking.
 */

"use client";

import { useCallback, useState } from "react";

import { LiveObject } from "@liveblocks/client";
import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useStorage,
} from "@liveblocks/react";
import { nanoid } from "nanoid";

import { pointerEventToCanvasPoint } from "@/lib/utils";
import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  LayerType,
  Point,
} from "@/types/canvas";

import { CursorsPresence } from "./cursors-presence";
import { Info } from "./info";
import { LayerPreview } from "./layer-preview";
import { Participants } from "./participants";
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
 *   camera movement, cursor presence, and layer insertion.
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
   * broadcasts the position to other participants via `setMyPresence`.
   *
   * @param {React.PointerEvent} e - The pointer move event fired on the SVG
   *   element.
   */
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);

      setMyPresence({ cursor: current });
    },
    [],
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
   * Handles pointer up events on the SVG canvas. Converts the pointer
   * position to canvas-space coordinates and, depending on the current
   * `canvasState.mode`, either inserts a new layer (when in
   * `CanvasMode.Inserting`) or resets the canvas to idle mode. Resumes the
   * shared history after the action completes so the operation is recorded
   * as a single undoable step.
   *
   * @param {{}} _ - Unused mutation context (destructured and ignored).
   * @param {React.PointerEvent} e - The pointer up event fired on the SVG
   *   element.
   */
  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      history.resume();
    },
    [camera, canvasState, history, insertLayer],
  );

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

      {/*
       * Full-screen SVG surface. Pointer and wheel events are handled here
       * to drive camera panning, cursor presence, and layer insertion.
       */}
      <svg
        className="h-screen w-screen"
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
              selectionColor="#000"
              onLayerPointerDown={() => {}}
            />
          ))}

          {/* Render remote participant cursors and pencil drafts */}
          <CursorsPresence />
        </g>
      </svg>
    </main>
  );
}
