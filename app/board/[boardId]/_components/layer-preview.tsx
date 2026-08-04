/**
 * @file layer-preview.tsx
 * @description Provides the LayerPreview component, which renders the
 * appropriate canvas element for a given layer ID by reading the layer's type
 * from Liveblocks shared storage and delegating to the matching shape component.
 */

"use client";

import { memo } from "react";

import { useStorage } from "@liveblocks/react";

import { colorToCss } from "@/lib/utils";
import { LayerType } from "@/types/canvas";

import { Ellipse } from "./ellipse";
import { Note } from "./note";
import { Path } from "./path";
import { Rectangle } from "./rectangle";
import { Text } from "./text";

/**
 * Props for the LayerPreview component.
 *
 * @interface LayerPreviewProps
 * @property {string} id - The unique identifier of the layer to render.
 *   Used to look up the layer's data in Liveblocks shared storage.
 * @property {(e: React.PointerEvent, layerId: string) => void} onLayerPointerDown
 *   Callback invoked when a pointer-down event is fired on this layer. Receives
 *   the pointer event and the layer's ID, allowing the parent to handle
 *   selection or drag initiation.
 * @property {string} [selectionColor] - Optional CSS color string used to
 *   render the layer's selection border/highlight. When omitted, no selection
 *   indicator is shown.
 */
interface LayerPreviewProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
}

/**
 * LayerPreview component that reads a layer's data from Liveblocks shared
 * storage and renders the corresponding shape component based on the layer's
 * `type` field.
 *
 * Behavior:
 * - Subscribes to the layer in shared storage via `useStorage`. Returns `null`
 *   if the layer does not exist (e.g. it was deleted by another participant).
 * - Delegates rendering to the appropriate shape component:
 *   - `LayerType.Path` → {@link Path}
 *   - `LayerType.Note` → {@link Note}
 *   - `LayerType.Text` → {@link Text}
 *   - `LayerType.Ellipse` → {@link Ellipse}
 *   - `LayerType.Rectangle` → {@link Rectangle}
 * - Logs a warning and returns `null` for any unrecognised layer type,
 *   ensuring the application degrades gracefully as new layer types are added.
 *
 * Wrapped in `React.memo` to avoid unnecessary re-renders when sibling layers
 * or unrelated state updates occur.
 *
 * This is a **Client Component** (`"use client"`) as it subscribes to the
 * Liveblocks `useStorage` hook.
 *
 * @param {LayerPreviewProps} props - The props for the LayerPreview component.
 * @param {string} props.id - The layer ID to look up and render.
 * @param {(e: React.PointerEvent, layerId: string) => void} props.onLayerPointerDown
 *   Handler for pointer-down events on the rendered layer.
 * @param {string} [props.selectionColor] - Optional selection highlight color.
 * @returns {JSX.Element | null} The rendered shape element, or `null` if the
 *   layer is missing or its type is unrecognised.
 *
 * @example
 * <LayerPreview
 *   id="layer-abc"
 *   onLayerPointerDown={(e, id) => handleSelect(e, id)}
 *   selectionColor="#6366f1"
 * />
 */
export const LayerPreview = memo(
  ({ id, onLayerPointerDown, selectionColor }: LayerPreviewProps) => {
    /**
     * The layer object retrieved from Liveblocks shared storage.
     * Will be `null` or `undefined` if the layer has been removed.
     */
    const layer = useStorage((root) => root.layers[id]);

    if (!layer) {
      return null;
    }

    switch (layer.type) {
      case LayerType.Path:
        return (
          <Path
            key={id}
            fill={layer.fill ? colorToCss(layer.fill) : "#000"}
            points={layer.points}
            stroke={selectionColor}
            x={layer.x}
            y={layer.y}
            onPointerDown={(e) => onLayerPointerDown(e, id)}
          />
        );
      case LayerType.Note:
        return (
          <Note
            id={id}
            layer={layer}
            selectionColor={selectionColor}
            onPointerDown={onLayerPointerDown}
          />
        );
      case LayerType.Text:
        return (
          <Text
            id={id}
            layer={layer}
            selectionColor={selectionColor}
            onPointerDown={onLayerPointerDown}
          />
        );
      case LayerType.Ellipse:
        return (
          <Ellipse
            id={id}
            layer={layer}
            selectionColor={selectionColor}
            onPointerDown={onLayerPointerDown}
          />
        );
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            layer={layer}
            selectionColor={selectionColor}
            onPointerDown={onLayerPointerDown}
          />
        );
      default:
        console.warn("Unknown layer type");
        return null;
    }
  },
);

LayerPreview.displayName = "LayerPreview";
