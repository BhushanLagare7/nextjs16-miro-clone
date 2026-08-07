/**
 * @file site.ts
 * @description Centralized site configuration and SEO metadata constants.
 */

import { requireEnvVar } from "@/lib/utils";

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
  readonly ogImageWidth: number;
  readonly ogImageHeight: number;
  readonly twitterHandle: string;
  readonly locale: string;
  readonly viewport: {
    readonly width: string;
    readonly initialScale: number;
    readonly maximumScale: number;
    readonly userScalable: boolean;
    readonly themeColor: readonly [
      { readonly media: string; readonly color: string },
      { readonly media: string; readonly color: string },
    ];
  };
  readonly boardMetadata: {
    readonly titlePrefix: string;
    readonly description: string;
  };
  readonly robots: {
    readonly rules: readonly [
      {
        readonly userAgent: string;
        readonly allow: string;
        readonly disallow: readonly string[];
      },
    ];
    readonly directives: {
      readonly index: boolean;
      readonly follow: boolean;
    };
  };
  readonly sitemap: {
    readonly changeFrequency:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
    readonly priority: number;
  };
  readonly jsonLd: {
    readonly context: string;
    readonly type: string;
    readonly applicationCategory: string;
    readonly operatingSystem: string;
  };
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
  url: requireEnvVar("NEXT_PUBLIC_APP_URL"),
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
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterHandle: "@nexcanvas",
  locale: "en_US",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
  },
  boardMetadata: {
    titlePrefix: "Board",
    description: "Collaborative canvas board on NexCanvas",
  },
  robots: {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    directives: {
      index: true,
      follow: true,
    },
  },
  sitemap: {
    changeFrequency: "weekly",
    priority: 1.0,
  },
  jsonLd: {
    context: "https://schema.org",
    type: "WebApplication",
    applicationCategory: "DesignApplication",
    operatingSystem: "All",
  },
} as const;
