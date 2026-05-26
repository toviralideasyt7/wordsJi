// Per-length word data is now loaded via fetch() from static assets
// See app.ts getDatasetForGame() for the fetch-based implementation

import type { SolverDataset } from '../../../types';

// Cache for fetched datasets
const dataCache = new Map<string, SolverDataset>();

/**
 * Fetch and cache word data for a specific word length.
 * Uses fetch() to load only the needed JSON file from /generated/per-length/
 */
export async function getWordDataForLength(length: number): Promise<SolverDataset> {
  const key = String(length);

  if (dataCache.has(key)) {
    return dataCache.get(key)!;
  }

  const response = await fetch(`/generated/per-length/word-data-len${key}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load word data for length ${length}`);
  }

  const data = (await response.json()) as SolverDataset;
  dataCache.set(key, data);
  return data;
}
