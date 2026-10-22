import { findSearchlePuzzleByAnswer, getDailyPuzzle } from './searchleData';

export interface SearchleDailyPuzzle {
	date: string;
	prompt: string;
	answer: string;
	luckyGuess?: string;
	// True when the answer comes from the verified daily-games record but
	// the day's prompt is not in the site's bundled pool (the pool is a
	// stale snapshot — newer real puzzles like "hooves" never entered it),
	// so no prompt can be shown for the day.
	promptMissing?: boolean;
}

export function formatSearchleDate(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
		date.getDate()
	).padStart(2, '0')}`;
}

export function getSearchlePuzzleForDate(date: Date, answerOverride?: string): SearchleDailyPuzzle {
	// The verified answer (daily-games database — what the real game
	// served) always wins over the bundled pool's day-index rotation,
	// which no longer matches the game's own sequence. When the day's
	// puzzle exists in the pool under that answer, its prompt is
	// recovered from the pool entry; otherwise the answer stands alone.
	if (answerOverride) {
		const entry = findSearchlePuzzleByAnswer(answerOverride);
		if (entry) {
			return {
				date: formatSearchleDate(date),
				prompt: `${entry.text}...`,
				answer: entry.answer,
				luckyGuess: entry.luckyGuess
			};
		}
		return {
			date: formatSearchleDate(date),
			prompt: '',
			answer: answerOverride,
			luckyGuess: undefined,
			promptMissing: true
		};
	}
	const puzzle = getDailyPuzzle(date);
	return {
		date: formatSearchleDate(date),
		prompt: `${puzzle.text}...`,
		answer: puzzle.answer,
		luckyGuess: puzzle.luckyGuess
	};
}

export function getSearchleArchive(baseDate: Date, days: number = 7): SearchleDailyPuzzle[] {
	const archive: SearchleDailyPuzzle[] = [];
	for (let i = 1; i <= days; i += 1) {
		const date = new Date(baseDate);
		date.setDate(date.getDate() - i);
		archive.push(getSearchlePuzzleForDate(date));
	}
	return archive;
}

export function getSearchleMonthPuzzles(year: number, monthIndex: number): SearchleDailyPuzzle[] {
	const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
	const puzzles: SearchleDailyPuzzle[] = [];
	for (let day = 1; day <= daysInMonth; day += 1) {
		puzzles.push(getSearchlePuzzleForDate(new Date(year, monthIndex, day)));
	}
	return puzzles;
}
