<script lang="ts">
	import type { WordlebotAppPageConfig, WordlebotGameConfig } from '$lib/wordlebot-wasm/types';
	import { getWordlebotGame } from '$lib/wordlebot-wasm/game-config';

	let { config }: { config: WordlebotAppPageConfig } = $props();

	let isCanuckleDaily = $derived(config.pageType === 'canuckle-daily');
	let isCanuckleArchive = $derived(config.pageType === 'canuckle-archive');
	let isCanucklePanel = $derived(isCanuckleDaily || isCanuckleArchive);

	let gameSlug = $derived(
		config.pageType === 'solver' ? config.game : 'canuckle'
	);
	let game = $derived(getWordlebotGame(gameSlug));
	let wordLength = $derived(
		config.pageType === 'solver' && config.wordLength
			? config.wordLength
			: game.lengths[0] ?? 5
	);
	let boardCount = $derived(game.boards);
	let isCanuckle = $derived(gameSlug === 'canuckle');
	let maxGuesses = $derived(game.defaultMax);
	let solverHeading = $derived(
		config.pageType === 'solver' && config.game === 'wordle'
			? `${wordLength}-Letter Wordle Solver`
			: `${game.name} Solver`
	);
	let solverDescription = $derived(
		boardCount > 1
			? 'Type a guess, match the clue tiles on each board, then review the ranked answers.'
			: 'Type a guess, match the clue tiles to your puzzle, then review the ranked answers.'
	);

	// Sample guess word per length (first N letters used)
	const SAMPLE_WORDS: Record<number, string> = {
		3: 'CAT',
		4: 'WORD',
		5: 'CRANE',
		6: 'PLANET',
		7: 'PIRATES',
		8: 'ELEPHANT',
		9: 'BUTTERFLY',
		10: 'STRAWBERRY',
		11: 'HELLOWORLD'
	};

	function getSampleWord(length: number): string {
		return SAMPLE_WORDS[length]?.slice(0, length) || 'CRANE'.slice(0, length);
	}

	function getSampleFeedback(length: number): string[] {
		const patterns: Record<number, string[]> = {
			3: ['g', 'y', 'x'],
			4: ['g', 'x', 'y', 'x'],
			5: ['g', 'x', 'g', 'y', 'x'],
			6: ['g', 'x', 'g', 'x', 'y', 'x'],
			7: ['g', 'x', 'g', 'x', 'y', 'x', 'x'],
			8: ['g', 'x', 'g', 'x', 'y', 'x', 'x', 'x'],
			9: ['g', 'x', 'g', 'x', 'y', 'x', 'x', 'x', 'x'],
			10: ['g', 'x', 'g', 'x', 'y', 'x', 'x', 'x', 'x', 'x'],
			11: ['g', 'x', 'g', 'x', 'y', 'x', 'x', 'x', 'x', 'x', 'x']
		};
		return patterns[length] || Array(length).fill('x');
	}

	function getFeedbackClass(code: string): string {
		switch (code) {
			case 'g': return 'skeleton-tile--correct';
			case 'y': return 'skeleton-tile--present';
			default: return 'skeleton-tile--empty';
		}
	}
</script>

{#if isCanucklePanel}
	<div class="solver-page">
		<div class="solver-container canuckle-daily-container">
			<div class="canuckle-plain">
				<h2 class="canuckle-h2">Puzzle #---</h2>
				<p class="canuckle-date skeleton-pulse">Loading date...</p>

				<h3 class="canuckle-h3">Answer</h3>
				<details class="canuckle-answer-reveal">
					<summary class="skeleton-pulse">-----</summary>
					<p class="canuckle-answer-note skeleton-pulse">Puzzle #--- · Loading...</p>
				</details>

				<h3 class="canuckle-h3">Canadian Fact</h3>
				<div class="canuckle-fact-text">
					<p class="canuckle-fact-line"></p>
					<p class="canuckle-fact-line short"></p>
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Solver Grid Skeleton -->
	<div
		class="skeleton-wrap"
		class:skeleton-wrap--canuckle={isCanuckle}
		style="--word-length: {wordLength}; --board-count: {boardCount};"
	>
		<div class="skeleton-copy">
			<h2 class="skeleton-title">{solverHeading}</h2>
			<p class="skeleton-description">{solverDescription}</p>
			<noscript>
				<p class="skeleton-noscript">This solver needs JavaScript turned on.</p>
			</noscript>
		</div>
		<div class="skeleton-boards">
			{#each Array(boardCount) as _, boardIndex}
				<div class="skeleton-board">
					{#if boardCount > 1}
						<div class="skeleton-board-label">Board {boardIndex + 1}</div>
					{/if}
					<div class="skeleton-grid">
						{#each Array(maxGuesses) as _, rowIndex}
							<div class="skeleton-row">
								{#each Array(wordLength) as _, colIndex}
									{@const sampleWord = getSampleWord(wordLength)}
									{@const feedback = getSampleFeedback(wordLength)}
									{@const isSampleRow = rowIndex === 0}
									{@const letter = isSampleRow ? sampleWord[colIndex] : ''}
									{@const feedbackClass = isSampleRow ? getFeedbackClass(feedback[colIndex]) : 'skeleton-tile--empty'}
									<div class="skeleton-tile {feedbackClass}">
										{#if letter}{letter}{/if}
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
		<div class="skeleton-hint">
			<div class="skeleton-spinner"></div>
			<span>Loading interactive solver…</span>
		</div>
	</div>
{/if}

<style>
	/* ========== SOLVER GRID SKELETON ========== */
	.skeleton-wrap {
		--skeleton-correct: rgb(83, 141, 78);
		--skeleton-present: rgb(181, 159, 59);
		--skeleton-empty-border: #d3d6da;
		--skeleton-bg: #f6f2e8;
		--skeleton-text: #1a1a1b;
		--skeleton-muted: #5f6368;

		width: min(470px, calc(100vw - 12px));
		margin: 0 auto;
		padding: 16px 0 36px;
		min-height: 600px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.skeleton-wrap--canuckle {
		--skeleton-correct: rgb(220, 38, 38);
		--skeleton-present: rgb(239, 68, 68);
	}

	.skeleton-copy {
		width: 100%;
		padding: 18px 18px 6px;
		border-radius: 20px;
		border: 1px solid rgba(122, 92, 46, 0.08);
		background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(250,248,243,0.98));
		text-align: center;
	}

	.skeleton-title {
		margin: 0;
		font-size: clamp(1.35rem, 1.1rem + 0.8vw, 1.9rem);
		font-weight: 800;
		color: #0f172a;
	}

	.skeleton-description {
		margin: 10px auto 0;
		max-width: 32rem;
		font-size: 0.98rem;
		line-height: 1.65;
		color: var(--skeleton-muted);
	}

	.skeleton-noscript {
		margin: 12px 0 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: #b45309;
	}

	.skeleton-boards {
		display: grid;
		gap: 10px;
		width: 100%;
	}

	.skeleton-board {
		width: 100%;
		padding: 10px;
		border-radius: 18px;
		border: 1px solid rgba(122, 92, 46, 0.08);
		background: linear-gradient(180deg, rgba(255,255,255,0.88), rgba(250,248,243,0.96));
	}

	.skeleton-board-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--skeleton-muted);
		margin-bottom: 8px;
		text-align: center;
		letter-spacing: 0.04em;
	}

	.skeleton-grid {
		display: grid;
		gap: 6px;
	}

	.skeleton-row {
		display: flex;
		justify-content: center;
		gap: 4px;
		width: 100%;
	}

	.skeleton-tile {
		width: min(calc((100vw - 40px) / (var(--word-length, 5) + 0.8)), 62px);
		height: min(calc((100vw - 40px) / (var(--word-length, 5) + 0.8)), 62px);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: clamp(0.9rem, calc(1.9rem - (var(--word-length, 5) - 5) * 0.12rem), 1.9rem);
		font-weight: 700;
		text-transform: uppercase;
		border-radius: 14px;
		border: 2px solid var(--skeleton-empty-border);
		background: linear-gradient(180deg, #ffffff 0%, #faf9f5 100%);
		color: var(--skeleton-text);
		box-shadow: inset 0 -2px 0 rgba(0,0,0,0.03);
	}

	.skeleton-tile--correct {
		background: var(--skeleton-correct);
		border-color: var(--skeleton-correct);
		color: #fff;
	}

	.skeleton-tile--present {
		background: var(--skeleton-present);
		border-color: var(--skeleton-present);
		color: #fff;
	}

	.skeleton-tile--empty {
		animation: skeleton-pulse 2s ease-in-out infinite;
	}

	@keyframes skeleton-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.65; }
	}

	/* ========== CANUCKLE ANSWER PANEL SKELETON ========== */
	.canuckle-plain {
		padding: 8px 0 16px;
	}

	.canuckle-h2 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 4px;
	}

	.canuckle-date {
		font-size: 0.9rem;
		color: #64748b;
		margin: 0 0 20px;
	}

	.canuckle-h3 {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #94a3b8;
		margin: 16px 0 8px;
	}

	.canuckle-word {
		font-size: 1.75rem;
		font-weight: 800;
		letter-spacing: 0.2em;
		color: #0f172a;
		margin: 0 0 4px;
	}

	.canuckle-fact-line {
		width: 100%;
		height: 12px;
		border-radius: 6px;
		background: #e2e8f0;
		animation: skeleton-pulse 2s ease-in-out infinite;
		margin: 0 0 8px;
	}

	.canuckle-fact-line.short {
		width: 60%;
	}

	/* ========== SHARED ========== */
	.skeleton-hint {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.9rem;
		color: var(--skeleton-muted);
		font-weight: 500;
	}

	.skeleton-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #d3d6da;
		border-top-color: #14b8a6;
		border-radius: 50%;
		animation: skeleton-spin 0.8s linear infinite;
	}

	@keyframes skeleton-spin {
		to { transform: rotate(360deg); }
	}

	@media (max-width: 480px) {
		.skeleton-tile {
			width: min(calc((100vw - 28px) / (var(--word-length, 5) + 0.8)), 54px);
			height: min(calc((100vw - 28px) / (var(--word-length, 5) + 0.8)), 54px);
		}
	}
</style>
