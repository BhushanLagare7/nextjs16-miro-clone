/**
 * @file toolbar.tsx
 * @description Provides the main toolbar component for the canvas board application.
 * The toolbar contains tools for selecting, drawing, and inserting various shapes
 * and elements onto the canvas, as well as undo/redo functionality.
 */

import { useCallback } from "react";

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
 * The set of {@link CanvasMode} values that represent "selection-related"
 * interactions. The Select tool button is considered active whenever the
 * canvas is in one of these modes.
 *
 * Declared at module scope so it is created once rather than on every render.
 */
const SELECTION_MODES: ReadonlySet<CanvasMode> = new Set([
  CanvasMode.None,
  CanvasMode.Translating,
  CanvasMode.SelectionNet,
  CanvasMode.Pressing,
  CanvasMode.Resizing,
]);

/**
 * Describes a single "insertable" tool button (i.e. a tool that, when
 * clicked, puts the canvas into {@link CanvasMode.Inserting} mode with a
 * specific {@link LayerType}).
 *
 * @interface InsertableTool
 * @property {LucideIcon} icon - The icon component rendered on the button.
 * @property {string} label - The accessible label/tooltip for the button.
 * @property {LayerType} layerType - The layer type inserted by this tool.
 */
/** The subset of layer types that can be inserted via the toolbar. */
type InsertableLayerType =
  | LayerType.Ellipse
  | LayerType.Note
  | LayerType.Rectangle
  | LayerType.Text;


/**
 * Configuration for the "insertable" layer tools (Text, Sticky note,
 * Rectangle, Ellipse). Declared at module scope so it is created once
 * rather than on every render, and rendered via `.map()` to avoid
 * duplicating near-identical JSX for each tool.
 */
const INSERTABLE_TOOLS = [
  { icon: TypeIcon, label: "Text", layerType: LayerType.Text },
  { icon: StickyNoteIcon, label: "Sticky note", layerType: LayerType.Note },
  { icon: SquareIcon, label: "Rectangle", layerType: LayerType.Rectangle },
  { icon: CircleIcon, label: "Ellipse", layerType: LayerType.Ellipse },
] as const;

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
  /**
   * Determines whether the canvas is currently inserting a layer of the
   * given type, i.e. whether the corresponding tool button should render
   * as "active".
   */
  const isInsertingLayer = useCallback(
    (layerType: LayerType) =>
      canvasState.mode === CanvasMode.Inserting &&
      canvasState.layerType === layerType,
    [canvasState],
  );

  /** Switches the canvas back to the default Select mode. */
  const selectSelectTool = useCallback(
    () => setCanvasState({ mode: CanvasMode.None }),
    [setCanvasState],
  );

  /** Switches the canvas into Inserting mode for the given layer type. */
  const selectInsertTool = useCallback(
    (layerType: InsertableLayerType) =>
      setCanvasState({ mode: CanvasMode.Inserting, layerType }),
    [setCanvasState],
  );

  /** Switches the canvas into freehand Pencil drawing mode. */
  const selectPencilTool = useCallback(
    () => setCanvasState({ mode: CanvasMode.Pencil }),
    [setCanvasState],
  );

  return (
    <div className="absolute top-[50%] left-2 flex translate-y-[-50%] flex-col gap-y-4">
      {/* Tools Panel */}
      <div className="flex flex-col items-center gap-y-1 rounded-md bg-white p-1.5 shadow-md">
        {/* Select Tool: Active when canvas is in selection-related modes */}
        <ToolButton
          icon={MousePointer2Icon}
          isActive={SELECTION_MODES.has(canvasState.mode)}
          label="Select"
          onClick={selectSelectTool}
        />

        {/* Insertable layer tools: Text, Sticky note, Rectangle, Ellipse */}
        {INSERTABLE_TOOLS.map(({ icon, label, layerType }) => (
          <ToolButton
            key={layerType}
            icon={icon}
            isActive={isInsertingLayer(layerType)}
            label={label}
            onClick={() => selectInsertTool(layerType)}
          />
        ))}

        {/* Pencil Tool: Enables freehand drawing mode */}
        <ToolButton
          icon={PencilIcon}
          isActive={canvasState.mode === CanvasMode.Pencil}
          label="Pen"
          onClick={selectPencilTool}
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
