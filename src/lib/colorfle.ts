import seedrandom from 'seedrandom';

export const COLORS = [
  '#FFFFFF', '#FFFAC8', '#FABEBE', '#AAFFC3', '#E6BEFF',
  '#46F0F0', '#FFE119', '#BCF60C', '#F58231', '#3CB44B',
  '#F032E6', '#808000', '#008080', '#9A6324', '#E6194B',
  '#4363D8', '#911EB4', '#800000', '#000075', '#000000'
];

export const COLOR_NAMES = [
  'White', 'Light Yellow', 'Pink', 'Light Green', 'Lavender',
  'Cyan', 'Yellow', 'Lime', 'Orange', 'Green',
  'Magenta', 'Olive', 'Teal', 'Brown', 'Red',
  'Blue', 'Purple', 'Maroon', 'Navy', 'Black'
];

export const NUM_ANSWER_BLOCKS = [3, 4];
export const WEIGHTS = [
  [0.5, 0.34, 0.16],
  [0.4, 0.3, 0.2, 0.1]
];

const LAUNCH_DATE = new Date('2022-04-25T12:00:00Z');

function getUtcDayDifference(date: Date, startDate: Date): number {
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  return Math.floor((current - start) / 86400000);
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface YCC {
  r: number;
  y: number;
  b: number;
}

export interface PuzzleAnswer {
  puzzleNumber: number;
  mode: number;
  colors: number[];
  targetColor: RGB;
  targetHex: string;
  colorNames: string[];
  colorHexes: string[];
}

export interface ColorfleColorInfo {
  index: number;
  name: string;
  hex: string;
  weight?: number;
}

export interface ColorfleAnswerPayload {
  puzzleNumber: number;
  mode: number;
  date: string;
  colors: ColorfleColorInfo[];
  targetColor: {
    rgb: RGB;
    hex: string;
  };
}

export interface SolveResult {
  colors: number[];
  colorNames: string[];
  colorHexes: string[];
  targetColor: RGB;
  targetHex: string;
  similarity: number;
}

export function hexToRgb(hex: string): RGB {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return { r: 0, g: 0, b: 0 };

  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16)
  };
}

export function rgbToHex(rgb: RGB): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r))).toString(16).padStart(2, '0');
  const g = Math.max(0, Math.min(255, Math.round(rgb.g))).toString(16).padStart(2, '0');
  const b = Math.max(0, Math.min(255, Math.round(rgb.b))).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function rgbToYcc(rgb: RGB): YCC {
  const t = Math.min(rgb.r, rgb.g, rgb.b);
  const o = Math.min(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
  const a = rgb.r - t;
  const l = rgb.g - t;
  const r = rgb.b - t;
  const s = Math.min(a, l);
  const n = a - s;
  const d = (l + s) / 2;
  const c = (r + l - s) / 2;
  const i = Math.max(n, d, c, 1) / Math.max(a, l, r, 1);

  return {
    r: n / i + o,
    y: d / i + o,
    b: c / i + o
  };
}

export function yccToRgb(ycc: YCC): RGB {
  const t = Math.min(ycc.r, ycc.y, ycc.b);
  const o = Math.min(255 - ycc.r, 255 - ycc.y, 255 - ycc.b);
  const a = ycc.r - t;
  const l = ycc.y - t;
  const r = ycc.b - t;
  const s = Math.min(l, r);
  const n = a + l - s;
  const d = l + 2 * s;
  const c = 2 * (r - s);
  const i = Math.max(n, d, c, 1) / Math.max(a, l, r, 1);

  return {
    r: n / i + o,
    g: d / i + o,
    b: c / i + o
  };
}

export function mixColors(colorIndices: number[], mode = 0): RGB {
  const weights = WEIGHTS[mode];
  const yccMix: YCC = { r: 0, y: 0, b: 0 };

  for (let i = 0; i < colorIndices.length; i += 1) {
    const converted = rgbToYcc(hexToRgb(COLORS[colorIndices[i]]));
    yccMix.r += converted.r * weights[i];
    yccMix.y += converted.y * weights[i];
    yccMix.b += converted.b * weights[i];
  }

  yccMix.r = Math.min(255, Math.round(yccMix.r));
  yccMix.y = Math.min(255, Math.round(yccMix.y));
  yccMix.b = Math.min(255, Math.round(yccMix.b));

  const yccResult = yccToRgb(yccMix);
  const rgbMix: RGB = { r: 0, g: 0, b: 0 };

  for (let i = 0; i < colorIndices.length; i += 1) {
    const converted = hexToRgb(COLORS[colorIndices[i]]);
    rgbMix.r += converted.r * weights[i];
    rgbMix.g += converted.g * weights[i];
    rgbMix.b += converted.b * weights[i];
  }

  rgbMix.r = Math.min(255, Math.round(rgbMix.r));
  rgbMix.g = Math.min(255, Math.round(rgbMix.g));
  rgbMix.b = Math.min(255, Math.round(rgbMix.b));

  return {
    r: Math.round((yccResult.r + rgbMix.r) / 2),
    g: Math.round((yccResult.g + rgbMix.g) / 2),
    b: Math.round((yccResult.b + rgbMix.b) / 2)
  };
}

export function getPuzzleNumber(date: Date = new Date()): number {
  return getUtcDayDifference(date, LAUNCH_DATE);
}

function getSeedString(date: Date, mode = 0): string {
  // Colorfle resets at midnight JST = 15:00 UTC
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const utc = new Date(utcMs);
  const reset = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 15));
  if (utcMs >= reset.getTime()) {
    reset.setUTCDate(reset.getUTCDate() + 1);
  }
  return `${mode} ${reset.getUTCDate()} ${reset.getUTCMonth()} ${reset.getUTCFullYear()}`;
}

export function getPuzzleAnswer(date: Date = new Date(), mode = 0): PuzzleAnswer {
  const puzzleNumber = getPuzzleNumber(date);
  const rng = seedrandom(getSeedString(date, mode));
  const numBlocks = NUM_ANSWER_BLOCKS[mode];
  const chosen: number[] = [];
  const pool = Array.from({ length: 20 }, (_, index) => index);

  for (let i = 0; i < numBlocks; i += 1) {
    const pickIndex = Math.floor(rng() * pool.length);
    chosen[i] = pool[pickIndex];
    pool.splice(pickIndex, 1);
  }

  const targetColor = mixColors(chosen, mode);

  return {
    puzzleNumber,
    mode,
    colors: chosen,
    targetColor,
    targetHex: rgbToHex(targetColor),
    colorNames: chosen.map((index) => COLOR_NAMES[index]),
    colorHexes: chosen.map((index) => COLORS[index])
  };
}

export function getPuzzleAnswerByNumber(puzzleNumber: number, mode = 0): PuzzleAnswer {
  const date = new Date(LAUNCH_DATE.getTime() + puzzleNumber * 86400000);
  return getPuzzleAnswer(date, mode);
}

export function colorSimilarityYCC(color1: RGB, color2: RGB): number {
  const ycc1 = rgbToYcc(color1);
  const ycc2 = rgbToYcc(color2);
  const distance = Math.sqrt(
    (ycc1.r - ycc2.r) ** 2 + (ycc1.y - ycc2.y) ** 2 + (ycc1.b - ycc2.b) ** 2
  );
  const maxDistance = Math.sqrt(3 * 255 ** 2);
  return Math.round((1 - distance / maxDistance) * 1000) / 10;
}

export function getNextResetTime(date: Date = new Date()): number {
  // Colorfle resets at midnight JST = 15:00 UTC
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const utc = new Date(utcMs);
  const next = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 15));
  if (utcMs >= next.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime() - date.getTimezoneOffset() * 60000;
}

export function generateAllCombinations(mode = 0): number[][] {
  const results: number[][] = [];
  const targetLength = NUM_ANSWER_BLOCKS[mode];

  function permutations(values: number[]): number[][] {
    if (values.length <= 1) return [values];
    const generated: number[][] = [];

    for (let index = 0; index < values.length; index += 1) {
      const remainder = [...values.slice(0, index), ...values.slice(index + 1)];
      for (const permutation of permutations(remainder)) {
        generated.push([values[index], ...permutation]);
      }
    }

    return generated;
  }

  function combine(start: number, current: number[]) {
    if (current.length === targetLength) {
      results.push(...permutations(current));
      return;
    }

    for (let index = start; index < COLORS.length; index += 1) {
      current.push(index);
      combine(index + 1, current);
      current.pop();
    }
  }

  combine(0, []);
  return results;
}

const cachedCombinations: Record<number, number[][] | null> = { 0: null, 1: null };

export function getAllCombinations(mode = 0): number[][] {
  if (!cachedCombinations[mode]) {
    cachedCombinations[mode] = generateAllCombinations(mode);
  }

  return cachedCombinations[mode] ?? [];
}

export function checkGuess(guess: number[], answer: number[], feedback: string[]): boolean {
  const answerCopy = [...answer];
  const guessCopy = [...guess];
  const resultFeedback = new Array(guess.length).fill('gray');

  for (let i = 0; i < guess.length; i += 1) {
    if (guessCopy[i] === answerCopy[i]) {
      resultFeedback[i] = 'green';
      answerCopy[i] = -1;
      guessCopy[i] = -2;
    }
  }

  for (let i = 0; i < guess.length; i += 1) {
    if (guessCopy[i] === -2) continue;
    const index = answerCopy.indexOf(guessCopy[i]);
    if (index !== -1) {
      resultFeedback[i] = 'yellow';
      answerCopy[index] = -1;
    }
  }

  return resultFeedback.every((value, index) => value === feedback[index]);
}

export function getCombinationTargetColor(combo: number[], mode = 0) {
  const rgb = mixColors(combo, mode);
  return { rgb, hex: rgbToHex(rgb) };
}

let solveTable: SolveResult[] | null = null;

function getSolveTable(): SolveResult[] {
  if (solveTable) return solveTable;

  solveTable = getAllCombinations(0).map((combo) => {
    const target = mixColors(combo, 0);
    return {
      colors: combo,
      colorNames: combo.map((index) => COLOR_NAMES[index]),
      colorHexes: combo.map((index) => COLORS[index]),
      targetColor: target,
      targetHex: rgbToHex(target),
      similarity: 0
    };
  });

  return solveTable;
}

export function solveFromHex(hex: string): SolveResult {
  const inputRgb = hexToRgb(hex);
  const table = getSolveTable();
  let bestResult = table[0];
  let bestScore = -1;

  for (const entry of table) {
    const score = colorSimilarityYCC(inputRgb, entry.targetColor);
    entry.similarity = score;
    if (score > bestScore) {
      bestScore = score;
      bestResult = entry;
    }
  }

  return bestResult;
}

export function solveFromHexTopN(hex: string, limit = 5): SolveResult[] {
  const inputRgb = hexToRgb(hex);
  return getSolveTable()
    .map((entry) => ({
      ...entry,
      similarity: colorSimilarityYCC(inputRgb, entry.targetColor)
    }))
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, limit);
}

export function normalizeHex(hex: string): string {
  const trimmed = hex.trim();
  let normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  if (normalized.length === 4) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  return normalized.toLowerCase();
}

export function isValidHex(hex: string): boolean {
  return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex.trim());
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function buildColorfleAnswerPayload(date: Date = new Date(), mode = 0): ColorfleAnswerPayload {
  const answer = getPuzzleAnswer(date, mode);
  return {
    puzzleNumber: answer.puzzleNumber,
    mode,
    date: date.toISOString().slice(0, 10),
    colors: answer.colors.map((index, position) => ({
      index,
      name: answer.colorNames[position],
      hex: answer.colorHexes[position],
      weight: WEIGHTS[mode][position]
    })),
    targetColor: {
      rgb: answer.targetColor,
      hex: answer.targetHex
    }
  };
}

export function getColorfleArchiveEntries(days: number, date: Date = new Date()): ColorfleAnswerPayload[] {
  return Array.from({ length: days }, (_, index) => {
    const entryDate = new Date(date);
    entryDate.setDate(entryDate.getDate() - index);
    return buildColorfleAnswerPayload(entryDate, 0);
  });
}
