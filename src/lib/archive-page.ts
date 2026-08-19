import { format } from 'date-fns';

const ARCHIVE_DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toArchiveDateKey(date: Date): string {
	return format(date, 'yyyy-MM-dd');
}

export function parseArchiveDateKey(dateKey: string | null): Date | null {
	if (!dateKey || !ARCHIVE_DATE_KEY_PATTERN.test(dateKey)) {
		return null;
	}

	const [yearString, monthString, dayString] = dateKey.split('-');
	const year = Number(yearString);
	const monthIndex = Number(monthString) - 1;
	const day = Number(dayString);
	const date = new Date(Date.UTC(year, monthIndex, day));

	if (
		Number.isNaN(date.getTime()) ||
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== monthIndex ||
		date.getUTCDate() !== day
	) {
		return null;
	}

	return date;
}

export function isArchiveDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
	const selected = toArchiveDateKey(date);
	const start = toArchiveDateKey(startDate);
	const end = toArchiveDateKey(endDate);

	return selected >= start && selected <= end;
}

const MONTH_NAMES = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december'
];

const MONTH_DAY_YEAR_PATTERN = /^([a-z]+)-(\d{1,2})-(\d{4})$/i;

/** "november-19-2022" for a UTC date */
export function toMonthDayYearKey(date: Date): string {
	return `${MONTH_NAMES[date.getUTCMonth()]}-${date.getUTCDate()}-${date.getUTCFullYear()}`;
}

/** Parse "november-19-2022" back into a UTC date (or null if invalid). */
export function parseMonthDayYearKey(key: string | null): Date | null {
	if (!key) {
		return null;
	}

	const match = MONTH_DAY_YEAR_PATTERN.exec(key);
	if (!match) {
		return null;
	}

	const monthIndex = MONTH_NAMES.indexOf(match[1].toLowerCase());
	const day = Number(match[2]);
	const year = Number(match[3]);

	if (monthIndex === -1 || Number.isNaN(day) || Number.isNaN(year)) {
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

	return date;
}
