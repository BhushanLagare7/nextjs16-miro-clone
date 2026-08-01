import Image from "next/image";

/**
 * EmptySearch
 *
 * Empty-state UI shown when a search query returns no matching boards.
 *
 * @returns The rendered empty search results placeholder.
 */
export function EmptySearch() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image alt="Empty" height={140} src="/empty-search.svg" width={140} />
      <h2 className="mt-6 text-2xl font-semibold">No results found!</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Try searching for something else
      </p>
    </div>
  );
}
