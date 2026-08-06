/**
 * @file selection-box.tsx
 * @description Renders the visual selection indicator on the collaborative
 * canvas: a blue outline around all selected layers plus eight resize
 * handles when a single, non-path layer is selected.
 *
 * ### Rendering rules
 * ```
 * Selection empty / no bounds  →  renders nothing
 * Single Path layer selected   →  outline only  (no resize handles)
 * Single non-Path layer        →  outline + 8 resize handles
 * Multiple layers selected     →  outline only  (no resize handles)
 * ```
 *
 * ### Component tree
 * ```
 * SelectionBox        (memo)
 * ├── <rect>          outline
 * └── ResizeHandle[]  (memo, one per handle, only when applicable)
 *     └── <rect>      handle square
 * ```
 */

"use client";

import { CSSProperties, memo } from "react";

import { useSelf, useStorage } from "@liveblocks/react";

import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { LayerType, Side, XYWH } from "@/types/canvas";

import { HANDLE_WIDTH } from "./constants";

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

/**
 * Props accepted by {@link SelectionBox}.
 */
interface SelectionBoxProps {
  /**
   * Callback fired when the user begins a pointer-drag on one of the
   * eight resize handles.
   *
   * The parent component is responsible for setting up the resize logic
   * (typically via `onPointerMove` / `onPointerUp` handlers on the SVG
   * root).
   *
   * @param corner       - A {@link Side} bitmask identifying which edge(s)
   *   or corner is being dragged.
   * @param initialBounds - A snapshot of the layer's {@link XYWH} bounding
   *   box at the moment the drag started, used as the reference frame for
   *   computing delta offsets.
   */
  onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------



/**
 * Tailwind class string applied to the selection **outline** `<rect>`.
 *
 * - `pointer-events-none` – the outline itself is not interactive; only
 *   the resize handles beneath it capture pointer events.
 * - `fill-transparent` – keeps the interior of the selection clear.
 * - `stroke-blue-500 stroke-1` – 1 px blue border.
 */
const OUTLINE_CLASSNAME =
  "pointer-events-none fill-transparent stroke-blue-500 stroke-1";

/**
 * Tailwind class string applied to every resize **handle** `<rect>`.
 *
 * - `fill-white` – white square background for contrast.
 * - `stroke-blue-500 stroke-1` – matches the selection outline colour.
 */
const HANDLE_CLASSNAME = "fill-white stroke-blue-500 stroke-1";

// ---------------------------------------------------------------------------
// Handle configuration
// ---------------------------------------------------------------------------

/**
 * Describes the static properties of one resize handle:
 * - which {@link Side}(s) it controls (as a bitmask),
 * - the CSS cursor to show while hovering or dragging,
 * - functions to derive its centre coordinates from the current bounds.
 *
 * The coordinate functions return the **centre** of the handle; the
 * rendering code subtracts `HANDLE_WIDTH / 2` to top-left-align the rect.
 */
interface HandleConfig {
  /**
   * Bitmask of {@link Side} values identifying which edges this handle
   * controls. Corner handles combine two sides (e.g. `Side.Top + Side.Left`).
   */
  side: Side;

  /**
   * CSS cursor string displayed while the pointer is over (or dragging)
   * this handle.
   */
  cursor: CSSProperties["cursor"];

  /**
   * Returns the **x** coordinate of the handle's centre given the current
   * selection bounding box.
   *
   * @param bounds - The current selection {@link XYWH}.
   */
  getX: (bounds: XYWH) => number;

  /**
   * Returns the **y** coordinate of the handle's centre given the current
   * selection bounding box.
   *
   * @param bounds - The current selection {@link XYWH}.
   */
  getY: (bounds: XYWH) => number;
}

/**
 * Ordered list of the **eight** resize handles rendered around the
 * selection bounding box.
 *
 * Visual layout (TL = top-left, TC = top-centre, …):
 * ```
 *  TL ──── TC ──── TR
 *  │                │
 *  ML              MR
 *  │                │
 *  BL ──── BC ──── BR
 * ```
 *
 * Each entry is a {@link HandleConfig}; the array is declared `readonly`
 * to prevent accidental mutation.
 */
const RESIZE_HANDLES: readonly HandleConfig[] = [
  // ── Corners ──────────────────────────────────────────────────────────────
  {
    side: Side.Top + Side.Left,
    cursor: "nwse-resize",
    getX: (b) => b.x,
    getY: (b) => b.y,
  },
  {
    side: Side.Top + Side.Right,
    cursor: "nesw-resize",
    getX: (b) => b.x + b.width,
    getY: (b) => b.y,
  },
  {
    side: Side.Bottom + Side.Right,
    cursor: "nwse-resize",
    getX: (b) => b.x + b.width,
    getY: (b) => b.y + b.height,
  },
  {
    side: Side.Bottom + Side.Left,
    cursor: "nesw-resize",
    getX: (b) => b.x,
    getY: (b) => b.y + b.height,
  },
  // ── Edge midpoints ────────────────────────────────────────────────────────
  {
    side: Side.Top,
    cursor: "ns-resize",
    getX: (b) => b.x + b.width / 2,
    getY: (b) => b.y,
  },
  {
    side: Side.Right,
    cursor: "ew-resize",
    getX: (b) => b.x + b.width,
    getY: (b) => b.y + b.height / 2,
  },
  {
    side: Side.Bottom,
    cursor: "ns-resize",
    getX: (b) => b.x + b.width / 2,
    getY: (b) => b.y + b.height,
  },
  {
    side: Side.Left,
    cursor: "ew-resize",
    getX: (b) => b.x,
    getY: (b) => b.y + b.height / 2,
  },
];

// ---------------------------------------------------------------------------
// ResizeHandle (internal)
// ---------------------------------------------------------------------------

/**
 * Props accepted by the internal {@link ResizeHandle} component.
 */
interface ResizeHandleProps {
  /**
   * The current selection bounding box, used to calculate the handle's
   * rendered position via the matching {@link HandleConfig}.
   */
  bounds: XYWH;

  /**
   * CSS cursor to display when hovering or dragging this handle.
   * Forwarded directly to the `<rect>` element's `style.cursor`.
   */
  cursor: CSSProperties["cursor"];

  /**
   * The {@link Side} bitmask identifying which resize handle this
   * component represents. Must match one of the entries in
   * {@link RESIZE_HANDLES}.
   */
  side: Side;

  /**
   * Called when the user begins a pointer-down gesture on this handle.
   *
   * @param corner       - The {@link Side} bitmask of the handle.
   * @param initialBounds - A snapshot of the bounding box at drag start.
   */
  onPointerDown: (corner: Side, initialBounds: XYWH) => void;
}

/**
 * Renders a single square resize handle as an SVG `<rect>` element.
 *
 * The handle is positioned by applying a CSS `translate()` transform,
 * with the square centred on the geometric anchor point defined by
 * the matching {@link HandleConfig}.
 *
 * Pointer events are stopped at this element to prevent the canvas's
 * global drag/pan listeners from interfering with resize interactions.
 *
 * Wrapped in `React.memo` to skip re-renders when neither `bounds`
 * nor the callback reference has changed.
 *
 * @internal Not exported; use {@link SelectionBox} instead.
 */
const ResizeHandle = memo(
  function ResizeHandle({ bounds, cursor, side, onPointerDown }: ResizeHandleProps) {
    /**
     * Look up the static config for this handle.
     * Returns null (renders nothing) for unrecognised side values –
     * this should never happen in practice but keeps the component safe.
     */
    const config = RESIZE_HANDLES.find((handle) => handle.side === side);

    if (!config) {
      return null;
    }

    /**
     * Centre coordinates of the handle, derived from the current bounds
     * via the config functions. The rendered rect is offset by half its
     * width/height so its visual centre lands on the anchor point.
     */
    const cx = config.getX(bounds);
    const cy = config.getY(bounds);

    return (
      <rect
        className={HANDLE_CLASSNAME}
        style={{
          cursor,
          width: `${HANDLE_WIDTH}px`,
          height: `${HANDLE_WIDTH}px`,
          // Translate so the rect is centred on (cx, cy).
          transform: `translate(
            ${cx - HANDLE_WIDTH / 2}px,
            ${cy - HANDLE_WIDTH / 2}px
          )`,
        }}
        x={0}
        y={0}
        onPointerDown={(e) => {
          // Prevent the canvas pan/select handlers from also firing.
          e.stopPropagation();
          onPointerDown(side, bounds);
        }}
      />
    );
  },
);

ResizeHandle.displayName = "ResizeHandle";

// ---------------------------------------------------------------------------
// SelectionBox (exported)
// ---------------------------------------------------------------------------

/**
 * Renders the visual selection indicator for the collaborative canvas.
 *
 * ### What it renders
 * 1. **Outline** – a blue, transparent-fill `<rect>` that wraps the
 *    combined bounding box of all selected layers. Always visible when
 *    the selection is non-empty.
 * 2. **Resize handles** – eight square handles at the corners and edge
 *    midpoints. Only visible when **exactly one non-Path layer** is
 *    selected. Path layers and multi-selections suppress the handles
 *    because free-form paths don't support axis-aligned resizing.
 *
 * ### Liveblocks subscriptions
 * | Hook | Purpose |
 * |---|---|
 * | `useSelf` | Reads the local user's `presence.selection` array |
 * | `useStorage` | Reads the selected layer's type from shared storage |
 * | `useSelectionBounds` | Derives the combined XYWH bounding box |
 *
 * ### Memoisation
 * The component is wrapped in `React.memo` so it only re-renders when
 * the callback prop reference or the Liveblocks-derived values change.
 * The `ResizeHandle` children are similarly memoised.
 *
 * @param props.onResizeHandlePointerDown - See {@link SelectionBoxProps}.
 *
 * @example
 * ```tsx
 * <SelectionBox
 *   onResizeHandlePointerDown={(corner, initialBounds) => {
 *     startResize(corner, initialBounds);
 *   }}
 * />
 * ```
 */
export const SelectionBox = memo(
  function SelectionBox({ onResizeHandlePointerDown }: SelectionBoxProps) {
    /**
     * The ID of the single selected layer, or `null` when zero or more
     * than one layer is selected. Used to gate the resize-handle logic.
     */
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );

    /**
     * `true` when resize handles should be rendered:
     * - exactly one layer is selected (`soleLayerId` is non-null), AND
     * - that layer is not a free-form `Path` (paths use a different
     *   editing interaction and do not support AABB resizing).
     *
     * Subscribes to shared storage so the value updates in real-time if
     * another collaborator changes the layer type.
     */
    const isShowingHandles = useStorage(
      (root) =>
        soleLayerId !== null &&
        root.layers[soleLayerId]?.type !== LayerType.Path,
    );

    /**
     * The axis-aligned bounding box around all selected layers.
     * Returns `null` when nothing is selected or layers are missing.
     */
    const bounds = useSelectionBounds();

    // Nothing to render if there's no valid bounding box.
    if (!bounds) {
      return null;
    }

    return (
      <>
        {/* ── Selection outline ──────────────────────────────────────────── */}
        <rect
          className={OUTLINE_CLASSNAME}
          height={bounds.height}
          style={{
            transform: `translate(${bounds.x}px, ${bounds.y}px)`,
          }}
          width={bounds.width}
          x={0}
          y={0}
        />

        {/* ── Resize handles (single non-path selection only) ────────────── */}
        {isShowingHandles &&
          RESIZE_HANDLES.map(({ side, cursor }) => (
            <ResizeHandle
              key={side}
              bounds={bounds}
              cursor={cursor}
              side={side}
              onPointerDown={onResizeHandlePointerDown}
            />
          ))}
      </>
    );
  },
);

SelectionBox.displayName = "SelectionBox";
