import { resolveGlobleDataForWindow } from '$lib/globle-date';
import { redirect } from '@sveltejs/kit';
import { getPuzzleWindow } from '$lib/puzzle-window';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
    // The window decides which dates are publishable; the resolver refuses anything older than
    // the effective date or its declared fallback, so this page can no longer relabel an older
    // country as "today" the way it did when it walked backwards through subDays().
    const puzzleWindow = getPuzzleWindow('globle');
    const resolved = await resolveGlobleDataForWindow(puzzleWindow);

    if (!resolved) {
        throw redirect(302, '/globle-archive');
    }

    const { data, publishedDateKey } = resolved;
    const { country, formattedDate } = data;
    const featuredImage = 'https://wordsolverx.com/images/globle-answer-today.webp';
    // Stream 4 (2026-10-06): shared daily title/stamp. Globle has no upstream
    // puzzle number, so the published date key is the puzzle identifier.
    const pageTitle = dailyAnswerTitle('Globle', publishedDateKey, formattedDate);
    const updatedStamp = updatedStampText('Globle', publishedDateKey, formattedDate);
    const pageDescription = `Get today's Globle country for ${formattedDate}, with the flag, the continent, the subregion, and the distance clues that help you narrow the map.`;
    const pageKeywords = `globle answer today, globle answer, globle hint, globle hint today, globle answer for ${formattedDate}`;
    const jsonLd = JSON.stringify([
        {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: pageTitle,
            datePublished: new Date(data.date).toISOString(),
            dateModified: new Date(data.date).toISOString(),
            author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' },
            publisher: { '@type': 'Organization', name: 'WordSolverX' },
            description: pageDescription,
            image: [featuredImage],
            mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/globle-answer-today' }
        }
    ]);

    // Key the edge cache on the date that is actually on the page. hooks.server.ts stores the
    // response under X-Puzzle-Date, so a render that had to fall back to the previous date can
    // never be handed out later under the new window's cache key while it is still inside its TTL.
    setHeaders({ 'X-Puzzle-Date': publishedDateKey });

    // FAQPage (wordle pattern): the updated-stamp Q&A feeds its own schema node
    // because the page-level strip removes FAQPage from data.schemas.
    const hintFaqs = [{ question: 'When was this page last updated?', answer: updatedStamp }];
    const faqSchemaJson = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: hintFaqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
    });

    // AI hint cards: deterministic letter analysis merged with any stored hints.
    const aiHints = mergeHints(country.name, getAIHints('globle', publishedDateKey));

    return {
        country,
        formattedDate,
        dateKey: publishedDateKey,
        updatedStamp,
        hintFaqs,
        faqSchemaJson,
        aiHints,
        schemas: jsonLd,
        meta: {
            title: pageTitle,
            description: pageDescription,
            keywords: pageKeywords,
            featuredImage
        }
    };
};
