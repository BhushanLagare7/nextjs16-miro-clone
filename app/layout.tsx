/**
 * @file layout.tsx
 * @description Root layout component for the Next.js application.
 *
 * This file serves as the top-level layout that wraps all pages in the application.
 * It handles:
 * - Global font configuration (Geist Sans and Geist Mono)
 * - Viewport settings for responsive design
 * - SEO metadata including Open Graph and Twitter card configurations
 * - Structured data (JSON-LD) for search engine optimization
 * - Theme management (light/dark mode)
 * - Global providers setup (Convex, Theme, Modal)
 * - Toast notifications
 */

import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { SITE_CONFIG } from "@/lib/constants/site";
import { ConvexClientProvider } from "@/providers/convex-client-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { ThemeProvider } from "@/providers/theme-provider";

/* -------------------------------------------------------------------------- */
/*                             Font Configuration                              */
/* -------------------------------------------------------------------------- */

/**
 * Geist Sans font configuration.
 * Used as the primary sans-serif font throughout the application.
 * Exposed as a CSS variable `--font-geist-sans` for use in Tailwind/CSS.
 *
 * @see {@link https://vercel.com/font Geist Font}
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Geist Mono font configuration.
 * Used for code blocks and monospace text throughout the application.
 * Exposed as a CSS variable `--font-geist-mono` for use in Tailwind/CSS.
 *
 * @see {@link https://vercel.com/font Geist Font}
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* -------------------------------------------------------------------------- */
/*                            Viewport Configuration                           */
/* -------------------------------------------------------------------------- */

/**
 * Viewport configuration for the application.
 * Controls how the application is displayed on different devices and screen sizes.
 *
 * @property {string} width - Sets viewport width to match device width
 * @property {number} initialScale - Initial zoom level when page first loads
 * @property {number} maximumScale - Maximum allowed zoom level (5x)
 * @property {boolean} userScalable - Allows users to zoom in/out
 * @property {Array} themeColor - Browser UI color based on system color scheme:
 *   - Light mode: White (#ffffff)
 *   - Dark mode: Near-black (#0a0a0a)
 */
export const viewport: Viewport = {
  width: SITE_CONFIG.viewport.width,
  initialScale: SITE_CONFIG.viewport.initialScale,
  maximumScale: SITE_CONFIG.viewport.maximumScale,
  userScalable: SITE_CONFIG.viewport.userScalable,
  themeColor: [...SITE_CONFIG.viewport.themeColor],
};

/* -------------------------------------------------------------------------- */
/*                            Metadata Configuration                           */
/* -------------------------------------------------------------------------- */

/**
 * Application-wide SEO metadata configuration.
 * Defines how the application appears in search results and when shared on social media.
 *
 * Includes:
 * - Basic metadata (title, description, keywords)
 * - Open Graph tags for rich social media previews (Facebook, LinkedIn, etc.)
 * - Twitter Card configuration for Twitter/X previews
 * - Canonical URL to prevent duplicate content issues
 * - Robot directives to control search engine crawling/indexing
 * - Favicon/icon configuration
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/functions/generate-metadata Next.js Metadata API}
 * @see {@link https://ogp.me/ Open Graph Protocol}
 */
export const metadata: Metadata = {
  /** Base URL used to resolve relative URLs in metadata */
  metadataBase: new URL(SITE_CONFIG.url),

  title: {
    /** Default title shown on the home page */
    default: SITE_CONFIG.title,
    /** Template for page-specific titles (e.g., "Page Name | Site Name") */
    template: SITE_CONFIG.titleTemplate,
  },

  /** Main description of the application for search engines */
  description: SITE_CONFIG.description,

  /** Search keywords relevant to the application's content */
  keywords: [...SITE_CONFIG.keywords],

  /** Application author information */
  authors: [{ name: SITE_CONFIG.name }],

  /** Content creator identifier */
  creator: SITE_CONFIG.name,

  /** Browser tab and bookmark icon */
  icons: {
    icon: "/logo.svg",
  },

  /**
   * Open Graph metadata for rich link previews on social platforms.
   * Used by Facebook, LinkedIn, Discord, Slack, and other platforms.
   */
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        /** Standard OG image width in pixels */
        width: SITE_CONFIG.ogImageWidth,
        /** Standard OG image height in pixels */
        height: SITE_CONFIG.ogImageHeight,
        alt: SITE_CONFIG.name,
      },
    ],
  },

  /**
   * Twitter/X Card metadata for rich link previews.
   * Uses `summary_large_image` for a prominent image display in tweets.
   */
  twitter: {
    /** Displays a large image above the tweet summary */
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    /** Twitter/X handle of the content creator */
    creator: SITE_CONFIG.twitterHandle,
  },

  /**
   * Canonical URL to indicate the preferred version of the page.
   * Helps prevent duplicate content issues in search engines.
   */
  alternates: {
    canonical: "/",
  },

  /**
   * Search engine crawler directives.
   * - index: Allows the page to be indexed in search results
   * - follow: Allows crawlers to follow links on the page
   */
  robots: {
    index: SITE_CONFIG.robots.directives.index,
    follow: SITE_CONFIG.robots.directives.follow,
  },
};

/* -------------------------------------------------------------------------- */
/*                               Type Definitions                              */
/* -------------------------------------------------------------------------- */

/**
 * Props interface for the RootLayout component.
 *
 * @interface RootLayoutProps
 * @property {React.ReactNode} children - Child components/pages to be rendered
 *   within the layout. Next.js automatically passes the current page as children.
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                              RootLayout Component                           */
/* -------------------------------------------------------------------------- */

/**
 * Root layout component that wraps all pages in the application.
 *
 * This component is rendered on every page and provides:
 * 1. **HTML structure**: Sets the base HTML document with language and font classes
 * 2. **JSON-LD structured data**: Embeds schema.org WebApplication markup for
 *    enhanced search engine understanding and rich results
 * 3. **Theme management**: Wraps content in ThemeProvider for light/dark mode support
 * 4. **Backend connectivity**: ConvexClientProvider enables real-time data sync
 * 5. **UI utilities**: Global toast notifications (Toaster) and modal management
 *
 * @param {RootLayoutProps} props - Component props
 * @param {React.ReactNode} props.children - The current page content to render
 * @returns {JSX.Element} The complete HTML document structure
 *
 * @example
 * // This component is automatically used by Next.js App Router.
 * // It wraps every page in your application:
 * // app/page.tsx → rendered as {children} inside this layout
 */
export default function RootLayout({
  children,
}: RootLayoutProps): React.JSX.Element {
  /**
   * JSON-LD structured data for schema.org WebApplication markup.
   * Helps search engines understand the nature of the application,
   * potentially enabling rich results in search engine result pages (SERPs).
   *
   * @see {@link https://schema.org/WebApplication schema.org/WebApplication}
   * @see {@link https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data Google Structured Data}
   */
  const jsonLd = {
    "@context": SITE_CONFIG.jsonLd.context,
    "@type": SITE_CONFIG.jsonLd.type,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    /** Categorizes this as a design tool for search engines */
    applicationCategory: SITE_CONFIG.jsonLd.applicationCategory,
    /** Indicates the app runs on any operating system (web-based) */
    operatingSystem: SITE_CONFIG.jsonLd.operatingSystem,
  };

  return (
    /*
     * Root HTML element with:
     * - Font CSS variables applied as classes for Tailwind access
     * - `lang="en"` for accessibility and SEO
     * - `suppressHydrationWarning` to prevent React hydration mismatch
     *   warnings caused by theme injection before React hydration
     * - `h-full` to ensure full-height layout support
     * - `antialiased` for smoother font rendering
     */
    <html
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/*
         * Injects JSON-LD structured data into the document head.
         * `dangerouslySetInnerHTML` is intentionally used here as this is
         * a controlled, sanitized JSON string from our own configuration.
         * This is the recommended Next.js pattern for JSON-LD injection.
         *
         * @see {@link https://nextjs.org/docs/app/building-your-application/optimizing/metadata#json-ld Next.js JSON-LD}
         */}
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      </head>

      {/*
       * Body with flex column layout to support sticky headers/footers
       * and full-height page sections.
       */}
      <body className="flex min-h-full flex-col">
        {/*
         * ThemeProvider: Manages light/dark/system theme preferences.
         * - `attribute="class"`: Applies theme via CSS class on <html>
         * - `defaultTheme="system"`: Respects OS-level theme preference
         * - `enableSystem`: Enables automatic system theme detection
         * - `enableColorScheme={false}`: Prevents automatic color-scheme
         *   style injection (managed manually via CSS variables instead)
         */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableColorScheme={false}
          enableSystem
        >
          {/*
           * ConvexClientProvider: Sets up the Convex real-time backend client.
           * All components within this provider can access Convex queries,
           * mutations, and actions via Convex React hooks.
           *
           * @see {@link https://docs.convex.dev/client/react Convex React Client}
           */}
          <ConvexClientProvider>
            {/*
             * Toaster: Renders global toast notification container.
             * Toast notifications can be triggered from anywhere in the
             * application using the `sonner` library's `toast()` function.
             */}
            <Toaster />

            {/*
             * ModalProvider: Renders a global modal/dialog container.
             * Enables modals to be triggered from anywhere in the component
             * tree without requiring local state management.
             */}
            <ModalProvider />

            {/* Current page content injected by Next.js App Router */}
            {children}
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
