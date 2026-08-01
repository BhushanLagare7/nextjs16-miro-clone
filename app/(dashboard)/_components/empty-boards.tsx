"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

/**
 * `EmptyBoards` is an empty-state component displayed when an organization
 * has no boards yet.
 *
 * It provides:
 * - An illustrative image to communicate the empty state visually.
 * - A call-to-action button that creates a new "Untitled" board and navigates
 *   the user directly into it upon success.
 *
 * Board creation is handled via the `api.board.create` Convex mutation.
 * Toast notifications inform the user of success or failure.
 *
 * @returns {JSX.Element} A centered empty-state UI with a board creation prompt.
 *
 * @example
 * // Rendered automatically by BoardList when no boards exist
 * <EmptyBoards />
 */
export function EmptyBoards() {
  const router = useRouter();

  /** Retrieve the currently active Clerk organization. */
  const { organization } = useOrganization();

  /**
   * `mutate`  – Triggers the board creation mutation.
   * `pending` – `true` while the mutation is in-flight; used to disable the button.
   */
  const { mutate, pending } = useApiMutation(api.board.create);

  /**
   * Handles the "Create board" button click.
   *
   * Guards against execution if no organization is active, then calls the
   * Convex `board.create` mutation. On success, shows a toast and navigates
   * to the new board. On failure, shows an error toast.
   *
   * @returns {void}
   */
  const onClick = () => {
    // Do nothing if there is no active organization context.
    if (!organization) return;

    mutate({
      orgId: organization.id,
      title: "Untitled",
    })
      .then((id) => {
        toast.success("Board created");
        // Navigate to the newly created board immediately.
        router.push(`/board/${id}`);
      })
      .catch(() => toast.error("Failed to create board"));
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {/* Decorative illustration representing the empty state */}
      <Image alt="Empty" height={110} src="/note.svg" width={110} />

      {/* Heading to guide the user */}
      <h2 className="mt-6 text-2xl font-semibold">Create your first board!</h2>

      {/* Supporting description */}
      <p className="text-muted-foreground mt-2 text-sm">
        Start by creating a board for your organization
      </p>

      {/* Primary action — disabled while the mutation is pending */}
      <div className="mt-6">
        <Button disabled={pending} size="lg" onClick={onClick}>
          Create board
        </Button>
      </div>
    </div>
  );
}
