import countriesData from '$lib/data/worldle/countries.json';
import citiesData from '$lib/data/worldle/cities.json';
import countryDetailsData from '$lib/data/worldle/country-details.json';
import { getWordleByDate } from '$lib/api';
import { isArchiveDateInRange, parseArchiveDateKey, toArchiveDateKey } from '$lib/archive-page';
import {
	buildContinuousDateKeys,
	getColordleDateFromApi,
	getColordleTodayFromApi,
	getColorfleDateFromApi,
	getColorfleTodayFromApi
} from '$lib/color-answers-api';
import { getContextoDateFromGameNumber, getContextoTodayDate } from '$lib/contexto';
import { getGlobleDataForDate } from '$lib/globle-date';
import {
	NERDLE_START_DATE_KEY,
	getNerdleTodayDateKey,
	isNerdleDateKeyAfterToday,
	isValidNerdleDateKey
} from '$lib/nerdle';
import {
	getNerdleAllModeAnswerForDate,
	type NerdleAnswerFetchOptions
} from '$lib/nerdle-answers';
import { getAllPhoodleDates, getPhoodleDataForDate } from '$lib/phoodle';
import { REFERENCE_DATE, getAnswerForDate } from '$lib/phrazle/phrases';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { getQuordleDataForDate } from '$lib/quordle';
import { getSearchlePuzzleForDate } from '$lib/searchle/daily';
import { getSemantleDataForDate } from '$lib/semantle';
import { formatSpotleDate, parseSpotleDate, type SpotleData } from '$lib/spotle';
import { getWaffleDataForDate } from '$lib/waffle';
import {
	WORLDLE_START_DATE,
	getCurrentWorldleDateString,
	getDailyWorldleAnswer,
	getDisplayDateLabel,
	isValidWorldleDate
} from '$lib/worldle/logic';
import { getWorgleEntryForDateKey, type WorgleArchiveEntry } from '$lib/worgle';
import type { WorldleCity, WorldleCountry, WorldleCountryDetailsMap } from '$lib/worldle/types';
import spotleData from '../../static/spotle_data.json';
import worgleArchiveData from '../../static/worgle_archive.json';
import worgleSolutionsData from '../../static/worgle_solutions.json';

export const ARCHIVE_GAMES = [
	'wordle',
	'colordle',
	'colorfle',
	'contexto',
	'globle',
	'nerdle',
	'phoodle',
	'phrazle',
	'quordle',
	'searchle',
	'semantle',
	'spotle',
	'waffle',
	'worgle',
	'worldle'
] as const;

export type ArchiveGame = (typeof ARCHIVE_GAMES)[number];

interface ArchiveLookupOptions {
	dateKey: string | null;
	fetchImpl: typeof fetch;
	platform?: unknown;
}

interface ContextoAnswerResponse {
	success: boolean;
	gameNumber: number;
	date: string;
	answer?: string;
	error?: string;
}

const WORDLE_START_DATE = new Date(2021, 5, 19);
const COLORDLE_START_DATE = new Date(2023, 7, 7);
const COLORDLE_START_DATE_KEY = '2023-08-07';
const COLORFLE_START_DATE = new Date(2022, 3, 25);
const COLORFLE_START_DATE_KEY = '2022-04-25';
const CONTEXTO_START_DATE = getContextoDateFromGameNumber(1);
const GLOBLE_START_DATE = new Date(2022, 0, 1);
const QUORDLE_START_DATE = new Date(2022, 0, 30);
const SEARCHLE_START_DATE = new Date(2023, 5, 22);
const SEMANTLE_START_DATE = new Date(2022, 0, 29);
const WAFFLE_START_DATE = new Date(2022, 0, 1);

const countries = countriesData as WorldleCountry[];
const cities = citiesData as WorldleCity[];
const countryDetails = countryDetailsData as WorldleCountryDetailsMap;

function getValidatedSelection(dateKey: string | null, startDate: Date, endDate: Date) {
	const selectedDate = parseArchiveDateKey(dateKey);

	if (!selectedDate || !isArchiveDateInRange(selectedDate, startDate, endDate)) {
		return {
			selectedDate: null,
			selectedDateKey: null
		};
	}

	return {
		selectedDate,
		selectedDateKey: toArchiveDateKey(selectedDate)
	};
}

async function getWordleArchiveData(dateKey: string | null) {
	const { selectedDateKey } = getValidatedSelection(
		dateKey,
		WORDLE_START_DATE,
		getPuzzleDateForGame('wordle')
	);

	if (!selectedDateKey) {
		return {
			selectedDateKey: null,
			selectedWordle: null
		};
	}

	const selectedWordle = await getWordleByDate(selectedDateKey).catch(() => null);

	return {
		selectedDateKey,
		selectedWordle: selectedWordle && selectedWordle.solution ? selectedWordle : null
	};
}

async function getColordleArchiveData(dateKey: string | null, fetchImpl: typeof fetch) {
	const latestAnswer = await getColordleTodayFromApi(fetchImpl);
	const availableDateStrings = buildContinuousDateKeys(COLORDLE_START_DATE_KEY, latestAnswer.date);
	const availableDateSet = new Set(availableDateStrings);
	const selectedDate = parseArchiveDateKey(dateKey);
	const selectedDateKey = selectedDate ? toArchiveDateKey(selectedDate) : null;
	const isAvailable = Boolean(selectedDateKey && availableDateSet.has(selectedDateKey));
	const selectedColordle =
		selectedDateKey && isAvailable ? await getColordleDateFromApi(fetchImpl, selectedDateKey) : null;

	return {
		availableDateStrings,
		selectedDateKey: isAvailable ? selectedDateKey : null,
		selectedColordle: selectedColordle
			? {
					dateKey: selectedColordle.date,
					dayNum: selectedColordle.dayNumber,
					formattedDate: selectedColordle.formattedDate,
					color: selectedColordle.color
				}
			: null
	};
}

async function getColorfleArchiveData(dateKey: string | null, fetchImpl: typeof fetch) {
	const latestAnswer = await getColorfleTodayFromApi(fetchImpl);
	const availableDateStrings = buildContinuousDateKeys(COLORFLE_START_DATE_KEY, latestAnswer.date);
	const availableDateSet = new Set(availableDateStrings);
	const selectedDate = parseArchiveDateKey(dateKey);
	const selectedDateKey = selectedDate ? toArchiveDateKey(selectedDate) : null;
	const isAvailable = Boolean(selectedDateKey && availableDateSet.has(selectedDateKey));
	const selectedColorfle =
		selectedDateKey && isAvailable ? await getColorfleDateFromApi(fetchImpl, selectedDateKey) : null;

	return {
		availableDateStrings,
		selectedDateKey: isAvailable ? selectedDateKey : null,
		selectedColorfle
	};
}

async function getContextoArchiveData(dateKey: string | null, fetchImpl: typeof fetch) {
	const { selectedDateKey } = getValidatedSelection(
		dateKey,
		CONTEXTO_START_DATE,
		getContextoTodayDate()
	);

	if (!selectedDateKey) {
		return {
			selectedDateKey: null,
			selectedContexto: null
		};
	}

	const response = await fetchImpl(`/api/contexto/daily?date=${selectedDateKey}`);
	const payload = (await response.json()) as ContextoAnswerResponse;

	return {
		selectedDateKey,
		selectedContexto: response.ok && payload.success ? payload : null
	};
}

async function getGlobleArchiveData(dateKey: string | null) {
	const { selectedDate, selectedDateKey } = getValidatedSelection(
		dateKey,
		GLOBLE_START_DATE,
		getPuzzleDateForGame('globle')
	);

	return {
		selectedDateKey,
		selectedGloble: selectedDate ? await getGlobleDataForDate(selectedDate) : null
	};
}

async function getNerdleArchiveData(
	dateKey: string | null,
	options: NerdleAnswerFetchOptions = {}
) {
	const selectedDateKey =
		dateKey &&
		isValidNerdleDateKey(dateKey) &&
		dateKey >= NERDLE_START_DATE_KEY &&
		!isNerdleDateKeyAfterToday(dateKey)
			? dateKey
			: null;

	return {
		selectedDateKey,
		selectedNerdle: selectedDateKey
			? await getNerdleAllModeAnswerForDate(selectedDateKey, options)
			: null,
		todayDateKey: getNerdleTodayDateKey()
	};
}

async function getPhoodleArchiveData(dateKey: string | null) {
	const availableDateStrings = await getAllPhoodleDates();
	const availableDateSet = new Set(availableDateStrings);
	const selectedDate = parseArchiveDateKey(dateKey);
	const selectedDateKey = selectedDate ? toArchiveDateKey(selectedDate) : null;
	const isAvailable = Boolean(selectedDateKey && availableDateSet.has(selectedDateKey));

	return {
		availableDateStrings,
		selectedDateKey: isAvailable ? selectedDateKey : null,
		selectedPhoodle: selectedDate && isAvailable ? await getPhoodleDataForDate(selectedDate) : null
	};
}

function getPhrazleArchiveData(dateKey: string | null) {
	const { selectedDateKey } = getValidatedSelection(
		dateKey,
		REFERENCE_DATE,
		getPuzzleDateForGame('phrazle')
	);

	if (!selectedDateKey) {
		return {
			selectedDateKey: null,
			selectedAnswers: null
		};
	}

	const activeDate = new Date(`${selectedDateKey}T12:00:00`);

	return {
		selectedDateKey,
		selectedAnswers: {
			morning: getAnswerForDate(activeDate, 'morning'),
			afternoon: getAnswerForDate(activeDate, 'afternoon')
		}
	};
}

function getQuordleArchiveData(dateKey: string | null) {
	const { selectedDate, selectedDateKey } = getValidatedSelection(
		dateKey,
		QUORDLE_START_DATE,
		getPuzzleDateForGame('quordle')
	);

	return {
		selectedDateKey,
		selectedQuordle: selectedDate ? getQuordleDataForDate(selectedDate) : null
	};
}

function getSearchleArchiveData(dateKey: string | null) {
	const { selectedDateKey } = getValidatedSelection(
		dateKey,
		SEARCHLE_START_DATE,
		getPuzzleDateForGame('searchle')
	);

	return {
		selectedDateKey,
		selectedPuzzle: selectedDateKey
			? getSearchlePuzzleForDate(new Date(`${selectedDateKey}T12:00:00`))
			: null
	};
}

function getSemantleArchiveData(dateKey: string | null) {
	const { selectedDate, selectedDateKey } = getValidatedSelection(
		dateKey,
		SEMANTLE_START_DATE,
		getPuzzleDateForGame('semantle')
	);

	return {
		selectedDateKey,
		selectedSemantle: selectedDate ? getSemantleDataForDate(selectedDate) : null
	};
}

function getSpotleArchiveData(dateKey: string | null) {
	const data = spotleData as SpotleData;
	const artists = data?.artists ?? [];
	const answers = data?.answers ?? [];
	const todayKey = formatSpotleDate(getPuzzleDateForGame('spotle'));
	const availableDateStrings = answers
		.map((entry) => entry.date)
		.filter((dateString) => dateString <= todayKey)
		.sort();
	const selectedDateKey = dateKey && availableDateStrings.includes(dateKey) ? dateKey : null;
	const selectedAnswer = answers.find((entry) => entry.date === selectedDateKey) ?? null;
	const selectedArtist =
		selectedAnswer?.artist
			? artists.find((artist) => artist.artist.toLowerCase() === selectedAnswer.artist.toLowerCase()) ?? null
			: null;

	return {
		availableDateStrings,
		selectedDateKey,
		selectedSpotle: selectedAnswer
			? {
					date: selectedAnswer.date,
					formattedDate: parseSpotleDate(selectedAnswer.date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					}),
					dayNumber: selectedAnswer.dayNumber,
					artistName: selectedAnswer.artist,
					track: selectedAnswer.track ?? null,
					soundcloudUrl: selectedAnswer.soundcloudUrl ?? null,
					artist: selectedArtist
				}
			: null
	};
}

async function getWaffleArchiveData(dateKey: string | null) {
	const { selectedDate, selectedDateKey } = getValidatedSelection(
		dateKey,
		WAFFLE_START_DATE,
		getPuzzleDateForGame('waffle')
	);

	return {
		selectedDateKey,
		selectedWaffle: selectedDate ? await getWaffleDataForDate(selectedDate) : null
	};
}

function getWorldleArchiveData(dateKey: string | null) {
	const selectedDate = parseArchiveDateKey(dateKey);

	if (!selectedDate) {
		return {
			selectedDateKey: null,
			selectedAnswer: null,
			formattedSelectedDate: null
		};
	}

	const selectedDateKey = toArchiveDateKey(selectedDate);
	const todayDate = getCurrentWorldleDateString();

	if (!isValidWorldleDate(selectedDateKey, todayDate)) {
		return {
			selectedDateKey: null,
			selectedAnswer: null,
			formattedSelectedDate: null
		};
	}

	return {
		selectedDateKey,
		selectedAnswer: getDailyWorldleAnswer(countries, cities, countryDetails, selectedDateKey),
		formattedSelectedDate: getDisplayDateLabel(selectedDateKey)
	};
}

function getWorgleArchiveData(dateKey: string | null) {
	const archive = worgleArchiveData as WorgleArchiveEntry[];
	const solutions = worgleSolutionsData as string[];
	const availableDateStrings = archive.map((entry) => entry.date).sort();
	const selectedDateKey = dateKey && availableDateStrings.includes(dateKey) ? dateKey : null;
	const selectedWorgle = selectedDateKey
		? getWorgleEntryForDateKey(selectedDateKey, archive, solutions)
		: null;

	return {
		availableDateStrings,
		selectedDateKey,
		selectedWorgle: selectedWorgle
			? {
					...selectedWorgle,
					formattedDate: new Date(`${selectedWorgle.date}T00:00:00`).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})
				}
			: null
	};
}

export async function getArchiveRouteResponse(
	game: ArchiveGame,
	options: ArchiveLookupOptions
) {
	switch (game) {
		case 'wordle':
			return getWordleArchiveData(options.dateKey);
		case 'colordle':
			return getColordleArchiveData(options.dateKey, options.fetchImpl);
		case 'colorfle':
			return getColorfleArchiveData(options.dateKey, options.fetchImpl);
		case 'contexto':
			return getContextoArchiveData(options.dateKey, options.fetchImpl);
		case 'globle':
			return getGlobleArchiveData(options.dateKey);
		case 'nerdle':
			return getNerdleArchiveData(options.dateKey, {
				fetchImpl: options.fetchImpl,
				platform: options.platform
			});
		case 'phoodle':
			return getPhoodleArchiveData(options.dateKey);
		case 'phrazle':
			return getPhrazleArchiveData(options.dateKey);
		case 'quordle':
			return getQuordleArchiveData(options.dateKey);
		case 'searchle':
			return getSearchleArchiveData(options.dateKey);
		case 'semantle':
			return getSemantleArchiveData(options.dateKey);
		case 'spotle':
			return getSpotleArchiveData(options.dateKey);
		case 'waffle':
			return getWaffleArchiveData(options.dateKey);
		case 'worgle':
			return getWorgleArchiveData(options.dateKey);
		case 'worldle':
			return getWorldleArchiveData(options.dateKey);
	}
}
