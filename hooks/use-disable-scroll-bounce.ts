/**
 * @file use-disable-scroll-bounce.ts
 * @description Provides the `useDisableScrollBounce` hook, which temporarily
 * disables page scrolling and overscroll ("bounce") effects for the lifetime
 * of the consuming component — typically used on full-screen canvas or
 * whiteboard views where native scroll/bounce gestures would interfere with
 * pointer-based panning and drawing interactions.
 */

import { useEffect } from "react";

/**
 * Disables body scrolling and overscroll bounce effects while the calling
 * component is mounted.
 *
 * On mount, adds the Tailwind utility classes `overflow-hidden` and
 * `overscroll-none` to `document.body`, preventing the page from scrolling
 * and suppressing the rubber-band/bounce effect seen on some browsers
 * (notably Safari/iOS) when scrolling past the content boundaries.
 *
 * On unmount, both classes are removed from `document.body`, restoring the
 * page's default scroll behavior. This cleanup ensures the effect does not
 * leak beyond the lifetime of the component that invoked the hook.
 *
 * @returns {void} This hook does not return a value; it only manages a
 *   side effect on `document.body`.
 *
 * @example
 * function CanvasPage() {
 *   useDisableScrollBounce();
 *   return <Canvas />;
 * }
 */
export function useDisableScrollBounce(): void {
  useEffect(() => {
    document.body.classList.add("overflow-hidden", "overscroll-none");
    return () => {
      document.body.classList.remove("overflow-hidden", "overscroll-none");
    };
  }, []);
}
