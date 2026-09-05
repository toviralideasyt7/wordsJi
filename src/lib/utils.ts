import { format, subDays } from 'date-fns';
import { applyDailyRolloverGrace } from '$lib/rollover-grace';

// Wordle launched on June 19, 2021 as puzzle #1. Numbering continues sequentially
// from that date, with the NYT adopting the same sequence when they acquired
// the game. 2022-01-24 is puzzle #220 by this count (219 days after launch, +1).
export const WORDLE_LAUNCH_DATE = new Date('2021-06-19');
export const WORDLE_LAUNCH_NUMBER = 1;

export function getWordleNumber(date: Date): number {
  const timeDiff = date.getTime() - WORDLE_LAUNCH_DATE.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return WORDLE_LAUNCH_NUMBER + daysDiff;
}

export function getWordleDate(number: number): Date {
  const daysDiff = number - WORDLE_LAUNCH_NUMBER;
  const date = new Date(WORDLE_LAUNCH_DATE);
  date.setDate(date.getDate() + daysDiff);
  return date;
}

/**
 * Get today's date in Japan Standard Time (UTC+9)
 */
export function getJSTToday(): Date {
  const now = applyDailyRolloverGrace();
  const jstOffset = 9 * 60; // JST is UTC+9
  const jstTime = new Date(now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60000);
  jstTime.setHours(0, 0, 0, 0);
  return jstTime;
}

/**
 * Get today's date using the UTC calendar day
 */
export function getUTCToday(): Date {
  const now = applyDailyRolloverGrace();
  return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/**
 * Get today's date in India Standard Time (UTC+5:30)
 */
export function getISTToday(): Date {
  const now = applyDailyRolloverGrace();
  const istOffset = 5.5 * 60; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + (istOffset + now.getTimezoneOffset()) * 60000);
  istTime.setHours(0, 0, 0, 0);
  return istTime;
}

/**
 * Get today's date in user's local timezone
 * Each user gets their own puzzle that resets at their local midnight
 */
export function getTodayDate(): Date {
  // Get current date in local time
  const now = new Date();

  // Normalize to the start of the day
  now.setHours(0, 0, 0, 0);

  return now;
}

/**
 * Get yesterday's date in GMT+14:00 timezone
 */
export function getYesterdayDate(): Date {
  return subDays(getTodayDate(), 1);
}

export function formatDate(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

export function formatNumber(num: number): string {
  return num.toString().padStart(3, '0');
} 
