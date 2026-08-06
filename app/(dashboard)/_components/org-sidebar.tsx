/**
 * @file org-sidebar.tsx
 * @description The organization sidebar component providing navigation
 * links for the application, an organization switcher, and quick access
 * to team and favorite canvases. Visible only on large screens.
 */

"use client";

import { useTransition } from "react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { BanknoteIcon, LayoutDashboardIcon, StarIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

/**
 * Poppins font configuration.
 * Loaded with the Latin subset and SemiBold (600) weight
 * for the application logo/brand text.
 */
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

/**
 * OrgSidebar Component
 *
 * Renders a fixed-width vertical sidebar for large screens that includes:
 * - Application logo and brand name linking to the home page.
 * - An organization switcher for switching between organizations.
 * - Navigation buttons for "Team canvases" and "Favorite canvases".
 * - A billing/upgrade button that redirects to Stripe for payment or portal management.
 *
 * @component
 * @example
 * ```tsx
 * // Used within a layout to provide persistent sidebar navigation
 * <OrgSidebar />
 * ```
 *
 * @remarks
 * ### Visibility:
 * - The sidebar is hidden on small screens and only visible on `lg`
 *   screens and above (`hidden lg:flex`).
 *
 * ### Active State Logic:
 * - **Team canvases** button uses `secondary` variant when there is no
 *   `favorites` query parameter (i.e., default view).
 * - **Favorite canvases** button uses `secondary` variant when the
 *   `favorites` query parameter is present.
 * - Both buttons use `ghost` variant when not active, providing a clear
 *   visual indicator of the current view.
 *
 * ### OrganizationSwitcher:
 * - Styled to fill the sidebar width with a clean bordered appearance.
 * - Personal accounts are hidden (`hidePersonal`) to keep focus on
 *   organization-level navigation.
 *
 * ### Billing Button:
 * - Displays "Upgrade" for non-subscribed organizations, triggering a
 *   Stripe Checkout session via `api.stripe.pay`.
 * - Displays "Payment Settings" for subscribed organizations, opening
 *   the Stripe customer portal via `api.stripe.portal`.
 * - Disabled while a redirect is in-flight (`pending === true`).
 * - Displays a `PRO` badge next to the logo when the organization has
 *   an active subscription.
 *
 * @returns {JSX.Element} A sidebar with logo, organization switcher,
 * canvas navigation buttons, and a billing button. Only visible on
 * large screens.
 */
export function OrgSidebar() {
  /**
   * Retrieves current URL search parameters.
   * Used to determine if the "favorites" filter is active.
   */
  const searchParams = useSearchParams();

  /**
   * The value of the `favorites` query parameter.
   * - Truthy: user is viewing favorite canvases.
   * - Null: user is viewing all team canvases (default view).
   */
  const favorites = searchParams.get("favorites");

  /** The currently active Clerk organization object. */
  const { organization } = useOrganization();

  /**
   * Reactive subscription status for the current organization.
   * - `true`  → organization has an active Pro subscription.
   * - `false` → organization is on the free tier.
   * - `undefined` → query is still loading.
   */
  const isSubscribed = useQuery(api.subscriptions.getIsSubscribed, {
    orgId: organization?.id,
  });

  /**
   * Convex action that creates or retrieves a Stripe customer portal
   * session URL for the current organization.
   * Called when the organization already has an active subscription.
   */
  const portal = useAction(api.stripe.portal);

  /**
   * Convex action that creates a Stripe Checkout session URL for the
   * current organization.
   * Called when the organization is not yet subscribed.
   */
  const pay = useAction(api.stripe.pay);

  /**
   * React transition state used to track the in-flight Stripe redirect.
   * - `pending` → `true` while the async action is running.
   * - `startTransition` → wraps the async billing action to set `pending`.
   */
  const [pending, startTransition] = useTransition();

  /**
   * Handles the billing button click.
   *
   * - Guards against missing organization ID.
   * - Selects the appropriate Stripe action (`portal` vs `pay`) based on
   *   the current subscription status.
   * - Redirects the browser to the returned Stripe URL.
   * - Displays an error toast if the action throws.
   *
   * @returns {void}
   */
  const onClick = async () => {
    if (!organization?.id) return;
    if (isSubscribed === undefined) return;

    startTransition(async () => {
      try {
        const action = isSubscribed ? portal : pay;
        const redirectUrl = await action({ orgId: organization?.id });
        window.location.href = redirectUrl;
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="hidden w-51.5 flex-col space-y-6 pt-5 pl-5 lg:flex">
      {/*
       * Application logo and brand name.
       * Clicking navigates to the home page.
       * The PRO badge is shown when the organization has an active subscription.
       */}
      <Link href="/">
        <div className="flex items-center justify-center gap-x-1">
          <Image alt="Logo" height={32} src="/logo.svg" width={32} />
          <span className={cn("text-xl font-semibold", font.className)}>
            NexCanvas
          </span>
          {isSubscribed && <Badge variant="secondary">PRO</Badge>}
        </div>
      </Link>

      {/*
       * Organization switcher styled to fill the sidebar width.
       * Personal accounts are hidden to maintain an org-focused UX.
       */}
      <OrganizationSwitcher
        appearance={{
          elements: {
            rootBox: {
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            },
            organizationSwitcherTrigger: {
              padding: "6px",
              width: "100%",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              justifyContent: "space-between",
              backgroundColor: "white",
            },
          },
        }}
        hidePersonal
      />

      {/* Navigation buttons for canvas views and billing */}
      <div className="w-full space-y-1">
        {/*
         * Team canvases button:
         * - Active (secondary) when no `favorites` filter is applied.
         * - Links to the home page without any query parameters.
         */}
        <Button
          asChild
          className="w-full justify-start px-2 font-normal"
          size="lg"
          variant={favorites ? "ghost" : "secondary"}
        >
          <Link href="/">
            <LayoutDashboardIcon className="mr-2 size-4" />
            Team canvases
          </Link>
        </Button>

        {/*
         * Favorite canvases button:
         * - Active (secondary) when the `favorites` query parameter is present.
         * - Links to the home page with `?favorites=true` query parameter.
         */}
        <Button
          asChild
          className="w-full justify-start px-2 font-normal"
          size="lg"
          variant={favorites ? "secondary" : "ghost"}
        >
          <Link
            href={{
              pathname: "/",
              query: { favorites: true },
            }}
          >
            <StarIcon className="mr-2 size-4" />
            Favorite canvases
          </Link>
        </Button>

        {/*
         * Billing button:
         * - Renders "Upgrade" for free-tier organizations (triggers Stripe Checkout).
         * - Renders "Payment Settings" for subscribed organizations (opens Stripe portal).
         * - Disabled while the Stripe redirect is in-flight (`pending === true`).
         */}
        <Button
          className="w-full justify-start px-2 font-normal"
          disabled={pending || isSubscribed === undefined}
          size="lg"
          variant="ghost"
          onClick={onClick}
        >
          <BanknoteIcon className="mr-2 size-4" />
          {isSubscribed ? "Payment Settings" : "Upgrade"}
        </Button>
      </div>
    </div>
  );
}
