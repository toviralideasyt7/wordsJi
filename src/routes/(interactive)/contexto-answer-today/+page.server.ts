import type { PageServerLoad } from './$types';
import { fetchTodayContextoAnswer, type ContextoAnswerPayload } from '$lib/contexto-api';
import { formatContextoDate, getContextoTodayDate } from '$lib/contexto';
import { dailyAnswerTitle, updatedStampText } from '$lib/seo/daily-title';
import { getAIHints, mergeHints } from '$lib/ai-hints';

function formatDisplayDate(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export const load: PageServerLoad = async ({ setHeaders }) => {
  try {
    const latestAnswer = await fetchTodayContextoAnswer();

    setHeaders({
      'X-Puzzle-Date': latestAnswer.date
    });

    const activeDate = latestAnswer.date;
    const activeLabel = formatDisplayDate(activeDate);
    const activeGameNumber = latestAnswer.gameNumber;
    const pageTitle = dailyAnswerTitle('Contexto', activeGameNumber, activeLabel);
    const updatedStamp = updatedStampText('Contexto', activeGameNumber, activeLabel);
    const aiHints = mergeHints(latestAnswer.answer ?? '', getAIHints('contexto', activeDate));
    const hintFaqs = [{ question: 'When was this page last updated?', answer: updatedStamp }];

    return {
      initialAnswer: latestAnswer,
      latestDate: latestAnswer.date,
      error: null,
      pageTitle,
      updatedStamp,
      aiHints,
      hintFaqs
    };
  } catch (error) {
    console.error('Contexto load error:', error);

    const fallbackDate = formatContextoDate(getContextoTodayDate());
    return {
      initialAnswer: null as ContextoAnswerPayload | null,
      latestDate: fallbackDate,
      error: 'Failed to load Contexto answer',
      pageTitle: dailyAnswerTitle('Contexto', '', formatDisplayDate(fallbackDate)),
      updatedStamp: '',
      aiHints: null,
      hintFaqs: []
    };
  }
};
