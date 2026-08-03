/**
 * @file Rectangle.tsx
 * @description Renders a single rectangle layer on the collaborative canvas
 * as an SVG `<rect>` element. Applies the layer's position, dimensions, and
 * fill color, and highlights the element with a colored stroke when it is
 * selected by a remote collaborator.
 */

import { colorToCss } from "@/lib/utils";
import { RectangleLayer } from "@/types/canvas";

/**
 * Props for the {@link Rectangle} component.
 *
 * @interface RectangleProps
 * @property {string} id - The unique identifier of this layer. Forwarded to
 *   the `onPointerDown` handler so the parent can identify which layer was
 *   interacted with.
 * @property {RectangleLayer} layer - The Liveblocks layer object containing
 *   the rectangle's position (`x`, `y`), dimensions (`width`, `height`), and
 *   fill {@link Color}.
 * @property {(e: React.PointerEvent, id: string) => void} onPointerDown -
 *   Callback invoked when the user presses a pointer button on this rectangle.
 *   Typically used by the parent canvas to begin a translation or selection
 *   interaction for this layer.
 * @property {string} [selectionColor] - Optional CSS color string used as the
 *   SVG stroke to indicate that a remote collaborator has selected this layer.
 *   Defaults to `"transparent"` when not provided, rendering no visible
 *   outline.
 */
interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

/**
 * Renders a rectangle layer as an SVG `<rect>` element.
 *
 * The rectangle is positioned using a CSS `transform: translate(x, y)` applied
 * via the `style` prop rather than the `x`/`y` SVG attributes (which are fixed
 * at `0`). This approach keeps the element's local coordinate origin at its
 * top-left corner, making it straightforward to apply further transforms if
 * needed.
 *
 * A drop shadow is applied via the `drop-shadow-md` Tailwind utility class.
 * The fill defaults to `"#000"` (black) when no fill color is stored on the
 * layer. The stroke renders the `selectionColor` provided by the parent to
 * show remote collaborator selection state, or `"transparent"` when the layer
 * is not selected by anyone.
 *
 * @param {RectangleProps} props - The props for the Rectangle component.
 * @param {string} props.id - Unique layer identifier forwarded to the pointer
 *   down handler.
 * @param {RectangleLayer} props.layer - Layer data (position, size, fill).
 * @param {(e: React.PointerEvent, id: string) => void} props.onPointerDown -
 *   Pointer down event handler for initiating layer interactions.
 * @param {string} [props.selectionColor] - Optional stroke color indicating
 *   remote selection. Omitting it renders no visible border.
 * @returns {JSX.Element} An SVG `<rect>` element representing the layer.
 *
 * @example
 * <Rectangle
 *   id="layer-abc"
 *   layer={rectangleLayerData}
 *   onPointerDown={onLayerPointerDown}
 *   selectionColor="#7C3AED"
 * />
 */
export function Rectangle({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: RectangleProps) {
  const { x, y, width, height, fill } = layer;

  return (
    <rect
      className="drop-shadow-md"
      fill={fill ? colorToCss(fill) : "#000"}
      height={height}
      stroke={selectionColor ?? "transparent"}
      strokeWidth={1}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      width={width}
      x={0}
      y={0}
      onPointerDown={(e) => onPointerDown(e, id)}
    />
  );
}
