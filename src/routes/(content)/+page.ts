import { format } from 'date-fns';
import { getPuzzleDateForGame } from '$lib/puzzle-window';

export const prerender = true;

export const load = () => {
	const today = getPuzzleDateForGame('wordle');

	return {
		todayStr: format(today, 'MMMM d, yyyy'),
		todayKey: format(today, 'yyyy-MM-dd')
	};
};
