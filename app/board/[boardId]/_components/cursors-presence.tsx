/**
 * @file cursors-presence.tsx
 * @description Renders real-time presence indicators for all remote participants
 * in the collaborative canvas session. This includes live cursor positions
 * (via {@link Cursor}) and in-progress freehand pencil strokes (via {@link Path}).
 */

"use client";

import { memo } from "react";

import { shallow } from "@liveblocks/client";
import { useOthersConnectionIds, useOthersMapped } from "@liveblocks/react";

import { colorToCss } from "@/lib/utils";

import { DEFAULT_FILL_COLOR_CSS } from "./constants";
import { Cursor } from "./cursor";
import { Path } from "./path";

/**
 * Renders a {@link Cursor} for each remote participant currently connected to
 * the Liveblocks room. Uses `useOthersConnectionIds` to obtain the list of
 * active connection IDs and maps each to a `Cursor` component.
 *
 * Kept as a separate internal component so that cursor re-renders are isolated
 * from draft re-renders, minimizing unnecessary work.
 *
 * @returns {JSX.Element} A React fragment containing one {@link Cursor} per
 *   connected remote participant.
 */
function Cursors() {
  const ids = useOthersConnectionIds();

  return (
    <>
      {ids.map((connectionId) => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  );
}

/**
 * Renders in-progress freehand pencil strokes for all remote participants who
 * have an active `pencilDraft` in their presence. Uses a shallow comparison
 * via `useOthersMapped` to avoid re-renders when unrelated presence fields
 * change.
 *
 * Each draft stroke is rendered as a {@link Path} component at the canvas
 * origin (x=0, y=0), using the participant's `penColor` (or black as a
 * fallback) as the fill.
 *
 * Kept as a separate internal component so that draft re-renders are isolated
 * from cursor re-renders, minimizing unnecessary work.
 *
 * @returns {JSX.Element} A React fragment containing one {@link Path} per
 *   remote participant who currently has an active pencil draft.
 */
function Drafts() {
  const others = useOthersMapped(
    (other) => ({
      pencilDraft: other.presence.pencilDraft,
      penColor: other.presence.penColor,
    }),
    shallow,
  );

  return (
    <>
      {others.map(([key, other]) => {
        if (other.pencilDraft) {
          return (
            <Path
              key={key}
              fill={other.penColor ? colorToCss(other.penColor) : DEFAULT_FILL_COLOR_CSS}
              points={other.pencilDraft}
              x={0}
              y={0}
            />
          );
        }

        return null;
      })}
    </>
  );
}

/**
 * CursorsPresence component that composes {@link Drafts} and {@link Cursors}
 * to display all real-time presence indicators for remote participants on the
 * collaborative canvas.
 *
 * Renders:
 * 1. **Drafts** — in-progress freehand pencil strokes being drawn by others.
 * 2. **Cursors** — pointer positions and name labels for all connected users.
 *
 * Wrapped in `React.memo` to prevent unnecessary re-renders when parent
 * components update for unrelated reasons.
 *
 * This is a **Client Component** (`"use client"`) as it subscribes to
 * Liveblocks real-time presence hooks.
 *
 * @returns {JSX.Element} A React fragment containing remote drafts and cursors.
 *
 * @example
 * // Used inside the canvas SVG transform group
 * <CursorsPresence />
 */
export const CursorsPresence = memo(() => {
  return (
    <>
      <Drafts />
      <Cursors />
    </>
  );
});

CursorsPresence.displayName = "CursorsPresence";
