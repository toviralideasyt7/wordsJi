import { json } from '@sveltejs/kit';
import { getColordleTodayPayload } from '$lib/colordle-date';
import { getPuzzleDateForGame, getPuzzleWindow } from '$lib/puzzle-window';
import type { RequestHandler } from './$types';

const ERROR_CACHE_CONTROL = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';

function getRequestedDate(dateKey: string | null): Date | null {
	if (!dateKey) {
		return getPuzzleDateForGame('colordle');
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
		return null;
	}

	const parsed = new Date(`${dateKey}T12:00:00Z`);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export const GET: RequestHandler = async ({ url }) => {
	const requestedDate = getRequestedDate(url.searchParams.get('date'));

	if (!requestedDate) {
		return json(
			{
				success: false,
				error: 'Date must use YYYY-MM-DD format.'
			},
			{
				status: 400,
				headers: {
					'Cache-Control': ERROR_CACHE_CONTROL
				}
			}
		);
	}

	const payload = getColordleTodayPayload(requestedDate);

	if (!payload || payload.fallbackReason === 'after-end') {
		return json(
			{
				success: false,
				error: 'Colordle data is not available right now.',
				requestedDate: requestedDate.toISOString().slice(0, 10),
				availableThroughDate: payload?.availableThroughDateKey ?? null
			},
			{
				status: 503,
				headers: {
					'Cache-Control': ERROR_CACHE_CONTROL
				}
			}
		);
	}

	const ttlSeconds = getPuzzleWindow('colordle').ttlSeconds;

	return json(
		{
			success: true,
			...payload
		},
		{
			headers: {
				'Cache-Control': `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=86400`,
				'X-Puzzle-Date': payload.actualDateKey
			}
		}
	);
};
