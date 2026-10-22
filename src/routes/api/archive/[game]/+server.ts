import { json } from '@sveltejs/kit';
import { ARCHIVE_GAMES, getArchiveRouteResponse, type ArchiveGame } from '$lib/archive-data';
import { getSearchleDbAnswer, getWorldleDbCountryCode } from '$lib/server/daily-games-answers';
import type { RequestHandler } from './$types';

const SUCCESS_CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400';
const ERROR_CACHE_CONTROL = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';

export const GET: RequestHandler = async ({ params, url, fetch, platform }) => {
	const game = params.game;

	if (!game || !ARCHIVE_GAMES.includes(game as ArchiveGame)) {
		return json(
			{
				error: 'Archive endpoint not found.'
			},
			{
				status: 404,
				headers: {
					'Cache-Control': ERROR_CACHE_CONTROL
				}
			}
		);
	}

	try {
		const dateParam = url.searchParams.get('date');
		// Worldle/Searchle answers must come from the daily-games database
		// (the record of the real game) whenever it covers the date — the
		// local derivations for these two games diverge from the game.
		let dbAnswerOverride: string | null = null;
		if (dateParam && game === 'worldle') {
			dbAnswerOverride = await getWorldleDbCountryCode(dateParam);
		} else if (dateParam && game === 'searchle') {
			dbAnswerOverride = await getSearchleDbAnswer(dateParam);
		}
		const payload = await getArchiveRouteResponse(game as ArchiveGame, {
			dateKey: dateParam,
			fetchImpl: fetch,
			platform,
			dbAnswerOverride
		});

		return json(payload, {
			headers: {
				'Cache-Control': SUCCESS_CACHE_CONTROL
			}
		});
	} catch (error) {
		console.error(`Archive API error for ${game}:`, error);
		return json(
			{
				error: 'Failed to load archive data.'
			},
			{
				status: 500,
				headers: {
					'Cache-Control': ERROR_CACHE_CONTROL
				}
			}
		);
	}
};
