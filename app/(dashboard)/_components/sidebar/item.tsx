/**
 * Item Component
 *
 * Represents a single organization item in the sidebar list.
 * Displays the organization's image and highlights it when it is the active organization.
 * Clicking the item switches the user's active organization.
 *
 * @param {ItemProps} props - The props for the Item component
 * @param {string} props.id - The unique identifier of the organization
 * @param {string} props.name - The display name of the organization (used as alt text and tooltip label)
 * @param {string} props.imageUrl - The URL of the organization's image/logo
 *
 * @returns {JSX.Element} A clickable organization image with a tooltip showing the organization name
 *
 * @example
 * <Item
 *   id="org_123"
 *   name="Acme Corp"
 *   imageUrl="https://example.com/acme-logo.png"
 * />
 */

"use client";

import Image from "next/image";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";

import { Hint } from "@/components/hint";
import { cn } from "@/lib/utils";

/**
 * Props for the Item component
 *
 * @interface ItemProps
 * @property {string} id - The unique identifier of the organization
 * @property {string} name - The display name of the organization
 * @property {string} imageUrl - The URL of the organization's image/logo
 */
interface ItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

export function Item({ id, name, imageUrl }: ItemProps) {
  /**
   * Retrieves the currently active organization from Clerk.
   * Used to determine whether this item should be shown as active.
   */
  const { organization } = useOrganization();

  /**
   * Retrieves the `setActive` function from Clerk's organization list hook.
   * Used to switch the active organization when the item is clicked.
   */
  const { setActive } = useOrganizationList();

  /** Whether this organization is the currently active one */
  const isActive = organization?.id === id;

  /**
   * Handles the click event on the organization item.
   * Switches the active organization to the one represented by this item.
   * Does nothing if `setActive` is not available.
   */
  const onClick = () => {
    if (!setActive) return;

    setActive({ organization: id });
  };

  return (
    // Wrapper maintains a square aspect ratio for the organization image
    <div className="relative aspect-square">
      {/* Tooltip displaying the organization name on hover */}
      <Hint align="start" label={name} side="right" sideOffset={18}>
        <Image
          alt={name}
          className={cn(
            // Base styles: cursor pointer, rounded corners, slightly transparent with hover effect
            "cursor-pointer rounded-md opacity-75 transition hover:opacity-100",
            // Active organization is shown at full opacity
            isActive && "opacity-100",
          )}
          fill
          src={imageUrl}
          onClick={onClick}
        />
      </Hint>
    </div>
  );
}
