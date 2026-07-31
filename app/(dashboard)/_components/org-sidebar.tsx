/**
 * @file org-sidebar.tsx
 * @description The organization sidebar component providing navigation
 * links for the application, an organization switcher, and quick access
 * to team and favorite canvases. Visible only on large screens.
 */

"use client";

import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { OrganizationSwitcher } from "@clerk/nextjs";
import { LayoutDashboardIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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
 * @returns {JSX.Element} A sidebar with logo, organization switcher,
 * and canvas navigation buttons. Only visible on large screens.
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

  return (
    <div className="hidden w-51.5 flex-col space-y-6 pt-5 pl-5 lg:flex">
      {/* Application logo and brand name linking to the home page */}
      <Link href="/">
        <div className="flex items-center gap-x-2">
          <Image alt="Logo" height={40} src="/logo.svg" width={40} />
          <span className={cn("text-2xl font-semibold", font.className)}>
            NexCanvas
          </span>
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

      {/* Navigation buttons for canvas views */}
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
         * - Links to the home page with `favorites=true` query parameter.
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
      </div>
    </div>
  );
}
