import type { PageServerLoad } from './$types';
import { loadGameDleToday } from '$lib/game-dle/today';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
    return loadGameDleToday({
        fetchFn: fetch,
        setHeaders,
        game: 'loldle',
        gameTitle: 'LoLdle'
    });
};
