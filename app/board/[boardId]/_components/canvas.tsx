/**
 * @file canvas.tsx
 * @description Provides the main Canvas component for the collaborative board
 * application. It manages canvas state and integrates with Liveblocks for
 * real-time collaboration features such as shared history.
 */

"use client";

import { useState } from "react";

import { useCanRedo, useCanUndo, useHistory } from "@liveblocks/react";

import { CanvasMode, CanvasState } from "@/types/canvas";

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";

/**
 * Props for the Canvas component.
 *
 * @interface CanvasProps
 * @property {string} boardId - The unique identifier for the board being rendered.
 *   Used to fetch and display board-specific information.
 */
interface CanvasProps {
  boardId: string;
}

/**
 * Canvas component that serves as the main drawing surface for the collaborative
 * board application.
 *
 * Responsibilities:
 * - Manages the local `canvasState` to track the active tool and drawing mode.
 * - Integrates with the Liveblocks `useHistory` hook to support collaborative
 *   undo/redo functionality.
 * - Renders the {@link Info} panel, {@link Participants} list, and {@link Toolbar}
 *   as overlays on top of the canvas surface.
 *
 * This is a **Client Component** (`"use client"`) as it depends on React state
 * and Liveblocks real-time hooks.
 *
 * @param {CanvasProps} props - The props for the Canvas component.
 * @returns {JSX.Element} The full-screen canvas with overlaid UI components.
 *
 * @example
 * // Render the Canvas for a specific board
 * <Canvas boardId="board-123" />
 */
export function Canvas({ boardId }: CanvasProps) {
  /**
   * Local state representing the current mode and configuration of the canvas.
   * Initialized to `CanvasMode.None` (selection/idle mode).
   */
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  /**
   * Liveblocks shared history object, providing `undo` and `redo` methods
   * that are synchronized across all collaborators in the room.
   */
  const history = useHistory();

  /**
   * Whether there are actions available to undo in the shared history.
   */
  const canUndo = useCanUndo();

  /**
   * Whether there are actions available to redo in the shared history.
   */
  const canRedo = useCanRedo();

  return (
    <main className="relative h-screen w-screen touch-none bg-neutral-100">
      {/* Displays board metadata such as title and organization info */}
      <Info boardId={boardId} />

      {/* Displays avatars of all active participants in the board session */}
      <Participants />

      {/* Primary toolbar for selecting tools and triggering undo/redo */}
      <Toolbar
        canRedo={canRedo}
        canUndo={canUndo}
        canvasState={canvasState}
        redo={history.redo}
        setCanvasState={setCanvasState}
        undo={history.undo}
      />
    </main>
  );
}
