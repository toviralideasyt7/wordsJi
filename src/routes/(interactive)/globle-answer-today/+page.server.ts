import { getGlobleDataForDate } from '$lib/globle-date';
import { format, subDays } from 'date-fns';
import { redirect } from '@sveltejs/kit';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const today = getPuzzleDateForGame('globle');
    const data = await getLatestAvailableGlobleData(today);

    if (!data) {
        throw redirect(302, '/globle-archive');
    }

    const { country, formattedDate, date } = data;
    const dateKey = date instanceof Date ? format(date, 'yyyy-MM-dd') : String(date).split('T')[0];
    const featuredImage = 'https://wordsolverx.com/images/globle-answer-today.webp';
    const pageTitle = `Globle Answer Today (${formattedDate}) - Country Answer and Hints`;
    const pageDescription = `Get today's Globle country for ${formattedDate}, with flag, continent, subregion, and distance clues to help you solve.`;
    const pageKeywords = `globle answer today, globle answer, globle hint, globle hint today, globle answer for ${formattedDate}`;
    const jsonLd = JSON.stringify([
        {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: pageTitle,
            datePublished: new Date(date).toISOString(),
            dateModified: new Date(date).toISOString(),
            author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' },
            publisher: { '@type': 'Organization', name: 'WordSolverX' },
            description: pageDescription,
            image: [featuredImage],
            mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/globle-answer-today' }
        }
    ]);

    return {
        country,
        formattedDate,
        dateKey,
        schemas: jsonLd,
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
            featuredImage
        }
    };
};

async function getLatestAvailableGlobleData(baseDate: Date) {
    for (let offset = 0; offset < 7; offset += 1) {
        const candidate = subDays(baseDate, offset);
        const data = await getGlobleDataForDate(candidate);
        if (data) {
            return data;
        }
    }

    return null;
}

