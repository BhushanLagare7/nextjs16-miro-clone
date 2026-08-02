/**
 * @file toolbar.tsx
 * @description Provides the main toolbar component for the canvas board application.
 * The toolbar contains tools for selecting, drawing, and inserting various shapes
 * and elements onto the canvas, as well as undo/redo functionality.
 */

import {
  CircleIcon,
  MousePointer2Icon,
  PencilIcon,
  Redo2Icon,
  SquareIcon,
  StickyNoteIcon,
  TypeIcon,
  Undo2Icon,
} from "lucide-react";

import { CanvasMode, CanvasState, LayerType } from "@/types/canvas";

import { ToolButton } from "./tool-button";

/**
 * Props for the Toolbar component.
 *
 * @interface ToolbarProps
 * @property {CanvasState} canvasState - The current state of the canvas, including
 *   the active mode and any layer being inserted.
 * @property {(newState: CanvasState) => void} setCanvasState - Callback to update
 *   the canvas state when a tool is selected.
 * @property {() => void} undo - Callback to undo the last action on the canvas.
 * @property {() => void} redo - Callback to redo the last undone action on the canvas.
 * @property {boolean} canUndo - Whether there are actions available to undo.
 * @property {boolean} canRedo - Whether there are actions available to redo.
 */
interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Toolbar component that renders the primary set of drawing and selection tools
 * for the canvas board, as well as undo/redo controls.
 *
 * The toolbar is vertically centered on the left side of the screen and is
 * divided into two sections:
 * - **Tools Panel**: Contains buttons for Select, Text, Sticky Note, Rectangle,
 *   Ellipse, and Pencil tools.
 * - **History Panel**: Contains Undo and Redo buttons.
 *
 * Each tool button reflects whether it is currently active based on the
 * current `canvasState`.
 *
 * @param {ToolbarProps} props - The props for the Toolbar component.
 * @returns {JSX.Element} The rendered toolbar with tool and history buttons.
 *
 * @example
 * <Toolbar
 *   canvasState={canvasState}
 *   setCanvasState={setCanvasState}
 *   undo={history.undo}
 *   redo={history.redo}
 *   canUndo={canUndo}
 *   canRedo={canRedo}
 * />
 */
export function Toolbar({
  canvasState,
  setCanvasState,
  undo,
  redo,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div className="absolute top-[50%] left-2 flex translate-y-[-50%] flex-col gap-y-4">
      {/* Tools Panel */}
      <div className="flex flex-col items-center gap-y-1 rounded-md bg-white p-1.5 shadow-md">
        {/* Select Tool: Active when canvas is in selection-related modes */}
        <ToolButton
          icon={MousePointer2Icon}
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing
          }
          label="Select"
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.None,
            })
          }
        />

        {/* Text Tool: Inserts a text layer onto the canvas */}
        <ToolButton
          icon={TypeIcon}
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Text
          }
          label="Text"
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
        />

        {/* Sticky Note Tool: Inserts a sticky note layer onto the canvas */}
        <ToolButton
          icon={StickyNoteIcon}
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Note
          }
          label="Sticky note"
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            })
          }
        />

        {/* Rectangle Tool: Inserts a rectangle layer onto the canvas */}
        <ToolButton
          icon={SquareIcon}
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Rectangle
          }
          label="Rectangle"
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
        />

        {/* Ellipse Tool: Inserts an ellipse layer onto the canvas */}
        <ToolButton
          icon={CircleIcon}
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Ellipse
          }
          label="Ellipse"
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
        />

        {/* Pencil Tool: Enables freehand drawing mode */}
        <ToolButton
          icon={PencilIcon}
          isActive={canvasState.mode === CanvasMode.Pencil}
          label="Pen"
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Pencil,
            })
          }
        />
      </div>

      {/* History Panel: Undo and Redo controls */}
      <div className="flex flex-col items-center rounded-md bg-white p-1.5 shadow-md">
        {/* Undo Button: Disabled when there is no action to undo */}
        <ToolButton
          icon={Undo2Icon}
          isDisabled={!canUndo}
          label="Undo"
          onClick={undo}
        />

        {/* Redo Button: Disabled when there is no action to redo */}
        <ToolButton
          icon={Redo2Icon}
          isDisabled={!canRedo}
          label="Redo"
          onClick={redo}
        />
      </div>
    </div>
  );
}

/**
 * ToolbarSkeleton component renders a placeholder for the Toolbar while
 * the application is loading.
 *
 * It mimics the size and position of the real Toolbar to prevent layout
 * shifts during the loading state.
 *
 * @returns {JSX.Element} A styled skeleton placeholder for the Toolbar.
 *
 * @example
 * // Render the skeleton while the board data is being fetched
 * {isLoading ? <ToolbarSkeleton /> : <Toolbar {...toolbarProps} />}
 */
export function ToolbarSkeleton() {
  return (
    <div className="absolute top-[50%] left-2 flex h-90 w-13 translate-y-[-50%] flex-col gap-y-4 rounded-md bg-white shadow-md" />
  );
}
