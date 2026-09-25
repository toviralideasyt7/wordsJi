/**
 * Terminus code calculator engine.
 *
 * Call of Duty: Black Ops 6 Zombies: Terminus map easter egg.
 * The player reads three symbols off the Research Office whiteboard
 * (labeled X, Y, Z); each symbol maps to a digit 0-9. Those digits run
 * through three fixed formulas to produce the three terminal codes.
 *
 * Pure TypeScript, zero dependencies. Runs entirely client-side.
 */

export interface TerminusSymbol {
  /** Digit value of the symbol, 0-9. */
  value: number;
  /** Human-readable name. */
  name: string;
}

export const TERMINUS_SYMBOLS: TerminusSymbol[] = [
  { value: 0, name: 'Zero' },
  { value: 1, name: 'One' },
  { value: 2, name: 'Two' },
  { value: 3, name: 'Three' },
  { value: 4, name: 'Four' },
  { value: 5, name: 'Five' },
  { value: 6, name: 'Six' },
  { value: 7, name: 'Seven' },
  { value: 8, name: 'Eight' },
  { value: 9, name: 'Nine' }
];

export interface TerminusCodes {
  /** 2X + 11 */
  code1: number;
  /** (2Z + Y) - 5 */
  code2: number;
  /** |Y + Z - X| */
  code3: number;
}

/**
 * The three fixed Terminus formulas, straight from the game.
 * X, Y and Z are each a single digit (0-9).
 */
export function calculateTerminusCodes(x: number, y: number, z: number): TerminusCodes {
  return {
    code1: 2 * x + 11,
    code2: 2 * z + y - 5,
    code3: Math.abs(y + z - x)
  };
}

/** The combined string entered into the Research Office terminal. */
export function formatTerminusCode(codes: TerminusCodes): string {
  return `${codes.code1} ${codes.code2} ${codes.code3}`;
}

/** Guard: all three inputs must be single digits. */
export function isValidTerminusInput(x: number, y: number, z: number): boolean {
  return [x, y, z].every((n) => Number.isInteger(n) && n >= 0 && n <= 9);
}

/** Per-code formula strings with the player's digits substituted in. */
export function terminusFormulaLabels(x: number, y: number, z: number): [string, string, string] {
  return [`2×${x} + 11`, `(2×${z} + ${y}) − 5`, `|${y} + ${z} − ${x}|`];
}
