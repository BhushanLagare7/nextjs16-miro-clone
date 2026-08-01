"use client";

/**
 * @file actions.tsx
 * @description A dropdown menu component that provides contextual actions for a board,
 * including copying the board link, renaming, and deleting the board.
 */

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { Link2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRenameModal } from "@/store/use-rename-modal";

/**
 * @interface ActionsProps
 * @description Defines the props for the Actions component.
 *
 * @property {React.ReactNode} children - The trigger element that opens the dropdown menu.
 * @property {DropdownMenuContentProps["side"]} [side] - The preferred side of the trigger
 * to render the dropdown menu (e.g., "top", "bottom", "left", "right").
 * @property {DropdownMenuContentProps["sideOffset"]} [sideOffset] - The distance in pixels
 * from the trigger element where the dropdown menu will appear.
 * @property {Id<"boards">} id - The unique identifier of the board.
 * @property {string} title - The current title of the board.
 */
interface ActionsProps {
  children: React.ReactNode;
  side?: DropdownMenuContentProps["side"];
  sideOffset?: DropdownMenuContentProps["sideOffset"];
  id: Id<"boards">;
  title: string;
}

/**
 * @component Actions
 * @description Renders a dropdown menu with contextual actions for a board.
 * Provides functionality to copy the board link, rename the board, or delete it.
 * Deletion requires confirmation via a modal dialog.
 *
 * @param {ActionsProps} props - The component props.
 * @param {React.ReactNode} props.children - The trigger element for the dropdown.
 * @param {DropdownMenuContentProps["side"]} [props.side] - Preferred side for dropdown placement.
 * @param {DropdownMenuContentProps["sideOffset"]} [props.sideOffset] - Offset distance from trigger.
 * @param {Id<"boards">} props.id - The unique board identifier.
 * @param {string} props.title - The current board title.
 *
 * @example
 * <Actions id={boardId} title="My Board" side="bottom" sideOffset={8}>
 *   <button>Open Actions</button>
 * </Actions>
 *
 * @returns {JSX.Element} A dropdown menu with board action items.
 */
export function Actions({
  children,
  side,
  sideOffset,
  id,
  title,
}: ActionsProps) {
  /** Access the rename modal's open handler from the global store */
  const { onOpen } = useRenameModal();

  /** Access the mutation function and pending state for board deletion */
  const { mutate, pending } = useApiMutation(api.board.remove);

  /**
   * @function onCopyLink
   * @description Copies the full board URL to the clipboard.
   * Displays a success toast notification on success, or an error toast on failure.
   *
   * @returns {void}
   */
  const onCopyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/board/${id}`)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Failed to copy link"));
  };

  /**
   * @function onDelete
   * @description Triggers the board deletion mutation using the board's ID.
   * Displays a success toast on completion, or an error toast on failure.
   *
   * @returns {void}
   */
  const onDelete = () => {
    mutate({ id })
      .then(() => toast.success("Board deleted"))
      .catch(() => toast.error("Failed to delete board"));
  };

  return (
    <DropdownMenu>
      {/* Renders the trigger element without wrapping it in an additional DOM element */}
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60"
        side={side}
        sideOffset={sideOffset}
        onClick={(e) => e.stopPropagation()} // Prevents click events from bubbling up to parent elements
      >
        {/* Action: Copy board link to clipboard */}
        <DropdownMenuItem className="cursor-pointer p-3" onClick={onCopyLink}>
          <Link2Icon className="mr-2 size-4" />
          Copy board link
        </DropdownMenuItem>

        {/* Action: Open the rename modal with current board ID and title */}
        <DropdownMenuItem
          className="cursor-pointer p-3"
          onClick={() => onOpen(id, title)}
        >
          <PencilIcon className="mr-2 size-4" />
          Rename
        </DropdownMenuItem>

        {/* Action: Delete board with confirmation dialog */}
        <ConfirmModal
          description="This will delete the board and all of its contents."
          disabled={pending}
          header="Delete board?"
          onConfirm={onDelete}
        >
          <Button
            className="w-full cursor-pointer justify-start p-3 text-sm font-normal"
            variant="ghost"
          >
            <Trash2Icon className="mr-2 size-4" />
            Delete
          </Button>
        </ConfirmModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
