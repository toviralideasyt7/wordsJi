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
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';
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

  const pageTitle = dailyAnswerTitle('Worldle', todayAnswer.worldleNumber, formattedTodayDate);
  const updatedStamp = updatedStampText('Worldle', todayAnswer.worldleNumber, formattedTodayDate);

  faqEntries.push({
    question: 'When was this page last updated?',
    answer: updatedStamp
  });

  const aiHints = mergeHints(todayAnswer.country.name, getAIHints('worldle', todayDate));

  const yesterdayAnswer = recentAnswers[1] ?? null;
  const yesterday = yesterdayAnswer
    ? {
        number: yesterdayAnswer.worldleNumber,
        dateLong: getDisplayDateLabel(yesterdayAnswer.date),
        answer: yesterdayAnswer.country.name
      }
    : null;

  const factLetters = todayAnswer.country.name.toLowerCase().replace(/[^a-z]/g, '');
  const factRepeatCount = factLetters.length - new Set(factLetters).size;
  const factData = {
    puzzleNumber: String(todayAnswer.worldleNumber),
    dateLong: formattedTodayDate,
    firstLetter: factLetters[0]?.toUpperCase() ?? '',
    lastLetter: factLetters[factLetters.length - 1]?.toUpperCase() ?? '',
    vowelCount: [...factLetters].filter((c) => 'aeiou'.includes(c)).length,
    repeatText: factRepeatCount === 0 ? 'None' : String(factRepeatCount)
  };

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

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntries.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    })),
  };

  const schemas = JSON.stringify([
    articleSchema,
    faqSchema,
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
    updatedStamp,
    aiHints,
    yesterday,
    factData,
    schemas,
    meta: {
      title: pageTitle,
      description: pageDescription,
      keywords: pageKeywords,
      canonical: pageUrl,
    },
  };
};
