import { format } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import { getGameVideo } from '$lib/server/game-videos';
import type { PageServerLoad } from './$types';

// Phrazle's page data comes from the universal load in +page.ts; this
// server load only adds the build-time video state for the same
// puzzle-window date the page displays (merged into the page data).
export const load: PageServerLoad = async () => {
	const today = getPuzzleDateForGame('phrazle');
	const dateKey = format(today, 'yyyy-MM-dd');
	return {
		video: await getGameVideo('phrazle', dateKey)
	};
};
