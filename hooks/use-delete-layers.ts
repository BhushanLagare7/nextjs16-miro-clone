import { useMutation, useSelf } from "@liveblocks/react";

/**
 * Returns a mutation function that deletes all currently selected layers
 * from shared storage and clears the local selection.
 *
 * The mutation:
 * 1. Reads the current selection from presence.
 * 2. Removes each selected layer from the `layers` LiveMap.
 * 3. Removes the corresponding id from the `layerIds` LiveList.
 * 4. Clears the local selection and records the change in history.
 *
 * @returns A memoized mutation callback that performs the deletion.
 */
export function useDeleteLayers() {
  // Current selection of layer ids from this user's presence.
  const selection = useSelf((me) => me.presence.selection);

  return useMutation(
    ({ storage, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");

      for (const id of selection ?? []) {
        // Remove the layer data itself.
        liveLayers.delete(id);

        // Remove the layer's id reference, if present.
        const index = liveLayerIds.indexOf(id);

        if (index !== -1) {
          liveLayerIds.delete(index);
        }
      }

      // Clear the local selection and push this change into history.
      setMyPresence({ selection: [] }, { addToHistory: true });
    },
    [selection],
  );
}
