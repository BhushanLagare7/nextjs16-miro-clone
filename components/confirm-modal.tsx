"use client";

/**
 * @file confirm-modal.tsx
 * @description A reusable confirmation dialog component built on top of the
 * AlertDialog primitive. Used to prompt users for confirmation before
 * executing potentially destructive or irreversible actions.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * @interface ConfirmModalProps
 * @description Defines the props for the ConfirmModal component.
 *
 * @property {React.ReactNode} children - The trigger element that opens the dialog.
 * @property {() => void} onConfirm - Callback function invoked when the user confirms the action.
 * @property {boolean} [disabled] - If true, the confirm button is disabled, preventing submission.
 * @property {string} header - The title text displayed at the top of the dialog.
 * @property {string} [description] - Optional descriptive text providing additional context.
 */
interface ConfirmModalProps {
  children: React.ReactNode;
  onConfirm: () => void;
  disabled?: boolean;
  header: string;
  description?: string;
}

/**
 * @component ConfirmModal
 * @description A confirmation dialog that wraps a trigger element and displays
 * an alert dialog with "Cancel" and "Confirm" action buttons. Useful for
 * guarding against accidental execution of destructive operations
 * (e.g., deleting a record).
 *
 * @param {ConfirmModalProps} props - The component props.
 * @param {React.ReactNode} props.children - The trigger element for the dialog.
 * @param {() => void} props.onConfirm - Handler called when the user confirms.
 * @param {boolean} [props.disabled] - Disables the confirm button when true.
 * @param {string} props.header - Dialog title text.
 * @param {string} [props.description] - Dialog description text.
 *
 * @example
 * <ConfirmModal
 *   header="Delete Item?"
 *   description="This action cannot be undone."
 *   onConfirm={handleDelete}
 *   disabled={isLoading}
 * >
 *   <button>Delete</button>
 * </ConfirmModal>
 *
 * @returns {JSX.Element} An alert dialog with confirm and cancel actions.
 */
export function ConfirmModal({
  children,
  onConfirm,
  disabled,
  header,
  description,
}: ConfirmModalProps) {
  /**
   * @function handleConfirm
   * @description Internal handler that delegates to the `onConfirm` callback.
   * Abstracted to allow for additional pre/post-confirmation logic if needed.
   *
   * @returns {void}
   */
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AlertDialog>
      {/* Renders the trigger element without adding a wrapping DOM node */}
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Dialog title passed via the header prop */}
          <AlertDialogTitle>{header}</AlertDialogTitle>

          {/* Optional description providing context for the confirmation */}
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          {/* Dismisses the dialog without performing any action */}
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          {/* Executes the confirm handler; disabled during async operations */}
          <AlertDialogAction disabled={disabled} onClick={handleConfirm}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
