/**
 * @file site.ts
 * @description Centralized site configuration and SEO metadata constants.
 */

/**
 * Interface representing the site configuration settings for SEO and OpenGraph metadata.
 */
export interface SiteConfig {
  readonly name: string;
  readonly title: string;
  readonly titleTemplate: string;
  readonly description: string;
  readonly url: string;
  readonly keywords: readonly string[];
  readonly ogImage: string;
  readonly twitterHandle: string;
  readonly locale: string;
}

/**
 * Site configuration constants used across metadata, sitemap, and robots endpoints.
 */
export const SITE_CONFIG: SiteConfig = {
  name: "NexCanvas",
  title: "NexCanvas - Real-Time Collaborative Infinite Canvas",
  titleTemplate: "%s | NexCanvas",
  description:
    "NexCanvas is an interactive real-time visual collaboration tool for teams. Create sticky notes, shapes, freehand drawings, and collaborate seamlessly on an infinite canvas.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://nexcanvas.vercel.app",
  keywords: [
    "Next.js",
    "Real-time Collaboration",
    "Infinite Canvas",
    "Miro Clone",
    "Visual Collaboration",
    "Liveblocks",
    "Convex",
    "React",
    "Whiteboard",
  ],
  ogImage: "/og-image.png",
  twitterHandle: "@nexcanvas",
  locale: "en_US",
} as const;
