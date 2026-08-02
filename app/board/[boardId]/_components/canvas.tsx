"use client";

import { useSelf } from "@liveblocks/react";

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";

interface CanvasProps {
  boardId: string;
}

export function Canvas({ boardId: _boardId }: CanvasProps) {
  const info = useSelf((me) => me.info);

  return (
    <main className="relative h-screen w-screen touch-none bg-neutral-100">
      <Info />
      <Participants />
      <Toolbar />
    </main>
  );
}
