/**
 * @file use-pro-modal.ts
 * @description A Zustand store that manages the global state of the "Pro" modal.
 * Tracks whether the modal is open and stores the initial values (board ID and title)
 * to be pre-populated in the form.
 */

import { create } from "zustand";

/**
 * @interface IProModal
 * @description Defines the shape of the pro modal Zustand store.
 *
 * @property {boolean} isOpen - Indicates whether the pro modal is currently visible.
 * @property {() => void} onOpen - Opens the modal and sets
 * the initial values for the selected board.
 * @property {() => void} onClose - Closes the modal and resets the initial values
 * to their defaults.
 */
interface IProModal {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * @store useProModal
 * @description A Zustand store hook for managing the pro modal state globally.
 * Can be consumed in any component that needs to open, close, or read the state
 * of the pro modal without prop drilling.
 *
 * @returns {IProModal} The current state and actions for the pro modal.
 *
 * @example
 * // Opening the modal from any component
 * const { onOpen } = useProModal();
 * onOpen();
 *
 * @example
 * // Reading modal state in the modal component itself
 * const { isOpen, onClose } = useProModal();
 */
export const useProModal = create<IProModal>((set) => ({
  /** Modal is closed by default */
  isOpen: false,

  /**
   * @action onOpen
   * @description Opens the pro modal and populates it with the provided board ID and title.
   */
  onOpen: () => set({ isOpen: true }),

  /**
   * @action onClose
   * @description Closes the pro modal and resets the initial values to defaults,
   * clearing any previously stored board data.
   */
  onClose: () => set({ isOpen: false }),
}));
