// Per-length word data is now loaded via fetch() from static assets
// See app.ts getDatasetForGame() for the fetch-based implementation

import type { SolverDataset } from '../../../types';

// Cache for fetched datasets. The promise is cached rather than the resolved value: the solver
// warms its assets on intent and then mounts, and both paths ask for the same length, so
// caching the value left a window where the second caller fetched a 341 KB file again.
const dataCache = new Map<string, Promise<SolverDataset>>();

/**
 * Fetch and cache word data for a specific word length.
 * Uses fetch() to load only the needed JSON file from /generated/per-length/
 */
export function getWordDataForLength(length: number): Promise<SolverDataset> {
  const key = String(length);

  const cached = dataCache.get(key);
  if (cached) {
    return cached;
  }

  const pending = (async () => {
    const response = await fetch(`/generated/per-length/word-data-len${key}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load word data for length ${length}`);
    }

    return (await response.json()) as SolverDataset;
  })();

  dataCache.set(key, pending);

  return pending.catch((error: unknown) => {
    // A failed load must not stay cached, or nothing could ever retry it.
    dataCache.delete(key);
    throw error;
  });
}
