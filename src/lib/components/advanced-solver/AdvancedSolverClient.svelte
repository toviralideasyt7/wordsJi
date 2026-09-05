<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Suggestions from './Suggestions.svelte';
	import WordGrid from './WordGrid.svelte';
	import WordLengthSelector from './WordLengthSelector.svelte';

	interface SolverSuggestion {
		word: string;
		score: number;
		expected_guesses?: number;
		average_remaining?: number;
		is_possible_answer?: boolean;
		is_preferred_answer?: boolean;
	}

	interface SolverResult {
		suggestions?: SolverSuggestion[];
		possibilities?: number;
	}

	interface WorkerReadyMessage {
		type: 'ready';
	}

	interface WorkerResultMessage {
		type: 'result';
		requestId: number;
		result: SolverResult;
	}

	interface WorkerErrorMessage {
		type: 'error';
		requestId?: number;
		error: string;
	}

	interface PendingRequest {
		kind: 'solve' | 'refresh';
		nextHistory?: string[];
	}

	type WorkerMessage = WorkerReadyMessage | WorkerResultMessage | WorkerErrorMessage;

	const createCorrectness = (length: number) => Array(length).fill(1);

	const showToast = (
		message: string,
		type: 'success' | 'error' | 'info' | 'warning' = 'info'
	) => {
		const toast = document.createElement('div');
		toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
			type === 'success'
				? 'bg-teal-600'
				: type === 'error'
					? 'bg-red-600'
					: type === 'warning'
						? 'bg-amber-600'
						: 'bg-blue-600'
		}`;
		toast.textContent = message;
		document.body.appendChild(toast);
		setTimeout(() => toast.remove(), 2800);
	};

	let currentWord = $state('');
	let history = $state<string[]>([]);
	let correctness = $state<number[]>(createCorrectness(5));
	let currentSelection = $state(0);
	let suggestion = $state<string | null>(null);
	let suggestions = $state<SolverSuggestion[]>([]);
	let possibilities = $state(0);
	let loading = $state(false);
	let showResult = $state(false);
	let solverInitializing = $state(true);
	let wordLength = $state(5);
	let isHardMode = $state(false);
	let useLimitNYT = $state(true);
	let worker = $state<Worker | null>(null);

	let suggestionsRef = $state<HTMLDivElement | null>(null);
	let gameAreaRef = $state<HTMLDivElement | null>(null);
	let nextRequestId = 0;
	const pendingRequests = new Map<number, PendingRequest>();

	function applyResult(result: SolverResult) {
		suggestions = result.suggestions ?? [];
		possibilities = result.possibilities ?? 0;
		suggestion = result.suggestions?.[0]?.word ?? null;
	}

	function resetPendingRequests() {
		pendingRequests.clear();
		loading = false;
	}

	function resetState() {
		currentWord = '';
		history = [];
		correctness = createCorrectness(wordLength);
		currentSelection = 0;
		suggestion = null;
		suggestions = [];
		possibilities = 0;
		showResult = false;
	}

	function requestSolver(kind: PendingRequest['kind'], state: string, nextHistory?: string[]) {
		if (!worker || solverInitializing) {
			return false;
		}

		const requestId = ++nextRequestId;
		pendingRequests.set(requestId, { kind, nextHistory });

		worker.postMessage({
			type: 'solve',
			requestId,
			state,
			isHardMode,
			useLimitNYT,
			wordLength
		});

		return true;
	}

	function refreshSuggestions(currentHistory: string[]) {
		if (!currentHistory.length) {
			suggestions = [];
			suggestion = null;
			possibilities = 0;
			showResult = false;
			return;
		}

		requestSolver('refresh', currentHistory.join(','));
	}

	function handleWordLengthChange(length: number) {
		wordLength = length;
		localStorage.setItem('wordLength', length.toString());
		localStorage.setItem('useLimitNYT', useLimitNYT.toString());
		resetPendingRequests();
		resetState();
	}

	function handleAnswerSetChange(limitToNYT: boolean) {
		useLimitNYT = limitToNYT;
		localStorage.setItem('useLimitNYT', useLimitNYT.toString());
		resetPendingRequests();
		refreshSuggestions(history);
	}

	function toggleHardMode() {
		isHardMode = !isHardMode;
		localStorage.setItem('isHardMode', isHardMode.toString());
		resetPendingRequests();
		refreshSuggestions(history);
	}

	function handleCellTap(index: number) {
		currentSelection = index;
	}

	function handleCellStateChange(index: number, state: number) {
		const next = [...correctness];
		next[index] = state;
		correctness = next;
	}

	async function submitGuess() {
		if (currentWord.length !== wordLength) {
			showToast(`Please enter a ${wordLength}-letter word`, 'error');
			return;
		}

		if (correctness.every((c) => c === 3)) {
			history = [...history, `${currentWord}:${correctness.join('')}`];
			suggestions = [];
			suggestion = null;
			possibilities = 1;
			currentWord = '';
			correctness = createCorrectness(wordLength);
			currentSelection = 0;
			showToast("You've solved the puzzle!", 'success');
			showResult = false;
			return;
		}

		if (!worker || solverInitializing) {
			showToast('Solver is still initializing, please wait', 'warning');
			return;
		}

		loading = true;
		const guessInfo = `${currentWord}:${correctness.join('')}`;
		const newHistory = [...history, guessInfo];

		if (!requestSolver('solve', newHistory.join(','), newHistory)) {
			loading = false;
			showToast('Solver is still initializing, please wait', 'warning');
			return;
		}

		await tick();
	}

	function useSuggestion(selectedWord?: string) {
		const wordToUse = typeof selectedWord === 'string' ? selectedWord : suggestion;
		if (!wordToUse) return;

		currentWord = wordToUse.toLowerCase();
		correctness = createCorrectness(wordLength);
		currentSelection = 0;
		showResult = false;
		suggestion = null;
		suggestions = [];

		setTimeout(() => {
			gameAreaRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
	}

	function handleInputChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const value = target.value.toLowerCase().replace(/[^a-z]/g, '');
		if (value.length <= wordLength) {
			currentWord = value;
			if (value.length === wordLength) {
				correctness = createCorrectness(wordLength);
			}
		}
	}

	function clearInput() {
		currentWord = '';
		correctness = createCorrectness(wordLength);
	}

	function resetSolver() {
		resetPendingRequests();
		resetState();
		showToast('Solver reset', 'info');
	}

	function goBack() {
		if (history.length === 0) return;

		resetPendingRequests();
		const newHistory = [...history];
		const lastGuess = newHistory.pop();
		if (!lastGuess) return;

		history = newHistory;
		const [word, corr] = lastGuess.split(':');
		currentWord = word ?? '';
		correctness = (corr ?? '').split('').map((c) => Number.parseInt(c, 10));
		showResult = false;
		suggestion = null;
		suggestions = [];
		possibilities = 0;

		refreshSuggestions(newHistory);
	}

	async function handleWorkerMessage(event: MessageEvent<WorkerMessage>) {
		const data = event.data;

		if (data?.type === 'ready') {
			solverInitializing = false;
			return;
		}

		if (data?.type === 'error' && data.requestId === undefined) {
			solverInitializing = false;
			showToast(data.error || 'Failed to initialize solver', 'error');
			return;
		}

		if (data?.type !== 'result' && data?.type !== 'error') {
			return;
		}

		const requestId = data.requestId;
		if (requestId === undefined) {
			return;
		}

		const pending = pendingRequests.get(requestId);
		if (!pending) {
			return;
		}

		pendingRequests.delete(requestId);

		if (data.type === 'error') {
			loading = false;
			showToast(data.error || 'The solver could not finish this request.', 'error');
			return;
		}

		const result = data.result ?? {};
		applyResult(result);
		loading = false;

		if (pending.kind === 'refresh') {
			showResult = suggestions.length > 0;
			return;
		}

		if (!result.suggestions || result.suggestions.length === 0) {
			showToast('No matching words found. Please check your colors and try again.', 'warning');
			return;
		}

		history = pending.nextHistory ?? history;
		correctness = createCorrectness(wordLength);
		currentWord = '';
		currentSelection = 0;
		showResult = true;

		await tick();
		suggestionsRef?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	onMount(() => {
		const savedLength = localStorage.getItem('wordLength');
		if (savedLength) {
			const parsed = Number.parseInt(savedLength, 10);
			if (!Number.isNaN(parsed)) {
				wordLength = parsed;
			}
		}

		if (localStorage.getItem('useLimitNYT')) {
			useLimitNYT = localStorage.getItem('useLimitNYT') === 'true';
		}

		const savedHardMode = localStorage.getItem('isHardMode');
		if (savedHardMode) {
			isHardMode = savedHardMode === 'true';
		}

		resetState();

		let workerInstance: Worker | null = null;
		try {
			workerInstance = new Worker(new URL('../../workers/solver.worker.ts', import.meta.url), {
				type: 'classic'
			});
			worker = workerInstance;
			solverInitializing = true;

			const onMessage = (workerEvent: MessageEvent<WorkerMessage>) => {
				void handleWorkerMessage(workerEvent);
			};

			const onError = (error: ErrorEvent) => {
				showToast(`Failed to initialize solver: ${error.message}`, 'error');
				solverInitializing = false;
			};

			workerInstance.addEventListener('message', onMessage);
			workerInstance.addEventListener('error', onError);
			workerInstance.postMessage({ type: 'init' });

			const handleKeyDown = (event: KeyboardEvent) => {
				if (showResult || solverInitializing) return;

				if (
					event.key === 'Enter' ||
					event.key === 'Backspace' ||
					/^[a-zA-Z]$/.test(event.key)
				) {
					event.preventDefault();
				}

				if (event.key === 'Enter') {
					void submitGuess();
				} else if (event.key === 'Backspace') {
					currentWord = currentWord.slice(0, -1);
				} else if (/^[a-zA-Z]$/.test(event.key) && currentWord.length < wordLength) {
					currentWord = `${currentWord}${event.key.toLowerCase()}`;
					if (currentWord.length === wordLength) {
						correctness = createCorrectness(wordLength);
					}
				}
			};

			window.addEventListener('keydown', handleKeyDown);

			return () => {
				window.removeEventListener('keydown', handleKeyDown);
				pendingRequests.clear();
				workerInstance?.removeEventListener('message', onMessage);
				workerInstance?.removeEventListener('error', onError);
				workerInstance?.terminate();
			};
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error';
			showToast(`Failed to initialize solver: ${message}`, 'error');
			solverInitializing = false;
		}
	});
</script>

<div class="flex-1 container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<div class="text-center mb-10">
			<h2
				class="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 bg-clip-text text-transparent mb-3"
			>
				Wordle Solver
			</h2>
			<p class="text-slate-600 text-lg">Find the solution with fewest attempts</p>
		</div>

		{#if history.length === 0}
			<div class="mb-8 space-y-6">
				<div class="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-lg border border-slate-200">
					<div class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
						&#x1F4CF; Word Length
					</div>
					<div class="flex justify-center">
						<WordLengthSelector currentLength={wordLength} onChange={handleWordLengthChange} />
					</div>
				</div>

				<div class="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-blue-200">
					<div class="block text-sm font-bold text-blue-800 uppercase tracking-wider mb-4">
						&#x1F3AF; Answer Set
					</div>
					<div class="flex bg-blue-100 p-1.5 rounded-xl shadow-inner">
						<button
							onclick={() => handleAnswerSetChange(true)}
							class="flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all duration-200 transform {useLimitNYT
								? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-md scale-105'
								: 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}"
						>
							Prefer NYT
						</button>
						<button
							onclick={() => handleAnswerSetChange(false)}
							class="flex-1 py-3 px-4 text-sm font-bold rounded-lg transition-all duration-200 transform {!useLimitNYT
								? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-md scale-105'
								: 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}"
						>
							All Words
						</button>
					</div>
				</div>

				<div class="bg-gradient-to-br from-white to-purple-50 p-6 rounded-2xl shadow-lg border border-purple-200">
					<div class="flex justify-center">
						<label class="flex items-center cursor-pointer group">
							<div class="relative">
								<input
									type="checkbox"
									class="sr-only"
									checked={isHardMode}
									onchange={toggleHardMode}
								/>
								<div
									class="block w-14 h-7 rounded-full transition-all duration-300 shadow-inner {isHardMode
										? 'bg-gradient-to-r from-orange-400 to-red-500'
										: 'bg-slate-300'}"
								></div>
								<div
									class="dot absolute left-1 top-0.5 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md {isHardMode
										? 'transform translate-x-7'
										: ''}"
								></div>
							</div>
							<div class="ml-4 text-base font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
								&#x1F525; Hard Mode
							</div>
						</label>
					</div>
				</div>
			</div>
		{/if}

		<div class="mb-8" bind:this={gameAreaRef}>
			<div class="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 text-center">
				&#x270D;&#xFE0F; Type Your Guess
			</div>
			<div class="relative w-full max-w-md mx-auto">
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					value={currentWord}
					oninput={handleInputChange}
					placeholder="Enter your word..."
					class="w-full px-6 py-4 text-center text-3xl font-black uppercase tracking-widest bg-gradient-to-br from-white to-slate-50 rounded-2xl border-[3px] border-slate-300 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-200 transition-all shadow-lg hover:shadow-xl text-slate-900"
					maxlength={wordLength}
					autofocus
				/>
				<button
					onclick={clearInput}
					class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors text-2xl hover:scale-110 transform"
					title="Clear"
				>
					&#x2715;
				</button>
			</div>
		</div>

		{#if history.length > 0}
			<div class="w-full mb-6">
				<h3 class="text-sm font-medium mb-3 text-slate-700 sr-only">Previous Guesses:</h3>
				<div class="flex flex-col gap-2">
					{#each history as item}
						{@const [word, pattern] = item.split(':')}
						<div class="flex justify-center gap-1">
							{#each (word ?? '').split('') as letter, i}
								{@const state = Number.parseInt(pattern?.[i] ?? '1', 10)}
								{@const cellClass = state === 1
									? 'bg-slate-400 border-slate-500 text-white'
									: state === 2
										? 'bg-yellow-400 border-yellow-500 text-white'
										: state === 3
											? 'bg-teal-500 border-teal-600 text-white'
											: 'bg-slate-200 border-slate-300'}
								<div
									class="flex items-center justify-center font-bold rounded-md border-2 {cellClass} {wordLength > 8
										? 'w-8 h-8 text-sm'
										: wordLength > 6
											? 'w-10 h-10 text-base'
											: 'w-12 h-12 text-lg'}"
								>
									{letter.toUpperCase()}
								</div>
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if !showResult}
			<div class="w-full mb-6">
				<WordGrid
					word={currentWord}
					wordLength={wordLength}
					correctness={correctness}
					currentSelection={currentSelection}
					onTap={handleCellTap}
					onDoubleTap={handleCellStateChange}
				/>
			</div>
		{/if}

		{#if history.length > 0 || currentWord.length > 0 || showResult}
			<div class="flex justify-center gap-3 mb-6 flex-wrap">
				<button
					onclick={resetSolver}
					class="flex items-center space-x-2 px-5 py-2.5 text-sm font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 rounded-xl border-2 border-red-200 transition-all shadow-sm hover:shadow-md"
				>
					<span>&#x21bb;</span>
					<span>Reset Solver</span>
				</button>
				{#if history.length > 0}
				<button
					onclick={goBack}
					class="flex items-center space-x-2 px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl border-2 border-slate-300 transition-all shadow-sm hover:shadow-md"
				>
					<span>&larr;</span>
					<span>Remove Last Entry</span>
				</button>
				{/if}
			</div>
		{/if}

		<div class="mb-8">
			<button
				onclick={() => void submitGuess()}
				disabled={loading || currentWord.length !== wordLength}
				class="w-full max-w-md mx-auto block py-5 px-8 bg-gradient-to-r from-teal-600 via-teal-600 to-teal-600 hover:from-teal-700 hover:via-teal-700 hover:to-teal-700 text-white font-black text-2xl rounded-2xl shadow-2xl transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-4"
			>
				{#if loading}
					<div class="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<span>Calculate Next Guess</span>
					<span class="text-3xl">&rarr;</span>
				{/if}
			</button>
		</div>

	{#if loading}
		<div class="w-full max-w-md mx-auto mt-6 p-8 text-center rounded-2xl bg-white shadow-lg border border-slate-100">
			<div class="w-10 h-10 mx-auto border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
			<p class="mt-4 text-base font-semibold text-slate-700">Calculating next guess…</p>
			<p class="mt-1 text-sm text-slate-500">Filtering the word list against your clues.</p>
		</div>
	{:else if showResult}
			<div bind:this={suggestionsRef}>
				<Suggestions {suggestions} {possibilities} onSelectWord={useSuggestion} />
			</div>
		{/if}
	</div>
</div>
