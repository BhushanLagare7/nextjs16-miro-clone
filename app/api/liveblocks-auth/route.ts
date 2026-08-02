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
 *          or a 403 response if the user is unauthorized.
 */
export async function POST(request: Request) {
  // Run independent Clerk lookups concurrently to reduce latency.
  const [authorization, user] = await Promise.all([auth(), currentUser()]);

  if (!authorization || !user) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { room }: { room: Id<"boards"> } = await request.json();
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

  if (room) {
    session.allow(room, ["*:write"]);
  }

  const { status, body } = await session.authorize();

  return new Response(body, { status });
}
