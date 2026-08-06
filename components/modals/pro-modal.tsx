"use client";

import { useTransition } from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";

import { useOrganization } from "@clerk/nextjs";
import { useAction } from "convex/react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useProModal } from "@/store/use-pro-modal";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * @component ProModal
 * @description A modal dialog component that allows users to rename a board.
 * It provides an input field pre-filled with the current board title,
 * and handles the submission of the new title through an API mutation.
 *
 * @remarks
 * This is a client-side component that:
 * - Uses `useProModal` hook to access modal state (open/close)
 * - Uses `useApiMutation` hook to handle the API call for updating the board title
 * - Displays success/error notifications using toast messages
 *
 * @example
 * // Usage in a parent component or layout
 * import { ProModal } from "@/components/modals/pro-modal";
 *
 * const Layout = () => {
 *   return (
 *     <>
 *       <ProModal />
 *       // ... rest of the layout
 *     </>
 *   );
 * };
 *
 * @returns {JSX.Element} A Dialog component containing a form to rename a board
 */
export function ProModal() {
  /**
   * Rename modal state management hook.
   * @property {boolean} isOpen - Controls the visibility of the modal
   * @property {Function} onClose - Callback function to close the modal
   */
  const { isOpen, onClose } = useProModal();

  const pay = useAction(api.stripe.pay);

  const [pending, startTransition] = useTransition();

  const { organization } = useOrganization();

  const onClick = async () => {
    if (!organization) return;
    startTransition(async () => {
      const redirectUrl = await pay({ orgId: organization.id });
      window.location.href = redirectUrl;
    });
  };

  return (
    // Dialog component controlled by `isOpen` state, closes via `onClose`
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-85 overflow-hidden">
        <div className="relative flex aspect-video items-center justify-center">
          <Image alt="Pro" className="object-fill" fill src="/pro.svg" />
        </div>
        <div
          className={cn(
            "mx-auto space-y-6 p-6 text-neutral-700",
            font.className,
          )}
        >
          <h2 className="text-lg font-medium">🚀 Upgrade to Pro today!</h2>
          <div>
            <ul className="list-disc space-y-1 text-[11px]">
              <li>Unlimited boards</li>
              <li>Unlimited tools</li>
              <li>Unlimited organizations</li>
              <li>Unlimited members</li>
            </ul>
          </div>
          <Button
            className="w-full"
            disabled={pending}
            size="sm"
            onClick={onClick}
          >
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
