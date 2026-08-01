import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Props for the Footer component.
 *
 * @interface FooterProps
 * @property {string} title - The board title displayed as the primary text.
 * @property {string} authorLabel - A human-readable author string (e.g., "You" or the author's name).
 * @property {string} createdAtLabel - A human-readable relative timestamp (e.g., "3 days ago").
 * @property {boolean} isFavorite - Whether the board is currently favorited by the user.
 * @property {() => void} onClick - Callback invoked when the favorite toggle button is clicked.
 * @property {boolean} disabled - When `true`, the favorite toggle button is non-interactive.
 */
interface FooterProps {
  title: string;
  authorLabel: string;
  createdAtLabel: string;
  isFavorite: boolean;
  onClick: () => void;
  disabled: boolean;
}

/**
 * `Footer` renders the bottom section of a `BoardCard`.
 *
 * It displays:
 * - The **board title** (truncated if it overflows).
 * - The **author and creation time** (visible only on card hover via CSS opacity transition).
 * - A **star (favorite) toggle button** (visible only on card hover) that calls `onClick`
 *   and fills with the accent color when `isFavorite` is `true`.
 *
 * The favorite button uses `event.stopPropagation()` and `event.preventDefault()` to
 * prevent the click from bubbling up to the parent `<Link>` wrapper inside `BoardCard`.
 *
 * @param {FooterProps} props - The props for the component.
 * @returns {JSX.Element} The rendered card footer.
 *
 * @example
 * <Footer
 *   title="Q3 Roadmap"
 *   authorLabel="You"
 *   createdAtLabel="2 days ago"
 *   isFavorite={false}
 *   disabled={false}
 *   onClick={toggleFavorite}
 * />
 */
export function Footer({
  title,
  authorLabel,
  createdAtLabel,
  isFavorite,
  onClick,
  disabled,
}: FooterProps) {
  /**
   * Handles the favorite button click.
   *
   * Stops event propagation and prevents the default action so the click
   * does not trigger the parent `<Link>` navigation, then calls `onClick`.
   *
   * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event - The native mouse event.
   * @returns {void}
   */
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    // Prevent the click from navigating to the board via the parent Link.
    event.stopPropagation();
    event.preventDefault();

    onClick();
  };

  return (
    <div className="relative bg-white p-3">
      {/* Board title — truncated to prevent layout overflow */}
      <p className="max-w-[calc(100%-20px)] truncate text-[13px]">{title}</p>

      {/*
       * Author and creation time — hidden by default, revealed on
       * parent group hover via an opacity CSS transition.
       */}
      <p className="text-muted-foreground truncate text-[11px] opacity-0 transition-opacity group-hover:opacity-100">
        {authorLabel}, {createdAtLabel}
      </p>

      {/*
       * Favorite toggle button — positioned absolutely in the top-right corner.
       * Hidden by default, revealed on parent group hover.
       * Filled with accent color when the board is favorited.
       */}
      <button
        className={cn(
          "text-muted-foreground absolute top-3 right-3 opacity-0 transition group-hover:opacity-100 hover:text-blue-600",
          // Visual feedback when the favorite action is pending
          disabled && "cursor-not-allowed opacity-75",
        )}
        disabled={disabled}
        onClick={handleClick}
      >
        <StarIcon
          className={cn(
            "size-4",
            // Fill the star with the accent color when the board is a favorite
            isFavorite && "fill-blue-600 text-blue-600",
          )}
        />
      </button>
    </div>
  );
}
