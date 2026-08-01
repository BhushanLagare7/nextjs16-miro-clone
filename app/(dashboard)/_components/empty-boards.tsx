"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

/**
 * EmptyBoards
 *
 * Empty-state UI shown when an organization has no boards yet.
 * Encourages the user to create their first board.
 *
 * @returns The rendered empty boards placeholder with a call-to-action button.
 */
export function EmptyBoards() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image alt="Empty" height={110} src="/note.svg" width={110} />
      <h2 className="mt-6 text-2xl font-semibold">Create your first board!</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Start by creating a board for your organization
      </p>
      <div className="mt-6">
        {/* TODO: Wire up onClick handler to trigger board creation flow */}
        <Button size="lg">Create board</Button>
      </div>
    </div>
  );
}
