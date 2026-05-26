import { PRERENDER_ENTRIES } from '$lib/route-registry.js';

const validPaths = new Set(PRERENDER_ENTRIES);
const MAX_PARAGRAPH_WORDS = 24;
const MAX_PARAGRAPH_SENTENCES = 3;

function normalizePath(path: string): string {
	const trimmed = path.replace(/\/+$/, '');
	return trimmed || '/';
}

function stripHtml(html: string): string {
	return String(html ?? '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function countWords(value: string): number {
	const text = stripHtml(value);
	return text ? text.split(/\s+/).length : 0;
}

function splitIntoSentenceChunks(text: string): string[] {
	const matches = text
		.replace(/\s+/g, ' ')
		.trim()
		.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g);

	if (!matches?.length) {
		return text.trim() ? [text.trim()] : [];
	}

	return matches.map((sentence) => sentence.trim()).filter(Boolean);
}

function splitLongSentence(sentence: string): string[] {
	const normalized = sentence.replace(/\s+/g, ' ').trim();
	if (!normalized) {
		return [];
	}

	if (countWords(normalized) <= MAX_PARAGRAPH_WORDS) {
		return [normalized];
	}

	const clauseChunks = normalized
		.split(/(?<=[,;:])\s+| (?=(?:and|but|because|while|when|where|which|that|so)\b)/i)
		.map((chunk) => chunk.trim())
		.filter(Boolean);

	const sourceChunks = clauseChunks.length > 1 ? clauseChunks : [normalized];
	const splitChunks: string[] = [];

	for (const chunk of sourceChunks) {
		if (countWords(chunk) <= MAX_PARAGRAPH_WORDS) {
			splitChunks.push(chunk);
			continue;
		}

		const words = chunk.split(/\s+/);
		for (let index = 0; index < words.length; index += MAX_PARAGRAPH_WORDS) {
			const slice = words.slice(index, index + MAX_PARAGRAPH_WORDS).join(' ').trim();
			if (slice) {
				splitChunks.push(slice);
			}
		}
	}

	return splitChunks;
}

function compactParagraphText(text: string): string[] {
	const sentences = splitIntoSentenceChunks(stripHtml(text));
	if (!sentences.length) {
		return [];
	}

	const pieces = sentences.flatMap((sentence) => splitLongSentence(sentence));
	const paragraphs: string[] = [];
	let currentPieces: string[] = [];
	let currentWords = 0;
	let currentSentences = 0;

	for (const piece of pieces) {
		const pieceWords = countWords(piece);
		const completesSentence = /[.!?]["')\]]*$/.test(piece);
		const nextSentenceCount = currentSentences + (completesSentence ? 1 : 0);

		if (
			currentPieces.length &&
			(currentWords + pieceWords > MAX_PARAGRAPH_WORDS ||
				nextSentenceCount > MAX_PARAGRAPH_SENTENCES)
		) {
			paragraphs.push(currentPieces.join(' ').trim());
			currentPieces = [piece];
			currentWords = pieceWords;
			currentSentences = completesSentence ? 1 : 0;
			continue;
		}

		currentPieces.push(piece);
		currentWords += pieceWords;
		if (completesSentence) {
			currentSentences += 1;
		}
	}

	if (currentPieces.length) {
		paragraphs.push(currentPieces.join(' ').trim());
	}

	return paragraphs;
}

export function compactGeneratedArticleParagraphs(html: string): string {
	return String(html ?? '').replace(/<p(\b[^>]*)>([\s\S]*?)<\/p>/gi, (_match, attrs: string, inner: string) => {
		const normalizedInner = inner.replace(/\s+/g, ' ').trim();
		if (!normalizedInner) {
			return '';
		}

		const sentenceCount = splitIntoSentenceChunks(stripHtml(normalizedInner)).length;
		if (
			countWords(normalizedInner) <= MAX_PARAGRAPH_WORDS &&
			sentenceCount <= MAX_PARAGRAPH_SENTENCES
		) {
			return `<p${attrs}>${normalizedInner}</p>`;
		}

		return compactParagraphText(normalizedInner)
			.map((chunk) => `<p${attrs}>${chunk}</p>`)
			.join('');
	});
}

export function sanitizeGeneratedArticleHtml(html: string): string {
	return compactGeneratedArticleParagraphs(
		html
		.replace(/<h1\b([^>]*)>/gi, '<h2$1>')
		.replace(/<\/h1>/gi, '</h2>')
		.replace(
		/<a\b([^>]*?)href=(["'])(\/[^"']*|https?:\/\/wordsolverx\.com\/[^"']*)\2([^>]*)>(.*?)<\/a>/gi,
		(match, beforeHref: string, _quote: string, href: string, afterHref: string, text: string) => {
			let path = href;

			if (href.startsWith('http')) {
				try {
					path = new URL(href).pathname;
				} catch {
					return text;
				}
			}

			if (validPaths.has(normalizePath(path))) {
				return `<a${beforeHref}href="${href}"${afterHref}>${text}</a>`;
			}

			return text;
		}
	)
	);
}
