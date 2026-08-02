import { Loader } from "lucide-react";

import { InfoSkeleton } from "./info";
import { ParticipantsSkeleton } from "./participants";
import { ToolbarSkeleton } from "./toolbar";

export function Loading() {
  return (
    <main className="relative flex h-screen w-screen touch-none items-center justify-center bg-neutral-100">
      <Loader className="text-muted-foreground h-6 w-6 animate-spin" />
      <InfoSkeleton />
      <ParticipantsSkeleton />
      <ToolbarSkeleton />
    </main>
  );
}
