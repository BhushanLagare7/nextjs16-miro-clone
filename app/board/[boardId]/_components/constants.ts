/**
 * @file constants.ts
 * @description Centralized constants for the board canvas components.
 * All magic numbers and strings used across the canvas, shapes, toolbar,
 * and selection UI are defined here for discoverability and consistency.
 */

// ---------------------------------------------------------------------------
// Canvas & Layer Limits
// ---------------------------------------------------------------------------

/**
 * The maximum number of layers allowed on the canvas at any given time.
 * Inserting a new layer when this limit is reached will be a no-op.
 */
export const MAX_LAYERS = 100;

/**
 * Default width (in canvas-space pixels) assigned to newly inserted layers.
 */
export const DEFAULT_LAYER_WIDTH = 100;

/**
 * Default height (in canvas-space pixels) assigned to newly inserted layers.
 */
export const DEFAULT_LAYER_HEIGHT = 100;

/**
 * Manhattan-distance threshold (in canvas-space pixels) that the pointer must
 * exceed before a "pressing" gesture transitions into a multi-selection
 * (marquee) gesture. Keeps simple clicks from accidentally starting a
 * selection net.
 */
export const SELECTION_NET_THRESHOLD = 5;

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

/**
 * The default fill color object used when no explicit fill is available.
 * Represents black in RGB.
 */
export const DEFAULT_FILL_COLOR = { r: 0, g: 0, b: 0 } as const;

/**
 * CSS hex representation of {@link DEFAULT_FILL_COLOR}.
 * Used as a fallback in SVG `fill` and `stroke` attributes.
 */
export const DEFAULT_FILL_COLOR_CSS = "#000";

// ---------------------------------------------------------------------------
// Freehand Stroke (perfect-freehand)
// ---------------------------------------------------------------------------

/**
 * Configuration passed to `perfect-freehand`'s `getStroke` function when
 * rendering freehand path layers and live pencil drafts.
 */
export const FREEHAND_STROKE_OPTIONS = {
  /** Diameter of the stroke in canvas-space pixels. */
  size: 16,
  /** Amount of thinning applied at the ends of the stroke (0–1). */
  thinning: 0.5,
  /** Degree of Bézier smoothing applied to the stroke outline (0–1). */
  smoothing: 0.5,
  /** Amount of streamlining applied to reduce jitter (0–1). */
  streamline: 0.5,
} as const;

// ---------------------------------------------------------------------------
// SVG Rendering
// ---------------------------------------------------------------------------

/**
 * Default SVG stroke width (in pixels) applied to shape outlines and
 * selection indicators.
 */
export const SVG_STROKE_WIDTH = 1;

// ---------------------------------------------------------------------------
// Font Sizing
// ---------------------------------------------------------------------------

/**
 * Maximum font size (in pixels) that a sticky note's text can scale up to.
 */
export const NOTE_MAX_FONT_SIZE = 96;

/**
 * Fraction of a sticky note's dimensions used to derive its font size.
 * The computed font size equals `min(width, height) * NOTE_FONT_SCALE_FACTOR`,
 * capped at {@link NOTE_MAX_FONT_SIZE}.
 */
export const NOTE_FONT_SCALE_FACTOR = 0.15;

/**
 * Maximum font size (in pixels) that a text layer can scale up to.
 */
export const TEXT_MAX_FONT_SIZE = 96;

/**
 * Fraction of a text layer's dimensions used to derive its font size.
 * The computed font size equals `min(width, height) * TEXT_FONT_SCALE_FACTOR`,
 * capped at {@link TEXT_MAX_FONT_SIZE}.
 */
export const TEXT_FONT_SCALE_FACTOR = 0.5;

/**
 * Default placeholder text shown inside Note and Text layers when no
 * user-supplied value is present.
 */
export const DEFAULT_TEXT_VALUE = "Text";

// ---------------------------------------------------------------------------
// Selection Box / Resize Handles
// ---------------------------------------------------------------------------

/**
 * The rendered side-length (in CSS pixels) of each square resize handle.
 * Handles are centered on their geometric position, so they extend
 * `HANDLE_WIDTH / 2` in each direction from their anchor point.
 */
export const HANDLE_WIDTH = 8;

// ---------------------------------------------------------------------------
// Selection Tools
// ---------------------------------------------------------------------------

/**
 * Pixel gap between the floating selection-tools toolbar and the top edge
 * of the current selection bounds.
 */
export const SELECTION_TOOLS_Y_OFFSET = 16;

// ---------------------------------------------------------------------------
// Cursor Rendering
// ---------------------------------------------------------------------------

/**
 * Height (in CSS pixels) of the `<foreignObject>` that hosts a remote
 * participant's cursor indicator and name label.
 */
export const CURSOR_FOREIGN_OBJECT_HEIGHT = 50;

/**
 * Estimated width (in CSS pixels) occupied by a single character in the
 * cursor name label. Used to dynamically size the `<foreignObject>` width.
 */
export const CURSOR_NAME_CHAR_WIDTH = 10;

/**
 * Extra horizontal padding (in CSS pixels) added to the cursor name label's
 * computed width to prevent clipping.
 */
export const CURSOR_NAME_PADDING = 24;

// ---------------------------------------------------------------------------
// Participants
// ---------------------------------------------------------------------------

/**
 * Fallback display name used for participants who have not set a name
 * in their Liveblocks user info.
 */
export const DEFAULT_USER_NAME = "Teammate";

/**
 * Fallback initial character displayed in avatar fallbacks when the
 * participant's name is unavailable.
 */
export const DEFAULT_AVATAR_FALLBACK = "T";

/**
 * Maximum number of other participants' avatars shown in the participants
 * bar before collapsing the remainder into a "+N" indicator.
 */
export const MAX_SHOWN_USERS = 2;

// ---------------------------------------------------------------------------
// Tooltip Offsets
// ---------------------------------------------------------------------------

/**
 * Side offset (in pixels) for tooltips within the Info bar component.
 */
export const HINT_SIDE_OFFSET = 10;

/**
 * Side offset (in pixels) for the user avatar tooltip, positioned below
 * the avatar circle.
 */
export const USER_AVATAR_TOOLTIP_OFFSET = 18;

/**
 * Side offset (in pixels) for toolbar button tooltips, positioned to
 * the right of each tool button.
 */
export const TOOL_BUTTON_HINT_OFFSET = 14;

// ---------------------------------------------------------------------------
// Info Bar / Branding
// ---------------------------------------------------------------------------

/**
 * The application's display name, rendered in the board Info bar.
 */
export const APP_NAME = "NexCanvas";

/**
 * Pixel width and height of the board logo image in the Info bar.
 */
export const LOGO_SIZE = 28;

// ---------------------------------------------------------------------------
// Keyboard Shortcuts
// ---------------------------------------------------------------------------

/**
 * The keyboard key (lowercased) used for undo/redo shortcuts.
 * - Ctrl/Cmd + Z → undo
 * - Ctrl/Cmd + Shift + Z → redo
 */
export const UNDO_REDO_KEY = "z";
