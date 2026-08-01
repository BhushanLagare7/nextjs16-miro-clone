/**
 * @file use-rename-modal.ts
 * @description A Zustand store that manages the global state of the "Rename Board" modal.
 * Tracks whether the modal is open and stores the initial values (board ID and title)
 * to be pre-populated in the rename form.
 */

import { create } from "zustand";

/**
 * @constant defaultValues
 * @description The default state for the rename modal's initial values.
 * Represents an empty/uninitialized state with no board selected.
 */
const defaultValues = { id: "", title: "" };

/**
 * @interface IRenameModal
 * @description Defines the shape of the rename modal Zustand store.
 *
 * @property {boolean} isOpen - Indicates whether the rename modal is currently visible.
 * @property {{ id: string; title: string }} initialValues - The board ID and title
 * to pre-populate in the rename input field when the modal opens.
 * @property {(id: string, title: string) => void} onOpen - Opens the modal and sets
 * the initial values for the selected board.
 * @property {() => void} onClose - Closes the modal and resets the initial values
 * to their defaults.
 */
interface IRenameModal {
  isOpen: boolean;
  initialValues: typeof defaultValues;
  onOpen: (id: string, title: string) => void;
  onClose: () => void;
}

/**
 * @store useRenameModal
 * @description A Zustand store hook for managing the rename modal state globally.
 * Can be consumed in any component that needs to open, close, or read the state
 * of the rename modal without prop drilling.
 *
 * @returns {IRenameModal} The current state and actions for the rename modal.
 *
 * @example
 * // Opening the modal from any component
 * const { onOpen } = useRenameModal();
 * onOpen(boardId, boardTitle);
 *
 * @example
 * // Reading modal state in the modal component itself
 * const { isOpen, initialValues, onClose } = useRenameModal();
 */
export const useRenameModal = create<IRenameModal>((set) => ({
  /** Modal is closed by default */
  isOpen: false,

  /**
   * @action onOpen
   * @description Opens the rename modal and populates it with the provided board ID and title.
   *
   * @param {string} id - The unique identifier of the board to rename.
   * @param {string} title - The current title of the board to pre-fill in the input.
   */
  onOpen: (id, title) =>
    set({
      isOpen: true,
      initialValues: { id, title },
    }),

  /**
   * @action onClose
   * @description Closes the rename modal and resets the initial values to defaults,
   * clearing any previously stored board data.
   */
  onClose: () =>
    set({
      isOpen: false,
      initialValues: defaultValues,
    }),

  /** Pre-populated form values; defaults to empty strings until a board is selected */
  initialValues: defaultValues,
}));
