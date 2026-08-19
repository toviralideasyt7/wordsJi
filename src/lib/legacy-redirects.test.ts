import { describe, expect, it } from 'vitest';
import { getLegacyDatedRedirect, getLegacyTodayRedirect } from './legacy-redirects';

describe('getLegacyTodayRedirect', () => {
	it('redirects old month-slug answer pages to the canonical today route (non-Wordle)', () => {
		expect(getLegacyTodayRedirect('/colordle-answer-for-december-06-2025')).toBe(
			'/colordle-answer-today'
		);
		expect(getLegacyTodayRedirect('/semantle-answer-for-october-1-2025')).toBe(
			'/semantle-answer-today'
		);
	});

	it('does not redirect Wordle dated pages (they are real prerendered pages now)', () => {
		expect(getLegacyTodayRedirect('/wordle-answer-for-may-31-2023')).toBeNull();
		expect(getLegacyTodayRedirect('/wordle-answer-for-december-06-2025')).toBeNull();
	});

	it('redirects old date-folder paths to the canonical today route', () => {
		expect(getLegacyTodayRedirect('/wordle/2022-05-06')).toBe('/wordle-answer-today');
		expect(getLegacyTodayRedirect('/wordle/2022-11-19')).toBe('/wordle-answer-today');
		expect(getLegacyTodayRedirect('/wordle/2022-11-19-foyer')).toBe('/wordle-answer-today');
		expect(getLegacyTodayRedirect('/colorfle/2025-12-06')).toBe('/colorfle-answer-today');
		expect(getLegacyTodayRedirect('/countryle-answer/2025-12-06')).toBe(
			'/countryle-answer-today'
		);
	});

	it('maps known legacy aliases onto the canonical live route', () => {
		expect(getLegacyTodayRedirect('/sportle-answer-for-december-06-2025')).toBe(
			'/spotle-answer-today'
		);
		expect(getLegacyTodayRedirect('/canuckle')).toBe('/canuckle-answer-today');
		expect(getLegacyTodayRedirect('/5-letter-wordle-solver')).toBe('/wordle-solver');
	});

	it('ignores unsupported or invalid legacy paths', () => {
		expect(getLegacyTodayRedirect('/wordle-answer-for-not-a-date')).toBeNull();
		expect(getLegacyTodayRedirect('/wordle/2025-13-40')).toBeNull();
		expect(getLegacyTodayRedirect('/not-a-game/2025-12-06')).toBeNull();
	});
});

describe('getLegacyDatedRedirect', () => {
	it('redirects Wordle ISO-date paths to the month-day-year dated page', () => {
		expect(getLegacyDatedRedirect('/wordle/2022-11-19')).toBe('/wordle-answer-for-november-19-2022');
		expect(getLegacyDatedRedirect('/wordle/2022-11-19-foyer')).toBe(
			'/wordle-answer-for-november-19-2022'
		);
		expect(getLegacyDatedRedirect('/wordle/2021-06-19')).toBe('/wordle-answer-for-june-19-2021');
	});

	it('ignores non-Wordle and invalid paths', () => {
		expect(getLegacyDatedRedirect('/colordle/2022-11-19')).toBeNull();
		expect(getLegacyDatedRedirect('/wordle/2025-13-40')).toBeNull();
		expect(getLegacyDatedRedirect('/wordle-answer-for-november-19-2022')).toBeNull();
	});
});
