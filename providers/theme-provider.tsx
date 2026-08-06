"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Props for the ThemeProvider component.
 *
 * @interface ThemeProviderProps
 * @property {React.ReactNode} children - The child components to be wrapped by the theme provider.
 */
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

/**
 * ThemeProvider
 *
 * A wrapper component that provides theme management capabilities to its children.
 * It uses `next-themes` to handle theme switching and persistence.
 *
 * @param {ThemeProviderProps} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the theme provider.
 * @param {...any} props - Additional props to be passed to the underlying NextThemesProvider.
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { ThemeProvider } from "@/providers/theme-provider";
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <ThemeProvider
 *           attribute="class"
 *           defaultTheme="system"
 *           enableSystem
 *           disableTransitionOnChange
 *         >
 *           {children}
 *         </ThemeProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
