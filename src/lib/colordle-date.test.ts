import generatedColordleData from '../../static/colordle_data.json';
import { describe, expect, it } from 'vitest';

function addUtcDays(dateKey: string, days: number): Date {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function formatUtcDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

describe('colordle generated date resolution', () => {
  it('resolves April 4, 2026 from the generated archive dataset', async () => {
    const { resolveColordleDataForDate } = await import('./colordle-date');

    const result = resolveColordleDataForDate(new Date('2026-04-04T12:00:00Z'));

    expect(result).not.toBeNull();
    expect(result?.formattedDate).toBe('April 4, 2026');
    expect(result?.requestedFormattedDate).toBe('April 4, 2026');
    expect(result?.exactMatch).toBe(true);
    expect(result?.color.hex).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('falls back to the latest available color instead of returning null for overflow dates', async () => {
    const { resolveColordleDataForDate } = await import('./colordle-date');
    const latestDate = (generatedColordleData as { latestDate: string }).latestDate;
    const requestedDate = addUtcDays(latestDate, 3);

    const result = resolveColordleDataForDate(requestedDate);

    expect(result).not.toBeNull();
    expect(result?.requestedFormattedDate).toBe(formatUtcDate(requestedDate));
    expect(result?.exactMatch).toBe(false);
    expect(result?.fallbackReason).toBe('after-end');
    expect(result?.formattedDate).toBe(result?.availableThroughFormattedDate);
  });

  it('builds a stable today payload from the generated dataset even after the latest published date', async () => {
    const { getColordleTodayPayload } = await import('./colordle-date');
    const latestDate = (generatedColordleData as { latestDate: string }).latestDate;
    const requestedDate = addUtcDays(latestDate, 3);

    const result = getColordleTodayPayload(requestedDate);

    expect(result).not.toBeNull();
    expect(result?.isFallback).toBe(true);
    expect(result?.actualDateKey).toBe(latestDate);
    expect(result?.last100Days.length).toBeGreaterThan(0);
  });
});
