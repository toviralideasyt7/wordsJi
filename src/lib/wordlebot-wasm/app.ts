import {
        getBestLengthForWordlebotGame,
        getWordlebotGame,
        WORDLEBOT_GAMES
} from './game-config';
import { getCanucklePagePath, getWordlebotSolverPath } from './routes';
import type {
        CanuckleData,
        CanucklePuzzle,
        CanuckleSolverData,
        SolverDataset,
        SolverResponse,
        SolverState,
        SolverTurn,
        WordlebotAppPageConfig,
        WordlebotGameSlug
} from './types';

// One WASM instance per solver key. The promise is cached rather than the resolved function:
// the page warms this on first intent and the mounted app asks for it again a moment later, and
// the value cache let both calls instantiate (and fetch 569 KB of) the same module.
const solverFnCache = new Map<string, Promise<(request: unknown) => unknown>>();
let canuckleDataPromise: Promise<CanuckleData> | null = null;
let canuckleSolverDataPromise: Promise<CanuckleSolverData> | null = null;

function required<T extends Element>(root: ParentNode, selector: string) {
        const node = root.querySelector(selector);
        if (!node) {
                throw new Error(`Missing expected element: ${selector}`);
        }
        return node as T;
}

function escapeHtml(value: string) {
        return String(value)
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#39;');
}

function renderError(target: HTMLElement, message: string) {
        target.innerHTML = `
                <div class="solver-page">
                        <div class="solver-container">
                                <section class="results-panel">
                                        <p class="loading-card">${escapeHtml(message)}</p>
                                </section>
                        </div>
                </div>
        `;
}

function scheduleWhenIdle(task: () => void, timeout = 1800) {
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                const idleId = window.requestIdleCallback(task, { timeout });
                return () => window.cancelIdleCallback(idleId);
        }

        const timerId = globalThis.setTimeout(task, 350);
        return () => globalThis.clearTimeout(timerId);
}

function renderInitialResultsPlaceholder(container: HTMLElement) {
        container.classList.remove('results-stale');
        container.innerHTML = `
                <div class="loading-card">
                        Solver ready. Suggestions will appear in a moment, or click
                        <strong>calculate next guess</strong>.
                </div>
        `;
}

export function mountWordlebotApp(target: HTMLElement, config: WordlebotAppPageConfig) {
        let destroyed = false;

        void (async () => {
                try {
                        if (config.pageType === 'canuckle-daily') {
                                await renderCanuckleDaily();
                                return;
                        }

                        if (config.pageType === 'canuckle-archive') {
                                await renderCanuckleArchive();
                                return;
                        }

                        await renderSolver(config.game, config.wordLength);
                } catch (error) {
                        if (!destroyed) {
                                renderError(
                                        target,
                                        error instanceof Error ? error.message : 'The WASM solver could not load.'
                                );
                        }
                }
        })();

        return () => {
                destroyed = true;
        };

        async function renderSolver(gameSlug: WordlebotGameSlug, preferredLength?: number) {
                const gameConfig = getWordlebotGame(gameSlug);
                const wordLength = getBestLengthForWordlebotGame(gameSlug, preferredLength ?? 5);
                const dataset = await getDatasetForGame(gameSlug, wordLength);
                if (destroyed) return;

                const storageKey = `wordlebot-wasm:${gameSlug}:${wordLength}`;
                const saved = readState(storageKey);
                const state: SolverState = {
                        game: gameSlug,
                        gameName: gameConfig.name,
                        boards: gameConfig.boards,
                        wordLength,
                        feedbackMode: gameConfig.feedback,
                        description: gameConfig.description,
                        dataset,
                        bank: saved.bank ?? 'restricted',
                        hardMode: saved.hardMode ?? false,
                        maxGuesses: saved.maxGuesses ?? gameConfig.defaultMax,
                        warmleDistance: saved.warmleDistance ?? 3,
                        turns: saved.turns ?? []
                };

                const extraSetting = gameConfig.supportsWarmleDistance
                        ? `
                                        <label>
                                                Warmle distance
                                                <select id="warmle-distance">
                                                        ${[1, 2, 3]
                                                                .map(
                                                                        (value) => `
                                                                                <option value="${value}" ${value === state.warmleDistance ? 'selected' : ''}>${value}</option>
                                                                        `
                                                                )
                                                                .join('')}
                                                </select>
                                        </label>
                                `
                        : '';

                const bankOptions =
                        state.game === 'canuckle'
                                ? `
                                                <option value="restricted" ${state.bank === 'restricted' ? 'selected' : ''}>Curated Canuckle answers</option>
                                                <option value="complete" ${state.bank === 'complete' ? 'selected' : ''}>Accepted Canuckle words</option>
                                        `
                                : `
                                                <option value="restricted" ${state.bank === 'restricted' ? 'selected' : ''}>Most likely answers</option>
                                                <option value="complete" ${state.bank === 'complete' ? 'selected' : ''}>All possible answers</option>
                                        `;

                const subtitle =
                        state.game === 'wordle'
                                ? `${state.wordLength}-letter clue filtering with ranked next guesses, hard mode support, and fast answer narrowing.`
                                : state.game === 'canuckle'
                                        ? 'Canadian-themed answer filtering with ranked next guesses and direct links to the Canuckle today and archive pages.'
                                        : `${state.gameName} clue filtering with fast next-guess ranking and responsive board updates.`;

                const solverTitle =
                        state.game === 'wordle'
                                ? `${state.wordLength}-Letter Wordle Solver`
                                : state.game === 'spotle'
                                        ? 'Spotle Wordle Solver'
                                        : `${state.gameName} Solver`;

                const headerClass =
                        state.game === 'wordle'
                                ? 'top-of-screen is-wordle'
                                : state.game === 'canuckle'
                                        ? 'top-of-screen is-canuckle'
                                        : 'top-of-screen';

                const solverContainerClass =
                        state.game === 'wordle'
                                ? 'solver-container wordle-solver-container'
                                : state.game === 'canuckle'
                                        ? 'solver-container canuckle-solver-container'
                                        : 'solver-container';

                target.innerHTML = `
                        <div class="solver-page">
                                <div class="${solverContainerClass}" style="--word-length: ${state.wordLength}">
                                        <section class="settings-card">
                                                <div class="settings-grid">
                                                        <label>
                                                                Game
                                                                <select id="game-select">
                                                                        ${WORDLEBOT_GAMES.map(
                                                                                (game) => `
                                                                                        <option value="${game.slug}" ${game.slug === state.game ? 'selected' : ''}>${escapeHtml(game.slug === 'spotle' ? 'Spotle (Wordle)' : game.name)}</option>
                                                                                `
                                                                        ).join('')}
                                                                </select>
                                                        </label>
                                                        <label>
                                                                Word length
                                                                <select id="length-select">
                                                                        ${gameConfig.lengths
                                                                                .map(
                                                                                        (length) => `
                                                                                                <option value="${length}" ${length === state.wordLength ? 'selected' : ''}>${length}</option>
                                                                                        `
                                                                                )
                                                                                .join('')}
                                                                </select>
                                                        </label>
                                                        <label>
                                                                Answers
                                                                <select id="bank-select">${bankOptions}</select>
                                                        </label>
                                                        <label>
                                                                Max guesses
                                                                <select id="max-select">
                                                                        ${Array.from({ length: 19 }, (_, index) => index + 3)
                                                                                .map(
                                                                                        (value) => `
                                                                                                <option value="${value}" ${value === state.maxGuesses ? 'selected' : ''}>${value}</option>
                                                                                        `
                                                                                )
                                                                                .join('')}
                                                                </select>
                                                        </label>
                                                        ${extraSetting}
                                                        <label class="hard-mode-row">
                                                                <span>Hard mode</span>
                                                                <input id="hard-toggle" type="checkbox" ${state.hardMode ? 'checked' : ''} />
                                                        </label>
                                                </div>
                                        </section>

                                        <section class="guesses-panel">
                                                <div class="guess-entry">
                                                        <input id="guess-input" maxlength="${state.wordLength}" autocomplete="off" spellcheck="false" placeholder="ENTER YOUR GUESS" />
                                                        <button id="add-guess" class="main-action" type="button">Add guess</button>
                                                </div>
                                                <p class="hint-text">${escapeHtml(hintTextForGame(state))}</p>
                                                <section id="boards" class="boards"></section>
                                                <div class="next-previous-buttons">
                                                        <button id="solve-button" type="button">calculate next guess</button>
                                                        <button id="undo-button" type="button">remove last guess</button>
                                                        <button id="reset-button" type="button">reset</button>
                                                </div>
                                        </section>

                                        <section id="results" class="results-panel">
                                                <div class="loading-card"><div class="loading-spinner"></div>Calculating suggestions...</div>
                                        </section>
                                </div>
                        </div>
                `;

                const guessInput = required<HTMLInputElement>(target, '#guess-input');
                const boardsContainer = required<HTMLElement>(target, '#boards');
                const resultsContainer = required<HTMLElement>(target, '#results');

                bindRouting(gameConfig, state.wordLength);
                bindControls({
                        state,
                        storageKey,
                        guessInput,
                        boardsContainer,
                        resultsContainer
                });

                drawBoards(boardsContainer, state, storageKey, resultsContainer);
                renderInitialResultsPlaceholder(resultsContainer);
                resultsContainer.dataset.initialSolvePending = 'true';
                scheduleWhenIdle(() => {
                        if (destroyed || resultsContainer.dataset.initialSolvePending !== 'true') return;
                        resultsContainer.dataset.initialSolvePending = 'false';
                        void solveAndRender(state, resultsContainer);
                });
        }

        async function renderCanuckleDaily() {
                const data = await getCanuckleData();
                if (destroyed) return;

                const visibleDateKey = config.pageType === 'canuckle-daily' ? config.visibleDateKey : getLocalDateKey();
                const visiblePuzzles = getVisibleCanucklePuzzles(data, visibleDateKey);
                const today = visiblePuzzles.find((puzzle) => puzzle.date === visibleDateKey) ?? visiblePuzzles.at(-1);

                if (!today) {
                        renderError(target, 'Canuckle data is not available right now.');
                        return;
                }

						target.innerHTML = `
							<div class="solver-page">
								<div class="solver-container canuckle-daily-container">
									<div class="canuckle-plain">
										<h2 class="canuckle-h2">Puzzle #${today.index}</h2>
										<p class="canuckle-date">${escapeHtml(formatCanuckleDate(today.date))}</p>

										<h3 class="canuckle-h3">Answer</h3>
										<div class="canuckle-answer-reveal">
											<p class="canuckle-answer-word">${escapeHtml(today.answer.toUpperCase())}</p>
											<p class="canuckle-answer-note">Puzzle #${today.index} · ${escapeHtml(formatCanuckleDate(today.date))}</p>
										</div>

										<h3 class="canuckle-h3">Canadian Fact</h3>
										<div class="canuckle-fact-text">${renderCanuckleFact(today)}</div>
									</div>
								</div>
							</div>
						`;
        }

        async function renderCanuckleArchive() {
                const data = await getCanuckleData();
                if (destroyed) return;

                const visibleDateKey = config.pageType === 'canuckle-archive' ? config.visibleDateKey : getLocalDateKey();
                const archive = [...getVisibleCanucklePuzzles(data, visibleDateKey)].reverse();
                const archiveState = { query: '', visibleCount: 250 };

                target.innerHTML = `
                        <div class="solver-page">
                                <div class="solver-container canuckle-archive-container">
                                        <section class="settings-card archive-toolbar">
                                                <div class="archive-toolbar-top">
                                                        <p class="archive-toolbar-copy">Browse ${archive.length} visible Canuckle archive entries without leaving the main archive page.</p>
                                                        <div class="archive-toolbar-actions">
                                                                <a class="subtle-link-button" href="${getCanucklePagePath('today')}">See answer today</a>
                                                                <a class="main-action button-link" href="${getCanucklePagePath('solver')}">Open solver</a>
                                                        </div>
                                                </div>
                                                <label class="archive-search">
                                                        <span>Search archive</span>
                                                        <input id="archive-search" type="search" placeholder="Search by puzzle, date, answer, or fact" />
                                                </label>
                                                <p id="archive-summary" class="hint-text"></p>
                                        </section>

                                        <section id="archive-results" class="results-panel archive-results"></section>
                                        <div class="archive-more-wrap">
                                                <button id="archive-more" class="subtle-link-button" type="button">Load more</button>
                                        </div>
                                </div>
                        </div>
                `;

                const searchInput = required<HTMLInputElement>(target, '#archive-search');
                const summary = required<HTMLElement>(target, '#archive-summary');
                const results = required<HTMLElement>(target, '#archive-results');
                const moreButton = required<HTMLButtonElement>(target, '#archive-more');

                const render = () => {
                        const filtered = archive.filter((puzzle) => matchesArchiveQuery(puzzle, archiveState.query));
                        const visible = filtered.slice(0, archiveState.visibleCount);

                        summary.textContent = `Showing ${visible.length} of ${filtered.length} archived puzzles.`;
                        results.innerHTML = visible
                                .map(
                                        (puzzle) => `
                                                <details class="archive-entry">
                                                        <summary>
                                                                <span class="archive-index">#${puzzle.index}</span>
                                                                <span class="archive-date">${escapeHtml(formatCanuckleDate(puzzle.date))}</span>
                                                                <span class="archive-answer-pill">${escapeHtml(puzzle.answer)}</span>
                                                        </summary>
                                                        <div class="archive-entry-body">
                                                                <div class="canuckle-fact">${renderCanuckleFact(puzzle)}</div>
                                                                <div class="archive-actions">
                                                                        <a class="subtle-link-button" href="${getCanucklePagePath('solver')}">Open Canuckle solver</a>
                                                                </div>
                                                        </div>
                                                </details>
                                        `
                                )
                                .join('');

                        moreButton.hidden = visible.length >= filtered.length;
                };

                searchInput.addEventListener('input', () => {
                        archiveState.query = searchInput.value.trim().toLowerCase();
                        archiveState.visibleCount = 250;
                        render();
                });

                moreButton.addEventListener('click', () => {
                        archiveState.visibleCount += 250;
                        render();
                });

                render();
        }

        function bindRouting(gameConfig: ReturnType<typeof getWordlebotGame>, currentLength: number) {
                required<HTMLSelectElement>(target, '#game-select').addEventListener('change', (event) => {
                        const nextGame = getWordlebotGame(
                                (event.currentTarget as HTMLSelectElement).value as WordlebotGameSlug
                        );
                        const length = getBestLengthForWordlebotGame(nextGame.slug, currentLength);
                        window.location.href = getWordlebotSolverPath(nextGame.slug, length);
                });

                required<HTMLSelectElement>(target, '#length-select').addEventListener('change', (event) => {
                        const length = Number((event.currentTarget as HTMLSelectElement).value);
                        window.location.href = getWordlebotSolverPath(gameConfig.slug, length);
                });
        }

        function bindControls({
                state,
                storageKey,
                guessInput,
                boardsContainer,
                resultsContainer
        }: {
                state: SolverState;
                storageKey: string;
                guessInput: HTMLInputElement;
                boardsContainer: HTMLElement;
                resultsContainer: HTMLElement;
        }) {
                required<HTMLSelectElement>(target, '#bank-select').addEventListener('change', (event) => {
                        state.bank = (event.currentTarget as HTMLSelectElement).value as 'restricted' | 'complete';
                        persistState(storageKey, state);
                        markResultsDirty(resultsContainer);
                });

                required<HTMLSelectElement>(target, '#max-select').addEventListener('change', (event) => {
                        state.maxGuesses = Number((event.currentTarget as HTMLSelectElement).value);
                        persistState(storageKey, state);
                        markResultsDirty(resultsContainer);
                });

                required<HTMLInputElement>(target, '#hard-toggle').addEventListener('change', (event) => {
                        state.hardMode = (event.currentTarget as HTMLInputElement).checked;
                        persistState(storageKey, state);
                        markResultsDirty(resultsContainer);
                });

                target.querySelector<HTMLSelectElement>('#warmle-distance')?.addEventListener('change', (event) => {
                        state.warmleDistance = Number((event.currentTarget as HTMLSelectElement).value);
                        persistState(storageKey, state);
                        markResultsDirty(resultsContainer);
                });

                required<HTMLButtonElement>(target, '#add-guess').addEventListener('click', () => {
                        const guess = guessInput.value.trim().toUpperCase();
                        if (!isAllowedGuess(state, state.dataset, guess)) {
                                guessInput.focus();
                                guessInput.select();
                                return;
                        }

                        state.turns.push({
                                guess,
                                feedback: Array.from({ length: state.boards }, () => defaultFeedbackForGame(state))
                        });
                        guessInput.value = '';
                        drawBoards(boardsContainer, state, storageKey, resultsContainer);
                        persistState(storageKey, state);
                        markResultsDirty(resultsContainer);
                });

                required<HTMLButtonElement>(target, '#solve-button').addEventListener('click', async () => {
                        persistState(storageKey, state);
                        await solveAndRender(state, resultsContainer);
                });

                required<HTMLButtonElement>(target, '#undo-button').addEventListener('click', async () => {
                        state.turns.pop();
                        drawBoards(boardsContainer, state, storageKey, resultsContainer);
                        persistState(storageKey, state);
                        await solveAndRender(state, resultsContainer);
                });

                required<HTMLButtonElement>(target, '#reset-button').addEventListener('click', async () => {
                        state.turns = [];
                        drawBoards(boardsContainer, state, storageKey, resultsContainer);
                        persistState(storageKey, state);
                        await solveAndRender(state, resultsContainer);
                });

                guessInput.addEventListener('input', () => {
                        guessInput.value = guessInput.value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, state.wordLength);
                });

                guessInput.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter') {
                                event.preventDefault();
                                required<HTMLButtonElement>(target, '#add-guess').click();
                        }
                });
        }

        function drawBoards(
                container: HTMLElement,
                state: SolverState,
                storageKey: string,
                resultsContainer: HTMLElement
        ) {
                container.innerHTML = Array.from({ length: state.boards }, (_, boardIndex) => {
                        const boardTurns = state.turns
                                .map((turn, turnIndex) => buildBoardTurnMarkup(state, turn, turnIndex, boardIndex))
                                .join('');

                        return `
                                <article class="board-card">
                                        ${state.boards > 1 ? `<p class="board-label">Board ${boardIndex + 1}</p>` : ''}
                                        <div class="turn-stack">${boardTurns || '<div class="empty-card">No guesses yet.</div>'}</div>
                                </article>
                        `;
                }).join('');

                container.querySelectorAll<HTMLElement>('.tile').forEach((tile) => {
                        tile.addEventListener('click', () => {
                                const turnIndex = Number(tile.dataset.turn);
                                const boardIndex = Number(tile.dataset.board);
                                const letterIndex = Number(tile.dataset.letter);
                                const current = state.turns[turnIndex].feedback[boardIndex][letterIndex];
                                const next = nextColorForGame(state, current);
                                state.turns[turnIndex].feedback[boardIndex] = replaceAt(
                                        state.turns[turnIndex].feedback[boardIndex],
                                        letterIndex,
                                        next
                                );
                                tile.className = `tile color-${next.toLowerCase()}`;
                                persistState(storageKey, state);
                                markResultsDirty(resultsContainer);
                        });
                });

                container.querySelectorAll<HTMLSelectElement>('.woodle-correct, .woodle-wrong').forEach((select) => {
                        select.addEventListener('change', () => {
                                const turnIndex = Number(select.dataset.turn);
                                const boardIndex = Number(select.dataset.board);
                                const turnRow = container.querySelector<HTMLElement>(
                                        `.woodle-row[data-turn="${turnIndex}"][data-board="${boardIndex}"]`
                                );
                                if (!turnRow) return;
                                const correct = Number(turnRow.querySelector<HTMLSelectElement>('.woodle-correct')?.value ?? '0');
                                const wrong = Number(turnRow.querySelector<HTMLSelectElement>('.woodle-wrong')?.value ?? '0');
                                const cappedWrong = Math.max(0, Math.min(state.wordLength - correct, wrong));
                                const wrongSelect = turnRow.querySelector<HTMLSelectElement>('.woodle-wrong');
                                if (wrongSelect && cappedWrong !== wrong) {
                                        wrongSelect.value = String(cappedWrong);
                                }
                                state.turns[turnIndex].feedback[boardIndex] = buildWoodleFeedback(
                                        state.wordLength,
                                        correct,
                                        cappedWrong
                                );
                                persistState(storageKey, state);
                                markResultsDirty(resultsContainer);
                        });
                });
        }

        function buildBoardTurnMarkup(
                state: SolverState,
                turn: SolverTurn,
                turnIndex: number,
                boardIndex: number
        ) {
                if (state.feedbackMode === 'woodle') {
                        const feedback = turn.feedback[boardIndex] ?? defaultFeedbackForGame(state);
                        const correct = countFeedback(feedback, 'G');
                        const wrong = countFeedback(feedback, 'Y');
                        return `
                                <div class="woodle-row" data-turn="${turnIndex}" data-board="${boardIndex}">
                                        <div class="guess-row static-word">
                                                ${turn.guess
                                                        .split('')
                                                        .map((letter) => `<span class="tile static-tile">${escapeHtml(letter)}</span>`)
                                                        .join('')}
                                        </div>
                                        <div class="woodle-counts">
                                                <label>
                                                        Exact
                                                        <select class="woodle-correct" data-turn="${turnIndex}" data-board="${boardIndex}">
                                                                ${buildCountOptions(state.wordLength, correct)}
                                                        </select>
                                                </label>
                                                <label>
                                                        Misplaced
                                                        <select class="woodle-wrong" data-turn="${turnIndex}" data-board="${boardIndex}">
                                                                ${buildCountOptions(state.wordLength - correct, wrong)}
                                                        </select>
                                                </label>
                                        </div>
                                </div>
                        `;
                }

                return `
                        <div class="guess-row" data-turn="${turnIndex}" data-board="${boardIndex}">
                                ${turn.guess
                                        .split('')
                                        .map((letter, letterIndex) => {
                                                const color = turn.feedback[boardIndex]?.[letterIndex] ?? defaultFeedbackForGame(state)[letterIndex];
                                                return `
                                                        <button
                                                                class="tile color-${color.toLowerCase()}"
                                                                type="button"
                                                                data-turn="${turnIndex}"
                                                                data-board="${boardIndex}"
                                                                data-letter="${letterIndex}"
                                                        >${escapeHtml(letter)}</button>
                                                `;
                                        })
                                        .join('')}
                        </div>
                `;
        }

        async function solveAndRender(state: SolverState, container: HTMLElement) {
                container.dataset.initialSolvePending = 'false';
                container.classList.remove('results-stale');
                container.innerHTML = '<div class="loading-card"><div class="loading-spinner"></div>Calculating suggestions...</div>';

                // Yield to the browser so the loading spinner paints before the synchronous
                // WASM solve blocks the main thread. Without this the old results stay frozen
                // on screen until compute finishes, making the tool look unresponsive.
                await new Promise<void>((resolve) => {
                        if ('requestAnimationFrame' in window) {
                                requestAnimationFrame(() => setTimeout(resolve, 0));
                        } else {
                                setTimeout(resolve, 0);
                        }
                });

                const key = state.game === 'canuckle' ? 'canuckle' : `len${state.wordLength}`;
                const solve = await getSolveFunction(key);
                const response = solve({
                        game: state.game,
                        bank: state.bank,
                        hardMode: state.hardMode,
                        maxGuesses: state.maxGuesses,
                        warmleDistance: state.warmleDistance,
                        turns: state.turns
                }) as SolverResponse;

                if (destroyed) return;

                const total = response.totalLikely + response.totalUnlikely;
                const hasGuesses = state.turns.length > 0;
                container.innerHTML = `
                        ${hasGuesses ? `
                                <h2 class="possibilities total">${total} possibilit${pluralizePossibility(total)}</h2>
                                <h3 class="possibilities separated">
                                        ${response.totalLikely} probable answer${response.totalLikely === 1 ? '' : 's'},
                                        ${response.totalUnlikely} unlikely possibilit${response.totalUnlikely === 1 ? 'y' : 'ies'}.
                                </h3>
                        ` : ''}
                        <h3 class="mini-title">${hasGuesses ? 'Your best possible guesses are:' : 'Best starting words:'}</h3>
                        <ol class="suggestion-list">
                                ${response.suggestions
                                        .map(
                                                (suggestion) => `
                                                        <li class="suggestion-item">
                                                                <div class="suggestion-word-wrap">
                                                                        <button class="word-button" data-suggestion="${escapeHtml(suggestion.word)}" type="button">${escapeHtml(suggestion.word)}</button>
                                                                </div>
                                                                <div class="score-note">${escapeHtml(formatSuggestionScore(suggestion, state, response.boardCount))}</div>
                                                        </li>
                                                `
                                        )
                                        .join('') || '<li class="suggestion-item"><div class="score-note">No guesses available from the current state.</div></li>'}
                        </ol>
                        ${hasGuesses ? `<div class="answers-section">
                                ${response.likelyAnswers
                                        .map(
                                                (answers, index) => {
                                                        const likely = answers;
                                                        const unlikely = response.unlikelyAnswers[index];
                                                        return `
                                                                <div class="candidate-group-open">
                                                                        ${response.boardCount > 1 ? `<p class="board-label">Board ${index + 1}: ${likely.length} probable, ${unlikely.length} unlikely</p>` : ''}
                                                                        <div class="candidate-columns">
                                                                                <div>
                                                                                        <p class="column-heading">Probable answers (${likely.length})</p>
                                                                                        <p>${likely.map(escapeHtml).join(', ') || 'None'}</p>
                                                                                </div>
                                                                                <div>
                                                                                        <p class="column-heading">Unlikely answers (${unlikely.length})</p>
                                                                                        <p>${unlikely.map(escapeHtml).join(', ') || 'None'}</p>
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        `;
                                                }
                                        )
                                        .join('')}
                        </div>` : ''}
                `;

                container.querySelectorAll<HTMLButtonElement>('.word-button').forEach((button) => {
                        button.addEventListener('click', () => {
                                const input = required<HTMLInputElement>(target, '#guess-input');
                                input.value = button.dataset.suggestion ?? '';
                                input.focus();
                                // Auto-submit the guess to the board
                                required<HTMLButtonElement>(target, '#add-guess').click();
                        });
                });

        }
}

async function getDatasetForGame(game: WordlebotGameSlug, length: number) {
        if (game === 'canuckle') {
                return getCanuckleSolverData();
        }

        // Fetch only the specific length dataset from static assets (87-510KB vs 2.96MB bundle)
        const { getWordDataForLength } = await import('./assets/generated/per-length/index.js');
        return getWordDataForLength(length);
}

async function getSolveFunction(key: string) {
        const cached = solverFnCache.get(key);
        if (cached) {
                return cached;
        }

        const pending = (async () => {
                let mod:
                        | {
                                        default: () => Promise<unknown>;
                                        solve: (request: unknown) => unknown;
                          }
                        | undefined;

                switch (key) {
                        case 'len3':
                                mod = await import('./assets/wasm/len3/solver_len3.js');
                                break;
                        case 'len4':
                                mod = await import('./assets/wasm/len4/solver_len4.js');
                                break;
                        case 'len5':
                                mod = await import('./assets/wasm/len5/solver_len5.js');
                                break;
                        case 'len6':
                                mod = await import('./assets/wasm/len6/solver_len6.js');
                                break;
                        case 'len7':
                                mod = await import('./assets/wasm/len7/solver_len7.js');
                                break;
                        case 'len8':
                                mod = await import('./assets/wasm/len8/solver_len8.js');
                                break;
                        case 'len9':
                                mod = await import('./assets/wasm/len9/solver_len9.js');
                                break;
                        case 'len10':
                                mod = await import('./assets/wasm/len10/solver_len10.js');
                                break;
                        case 'len11':
                                mod = await import('./assets/wasm/len11/solver_len11.js');
                                break;
                        case 'canuckle':
                                mod = await import('./assets/wasm/canuckle/solver_canuckle.js');
                                break;
                        default:
                                throw new Error(`Unknown solver key: ${key}`);
                }

                await mod.default();
                return mod.solve;
        })();

        solverFnCache.set(key, pending);

        try {
                return await pending;
        } catch (error) {
                // A failed load must not stay cached, or the retry could never recover.
                solverFnCache.delete(key);
                throw error;
        }
}

/**
 * Preload (without solving) the WASM solver module + dictionary dataset for a page's
 * game/length. Safe to call during browser idle: it only resolves dynamic imports and
 * caches them — it runs zero solve logic, so suggestions are unchanged. When the app
 * later mounts and calls solveAndRender(), the modules are already cached and the first
 * solve starts immediately instead of waiting on a cold import + dataset fetch.
 */
export async function preloadSolverAssets(config: WordlebotAppPageConfig) {
        try {
                if (config.pageType === 'canuckle-daily' || config.pageType === 'canuckle-archive') {
                        await Promise.all([getSolveFunction('canuckle'), getCanuckleData()]);
                        return;
                }
                const game = config.game;
                const gameConfig = getWordlebotGame(game);
                const length = getBestLengthForWordlebotGame(game, config.wordLength ?? gameConfig.lengths[0]);
                const key = `len${length}`;
                await Promise.all([getSolveFunction(key), getDatasetForGame(game, length)]);
        } catch {
                // Preload is best-effort; real errors surface when the app actually mounts.
        }
}

async function getCanuckleSolverData() {
        if (!canuckleSolverDataPromise) {
                canuckleSolverDataPromise = import('./assets/generated/canuckle-solver-data.json').then(
                        (module) => module.default as CanuckleSolverData
                );
        }
        return canuckleSolverDataPromise;
}

async function getCanuckleData() {
        if (!canuckleDataPromise) {
                canuckleDataPromise = import('./assets/generated/canuckle-data.json').then(
                        (module) => module.default as CanuckleData
                );
        }
        return canuckleDataPromise;
}

function getVisibleCanucklePuzzles(data: CanuckleData, visibleDateKey: string = getLocalDateKey()) {
        return data.puzzles.filter((puzzle) => puzzle.date <= visibleDateKey);
}

function getLocalDateKey(date: Date = new Date()) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
                date.getDate()
        ).padStart(2, '0')}`;
}

function renderCanuckleFact(puzzle: CanucklePuzzle) {
        const text = puzzle.fact.join('');
        return escapeHtml(
                text
                        .replace(
                                /\s*Check out\s*Practice Mode\s*to play random Canuckle games for fun without affecting your stats or streak numbers!\s*/gi,
                                ''
                        )
                        .replace(
                                /\s*Practice Mode\s*to play random Canuckle games for fun without affecting your stats or streak numbers!\s*/gi,
                                ''
                        )
                        .replace(/\s*Check out\s*$/i, '')
                        .trim()
        );
}

function matchesArchiveQuery(puzzle: CanucklePuzzle, query: string) {
        if (!query) {
                return true;
        }

        const haystack = [`#${puzzle.index}`, puzzle.index, puzzle.answer, puzzle.date, ...puzzle.fact]
                .join(' ')
                .toLowerCase();

        return haystack.includes(query);
}

function formatCanuckleDate(isoDate: string) {
        return new Intl.DateTimeFormat(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
        }).format(new Date(`${isoDate}T12:00:00Z`));
}

function readState(key: string) {
        try {
                return JSON.parse(localStorage.getItem(key) ?? '{}') as Partial<SolverState>;
        } catch {
                return {};
        }
}

function persistState(key: string, state: SolverState) {
        localStorage.setItem(
                key,
                JSON.stringify({
                        bank: state.bank,
                        hardMode: state.hardMode,
                        maxGuesses: state.maxGuesses,
                        warmleDistance: state.warmleDistance,
                        turns: state.turns
                })
        );
}

function markResultsDirty(container: HTMLElement) {
        if (!container.querySelector('.results-stale-note')) {
                container.insertAdjacentHTML(
                        'afterbegin',
                        `
                                <div class="results-stale-note">
                                        Board updated. Click <strong>calculate next guess</strong> to refresh these results.
                                </div>
                        `
                );
        }
        container.classList.add('results-stale');
}

function buildCountOptions(max: number, selected: number) {
        return Array.from({ length: max + 1 }, (_, value) => {
                const isSelected = value === selected ? 'selected' : '';
                return `<option value="${value}" ${isSelected}>${value}</option>`;
        }).join('');
}

function formatSuggestionScore(
        suggestion: SolverResponse['suggestions'][number],
        state: SolverState,
        boardCount: number
) {
        const turnsSoFar = state.turns.length;
        if (state.game === 'xordle') return `${suggestion.average.toFixed(3)} merge score`;
        if (boardCount > 1) return `${suggestion.average.toFixed(3)} guesses`;
        if (suggestion.wrong > 0) return `${((1 - suggestion.wrong) * 100).toFixed(2)}% solve rate`;
        if (turnsSoFar === 0) return `${suggestion.average.toFixed(3)} guesses`;
        return `${(suggestion.average - turnsSoFar).toFixed(3)} guesses left`;
}

function pluralizePossibility(count: number) {
        return count === 1 ? 'y' : 'ies';
}

function replaceAt(value: string, index: number, char: string) {
        return `${value.slice(0, index)}${char}${value.slice(index + 1)}`;
}

function countFeedback(feedback: string, char: string) {
        return feedback.split('').filter((value) => value === char).length;
}

function buildWoodleFeedback(wordLength: number, correct: number, wrong: number) {
        return `${'G'.repeat(correct)}${'Y'.repeat(wrong)}${'B'.repeat(
                Math.max(0, wordLength - correct - wrong)
        )}`;
}

function defaultFeedbackForGame(state: SolverState) {
        return 'B'.repeat(state.wordLength);
}

function colorOrderForGame(state: SolverState) {
        return state.feedbackMode === 'spotle' ? ['B', 'G', 'Y', 'X'] : ['B', 'G', 'Y'];
}

function nextColorForGame(state: SolverState, current: string) {
        const order = colorOrderForGame(state);
        return order[(order.indexOf(current) + 1) % order.length];
}

function isAllowedGuess(state: SolverState, dataset: SolverDataset, guess: string) {
        if (guess.length !== state.wordLength) return false;
        if (state.game === 'thirdle') return /^[A-Z]+$/.test(guess);
        return dataset.guesses.includes(guess);
}

function hintTextForGame(state: SolverState) {
        if (state.game === 'canuckle') {
                return "Click tiles to cycle gray, red, and yellow after adding each guess. The answer bank uses Canuckle's Canadian-themed list.";
        }
        if (state.feedbackMode === 'woodle') {
                return 'After each guess, set how many letters are exact matches and how many are misplaced.';
        }
        if (state.feedbackMode === 'warmle') {
                return 'Click tiles to cycle between gray, green, and yellow. Yellow means alphabetically close, not misplaced.';
        }
        if (state.feedbackMode === 'peaks') {
                return 'Click tiles to cycle between gray, green, and yellow. Gray means the answer letter is earlier; yellow means later.';
        }
        if (state.feedbackMode === 'spotle') {
                return 'Click tiles to cycle gray, green, yellow, and blank after adding each guess.';
        }
        if (state.game === 'hardle') {
                return 'Click tiles to match the clue. Hardle can swap greens and yellows compared with standard Wordle.';
        }
        if (state.game === 'fibble') {
                return 'Click tiles to match the clue. In Fibble, one tile in each clue may be a lie.';
        }
        if (state.game === 'xordle') {
                return 'Click tiles to match the merged clue coming from the two hidden words.';
        }
        return 'Click tiles to cycle gray, green, and yellow after adding each guess.';
}
