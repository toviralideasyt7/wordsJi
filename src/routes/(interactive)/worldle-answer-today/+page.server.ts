import countriesData from '$lib/data/worldle/countries.json';
import citiesData from '$lib/data/worldle/cities.json';
import countryDetailsData from '$lib/data/worldle/country-details.json';
import {
  generateBreadcrumbSchema,
  generateSoftwareApplicationSchema,
  generateWebPageSchema,
} from '$lib/seo';
import {
  getDailyWorldleAnswer,
  getDisplayDateLabel,
  getRecentWorldleAnswers,
} from '$lib/worldle/logic';
import type { WorldleCity, WorldleCountry, WorldleCountryDetailsMap } from '$lib/worldle/types';
import { getPuzzleDateForGame } from '$lib/puzzle-window';
import type { PageServerLoad } from './$types';

const countries = countriesData as WorldleCountry[];
const cities = citiesData as WorldleCity[];
const countryDetails = countryDetailsData as WorldleCountryDetailsMap;

export const load: PageServerLoad = async () => {
  const today = getPuzzleDateForGame('worldle');
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const todayAnswer = getDailyWorldleAnswer(countries, cities, countryDetails, todayDate);
  const recentAnswers = getRecentWorldleAnswers(10, countries, cities, countryDetails, todayDate);

  const formattedTodayDate = getDisplayDateLabel(todayDate);

  const faqEntries = recentAnswers.map((answer) => ({
    question: `What was the Worldle answer on ${getDisplayDateLabel(answer.date)}?`,
    answer: `The Worldle answer on ${getDisplayDateLabel(answer.date)} was ${answer.country.name}. That puzzle was Worldle #${answer.worldleNumber}.`,
  }));

  const pageTitle = `Worldle Answer Today (${formattedTodayDate}) - Answer and Map`;
  const pageDescription = `Get Worldle hints and today's confirmed answer for ${formattedTodayDate}, with the distance and direction clues and a direct link to the full archive.`;
  const pageKeywords = `worldle answer today, worldle answer, worldle hint, worldle hint today, worldle answer for ${formattedTodayDate}`;

  const pageUrl = 'https://wordsolverx.com/worldle-answer-today';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Worldle Answer Today for ${formattedTodayDate}: ${todayAnswer.country.name}`,
    description: pageDescription,
    datePublished: `${todayDate}T00:00:00Z`,
    dateModified: `${todayDate}T00:00:00Z`,
    author: {
      '@type': 'Person',
      name: 'Preston Hayes',
      url: 'https://wordsolverx.com/about#preston-hayes',
      image: 'https://wordsolverx.com/author-wordsolverx.webp',
      jobTitle: 'Word Puzzle Analyst',
      knowsAbout: ['Wordle', 'Word Puzzles', 'Daily Puzzle Answers', 'Puzzle Solver Tools', 'Information Theory'],
      sameAs: ['https://www.pinterest.com/wordsolverx/']
    },
    publisher: {
      '@type': 'Organization',
      name: 'WordSolverX',
      logo: {
        '@type': 'ImageObject',
        url: 'https://wordsolverx.com/images/worldle-answer-today.webp',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  const schemas = JSON.stringify([
    articleSchema,
    generateSoftwareApplicationSchema('Worldle Answer Today', 'UtilitiesApplication'),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://wordsolverx.com' },
      { name: 'Today', url: 'https://wordsolverx.com/today' },
      { name: 'Worldle Answer Today', url: pageUrl },
    ]),
    generateWebPageSchema('Worldle Answer Today', pageDescription, pageUrl),
  ]);

  return {
    todayDate,
    todayAnswer,
    formattedTodayDate,
    faqEntries,
    schemas,
    meta: {
      title: pageTitle,
      description: pageDescription,
      keywords: pageKeywords,
      canonical: pageUrl,
    },
  };
};
