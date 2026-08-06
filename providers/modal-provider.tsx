/**
 * @file modal-provider.tsx
 * @description A client-side provider component that mounts all global
 * application modals in a single location. Prevents hydration mismatches
 * by only rendering modals after the component has mounted on the client.
 */

"use client";

import { useEffect, useState } from "react";

import { ProModal } from "@/components/modals/pro-modal";
import { RenameModal } from "@/components/modals/rename-modal";

/**
 * `ModalProvider` renders all global application modals in one place,
 * ensuring they are available throughout the component tree without being
 * embedded directly in individual page or feature components.
 *
 * ### Hydration safety
 * Modals often depend on client-only state (e.g., Zustand stores, `localStorage`,
 * or browser APIs). Rendering them during server-side rendering (SSR) can cause
 * React hydration mismatches. To prevent this, `ModalProvider` tracks whether it
 * has mounted via a `isMounted` state flag and returns `null` until the first
 * client-side render completes.
 *
 * ### Usage
 * Place `<ModalProvider />` once near the root of the application (e.g., inside
 * the root layout) so that all modals are globally available:
 *
 * @component
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { ModalProvider } from "@/providers/modal-provider";
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         {children}
 *         <ModalProvider />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * ### Modals rendered
 * - {@link ProModal} – Prompts users to upgrade to the Pro plan.
 * - {@link RenameModal} – Allows users to rename an existing board.
 *
 * @returns {JSX.Element | null} The mounted modal components, or `null`
 * before the first client-side render to prevent hydration mismatches.
 */
export const ModalProvider = () => {
  /**
   * Tracks whether the component has completed its first client-side render.
   * Initialized to `false` on both the server and client; set to `true`
   * inside `useEffect`, which only runs in the browser.
   */
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Sets `isMounted` to `true` after the first client-side render.
   * The empty dependency array ensures this runs only once on mount.
   * Returning `null` before this point prevents SSR/hydration mismatches
   * for modals that rely on client-only state or browser APIs.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  /* Do not render modals during SSR or before client hydration completes */
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Global upgrade/pro plan modal */}
      <ProModal />

      {/* Global board rename modal */}
      <RenameModal />
    </>
  );
};
