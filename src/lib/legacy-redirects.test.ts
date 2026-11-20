import { describe, expect, it } from 'vitest';
import { getLegacyTodayRedirect } from './legacy-redirects';

describe('getLegacyTodayRedirect', () => {
	it('redirects old month-slug answer pages to the canonical today route (games that never had dated pages)', () => {
		expect(getLegacyTodayRedirect('/phoodle-answer-for-december-06-2025')).toBe(
			'/phoodle-answer-today'
		);
	});

	it('does not redirect dated answer pages (removed in the Phase 1 cleanup — they 404, no many-to-one redirect)', () => {
		expect(getLegacyTodayRedirect('/wordle-answer-for-may-31-2023')).toBeNull();
		expect(getLegacyTodayRedirect('/wordle-answer-for-december-06-2025')).toBeNull();
		expect(getLegacyTodayRedirect('/colordle-answer-for-december-06-2025')).toBeNull();
		expect(getLegacyTodayRedirect('/semantle-answer-for-october-1-2025')).toBeNull();
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
