/**
 * @file cursor.tsx
 * @description Renders a single remote participant's cursor on the collaborative
 * canvas. Displays a pointer icon and a name label, both colored uniquely based
 * on the participant's Liveblocks connection ID.
 */

"use client";

import { memo } from "react";

import { useOther } from "@liveblocks/react";
import { MousePointer2Icon } from "lucide-react";

import { connectionIdToColor } from "@/lib/utils";

import {
  CURSOR_FOREIGN_OBJECT_HEIGHT,
  CURSOR_NAME_CHAR_WIDTH,
  CURSOR_NAME_PADDING,
  DEFAULT_USER_NAME,
} from "./constants";

/**
 * Props for the Cursor component.
 *
 * @interface CursorProps
 * @property {number} connectionId - The unique numeric connection ID assigned
 *   to the remote participant by Liveblocks. Used to derive the cursor color
 *   and to subscribe to that participant's presence data.
 */
interface CursorProps {
  connectionId: number;
}

/**
 * Cursor component that renders a remote participant's pointer position and
 * display name on the collaborative canvas.
 *
 * Behavior:
 * - Subscribes to the remote participant's `info` (for their display name) and
 *   `presence.cursor` (for their canvas-space position) via `useOther`.
 * - Falls back to `"Teammate"` when no display name is available.
 * - Returns `null` (renders nothing) when the participant's cursor is `null`,
 *   meaning they are not currently hovering over the canvas.
 * - Positions itself using a CSS `translate` transform applied to a
 *   `<foreignObject>` so it follows the participant's exact canvas coordinates.
 * - Both the pointer icon and the name label are colored using
 *   {@link connectionIdToColor} for consistent per-participant color assignment.
 *
 * Wrapped in `React.memo` to prevent unnecessary re-renders when unrelated
 * presence data changes.
 *
 * This is a **Client Component** (`"use client"`) as it subscribes to
 * Liveblocks real-time presence hooks.
 *
 * @param {CursorProps} props - The props for the Cursor component.
 * @param {number} props.connectionId - The remote participant's connection ID.
 * @returns {JSX.Element | null} A positioned `<foreignObject>` containing the
 *   cursor icon and name label, or `null` if the cursor position is unavailable.
 *
 * @example
 * // Rendered automatically by CursorsPresence for each connected participant
 * <Cursor connectionId={42} />
 */
export const Cursor = memo(function Cursor({ connectionId }: CursorProps) {
  /**
   * The remote participant's user info object (e.g. name, avatar), derived
   * from their Liveblocks authentication metadata.
   */
  const info = useOther(connectionId, (user) => user?.info);

  /**
   * The remote participant's current canvas-space cursor position, or `null`
   * if they are not hovering over the canvas.
   */
  const cursor = useOther(connectionId, (user) => user.presence.cursor);

  /** Display name shown in the cursor label. Falls back to "Teammate". */
  const name = info?.name ?? DEFAULT_USER_NAME;

  if (!cursor) {
    return null;
  }

  const { x, y } = cursor;

  return (
    <foreignObject
      className="relative drop-shadow-md"
      height={CURSOR_FOREIGN_OBJECT_HEIGHT}
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
      /**
       * Width is dynamically calculated based on the participant's name length
       * to ensure the label fits without clipping.
       */
      width={name.length * CURSOR_NAME_CHAR_WIDTH + CURSOR_NAME_PADDING}
    >
      {/* Pointer icon colored uniquely per participant */}
      <MousePointer2Icon
        className="size-5"
        style={{
          fill: connectionIdToColor(connectionId),
          color: connectionIdToColor(connectionId),
        }}
      />

      {/* Name label positioned to the right of the pointer icon */}
      <div
        className="absolute left-5 rounded-md px-1.5 py-0.5 text-xs font-semibold text-white"
        style={{ backgroundColor: connectionIdToColor(connectionId) }}
      >
        {name}
      </div>
    </foreignObject>
  );
});

Cursor.displayName = "Cursor";
