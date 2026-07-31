/**
 * NewButton Component
 *
 * Renders a button in the sidebar that opens a dialog for creating a new organization.
 *
 * - Displays a "+" icon button with a tooltip labelled "Create organization".
 * - On click, opens a modal dialog containing Clerk's `CreateOrganization` form,
 *   which guides the user through the organization creation process.
 * - The dialog has a transparent background so Clerk's component styles are preserved.
 *
 * @returns {JSX.Element} A dialog-triggered button for creating a new organization
 */

"use client";

import { CreateOrganization } from "@clerk/nextjs";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { PlusIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewButton() {
  return (
    /**
     * Dialog component that manages the open/close state of the
     * organization creation modal.
     */
    <Dialog>
      {/* DialogTrigger wraps the button, opening the dialog on click */}
      <DialogTrigger asChild>
        <div className="aspect-square">
          {/* Tooltip displayed on hover, positioned to the right of the button */}
          <Hint
            align="start"
            label="Create organization"
            side="right"
            sideOffset={18}
          >
            {/* 
              Plus icon button styled to match the sidebar's dark theme.
              Slightly transparent by default, becoming fully opaque on hover.
            */}
            <button className="flex h-full w-full items-center justify-center rounded-md bg-white/25 opacity-60 transition hover:opacity-100">
              <PlusIcon className="text-white" />
            </button>
          </Hint>
        </div>
      </DialogTrigger>

      {/* 
        Dialog content renders Clerk's CreateOrganization form.
        Transparent background and no border to preserve Clerk's default component styling.
      */}
      <DialogContent className="max-w-120 border-none bg-transparent p-0" showCloseButton={false}>
        {/* Visually hidden title satisfies Radix/ARIA dialog accessibility requirements */}
        <VisuallyHidden.Root>
          <DialogTitle>Create organization</DialogTitle>
        </VisuallyHidden.Root>
        <CreateOrganization />
      </DialogContent>
    </Dialog>
  );
}
