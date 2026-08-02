import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Convex HTTP client used to query board data.
 * Instantiated once at module scope so it can be reused across
 * invocations within the same serverless runtime (warm starts).
 */
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Liveblocks server-side client used to authorize collaborative
 * room sessions. Instantiated once at module scope for reuse.
 */
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

/**
 * Type guard verifying that a parsed JSON request body has the
 * expected shape `{ room: string }`, where `room` is a non-empty
 * string.
 *
 * @param payload - Unknown value parsed from the request body.
 * @returns `true` if `payload` matches the expected shape, narrowing
 *          its type to `{ room: string }` for the caller.
 */
function isValidRoomPayload(payload: unknown): payload is { room: string } {
  return (
    !!payload &&
    typeof payload === "object" &&
    "room" in payload &&
    typeof payload.room === "string" &&
    payload.room.length > 0
  );
}

/**
 * Handles Liveblocks room authorization requests.
 *
 * Flow:
 * 1. Verifies the requester is authenticated via Clerk.
 * 2. Loads the requested board from Convex and ensures it belongs
 *    to the same organization as the authenticated user.
 * 3. Prepares and authorizes a Liveblocks session for the user,
 *    granting write access to the requested room.
 *
 * @param request - Incoming HTTP request. Expected JSON body: `{ room: string }`.
 * @returns A `Response` containing the Liveblocks authorization payload,
 *          a 400 response if the request body is missing or invalid,
 *          or a 403 response if the user is unauthorized.
 */
export async function POST(request: Request) {
  // Run independent Clerk lookups concurrently to reduce latency.
  const [authorization, user] = await Promise.all([auth(), currentUser()]);

  if (!authorization || !user) {
    return new Response("Unauthorized", { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid room", { status: 400 });
  }

  if (!isValidRoomPayload(payload)) {
    return new Response("Invalid room", { status: 400 });
  }

  const room = payload.room as Id<"boards">;
  const board = await convex.query(api.board.get, { id: room });

  // Ensure the board belongs to the same organization as the requester.
  if (board?.orgId !== authorization.orgId) {
    return new Response("Unauthorized", { status: 403 });
  }

  const userInfo = {
    name: user.firstName ?? user.username ?? "Teammate",
    picture: user.imageUrl,
  };

  const session = liveblocks.prepareSession(user.id, { userInfo });

  // `room` is already validated as a non-empty string above.
  session.allow(room, ["*:write"]);

  const { status, body } = await session.authorize();

  return new Response(body, { status });
}
