/**
 * `Overlay` renders a full-size, semi-transparent black overlay that is
 * hidden by default and revealed when a parent element with the `group`
 * Tailwind class is hovered.
 *
 * It is placed as an absolutely positioned child inside a `relative`
 * container (e.g., the image area of `BoardCard`) to create a darkening
 * hover effect over the board thumbnail.
 *
 * The opacity transition is driven entirely by CSS using Tailwind's
 * `group-hover` variant — no JavaScript event handlers are required.
 *
 * @returns {JSX.Element} A full-size div that darkens its parent on hover.
 *
 * @example
 * // Inside a group-enabled parent container
 * <div className="group relative">
 *   <Image src={imageUrl} alt={title} fill />
 *   <Overlay />
 * </div>
 */
export function Overlay() {
  return (
    /*
     * opacity-0   → invisible by default
     * group-hover:opacity-50 → 50% opaque when any ancestor with class "group" is hovered
     * transition-opacity     → smooth fade between the two states
     */
    <div className="h-full w-full bg-black opacity-0 transition-opacity group-hover:opacity-50" />
  );
}
