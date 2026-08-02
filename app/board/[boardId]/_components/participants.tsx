"use client";

import { useOthers, useSelf } from "@liveblocks/react";

import { cn, connectionIdToColor } from "@/lib/utils";

import { UserAvatar } from "./user-avatar";

/** Maximum number of other participants' avatars shown before collapsing into a "+N" indicator. */
const MAX_SHOWN_USERS = 2;

/**
 * Base styling shared by the participants bar and its loading skeleton.
 * Individual variants extend this with layout-specific classes (e.g. width).
 */
const PARTICIPANTS_BAR_BASE_CLASSNAME =
  "absolute top-2 right-2 flex h-12 items-center rounded-md bg-white p-3 shadow-md";

/**
 * Displays avatars for all participants currently present on the board.
 *
 * - Shows up to {@link MAX_SHOWN_USERS} other participants.
 * - Always shows the current user, labeled with "(You)".
 * - Collapses any remaining participants into a "+N" avatar.
 */
export function Participants() {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > MAX_SHOWN_USERS;

  return (
    <div className={cn(PARTICIPANTS_BAR_BASE_CLASSNAME)}>
      <div className="flex gap-x-2">
        {users.slice(0, MAX_SHOWN_USERS).map(({ connectionId, info }) => (
          <UserAvatar
            key={connectionId}
            borderColor={connectionIdToColor(connectionId)}
            fallback={info?.name?.[0] ?? "T"}
            name={info?.name}
            src={info?.picture}
          />
        ))}

        {currentUser && (
          <UserAvatar
            borderColor={connectionIdToColor(currentUser.connectionId)}
            fallback={currentUser.info?.name?.[0]}
            name={`${currentUser.info?.name} (You)`}
            src={currentUser.info?.picture}
          />
        )}

        {hasMoreUsers && (
          <UserAvatar
            fallback={`+${users.length - MAX_SHOWN_USERS}`}
            name={`${users.length - MAX_SHOWN_USERS} more`}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Placeholder shown in place of {@link Participants} while presence data
 * is loading. Mirrors the dimensions of the real participants bar (plus
 * a fixed width) to avoid layout shift.
 */
export function ParticipantsSkeleton() {
  return <div className={cn(PARTICIPANTS_BAR_BASE_CLASSNAME, "w-25")} />;
}
