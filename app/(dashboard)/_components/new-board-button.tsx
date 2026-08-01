"use client";

import { useRouter } from "next/navigation";

import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";

/**
 * Props for the NewBoardButton component.
 *
 * @interface NewBoardButtonProps
 * @property {string} orgId - The organization ID under which the new board will be created.
 * @property {boolean} [disabled] - When `true`, the button is non-interactive.
 *   Typically set while the parent is in a loading state.
 */
interface NewBoardButtonProps {
  orgId: string;
  disabled?: boolean;
}

/**
 * `NewBoardButton` renders a visually prominent button that creates a new
 * board for the given organization and navigates to it immediately.
 *
 * The button occupies one cell in the board grid and matches the aspect
 * ratio of `BoardCard`. It is disabled in two cases:
 * 1. The `disabled` prop is passed explicitly (e.g., during a parent loading state).
 * 2. The board creation mutation is already in-flight (`pending`).
 *
 * On success, a success toast is shown and the router navigates to the new board.
 * On failure, an error toast is shown.
 *
 * @param {NewBoardButtonProps} props - The props for the component.
 * @param {string} props.orgId - The target organization ID.
 * @param {boolean} [props.disabled=false] - Whether the button should be non-interactive.
 * @returns {JSX.Element} A styled button for creating a new board.
 *
 * @example
 * // Active state – user can click to create a board
 * <NewBoardButton orgId="org_123" />
 *
 * @example
 * // Disabled during a parent loading state
 * <NewBoardButton disabled orgId="org_123" />
 */
export function NewBoardButton({ orgId, disabled }: NewBoardButtonProps) {
  const router = useRouter();

  /**
   * `mutate`  – Calls the Convex `board.create` mutation.
   * `pending` – `true` while the mutation request is in-flight.
   */
  const { mutate, pending } = useApiMutation(api.board.create);

  /**
   * Handles the button click event.
   *
   * Fires the `board.create` mutation with a default "Untitled" title.
   * On success, navigates the user to the newly created board.
   * On failure, displays an error toast notification.
   *
   * @returns {void}
   */
  const onClick = () => {
    mutate({
      orgId,
      title: "Untitled",
    })
      .then((id) => {
        toast.success("Board created");
        // Navigate directly into the new board after creation.
        router.push(`/board/${id}`);
      })
      .catch(() => toast.error("Failed to create board"));
  };

  return (
    <button
      className={cn(
        // Base styles: fills one grid cell, blue background, centered content
        "col-span-1 flex aspect-100/127 flex-col items-center justify-center rounded-lg bg-blue-600 py-6 hover:bg-blue-800",
        // Disabled styles: muted appearance, no hover color change, blocked cursor
        (pending || disabled) &&
          "cursor-not-allowed opacity-75 hover:bg-blue-600",
      )}
      // Prevent interaction while a mutation is pending or the parent disables the button
      disabled={pending || disabled}
      onClick={onClick}
    >
      {/* Spacer — maintains vertical centering of the icon and label */}
      <div />

      {/* Plus icon indicating the "create new" action */}
      <PlusIcon className="size-12 stroke-1 text-white" />

      {/* Button label */}
      <p className="text-sm font-light text-white">New board</p>
    </button>
  );
}
