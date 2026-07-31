"use client";

import { ReactNode } from "react";

import { ClerkProvider, RedirectToSignIn, useAuth } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { Loading } from "@/components/auth/loading";

/**
 * Ensure the Convex deployment URL is available before the app boots.
 * This variable must be exposed to the client, so it is prefixed with
 * `NEXT_PUBLIC_` and should be defined in your `.env.local` file.
 *
 * Failing fast here (at module load time) prevents confusing runtime
 * errors later when Convex tries to connect with an undefined URL.
 */
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
}

/**
 * Singleton Convex client instance used throughout the app.
 *
 * Because this file is a module, `convex` is created once and reused
 * across re-renders instead of being re-instantiated on every render.
 */
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * ConvexClientProvider
 *
 * Wraps the application with the necessary context providers to enable:
 * 1. Clerk authentication (`ClerkProvider`) — manages user sign-in state,
 *    sessions, and auth tokens on the client.
 * 2. Convex + Clerk integration (`ConvexProviderWithClerk`) — connects
 *    the Convex client to Clerk's authentication state so that Convex
 *    queries/mutations can be executed with the current user's identity.
 *
 * This component should be placed near the root of the component tree
 * (e.g., in `app/layout.tsx`) so that all child components have access
 * to both Clerk's auth context and Convex's data-fetching hooks.
 *
 * @param children - The React tree that should have access to Clerk
 *                    auth state and the Convex client.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * export default function RootLayout({ children }: { children: ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <ConvexClientProvider>{children}</ConvexClientProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    // ClerkProvider must wrap ConvexProviderWithClerk because Convex
    // relies on Clerk's `useAuth` hook to retrieve the current session
    // and auth token.
    <ClerkProvider afterSignOutUrl="/">
      {/*
        ConvexProviderWithClerk bridges Clerk's auth state with the
        Convex client, automatically attaching auth tokens to Convex
        requests and re-authenticating when the user's session changes.
      */}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {/* Children are only rendered when the user is authenticated. */}
        <Authenticated>{children}</Authenticated>
        {/* Redirect unauthenticated users to the Clerk sign-in page. */}
        <Unauthenticated>
          <RedirectToSignIn />
        </Unauthenticated>
        {/* Loading is shown while the user is being authenticated. */}
        <AuthLoading>
          <Loading />
        </AuthLoading>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
