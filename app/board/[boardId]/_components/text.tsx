import { memo, useCallback, useMemo } from "react";
import ContentEditable, {
  type ContentEditableEvent,
} from "react-contenteditable";
import { Kalam } from "next/font/google";

import { useMutation } from "@liveblocks/react";

import { cn, colorToCss } from "@/lib/utils";
import { TextLayer } from "@/types/canvas";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

/** Maximum font size, in pixels, a text layer can scale up to. */
const MAX_FONT_SIZE = 96;

/** Fraction of the text layer's dimensions used to derive the font size. */
const FONT_SCALE_FACTOR = 0.5;

/**
 * Calculates an appropriate font size for a text layer based on its
 * dimensions, capped at a maximum value to avoid oversized text.
 *
 * @param width - Width of the text layer, in pixels.
 * @param height - Height of the text layer, in pixels.
 * @returns The computed font size, in pixels.
 */
function calculateFontSize(width: number, height: number): number {
  const fontSizeBasedOnHeight = height * FONT_SCALE_FACTOR;
  const fontSizeBasedOnWidth = width * FONT_SCALE_FACTOR;

  return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, MAX_FONT_SIZE);
}

interface TextProps {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

/**
 * Renders an editable plain-text layer on the canvas.
 *
 * The text content is editable in place via `ContentEditable`, and changes
 * are persisted to shared storage through a Liveblocks mutation. Font size
 * automatically scales with the layer's dimensions.
 *
 * @param id - Unique identifier of the layer, used for mutations and pointer events.
 * @param layer - Layer data describing position, size, fill color, and text value.
 * @param onPointerDown - Callback invoked when the text layer receives a pointer down event.
 * @param selectionColor - Optional outline color used to indicate the layer is selected.
 */
export const Text = memo(function Text({
  layer,
  onPointerDown,
  id,
  selectionColor,
}: TextProps) {
  const { x, y, width, height, fill, value } = layer;

  const updateValue = useMutation(({ storage }, newValue: string) => {
    const liveLayers = storage.get("layers");

    liveLayers.get(id)?.set("value", newValue);
  }, []);

  const handleContentChange = useCallback(
    (e: ContentEditableEvent) => updateValue(e.target.value),
    [updateValue],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => onPointerDown(e, id),
    [onPointerDown, id],
  );

  const fontSize = useMemo(
    () => calculateFontSize(width, height),
    [width, height],
  );

  const foreignObjectStyle = useMemo(
    () => ({
      outline: selectionColor ? `1px solid ${selectionColor}` : "none",
    }),
    [selectionColor],
  );

  const contentStyle = useMemo(
    () => ({
      fontSize,
      color: fill ? colorToCss(fill) : "#000",
    }),
    [fontSize, fill],
  );

  return (
    <foreignObject
      height={height}
      style={foreignObjectStyle}
      width={width}
      x={x}
      y={y}
      onPointerDown={handlePointerDown}
    >
      <ContentEditable
        className={cn(
          "flex h-full w-full items-center justify-center text-center drop-shadow-md outline-none",
          font.className,
        )}
        html={value ?? "Text"}
        style={contentStyle}
        onChange={handleContentChange}
      />
    </foreignObject>
  );
});
