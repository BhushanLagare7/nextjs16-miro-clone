/**
 * @file invite-button.tsx
 * @description A button component that opens a dialog for inviting members
 * to an organization using Clerk's OrganizationProfile component.
 */

import { OrganizationProfile } from "@clerk/nextjs";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

/**
 * InviteButton Component
 *
 * Renders a button that triggers a dialog containing Clerk's OrganizationProfile
 * component, allowing users to invite new members to their organization.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <InviteButton />
 * ```
 *
 * @remarks
 * - Uses Clerk's `OrganizationProfile` with hash-based routing to manage
 *   the organization's member invitations.
 * - The dialog is styled with a transparent background and no border,
 *   letting the OrganizationProfile's own styles take precedence.
 * - The close button is hidden (`showCloseButton={false}`) to maintain
 *   a clean UI for the profile dialog.
 *
 * @returns {JSX.Element} A dialog trigger button labeled "Invite members"
 * with a plus icon, which opens a modal containing the OrganizationProfile.
 */
export function InviteButton() {
  return (
    <Dialog>
      {/* Trigger button that opens the invite dialog */}
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="mr-2 size-4" />
          Invite members
        </Button>
      </DialogTrigger>

      {/*
       * Dialog content containing the OrganizationProfile component.
       * - max-w-220: Sets a wide max-width to accommodate the profile UI.
       * - bg-transparent and border-none: Removes default dialog styling.
       * - p-0: Removes padding to let OrganizationProfile fill the space.
       */}
      <DialogContent
        className="max-w-220 border-none bg-transparent p-0 sm:max-w-220"
        showCloseButton={false}
      >
        {/*
         * OrganizationProfile with hash routing to handle navigation
         * within the profile UI without full page reloads.
         */}
        <OrganizationProfile routing="hash" />
      </DialogContent>
    </Dialog>
  );
}
