"use client";

import { colorToCss } from "@/lib/utils";
import { Color } from "@/types/canvas";

/**
 * Predefined palette of colors available for selection.
 * Declared outside the component so the array is created once,
 * rather than being reconstructed on every render.
 */
const PRESET_COLORS: Color[] = [
  { r: 243, g: 82, b: 35 }, // Red
  { r: 255, g: 249, b: 177 }, // Yellow
  { r: 68, g: 202, b: 99 }, // Green
  { r: 39, g: 142, b: 237 }, // Blue
  { r: 155, g: 105, b: 245 }, // Purple
  { r: 252, g: 142, b: 42 }, // Orange
  { r: 0, g: 0, b: 0 }, // Black
  { r: 255, g: 255, b: 255 }, // White
];

/**
 * Human-readable names for each preset color, keyed by CSS string.
 * Used to provide accessible labels for color swatch buttons.
 */
const PRESET_COLOR_NAMES: Record<string, string> = {
  "#f35223": "Red",
  "#fff9b1": "Yellow",
  "#44ca63": "Green",
  "#278eed": "Blue",
  "#9b69f5": "Purple",
  "#fc8e2a": "Orange",
  "#000000": "Black",
  "#ffffff": "White",
};

interface ColorPickerProps {
  /** Callback invoked with the selected color when a swatch is clicked. */
  onChange: (color: Color) => void;
}

/**
 * Renders a row of preset color swatches for the user to choose from.
 *
 * @param onChange - Called with the chosen {@link Color} when a swatch is clicked.
 */
export function ColorPicker({ onChange }: ColorPickerProps) {
  return (
    <div className="mr-2 flex max-w-41 flex-wrap items-center gap-2 border-r border-neutral-200 pr-2">
      {PRESET_COLORS.map((color) => (
        <ColorButton
          key={colorToCss(color)}
          color={color}
          name={PRESET_COLOR_NAMES[colorToCss(color)] ?? "Color"}
          onClick={onChange}
        />
      ))}
    </div>
  );
}

interface ColorButtonProps {
  /** Callback invoked with this button's color when clicked. */
  onClick: (color: Color) => void;
  /** The color this button represents. */
  color: Color;
  /** Human-readable name for the color, used as the button's aria-label. */
  name: string;
}

/**
 * A single clickable color swatch.
 *
 * @param onClick - Called with {@link color} when the button is clicked.
 * @param color - The color displayed by this button.
 */
function ColorButton({ onClick, color, name }: ColorButtonProps) {
  return (
    <button
      aria-label={`Select ${name} color`}
      className="flex size-8 items-center justify-center transition hover:opacity-75"
      onClick={() => onClick(color)}
    >
      <div
        className="size-8 rounded-md border border-neutral-300"
        style={{ background: colorToCss(color) }}
      />
    </button>
  );
}
