/**
 * @file room.tsx
 * @description Provides the Room component, which wraps its children with the
 * necessary Liveblocks context providers to enable real-time collaboration.
 * Sets up authentication, throttling, room identity, initial presence, and
 * initial shared storage for the collaborative canvas session.
 */

"use client";

import { ReactNode } from "react";

import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";

import { Layer } from "@/types/canvas";

/**
 * Props for the Room component.
 *
 * @interface RoomProps
 * @property {ReactNode} children - The child components that require access to
 *   the Liveblocks room context (e.g. the {@link Canvas} component).
 * @property {string} roomId - The unique identifier of the Liveblocks room to
 *   connect to. Determines which shared storage and presence session is used.
 * @property {NonNullable<ReactNode> | null} fallback - The React node rendered
 *   by `ClientSideSuspense` while the room connection and storage are being
 *   initialised. Use a loading spinner or skeleton screen here.
 */
interface RoomProps {
  children: ReactNode;
  roomId: string;
  fallback: NonNullable<ReactNode> | null;
}

/**
 * Room component that bootstraps the Liveblocks real-time collaboration
 * infrastructure for the collaborative canvas board.
 *
 * Provider hierarchy (outer to inner):
 * 1. **`LiveblocksProvider`** — configures the global Liveblocks client with
 *    an authentication endpoint (`/api/liveblocks-auth`) and a throttle of
 *    16 ms (~60 fps) for presence broadcast updates.
 * 2. **`RoomProvider`** — connects to the specified `roomId` and establishes:
 *    - **Initial presence** for the local user:
 *      - `cursor: null` — no cursor position until the user moves their pointer.
 *      - `selection: []` — no layers selected initially.
 *      - `pencilDraft: null` — no active freehand drawing.
 *      - `penColor: null` — no pen color selected.
 *    - **Initial shared storage** for the room:
 *      - `layers` — a `LiveMap` keyed by layer ID, storing `LiveObject<Layer>`
 *        instances representing each canvas element.
 *      - `layerIds` — a `LiveList` of layer ID strings defining render order.
 * 3. **`ClientSideSuspense`** — defers rendering of `children` until the room
 *    connection is ready, displaying `fallback` in the interim.
 *
 * This is a **Client Component** (`"use client"`) as it instantiates
 * Liveblocks client-side providers.
 *
 * @param {RoomProps} props - The props for the Room component.
 * @param {ReactNode} props.children - Content requiring Liveblocks room access.
 * @param {string} props.roomId - The Liveblocks room identifier.
 * @param {NonNullable<ReactNode> | null} props.fallback - Loading UI shown
 *   during room initialisation.
 * @returns {JSX.Element} The fully configured Liveblocks provider tree wrapping
 *   the given children.
 *
 * @example
 * <Room roomId="board-abc-123" fallback={<LoadingSpinner />}>
 *   <Canvas boardId="board-abc-123" />
 * </Room>
 */
export function Room({ children, roomId, fallback }: RoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          selection: [],
          pencilDraft: null,
          penColor: null,
        }}
        initialStorage={{
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList([]),
        }}
      >
        <ClientSideSuspense fallback={fallback}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
