import { memo, useCallback, useMemo } from "react";
import ContentEditable, {
  type ContentEditableEvent,
} from "react-contenteditable";
import { Kalam } from "next/font/google";

import { useMutation } from "@liveblocks/react";

import { cn, colorToCss, getContrastingTextColor } from "@/lib/utils";
import { NoteLayer } from "@/types/canvas";

const font = Kalam({
  subsets: ["latin"],
  weight: ["400"],
});

/** Maximum font size, in pixels, a note's text can scale up to. */
const MAX_FONT_SIZE = 96;

/** Fraction of the note's dimensions used to derive the font size. */
const FONT_SCALE_FACTOR = 0.15;

/**
 * Calculates an appropriate font size for a sticky note based on its
 * dimensions, capped at a maximum value to avoid oversized text.
 *
 * @param width - Width of the note, in pixels.
 * @param height - Height of the note, in pixels.
 * @returns The computed font size, in pixels.
 */
function calculateFontSize(width: number, height: number): number {
  const fontSizeBasedOnHeight = height * FONT_SCALE_FACTOR;
  const fontSizeBasedOnWidth = width * FONT_SCALE_FACTOR;

  return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, MAX_FONT_SIZE);
}

interface NoteProps {
  id: string;
  layer: NoteLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

/**
 * Renders an editable sticky note on the canvas.
 *
 * The note's text content is editable in place via `ContentEditable`, and
 * changes are persisted to shared storage through a Liveblocks mutation.
 * Font size and text color automatically adapt to the note's fill color and
 * dimensions for readability.
 *
 * @param id - Unique identifier of the layer, used for mutations and pointer events.
 * @param layer - Layer data describing position, size, fill color, and text value.
 * @param onPointerDown - Callback invoked when the note receives a pointer down event.
 * @param selectionColor - Optional outline color used to indicate the note is selected.
 */
export const Note = memo(function Note({
  layer,
  onPointerDown,
  id,
  selectionColor,
}: NoteProps) {
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

  const textColor = useMemo(
    () => (fill ? getContrastingTextColor(fill) : "#000"),
    [fill],
  );

  const foreignObjectStyle = useMemo(
    () => ({
      outline: selectionColor ? `1px solid ${selectionColor}` : "none",
      backgroundColor: fill ? colorToCss(fill) : "#000",
    }),
    [selectionColor, fill],
  );

  const contentStyle = useMemo(
    () => ({ fontSize, color: textColor }),
    [fontSize, textColor],
  );

  return (
    <foreignObject
      className="shadow-md drop-shadow-xl"
      height={height}
      style={foreignObjectStyle}
      width={width}
      x={x}
      y={y}
      onPointerDown={handlePointerDown}
    >
      <ContentEditable
        className={cn(
          "flex h-full w-full items-center justify-center text-center outline-none",
          font.className,
        )}
        html={value ?? "Text"}
        style={contentStyle}
        onChange={handleContentChange}
      />
    </foreignObject>
  );
});
