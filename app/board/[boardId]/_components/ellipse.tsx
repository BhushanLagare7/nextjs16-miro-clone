import { memo, useCallback, useMemo } from "react";

import { colorToCss } from "@/lib/utils";
import { EllipseLayer } from "@/types/canvas";

interface EllipseProps {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

/**
 * Renders an SVG ellipse shape on the canvas.
 *
 * The ellipse is positioned using a CSS `transform: translate(...)` (rather
 * than SVG `x`/`y` attributes) so that it can be moved efficiently without
 * triggering SVG layout recalculations.
 *
 * @param id - Unique identifier of the layer, forwarded to `onPointerDown`.
 * @param layer - Layer data describing position, size, and fill color.
 * @param onPointerDown - Callback invoked when the shape receives a pointer down event.
 * @param selectionColor - Optional stroke color used to indicate the shape is selected.
 */
export const Ellipse = memo(function Ellipse({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: EllipseProps) {
  const { x, y, width, height, fill } = layer;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => onPointerDown(e, id),
    [onPointerDown, id],
  );

  const translateStyle = useMemo(
    () => ({ transform: `translate(${x}px, ${y}px)` }),
    [x, y],
  );

  return (
    <ellipse
      className="drop-shadow-md"
      cx={width / 2}
      cy={height / 2}
      fill={fill ? colorToCss(fill) : "#000"}
      rx={width / 2}
      ry={height / 2}
      stroke={selectionColor ?? "transparent"}
      strokeWidth="1"
      style={translateStyle}
      onPointerDown={handlePointerDown}
    />
  );
});
