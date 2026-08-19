import { parseArchiveDateKey, toMonthDayYearKey } from '$lib/archive-page';
import { TODAY_ROUTE_GAME_MAP } from '$lib/puzzle-window';

const LEGACY_MONTH_DATE_PATTERN = /^(?<month>[a-z]+)-(?<day>\d{1,2})-(?<year>\d{4})$/i;

const EXACT_CANONICAL_REDIRECTS: Record<string, string> = {
	'/canuckle': '/canuckle-answer-today',
	'/5-letter-wordle-solver': '/wordle-solver',
	'/wordle/2022-05-06': '/wordle-answer-today'
};

const LEGACY_GAME_ALIASES: Record<string, string> = {
	sportle: 'spotle'
};

const todayRouteByGame = Object.entries(TODAY_ROUTE_GAME_MAP).reduce<Record<string, string>>(
	(routes, [pathname, game]) => {
		routes[game] = pathname;
		return routes;
	},
	{}
);

const LEGACY_GAME_TODAY_ROUTE_MAP: Record<string, string> = {
	...todayRouteByGame,
	...Object.fromEntries(
		Object.entries(LEGACY_GAME_ALIASES)
			.map(([legacyGame, canonicalGame]) => [legacyGame, todayRouteByGame[canonicalGame]])
			.filter((entry): entry is [string, string] => Boolean(entry[1]))
	)
};

const LEGACY_GAME_PATTERN = Object.keys(LEGACY_GAME_TODAY_ROUTE_MAP)
	.sort((left, right) => right.length - left.length)
	.join('|');

const LEGACY_DATED_SLUG_PATH = new RegExp(
	`^\\/(?<game>${LEGACY_GAME_PATTERN})-answer-for-(?<legacyDate>[a-z]+-\\d{1,2}-\\d{4})\\/?$`,
	'i'
);
const LEGACY_GAME_DATE_PATH = new RegExp(
	`^\\/(?<game>${LEGACY_GAME_PATTERN})\\/(?<isoDate>\\d{4}-\\d{2}-\\d{2})(?:-[a-z0-9-]+)?\\/?$`,
	'i'
);
const LEGACY_ANSWER_DATE_PATH = new RegExp(
	`^\\/(?<game>${LEGACY_GAME_PATTERN})-answer\\/(?<isoDate>\\d{4}-\\d{2}-\\d{2})(?:-[a-z0-9-]+)?\\/?$`,
	'i'
);

function parseLegacyMonthDate(input: string): string | null {
	const match = LEGACY_MONTH_DATE_PATTERN.exec(input);
	if (!match?.groups) {
		return null;
	}

	const monthMap: Record<string, number> = {
		january: 0,
		february: 1,
		march: 2,
		april: 3,
		may: 4,
		june: 5,
		july: 6,
		august: 7,
		september: 8,
		october: 9,
		november: 10,
		december: 11
	};

	const monthIndex = monthMap[match.groups.month.toLowerCase()];
	const day = Number(match.groups.day);
	const year = Number(match.groups.year);

	if (monthIndex === undefined || Number.isNaN(day) || Number.isNaN(year)) {
		return null;
	}

	const date = new Date(Date.UTC(year, monthIndex, day));
	if (
		Number.isNaN(date.getTime()) ||
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== monthIndex ||
		date.getUTCDate() !== day
	) {
		return null;
	}

	return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getTodayRouteForLegacyGame(game: string): string | null {
	return LEGACY_GAME_TODAY_ROUTE_MAP[game.toLowerCase()] ?? null;
}

export function getLegacyTodayRedirect(pathname: string): string | null {
	if (pathname in EXACT_CANONICAL_REDIRECTS) {
		return EXACT_CANONICAL_REDIRECTS[pathname];
	}

	const datedSlugMatch = LEGACY_DATED_SLUG_PATH.exec(pathname);
	if (datedSlugMatch?.groups?.game && datedSlugMatch.groups.legacyDate) {
		const todayRoute = getTodayRouteForLegacyGame(datedSlugMatch.groups.game);
		const parsedDate = parseLegacyMonthDate(datedSlugMatch.groups.legacyDate);
		if (todayRoute && parsedDate) {
			return todayRoute;
		}
	}

	for (const pattern of [LEGACY_GAME_DATE_PATH, LEGACY_ANSWER_DATE_PATH]) {
		const datedPathMatch = pattern.exec(pathname);
		if (!datedPathMatch?.groups?.game || !datedPathMatch.groups.isoDate) {
			continue;
		}

		const todayRoute = getTodayRouteForLegacyGame(datedPathMatch.groups.game);
		const parsedDate = parseArchiveDateKey(datedPathMatch.groups.isoDate);
		if (todayRoute && parsedDate) {
			return todayRoute;
		}
	}

	return null;
}

export function getLegacyDatedRedirect(pathname: string): string | null {
	const match = LEGACY_GAME_DATE_PATH.exec(pathname);
	if (!match?.groups?.game || !match.groups.isoDate) {
		return null;
	}

	if (match.groups.game.toLowerCase() !== 'wordle') {
		return null;
	}

	const date = parseArchiveDateKey(match.groups.isoDate);
	if (!date) {
		return null;
	}

	return `/wordle-answer-for-${toMonthDayYearKey(date)}`;
}
