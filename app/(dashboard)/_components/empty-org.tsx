import Image from "next/image";

import { CreateOrganization } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

/**
 * EmptyOrg
 *
 * Empty-state UI shown when the user has no active organization selected.
 * Prompts the user to create a new organization via Clerk's
 * `CreateOrganization` component, presented inside a modal dialog.
 *
 * @returns The rendered welcome/empty-org placeholder with a dialog
 * for organization creation.
 */
export function EmptyOrg() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image alt="Empty" height={200} src="/elements.svg" width={200} />
      <h2 className="mt-6 text-2xl font-semibold">Welcome to Board</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Create an organization to get started
      </p>
      <div className="mt-6">
        <Dialog>
          {/* Trigger button that opens the organization creation dialog */}
          <DialogTrigger asChild>
            <Button size="lg">Create organization</Button>
          </DialogTrigger>

          {/* Modal content hosting Clerk's CreateOrganization form.
              Styled transparent/borderless to blend with Clerk's own UI,
              and hides the default close button. */}
          <DialogContent
            className="max-w-120 border-none bg-transparent p-0"
            showCloseButton={false}
          >
            <CreateOrganization />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
