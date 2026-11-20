import {
	buildWordLadderIndex,
	solveWordLadderWithIndex,
	type SolveWordLadderOptions,
	type SolveWordLadderResult,
	type SolutionMode,
	type WordLadderIndex
} from '$lib/word-ladder-logic';

export type DictionaryType = 'wordsolverx' | 'twl' | 'sowpods';
export type WordListCase = 'upper' | 'lower';

interface WordsData {
	words: string[];
}

export const WORDAUDITOR_WORD_LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const WORDAUDITOR_FILES: Record<number, string> = {
	3: '/3letterwords.json',
	4: '/4letterwords.json',
	5: '/words.json',
	6: '/6letterwords.json',
	7: '/7letterwords.json',
	8: '/8letterwords.json',
	9: '/9letterwords.json',
	10: '/10letterwords.json',
	11: '/11letterwords.json',
	12: '/12letterwords.json'
};

const textDictionaryCache = new Map<'twl' | 'sowpods', Promise<Map<number, Set<string>>>>();
const wordAuditorCache = new Map<string, Promise<Set<string>>>();
const indexCache = new Map<string, Promise<WordLadderIndex>>();

function normalizeWords(words: Iterable<string>, wordCase: WordListCase): Set<string> {
	const normalized = new Set<string>();

	for (const word of words) {
		const cleanWord = word.trim();
		if (!cleanWord) continue;
		normalized.add(wordCase === 'upper' ? cleanWord.toUpperCase() : cleanWord.toLowerCase());
	}

	return normalized;
}

function getWordAuditorFile(length: number): string | null {
	return WORDAUDITOR_FILES[length] ?? null;
}

async function loadTextDictionary(type: 'twl' | 'sowpods'): Promise<Map<number, Set<string>>> {
	let cached = textDictionaryCache.get(type);
	if (!cached) {
		const filename = type === 'twl' ? '/data/twl06.txt' : '/data/sowpods.txt';
		cached = fetch(filename)
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`Failed to load dictionary: ${response.status}`);
				}
				return response.text();
			})
			.then((content) => {
				const byLength = new Map<number, Set<string>>();
				const words = content
					.split('\n')
					.map((word) => word.trim().toUpperCase())
					.filter((word) => word.length > 0);

				for (const word of words) {
					const length = word.length;
					if (!byLength.has(length)) {
						byLength.set(length, new Set());
					}
					byLength.get(length)!.add(word);
				}

				return byLength;
			});
		textDictionaryCache.set(type, cached);
	}

	return cached;
}

async function loadWordAuditorWords(
	length: number,
	wordCase: WordListCase = 'upper'
): Promise<Set<string>> {
	const file = getWordAuditorFile(length);
	if (!file) {
		return new Set();
	}

	const cacheKey = `${length}:${wordCase}`;
	let cached = wordAuditorCache.get(cacheKey);
	if (!cached) {
		cached = fetch(file)
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`Failed to load word list: ${response.status}`);
				}
				return response.json();
			})
			.then((data) => {
				const typedData = data as WordsData;
				if (!Array.isArray(typedData.words)) {
					throw new Error('Invalid WordAuditor word list format');
				}

				const filteredWords = typedData.words.filter((word) => word && word.length === length);
				return normalizeWords(filteredWords, wordCase);
			});
		wordAuditorCache.set(cacheKey, cached);
	}

	return cached;
}

export function getDictionaryLabel(dictionary: DictionaryType): string {
	if (dictionary === 'wordsolverx') return 'Our Word List';
	if (dictionary === 'twl') return 'OWL2 (US Scrabble)';
	return 'SOWPODS (World Scrabble)';
}

export function supportsWordAuditorLength(length: number): boolean {
	return getWordAuditorFile(length) !== null;
}

export async function getWordsOfLengthClient(
	length: number,
	dictionary: DictionaryType = 'wordsolverx',
	wordCase: WordListCase = 'upper'
): Promise<Set<string>> {
	if (dictionary === 'wordsolverx') {
		return loadWordAuditorWords(length, wordCase);
	}

	const dict = await loadTextDictionary(dictionary);
	return dict.get(length) ?? new Set();
}

export async function getWordLadderIndexClient(
	length: number,
	dictionary: DictionaryType = 'wordsolverx',
	wordCase: WordListCase = 'upper'
): Promise<WordLadderIndex> {
	const cacheKey = `${dictionary}:${length}:${wordCase}`;
	let cached = indexCache.get(cacheKey);

	if (!cached) {
		cached = getWordsOfLengthClient(length, dictionary, wordCase).then((words) =>
			buildWordLadderIndex(words)
		);
		indexCache.set(cacheKey, cached);
	}

	return cached;
}

export async function isValidWordClient(
	word: string,
	dictionary: DictionaryType = 'wordsolverx'
): Promise<boolean> {
	const trimmedWord = word.trim();
	if (!trimmedWord) return false;

	const wordCase: WordListCase = dictionary === 'wordsolverx' && trimmedWord === trimmedWord.toLowerCase()
		? 'lower'
		: 'upper';
	const words = await getWordsOfLengthClient(trimmedWord.length, dictionary, wordCase);
	return words.has(
		wordCase === 'upper' ? trimmedWord.toUpperCase() : trimmedWord.toLowerCase()
	);
}

export async function solveWordLadderClient(
	startWord: string,
	endWord: string,
	dictionary: DictionaryType = 'wordsolverx',
	options: number | SolveWordLadderOptions = 10
): Promise<SolveWordLadderResult> {
	const start = startWord.trim();
	const end = endWord.trim();

	if (!start || !end || start.length !== end.length) {
		return {
			solutions: [],
			length: 0,
			shortestLength: 0,
			stepCounts: [],
			truncated: false
		};
	}

	const wordCase: WordListCase =
		dictionary === 'wordsolverx' && start === start.toLowerCase() && end === end.toLowerCase()
			? 'lower'
			: 'upper';

	const normalizedStart = wordCase === 'upper' ? start.toUpperCase() : start.toLowerCase();
	const normalizedEnd = wordCase === 'upper' ? end.toUpperCase() : end.toLowerCase();
	const normalizedOptions: SolveWordLadderOptions =
		typeof options === 'number' ? { maxSolutions: options, mode: 'short' } : options;

	const index = await getWordLadderIndexClient(start.length, dictionary, wordCase);
	return solveWordLadderWithIndex(index, normalizedStart, normalizedEnd, normalizedOptions);
}

export type { SolveWordLadderOptions, SolveWordLadderResult, SolutionMode, WordLadderIndex };
