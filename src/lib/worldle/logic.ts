import seedrandom from 'seedrandom';
import { format } from 'date-fns';
import { getPuzzleWindow } from '$lib/puzzle-window';

import type {
  WorldleAnswer,
  WorldleCity,
  WorldleCountry,
  WorldleCountryDetailsMap,
  WorldleDirection,
  WorldleSolverHint,
  WorldleSolverResult,
} from './types';

export const WORLDLE_START_DATE = '2022-01-21';
export const WORLDLE_DIRECTIONS: WorldleDirection[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const KNOWN_ANSWERS: Record<string, string> = {
  '2026-02-25': 'WS',
  '2026-02-26': 'SM',
  '2026-02-27': 'BN',
  '2026-02-28': 'BG',
  '2026-03-01': 'GR',
  '2026-03-02': 'MG',
};

function parseDateParts(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  return { year, month, day };
}

function dateStringToLocalDate(dateStr: string): Date {
  const { year, month, day } = parseDateParts(dateStr);
  return new Date(year, month - 1, day);
}

function localDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(fromDate: string, toDate: string): number {
  const start = dateStringToLocalDate(fromDate);
  const end = dateStringToLocalDate(toDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getSeededRandom(seed: string): () => number {
  return seedrandom(seed);
}

function isDirectionMatch(actual: WorldleDirection, expected: WorldleDirection): boolean {
  if (actual === expected) {
    return true;
  }

  const actualIndex = WORLDLE_DIRECTIONS.indexOf(actual);
  const expectedIndex = WORLDLE_DIRECTIONS.indexOf(expected);
  const diff = Math.abs(actualIndex - expectedIndex);
  return diff === 1 || diff === 7;
}

export function getCurrentWorldleDateString(now: Date = new Date()): string {
  return getPuzzleWindow('worldle', { now }).effectivePuzzleDate;
}

export function getWorldleNumberFromDateString(dateStr: string): number {
  return daysBetween(WORLDLE_START_DATE, dateStr) + 1;
}

export function isValidWorldleDate(dateStr: string, maxDate: string = getCurrentWorldleDateString()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }

  const parsedDate = dateStringToLocalDate(dateStr);
  if (Number.isNaN(parsedDate.getTime()) || localDateToString(parsedDate) !== dateStr) {
    return false;
  }

  return dateStr >= WORLDLE_START_DATE && dateStr <= maxDate;
}

export function getDisplayDateLabel(dateStr: string): string {
  return format(dateStringToLocalDate(dateStr), 'MMMM d, yyyy');
}

export function getMonthKey(dateStr: string): string {
  const { year, month } = parseDateParts(dateStr);
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getMonthDate(monthKey: string): Date {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

export function getDailyWorldleAnswer(
  countries: WorldleCountry[],
  cities: WorldleCity[],
  detailsMap: WorldleCountryDetailsMap,
  dateStr: string = getCurrentWorldleDateString(),
  // Verified country codes (ISO alpha-2) keyed by date, sourced at build
  // time from the daily-games database — the record of what the real game
  // actually served. An override ALWAYS wins: the seeded pick below is a
  // local fabrication that does not match the game's own sequence, kept
  // only as a last resort for dates no verified record covers.
  answerCodeOverrides?: Record<string, string>,
): WorldleAnswer {
  const overrideCode = answerCodeOverrides?.[dateStr];
  const knownCode = overrideCode ?? KNOWN_ANSWERS[dateStr];
  const sortedCountries = [...countries].sort((a, b) => a.code.localeCompare(b.code));
  const worldleNumber = getWorldleNumberFromDateString(dateStr);

  let country = knownCode ? countries.find((entry) => entry.code === knownCode) : undefined;

  if (!country) {
    const rng = getSeededRandom(String(worldleNumber));
    const index = Math.floor(rng() * sortedCountries.length);
    country = sortedCountries[index];
  }

  if (!country) {
    throw new Error('Worldle country dataset is empty.');
  }

  const capital = cities.find((entry) => entry.countryCode === country.code && entry.capital);

  return {
    date: dateStr,
    worldleNumber,
    country,
    capital,
    details: detailsMap[country.code],
  };
}

export function getRecentWorldleAnswers(
  count: number,
  countries: WorldleCountry[],
  cities: WorldleCity[],
  detailsMap: WorldleCountryDetailsMap,
  fromDateStr: string = getCurrentWorldleDateString(),
  answerCodeOverrides?: Record<string, string>,
): WorldleAnswer[] {
  const results: WorldleAnswer[] = [];
  const cursor = dateStringToLocalDate(fromDateStr);

  for (let index = 0; index < count; index += 1) {
    const dateStr = localDateToString(cursor);
    results.push(getDailyWorldleAnswer(countries, cities, detailsMap, dateStr, answerCodeOverrides));
    cursor.setDate(cursor.getDate() - 1);
  }

  return results;
}

export function calculateDistance(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): number {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(toLat - fromLat);
  const lonDelta = toRadians(toLon - fromLon);

  const arc =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);

  const angle = 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
  return Math.round(earthRadiusKm * angle);
}

export function calculateDirection(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
): WorldleDirection {
  const latDelta = toLat - fromLat;
  const lonDelta = toLon - fromLon;
  const angle = Math.atan2(latDelta, lonDelta) * (180 / Math.PI);
  const normalized = (angle + 360) % 360;
  const directionIndex = Math.round(normalized / 45) % 8;

  return ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE'][directionIndex] as WorldleDirection;
}

export function calculateProximity(distance: number): number {
  if (distance === 0) {
    return 100;
  }

  const maxDistance = 20000;
  return Math.round(Math.max(0, 100 - (distance / maxDistance) * 100));
}

export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${distance} km`;
  }

  return `${(distance / 1000).toFixed(1)}k km`;
}

export function getDirectionEmoji(direction: WorldleDirection): string {
  const emojiMap: Record<WorldleDirection, string> = {
    N: '⬆️',
    NE: '↗️',
    E: '➡️',
    SE: '↘️',
    S: '⬇️',
    SW: '↙️',
    W: '⬅️',
    NW: '↖️',
  };

  return emojiMap[direction];
}

export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((character) => 127397 + character.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function solveWorldle(
  countries: WorldleCountry[],
  hints: WorldleSolverHint[],
  maxResults = 20,
): WorldleSolverResult[] {
  if (hints.length === 0) {
    return [];
  }

  const results: WorldleSolverResult[] = [];

  for (const country of countries) {
    let isValid = true;
    let totalScore = 0;
    let totalDistance = 0;

    for (const hint of hints) {
      if (hint.country.code === country.code) {
        isValid = false;
        break;
      }

      const actualDistance = calculateDistance(
        country.latitude,
        country.longitude,
        hint.country.latitude,
        hint.country.longitude,
      );
      const actualDirection = calculateDirection(
        hint.country.latitude,
        hint.country.longitude,
        country.latitude,
        country.longitude,
      );
      const distanceMatch = Math.abs(actualDistance - hint.distance) <= hint.distance * 0.5 + 500;
      const directionMatch = isDirectionMatch(actualDirection, hint.direction);

      if (!distanceMatch && !directionMatch) {
        isValid = false;
        break;
      }

      const distanceScore = Math.max(
        0,
        100 - (Math.abs(actualDistance - hint.distance) / Math.max(hint.distance, 1)) * 100,
      );
      const directionScore = directionMatch ? 100 : 50;
      const proximityScore =
        typeof hint.proximity === 'number'
          ? Math.max(0, 100 - Math.abs(calculateProximity(actualDistance) - hint.proximity))
          : 75;

      totalScore += (distanceScore + directionScore + proximityScore) / 3;
      totalDistance += actualDistance;
    }

    if (isValid) {
      results.push({
        country,
        matchScore: totalScore / hints.length,
        averageDistance: totalDistance / hints.length,
      });
    }
  }

  return results
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return left.averageDistance - right.averageDistance;
    })
    .slice(0, maxResults);
}

function toRadians(value: number): number {
  return value * (Math.PI / 180);
}
