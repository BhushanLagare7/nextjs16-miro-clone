/**
 * Sidebar Component
 *
 * A fixed vertical navigation sidebar displayed on the left side of the screen.
 * Renders a list of organizations the user belongs to and a button to create new organizations.
 *
 * Layout:
 * - Fixed position on the left edge of the viewport
 * - Full height with a dark blue background
 * - Stacks child components vertically with consistent spacing
 *
 * @returns {JSX.Element} A fixed sidebar containing the organization List and NewButton components
 */

import { List } from "./list";
import { NewButton } from "./new-button";

export function Sidebar() {
  return (
    <aside className="fixed left-0 z-1 flex h-full w-15 flex-col gap-y-4 bg-blue-950 p-3 text-white">
      {/* Renders the list of organizations the user is a member of */}
      <List />

      {/* Renders the button to create a new organization */}
      <NewButton />
    </aside>
  );
}
