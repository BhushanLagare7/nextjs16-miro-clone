/**
 * @file search-input.tsx
 * @description A debounced search input component that updates the URL
 * query parameters based on user input, enabling URL-driven search
 * functionality for boards.
 */

"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SearchIcon } from "lucide-react";
import qs from "query-string";
import { useDebounceValue } from "usehooks-ts";

import { Input } from "@/components/ui/input";

import { SEARCH_DEBOUNCE_MS } from "./constants";

/**
 * SearchInput Component
 *
 * Renders a search input field with a search icon that updates the URL's
 * `search` query parameter as the user types, with a debounce delay to
 * minimize unnecessary navigation events.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage inside a Navbar or layout
 * <SearchInput />
 * ```
 *
 * @remarks
 * ### Debouncing:
 * - User input is debounced by **500ms** using `useDebounceValue` from
 *   `usehooks-ts` to prevent excessive router pushes on every keystroke.
 *
 * ### URL Management:
 * - Uses `query-string` (`qs`) to serialize the search query into a URL.
 * - Empty strings and null values are skipped (`skipEmptyString`, `skipNull`)
 *   to keep the URL clean when the search input is cleared.
 * - Navigates to `/?search=<value>` when a query is present, or `/` when
 *   the input is cleared.
 *
 * ### Reactivity:
 * - The `useEffect` hook re-runs whenever `debouncedValue` or `router`
 *   changes, ensuring the URL stays in sync with the search input.
 *
 * @returns {JSX.Element} A styled search input with a leading search icon,
 * constrained to a maximum width for consistent layout.
 */
export function SearchInput() {
  /** Next.js router instance used for client-side navigation. */
  const router = useRouter();

  /**
   * The current raw input value entered by the user.
   * Updated on every keystroke via `handleChange`.
   */
  const [value, setValue] = useState("");

  /**
   * The debounced version of the input value.
   * Only updates 500ms after the user stops typing,
   * reducing the frequency of URL updates.
   */
  const [debouncedValue] = useDebounceValue(value, SEARCH_DEBOUNCE_MS);

  /**
   * Handles changes to the search input field.
   * Updates the local `value` state on every keystroke.
   *
   * @param {ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  /**
   * Effect: Synchronizes the debounced search value with the URL.
   *
   * Constructs a URL with the `search` query parameter from the
   * debounced value and pushes it to the router. Empty strings and
   * null values are excluded to avoid cluttering the URL.
   *
   * @listens debouncedValue - Triggers when the debounced input value changes.
   * @listens router - Included as a dependency per React's exhaustive-deps rule.
   */
  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: "/",
        query: {
          search: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true },
    );

    router.replace(url);
  }, [debouncedValue, router]);

  return (
    <div className="relative w-full">
      {/*
       * Search icon positioned absolutely on the left side of the input,
       * vertically centered using transform translate.
       */}
      <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2 transform" />

      {/*
       * Search input field:
       * - pl-9: Left padding to prevent text from overlapping the search icon.
       * - max-w-129: Constrains width for consistent layout in larger containers.
       */}
      <Input
        className="w-full max-w-129 pl-9"
        placeholder="Search boards"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
