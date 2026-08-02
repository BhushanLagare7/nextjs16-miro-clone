/**
 * @file user-avatar.tsx
 * @description Provides the UserAvatar component for displaying a participant's
 * avatar in the collaborative board. It includes a tooltip with the user's name
 * and supports a custom border color to distinguish participants.
 */

import { Hint } from "@/components/hint";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Props for the UserAvatar component.
 *
 * @interface UserAvatarProps
 * @property {string} [src] - The URL of the user's profile image. If not
 *   provided, the fallback text will be displayed instead.
 * @property {string} [name] - The display name of the user, shown in the
 *   tooltip. Defaults to `"Teammate"` if not provided.
 * @property {string} [fallback] - A short text (e.g., initials) displayed
 *   when the avatar image is unavailable or fails to load.
 * @property {string} [borderColor] - A CSS color value applied as the avatar's
 *   border color to visually distinguish participants in a session.
 */
interface UserAvatarProps {
  src?: string;
  name?: string;
  fallback?: string;
  borderColor?: string;
}

/**
 * UserAvatar component displays a circular avatar for a board participant.
 *
 * Features:
 * - Shows the participant's profile image if `src` is provided.
 * - Falls back to displaying `fallback` text (typically initials) if no image
 *   is available.
 * - Renders a tooltip with the participant's `name` on hover, positioned below
 *   the avatar.
 * - Applies a custom `borderColor` to help visually identify different users
 *   in a collaborative session.
 *
 * @param {UserAvatarProps} props - The props for the UserAvatar component.
 * @returns {JSX.Element} A tooltip-wrapped avatar with image and fallback support.
 *
 * @example
 * // Render an avatar for a known user
 * <UserAvatar
 *   src="https://example.com/avatar.jpg"
 *   name="Jane Doe"
 *   fallback="JD"
 *   borderColor="#7C3AED"
 * />
 *
 * @example
 * // Render an avatar for an anonymous teammate
 * <UserAvatar fallback="?" />
 */
export function UserAvatar({
  src,
  name,
  fallback,
  borderColor,
}: UserAvatarProps) {
  return (
    // Tooltip displaying the participant's name, positioned below the avatar
    <Hint label={name ?? "Teammate"} side="bottom" sideOffset={18}>
      <Avatar className="size-8 border-2" style={{ borderColor }}>
        {/* Participant's profile image */}
        <AvatarImage src={src} />

        {/* Fallback content (e.g., initials) shown when image is unavailable */}
        <AvatarFallback className="text-xs font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
    </Hint>
  );
}
