import Image from "next/image";

/**
 * EmptyFavorites
 *
 * Empty-state UI shown when the "favorites" filter is active
 * but no boards have been marked as favorites.
 *
 * @returns The rendered empty favorites placeholder.
 */
export function EmptyFavorites() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image alt="Empty" height={140} src="/empty-favorites.svg" width={140} />
      <h2 className="mt-6 text-2xl font-semibold">No favorite boards!</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Try favoriting a board
      </p>
    </div>
  );
}
