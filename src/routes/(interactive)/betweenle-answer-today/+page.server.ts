import type { PageServerLoad } from './$types';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';

import {
  formatBetweenleDate,
  getBetweenleArchive,
  getBetweenleTodayAnswer,
  parseDateKey,
} from '$lib/betweenle/logic';

export const load: PageServerLoad = async ({ setHeaders }) => {
  const todayAnswer = getBetweenleTodayAnswer();
  const archive = getBetweenleArchive();
  const todaySeoDate = parseDateKey(todayAnswer.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const pageTitle = dailyAnswerTitle('Betweenle', todayAnswer.puzzleNumber, todaySeoDate);
  const pageDescription = `Check Betweenle hints and reveal today's answer for ${todaySeoDate}. Includes the clue cards, the puzzle number, recent answers, and archive links.`;
  const pageKeywords = [
    'betweenle answer today',
    'betweenle answer',
    'betweenle hint today',
    'betweenle hints and answer for today',
    'betweenle daily answer',
    `betweenle answer for ${todaySeoDate}`,
    'betweenle solver',
    'betweenle previous answers',
    'betweenle archive',
  ].join(', ');

  setHeaders({
    'X-Puzzle-Date': todayAnswer.date
  });

  const updatedStamp = updatedStampText('Betweenle', todayAnswer.puzzleNumber, todaySeoDate);
  const aiHints = mergeHints(todayAnswer.word, getAIHints('betweenle', todayAnswer.date));
  const hintFaqs = [{ question: 'When was this page last updated?', answer: updatedStamp }];

  // Yesterday's entry from the archive (index -2, since the last entry is today).
  const yesterdayEntry = archive.length > 1 ? archive[archive.length - 2] : null;
  const yesterday = yesterdayEntry
    ? {
        number: yesterdayEntry.puzzleNumber,
        dateLong: formatBetweenleDate(yesterdayEntry.date),
        answer: yesterdayEntry.word.toUpperCase()
      }
    : null;

  return {
    todayAnswer,
    archive,
    todayLabel: formatBetweenleDate(todayAnswer.date),
    todaySeoDate,
    updatedStamp,
    aiHints,
    hintFaqs,
    yesterday,
    meta: {
      title: pageTitle,
      description: pageDescription,
      keywords: pageKeywords,
      canonical: 'https://wordsolverx.com/betweenle-answer-today',
    },
  };
};
