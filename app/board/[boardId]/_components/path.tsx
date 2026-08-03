/**
 * @file path.tsx
 * @description Provides the Path component, which renders a single freehand
 * stroke as an SVG `<path>` element. Uses the `perfect-freehand` library to
 * convert raw input points into a smooth, pressure-sensitive stroke outline,
 * and `getSvgPathFromStroke` to serialize it to an SVG `d` attribute string.
 */

import getStroke from "perfect-freehand";

import { getSvgPathFromStroke } from "@/lib/utils";

/**
 * Props for the Path component.
 *
 * @interface PathProps
 * @property {number} x - Horizontal translation (in canvas-space pixels)
 *   applied to the path via a CSS `translate` transform.
 * @property {number} y - Vertical translation (in canvas-space pixels)
 *   applied to the path via a CSS `translate` transform.
 * @property {number[][]} points - An array of input points that define the
 *   freehand stroke. Each entry is expected to be a `[x, y]` or
 *   `[x, y, pressure]` tuple as consumed by `perfect-freehand`.
 * @property {string} fill - CSS color string used to fill the stroke outline.
 * @property {(e: React.PointerEvent) => void} [onPointerDown] - Optional
 *   callback invoked when a pointer-down event occurs on the path element.
 *   Useful for initiating selection or drag operations on an existing stroke.
 * @property {string} [stroke] - Optional CSS color string for the path's
 *   border stroke. When omitted, no explicit stroke color is applied.
 */
interface PathProps {
  x: number;
  y: number;
  points: number[][];
  fill: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  stroke?: string;
}

/**
 * Path component that renders a freehand stroke as a smooth SVG `<path>`.
 *
 * Rendering pipeline:
 * 1. `getStroke` (from `perfect-freehand`) processes the raw `points` array
 *    with fixed parameters (`size: 16`, `thinning: 0.5`, `smoothing: 0.5`,
 *    `streamline: 0.5`) to produce an array of outline coordinates.
 * 2. {@link getSvgPathFromStroke} converts those outline coordinates into an
 *    SVG path `d` attribute string using quadratic Bézier curves.
 * 3. The resulting `<path>` is positioned via a CSS `translate` transform
 *    using the provided `x` and `y` offsets.
 *
 * A `drop-shadow-md` Tailwind class is applied for a subtle depth effect.
 *
 * @param {PathProps} props - The props for the Path component.
 * @param {number} props.x - Horizontal canvas-space offset.
 * @param {number} props.y - Vertical canvas-space offset.
 * @param {number[][]} props.points - Raw freehand input points.
 * @param {string} props.fill - Fill color for the stroke shape.
 * @param {(e: React.PointerEvent) => void} [props.onPointerDown] - Optional
 *   pointer-down event handler.
 * @param {string} [props.stroke] - Optional border stroke color.
 * @returns {JSX.Element} An SVG `<path>` element representing the freehand
 *   stroke.
 *
 * @example
 * // Render a freehand stroke in red at the canvas origin
 * <Path x={0} y={0} points={[[10, 20], [15, 25]]} fill="#DC2626" />
 *
 * @example
 * // Render a remote participant's pencil draft
 * <Path
 *   x={0}
 *   y={0}
 *   points={pencilDraft}
 *   fill={colorToCss(penColor)}
 * />
 */
export function Path({ x, y, points, fill, onPointerDown, stroke }: PathProps) {
  return (
    <path
      className="drop-shadow-md"
      d={getSvgPathFromStroke(
        getStroke(points, {
          size: 16,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        }),
      )}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      onPointerDown={onPointerDown}
    />
  );
}
