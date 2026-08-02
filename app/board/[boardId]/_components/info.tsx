"use client";

import { useCallback } from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { useQuery } from "convex/react";
import { MenuIcon } from "lucide-react";

import { Actions } from "@/components/actions";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";

/**
 * Props for the {@link Info} component.
 */
interface InfoProps {
  /** ID of the board whose metadata should be displayed. */
  boardId: string;
}

/** Poppins font (600 weight) used for the app logotype. */
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

/** Offset (in px) applied to all `Hint` tooltips within this component. */
const HINT_SIDE_OFFSET = 10;

/**
 * Base styling shared by the info bar and its loading skeleton.
 * Individual variants extend this with layout-specific classes (e.g. width).
 */
const INFO_BAR_BASE_CLASSNAME =
  "absolute top-2 left-2 flex h-12 items-center rounded-md bg-white px-1.5 shadow-md";

/**
 * Simple visual divider used between action groups in the info bar.
 */
function TabSeparator() {
  return <div className="px-1.5 text-neutral-300">|</div>;
}

/**
 * Floating info bar displayed on the board canvas.
 *
 * Shows:
 * - A link back to the boards overview (with logo).
 * - The current board's title, editable via a rename modal.
 * - A menu button exposing board-level actions (rename, delete, etc.).
 *
 * Renders a skeleton placeholder while board data is loading.
 */
export function Info({ boardId }: InfoProps) {
  const { onOpen } = useRenameModal();

  const data = useQuery(api.board.get, {
    id: boardId as Id<"boards">,
  });

  /**
   * Opens the rename modal for the current board.
   * Memoized to keep a stable reference across re-renders.
   */
  const handleRenameClick = useCallback(() => {
    if (!data) return;
    onOpen(data._id, data.title);
  }, [data, onOpen]);

  if (!data) return <InfoSkeleton />;

  return (
    <div className={cn(INFO_BAR_BASE_CLASSNAME)}>
      <Hint label="Go to boards" side="bottom" sideOffset={HINT_SIDE_OFFSET}>
        <Button asChild className="px-2" variant="board">
          <Link href="/">
            <Image alt="Board logo" height={28} src="/logo.svg" width={28} />
            <span
              className={cn(
                "ml-2 text-xl font-semibold text-black",
                font.className,
              )}
            >
              NexCanvas
            </span>
          </Link>
        </Button>
      </Hint>

      <TabSeparator />

      <Hint label="Edit title" side="bottom" sideOffset={HINT_SIDE_OFFSET}>
        <Button
          className="px-2 text-base font-normal"
          variant="board"
          onClick={handleRenameClick}
        >
          {data.title}
        </Button>
      </Hint>

      <TabSeparator />

      <Actions
        id={data._id}
        side="bottom"
        sideOffset={HINT_SIDE_OFFSET}
        title={data.title}
      >
        <div>
          <Hint label="Main menu" side="bottom" sideOffset={HINT_SIDE_OFFSET}>
            <Button size="icon" variant="board">
              <MenuIcon />
            </Button>
          </Hint>
        </div>
      </Actions>
    </div>
  );
}

/**
 * Placeholder shown in place of {@link Info} while board data is loading.
 * Mirrors the dimensions of the real info bar (plus a fixed width) to
 * avoid layout shift.
 */
export function InfoSkeleton() {
  return <div className={cn(INFO_BAR_BASE_CLASSNAME, "w-75")} />;
}
