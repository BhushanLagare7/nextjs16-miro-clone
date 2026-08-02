/**
 * Represents an RGB color value.
 * Each channel is a numeric value (typically 0-255).
 */
export type Color = {
  /** Red channel value */
  r: number;
  /** Green channel value */
  g: number;
  /** Blue channel value */
  b: number;
};

/**
 * Represents the camera/viewport position in the canvas.
 * Used to determine which portion of the canvas is currently visible.
 */
export type Camera = {
  /** Horizontal offset of the camera */
  x: number;
  /** Vertical offset of the camera */
  y: number;
};

/**
 * Represents a 2D point coordinate.
 */
export type Point = {
  /** Horizontal coordinate */
  x: number;
  /** Vertical coordinate */
  y: number;
};

/**
 * Represents a rectangle defined by its position (x, y) and dimensions (width, height).
 * Commonly used for bounding boxes and spatial calculations.
 */
export type XYWH = {
  /** Horizontal position */
  x: number;
  /** Vertical position */
  y: number;
  /** Width of the rectangle */
  width: number;
  /** Height of the rectangle */
  height: number;
};

/**
 * Enumerates the different modes the canvas can be in.
 * Each mode defines a distinct interaction behavior.
 */
export enum CanvasMode {
  /** Default idle state with no active interaction */
  None,
  /** User is inserting a new layer onto the canvas */
  Inserting,
  /** User is drawing freehand with the pencil tool */
  Pencil,
  /** User is pressing down but hasn't yet committed to an action */
  Pressing,
  /** User is resizing an existing layer */
  Resizing,
  /** User is dragging a selection net to select multiple layers */
  SelectionNet,
  /** User is moving/translating a selected layer */
  Translating,
}

/**
 * Enumerates the types of layers that can exist on the canvas.
 */
export enum LayerType {
  /** An ellipse/oval shape */
  Ellipse,
  /** A sticky note element */
  Note,
  /** A freehand drawn path */
  Path,
  /** A rectangle shape */
  Rectangle,
  /** A text element */
  Text,
}

/**
 * Bit-flag enum representing the sides/edges of a bounding box.
 * Values can be combined using bitwise OR to represent corners
 * (e.g., Top | Left = 5 for the top-left corner).
 */
export enum Side {
  /** Top edge (bit 0) */
  Top = 1,
  /** Bottom edge (bit 1) */
  Bottom = 2,
  /** Left edge (bit 2) */
  Left = 4,
  /** Right edge (bit 3) */
  Right = 8,
}

/**
 * Represents an ellipse/oval layer on the canvas.
 */
export type EllipseLayer = {
  /** Identifies this layer as an ellipse */
  type: LayerType.Ellipse;
  /** Horizontal position */
  x: number;
  /** Vertical position */
  y: number;
  /** Height of the ellipse's bounding box */
  height: number;
  /** Width of the ellipse's bounding box */
  width: number;
  /** Fill color of the ellipse */
  fill: Color;
  /** Optional text value associated with the ellipse */
  value?: string;
};

/**
 * Represents a sticky note layer on the canvas.
 * Notes typically display text content with a colored background.
 */
export type NoteLayer = {
  /** Identifies this layer as a note */
  type: LayerType.Note;
  /** Horizontal position */
  x: number;
  /** Vertical position */
  y: number;
  /** Height of the note */
  height: number;
  /** Width of the note */
  width: number;
  /** Background fill color of the note */
  fill: Color;
  /** Optional text content of the note */
  value?: string;
};

/**
 * Represents a freehand-drawn path layer on the canvas.
 * The path is defined by a series of points.
 */
export type PathLayer = {
  /** Identifies this layer as a path */
  type: LayerType.Path;
  /** Horizontal position of the path's bounding box */
  x: number;
  /** Vertical position of the path's bounding box */
  y: number;
  /** Height of the path's bounding box */
  height: number;
  /** Width of the path's bounding box */
  width: number;
  /** Stroke/fill color of the path */
  fill: Color;
  /** Array of point coordinates defining the path, where each point is [x, y, ...] */
  points: number[][];
  /** Optional text value associated with the path */
  value?: string;
};

/**
 * Represents a rectangle layer on the canvas.
 */
export type RectangleLayer = {
  /** Identifies this layer as a rectangle */
  type: LayerType.Rectangle;
  /** Horizontal position */
  x: number;
  /** Vertical position */
  y: number;
  /** Height of the rectangle */
  height: number;
  /** Width of the rectangle */
  width: number;
  /** Fill color of the rectangle */
  fill: Color;
  /** Optional text value associated with the rectangle */
  value?: string;
};

/**
 * Represents a text layer on the canvas.
 */
export type TextLayer = {
  /** Identifies this layer as text */
  type: LayerType.Text;
  /** Horizontal position */
  x: number;
  /** Vertical position */
  y: number;
  /** Height of the text bounding box */
  height: number;
  /** Width of the text bounding box */
  width: number;
  /** Color of the text */
  fill: Color;
  /** Optional text content */
  value?: string;
};

/**
 * Union type representing any possible layer on the canvas.
 */
export type Layer =
  EllipseLayer | NoteLayer | PathLayer | RectangleLayer | TextLayer;

/**
 * Represents the current state of the canvas, which varies based on the active mode.
 * Each variant carries the contextual data needed for that particular interaction.
 */
export type CanvasState =
  | {
      /** Canvas is in the default idle state */
      mode: CanvasMode.None;
    }
  | {
      /** Canvas is in inserting mode, placing a new layer */
      mode: CanvasMode.Inserting;
      /** The type of layer being inserted */
      layerType:
        | LayerType.Ellipse
        | LayerType.Note
        | LayerType.Rectangle
        | LayerType.Text;
    }
  | {
      /** Canvas is in pencil/freehand drawing mode */
      mode: CanvasMode.Pencil;
    }
  | {
      /** Canvas is in the pressing state before a drag action is determined */
      mode: CanvasMode.Pressing;
      /** The point where the press originated */
      origin: Point;
    }
  | {
      /** Canvas is in resizing mode for an existing layer */
      mode: CanvasMode.Resizing;
      /** The initial bounding box of the layer before resizing began */
      initialBounds: XYWH;
      /** The side/corner being dragged for resizing */
      corner: Side;
    }
  | {
      /** Canvas is in selection net mode, drawing a selection rectangle */
      mode: CanvasMode.SelectionNet;
      /** The point where the selection net originated */
      origin: Point;
      /** The current point of the selection net as the user drags */
      current?: Point;
    }
  | {
      /** Canvas is in translating/moving mode for a selected layer */
      mode: CanvasMode.Translating;
      /** The current pointer position during translation */
      current: Point;
    };
