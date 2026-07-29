import type { PageServerLoad } from './$types';

export const prerender = true;

interface ArchiveAnswer {
	date: string;
	solution: string;
	puzzleNumber: number | null;
	editor: string | null;
}

interface GroupedYear {
	year: string;
	answers: ArchiveAnswer[];
	count: number;
}

interface MonthStat {
	year: string;
	month: string;
	monthLabel: string;
	count: number;
}

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
	let answers: ArchiveAnswer[] = [];
	let fetchError: string | null = null;

	try {
		const res = await fetch('https://api.wordsolverx.workers.dev/api/answers?limit=2000');
		if (res.ok) {
			const payload = await res.json();
			answers = payload.answers || [];
		} else {
			fetchError = `Archive API returned HTTP ${res.status}`;
		}
	} catch (err) {
		fetchError = err instanceof Error ? err.message : 'Failed to fetch archive';
	}

	// Group by year (descending)
	const byYear: Record<string, ArchiveAnswer[]> = {};
	for (const a of answers) {
		const year = (a.date || '').slice(0, 4);
		if (!year) continue;
		if (!byYear[year]) byYear[year] = [];
		byYear[year].push(a);
	}
	const years: GroupedYear[] = Object.keys(byYear)
		.sort((a, b) => b.localeCompare(a))
		.map((year) => ({
			year,
			answers: byYear[year],
			count: byYear[year].length
		}));

	// Per-month stats for the most recent year that has data
	const monthLabels = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];
	const monthStats: MonthStat[] = [];
	if (years.length > 0) {
		const latestYear = years[0].year;
		const byMonth: Record<string, ArchiveAnswer[]> = {};
		for (const a of byYear[latestYear]) {
			const month = (a.date || '').slice(5, 7);
			if (!month) continue;
			if (!byMonth[month]) byMonth[month] = [];
			byMonth[month].push(a);
		}
		for (const m of Object.keys(byMonth).sort()) {
			monthStats.push({
				year: latestYear,
				month: m,
				monthLabel: monthLabels[parseInt(m, 10) - 1] || m,
				count: byMonth[m].length
			});
		}
	}

	setHeaders({
		'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
	});

	return {
		totalAnswers: answers.length,
		years,
		monthStats,
		fetchError,
		// Pass the raw answers for client-side search
		allAnswers: answers
	};
};
