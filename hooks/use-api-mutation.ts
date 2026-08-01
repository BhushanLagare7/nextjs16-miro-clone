/**
 * @file use-api-mutation.ts
 * @description A custom React hook that wraps Convex's `useMutation` hook to provide
 * a simplified interface for executing API mutations with built-in pending state management.
 */

import { useState } from "react";

import { useMutation } from "convex/react";
import { FunctionReference } from "convex/server";

/**
 * @hook useApiMutation
 * @description Wraps a Convex mutation function to manage the async execution lifecycle,
 * including tracking the pending/loading state. Automatically sets `pending` to `true`
 * before the mutation runs and resets it to `false` upon completion (success or failure).
 *
 * @template Mutation - A Convex `FunctionReference` typed as a `"mutation"`.
 *
 * @param {Mutation} mutationFunction - The Convex mutation function reference to wrap.
 *
 * @returns {{
 *   mutate: (payload: Parameters<typeof apiMutation>[0]) => Promise<any>,
 *   pending: boolean
 * }} An object containing:
 * - `mutate`: An async function that accepts the mutation payload and returns a Promise.
 * - `pending`: A boolean indicating whether the mutation is currently in progress.
 *
 * @example
 * const { mutate, pending } = useApiMutation(api.board.create);
 *
 * const handleCreate = async () => {
 *   try {
 *     await mutate({ title: "New Board" });
 *     console.log("Board created successfully");
 *   } catch (error) {
 *     console.error("Failed to create board:", error);
 *   }
 * };
 */
export const useApiMutation = <Mutation extends FunctionReference<"mutation">>(
  mutationFunction: Mutation,
) => {
  /**
   * @state pending
   * @description Tracks whether the mutation is currently executing.
   * Initialized to `false` and toggled during the mutation lifecycle.
   */
  const [pending, setPending] = useState(false);

  /** The raw Convex mutation function created from the provided function reference */
  const apiMutation = useMutation(mutationFunction);

  /**
   * @function mutate
   * @description Executes the wrapped Convex mutation with the given payload.
   * Sets `pending` to `true` at the start and resets it to `false` when the
   * Promise settles (regardless of success or failure).
   *
   * @param {Parameters<typeof apiMutation>[0]} payload - The input arguments
   * required by the Convex mutation function.
   *
   * @returns {Promise<any>} Resolves with the mutation result, or rejects with
   * the error if the mutation fails.
   *
   * @throws Will re-throw any error returned by the Convex mutation.
   */
  const mutate = async (payload: Parameters<typeof apiMutation>[0]) => {
    setPending(true);
    return apiMutation(payload)
      .finally(() => setPending(false)) // Always reset pending state
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw error; // Re-throw to allow caller-level error handling
      });
  };

  return {
    mutate,
    pending,
  };
};
