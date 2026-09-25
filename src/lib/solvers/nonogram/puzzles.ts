/**
 * Sample Nonogram Puzzles - All verified and tested
 * 
 * Each puzzle is created by first defining the shape,
 * then deriving the clues to ensure consistency.
 */

import type { NonogramPuzzle } from './solver';

// Helper to create puzzle from grid
function createPuzzleFromGrid(grid: number[][]): NonogramPuzzle {
  const rows = grid.length;
  const cols = grid[0].length;
  
  const rowClues: number[][] = [];
  const colClues: number[][] = [];
  
  // Compute row clues
  for (const row of grid) {
    const clues: number[] = [];
    let count = 0;
    for (const cell of row) {
      if (cell === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    rowClues.push(clues.length === 0 ? [0] : clues);
  }
  
  // Compute column clues
  for (let c = 0; c < cols; c++) {
    const clues: number[] = [];
    let count = 0;
    for (let r = 0; r < rows; r++) {
      if (grid[r][c] === 1) {
        count++;
      } else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    colClues.push(clues.length === 0 ? [0] : clues);
  }
  
  return { rows, cols, rowClues, colClues };
}

// 1 = filled, 0 = blank
export const SAMPLE_PUZZLES: NonogramPuzzle[] = [
  // Diamond (5x5)
  createPuzzleFromGrid([
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0]
  ]),
  
  // Hollow Square (5x5)
  createPuzzleFromGrid([
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ]),
  
  // Plus sign (5x5)
  createPuzzleFromGrid([
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
  ]),
  
  // L shape (5x5)
  createPuzzleFromGrid([
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1]
  ]),
  
  // Stairs (5x5)
  createPuzzleFromGrid([
    [1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0],
    [1, 1, 1, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1]
  ]),
  
  // T shape (6x5)
  createPuzzleFromGrid([
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
  ]),
  
  // Inverted T (5x6)
  createPuzzleFromGrid([
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1]
  ]),
  
  // Solid rectangle (4x6)
  createPuzzleFromGrid([
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1]
  ]),
  
  // Half diamond (6x6)
  createPuzzleFromGrid([
    [1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1]
  ]),
  
  // U shape (5x5)
  createPuzzleFromGrid([
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ]),
  
  // H shape (5x5)
  createPuzzleFromGrid([
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
  ]),
  
  // Arrow right (5x5)
  createPuzzleFromGrid([
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1]
  ]),
  
  // Heart shape (6x5)
  createPuzzleFromGrid([
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0]
  ]),
  
  // X shape (5x5)
  createPuzzleFromGrid([
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1]
  ]),
  
  // Tree (7x5)
  createPuzzleFromGrid([
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0]
  ])
];

export function getPuzzleByIndex(index: number): NonogramPuzzle {
  return SAMPLE_PUZZLES[index % SAMPLE_PUZZLES.length];
}

export function getRandomPuzzle(): NonogramPuzzle {
  return SAMPLE_PUZZLES[Math.floor(Math.random() * SAMPLE_PUZZLES.length)];
}

