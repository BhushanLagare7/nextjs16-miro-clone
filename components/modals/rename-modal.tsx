"use client";

import { useState } from "react";
import { SubmitEventHandler } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { BOARD_TITLE_MAX_LENGTH } from "@/convex/constants";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRenameModal } from "@/store/use-rename-modal";

/**
 * @component RenameModal
 * @description A modal dialog component that allows users to rename a board.
 * It provides an input field pre-filled with the current board title,
 * and handles the submission of the new title through an API mutation.
 *
 * @remarks
 * This is a client-side component that:
 * - Uses `useRenameModal` hook to access modal state (open/close) and initial values
 * - Uses `useApiMutation` hook to handle the API call for updating the board title
 * - Displays success/error notifications using toast messages
 * - Syncs the title state with `initialValues` when they change externally
 *
 * @example
 * // Usage in a parent component or layout
 * import { RenameModal } from "@/components/modals/rename-modal";
 *
 * const Layout = () => {
 *   return (
 *     <>
 *       <RenameModal />
 *       // ... rest of the layout
 *     </>
 *   );
 * };
 *
 * @returns {JSX.Element} A Dialog component containing a form to rename a board
 */
export function RenameModal() {
  /**
   * API mutation hook for updating board details.
   * @property {Function} mutate - Function to trigger the board update mutation
   * @property {boolean} pending - Indicates if the mutation is in progress
   */
  const { mutate, pending } = useApiMutation(api.board.update);

  /**
   * Rename modal state management hook.
   * @property {boolean} isOpen - Controls the visibility of the modal
   * @property {Function} onClose - Callback function to close the modal
   * @property {Object} initialValues - Initial values for the board being renamed
   * @property {string} initialValues.title - Current title of the board
   * @property {string} initialValues.id - Unique identifier of the board
   */
  const { isOpen, onClose, initialValues } = useRenameModal();

  /**
   * Tracks the previous title to detect external changes to `initialValues`.
   * Used to sync the `title` state when `initialValues.title` is updated externally.
   * @type {string}
   */
  const [prevTitle, setPrevTitle] = useState(initialValues.title);

  /**
   * Tracks the current value of the title input field.
   * Initialized with `initialValues.title` and updated as the user types.
   * @type {string}
   */
  const [title, setTitle] = useState(initialValues.title);

  /**
   * Syncs the local title state with new `initialValues` when they change externally.
   * This handles cases where the modal is reused for different boards without unmounting,
   * using a render-time state update pattern to avoid stale values.
   */
  if (initialValues.title !== prevTitle) {
    setPrevTitle(initialValues.title);
    setTitle(initialValues.title);
  }

  /**
   * Handles the form submission event for renaming the board.
   * Prevents the default form submission behavior, triggers the API mutation,
   * and shows a success or error toast notification based on the result.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event
   * @returns {void}
   */
  const onSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    mutate({
      id: initialValues.id as Id<"boards">,
      title,
    })
      .then(() => {
        toast.success("Board renamed");
        onClose(); // Close the modal on successful rename
      })
      .catch(() => toast.error("Failed to rename board")); // Show error toast on failure
  };

  return (
    // Dialog component controlled by `isOpen` state, closes via `onClose`
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          {/* Modal title displayed at the top of the dialog */}
          <DialogTitle>Edit board title</DialogTitle>
        </DialogHeader>

        {/* Instructional description for the user */}
        <DialogDescription>Enter a new title for this board</DialogDescription>

        {/* Form for submitting the new board title */}
        <form className="space-y-4" onSubmit={onSubmit}>
          {/*
           * Input field for the new board title.
           * - Disabled during pending API mutation to prevent multiple submissions
           * - Limited to {BOARD_TITLE_MAX_LENGTH} characters
           * - Required to prevent empty title submission
           */}
          <Input
            disabled={pending}
            maxLength={BOARD_TITLE_MAX_LENGTH}
            placeholder="Board title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <DialogFooter>
            {/*
             * Cancel button: Closes the modal without saving changes.
             * Uses `DialogClose` to handle closing behavior.
             */}
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>

            {/*
             * Save button: Submits the form to update the board title.
             * Disabled during pending API mutation to prevent duplicate requests.
             */}
            <Button disabled={pending} type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
