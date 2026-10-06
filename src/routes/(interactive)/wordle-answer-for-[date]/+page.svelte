<script lang="ts">
	interface WordStats {
		first: string;
		last: string;
		vowels: number;
		repeat: boolean;
	}

	interface WeekLink {
		href: string;
		label: string;
		isToday: boolean;
		isAdjacent: boolean;
		rel: 'prev' | 'next' | null;
	}

	interface DatedData {
		dateKey: string;
		formattedDate: string;
		solution: string;
		puzzleNumber: number;
		editor: string | null;
		schemas: string;
		title: string;
		description: string;
		canonicalUrl: string;
		prevDateKey: string | null;
		nextDateKey: string | null;
		nextIsToday: boolean;
		prevDateLabel: string | null;
		nextDateLabel: string | null;
		prose: string | null;
		wordStats: WordStats | null;
		weekLinks: WeekLink[];
		bodyHtml: string;
		dayName: string;
		isoDateKey: string;
	}

	let { data }: { data: DatedData } = $props();
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalUrl} />
	<!-- Dated archive pages are self-canonical and indexable: each carries unique
	     per-puzzle prose and its own answer, so they stand as canonical dated URLs. -->
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={data.canonicalUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.title} />
	<meta name="twitter:description" content={data.description} />
	{@html `<script type="application/ld+json">${data.schemas}</script>`}
</svelte:head>

<!-- NOTE: the layout already renders <main id="main-content"> — this page must not
	nest a second <main> (invalid HTML that confuses ad content extraction). -->
<div class="min-h-screen bg-slate-50 dark:bg-slate-800/30">
	<section class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
			<nav class="mb-6 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
				<a href="/" class="hover:text-teal-600 dark:hover:text-teal-400">Home</a>
				<span class="mx-2">/</span>
				<a href="/wordle-answer-archive" class="hover:text-teal-600 dark:hover:text-teal-400">Wordle archive</a>
			</nav>

			<h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
				Wordle Answer for {data.formattedDate}
			</h1>
			<p class="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Wordle #{data.puzzleNumber}</p>
			<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
				Published {data.dayName}, {data.formattedDate} · By <a href="/about#preston-hayes" class="underline hover:text-teal-600 dark:hover:text-teal-400">Preston Hayes, editor</a>
			</p>

			{#if data.solution}
				<div class="mt-6 rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800/40 dark:bg-green-900/20">
					<div class="text-4xl sm:text-5xl font-black tracking-[0.3em] text-green-700 dark:text-green-300 uppercase">
						{data.solution}
					</div>
				</div>
				<p class="mt-6 text-base leading-7 text-slate-600 dark:text-slate-300">
					The Wordle answer for {data.formattedDate} was
					<strong class="font-bold text-slate-900 dark:text-slate-50 uppercase">{data.solution}</strong>.
					{#if data.editor}It was selected by {data.editor}.{/if}
				</p>
				{#if data.prose}
					<p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
						{data.prose}
					</p>
				{/if}
				{#if data.wordStats}
					<ul class="mt-6 grid grid-cols-2 gap-3 text-center sm:grid-cols-4" aria-label="Answer hints">
						<li class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
							<span class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Starts with</span>
							<span class="mt-1 block text-xl font-black text-slate-900 dark:text-slate-50">{data.wordStats.first}</span>
						</li>
						<li class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
							<span class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ends with</span>
							<span class="mt-1 block text-xl font-black text-slate-900 dark:text-slate-50">{data.wordStats.last}</span>
						</li>
						<li class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
							<span class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Vowels</span>
							<span class="mt-1 block text-xl font-black text-slate-900 dark:text-slate-50">{data.wordStats.vowels}</span>
						</li>
						<li class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
							<span class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Repeats</span>
							<span class="mt-1 block text-xl font-black text-slate-900 dark:text-slate-50">{data.wordStats.repeat ? 'Yes' : 'No'}</span>
						</li>
					</ul>
				{/if}
			{:else}
				<div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800/40 dark:bg-amber-900/20">
					<p class="text-slate-700 dark:text-slate-200">
						We don't have the Wordle answer for this date yet. Check the full archive for the complete history.
					</p>
				</div>
			{/if}

			<div class="mt-8 flex flex-wrap gap-3">
				<a
					href="/wordle-answer-today"
					class="inline-flex items-center rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-500"
				>
					Today's Wordle answer
				</a>
				<a
					href="/wordle-solver"
					class="inline-flex items-center rounded-full border border-teal-200 bg-white px-5 py-2.5 text-sm font-bold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300"
				>
					Wordle solver
				</a>
				<a
					href="/wordle-answer-archive"
					class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
				>
					Full archive
				</a>
			</div>

			{#if data.solution}
				<article class="mt-8 border-t border-slate-200 pt-6 text-base leading-7 text-slate-700 dark:border-slate-700 dark:text-slate-200" aria-label="Puzzle overview">
					<h2 class="text-lg font-bold text-slate-900 dark:text-slate-50">About Wordle #{data.puzzleNumber} ({data.formattedDate})</h2>
					{@html data.bodyHtml}
				</article>
			{/if}

			{#if data.solution}
				<section class="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700" aria-label="Frequently asked questions" itemscope itemtype="https://schema.org/FAQPage">
					<h2 class="text-lg font-bold text-slate-900 dark:text-slate-50">Frequently asked questions</h2>
					<div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
						<h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50" itemprop="name">
							What was the Wordle answer on {data.formattedDate}?
						</h3>
						<div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
							<p class="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300" itemprop="text">
								The Wordle answer for {data.formattedDate} was
								<strong class="font-bold text-slate-900 dark:text-slate-50 uppercase">{data.solution}</strong>.
								This was Wordle #{data.puzzleNumber}.
							</p>
						</div>
					</div>
					<div itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
						<h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50" itemprop="name">
							What was Wordle #{data.puzzleNumber}?
						</h3>
						<div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
							<p class="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300" itemprop="text">
								Wordle #{data.puzzleNumber}, published {data.formattedDate}, was
								<strong class="font-bold text-slate-900 dark:text-slate-50 uppercase">{data.solution}</strong>.
							</p>
						</div>
					</div>
				</section>
			{/if}

			<nav class="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700" aria-label="Older and newer Wordle answers">
				{#if data.prevDateKey}
					<a
						href="/wordle-answer-for-{data.prevDateKey}"
						rel="prev"
						class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-700 dark:hover:text-teal-300"
					>
						← Older: {data.prevDateLabel}
					</a>
				{:else}
					<span></span>
				{/if}
				{#if data.nextDateKey}
					<a
						href="/wordle-answer-for-{data.nextDateKey}"
						rel="next"
						class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-700 dark:hover:text-teal-300"
					>
						Newer: {data.nextDateLabel} →
					</a>
				{/if}
			</nav>

			{#if data.weekLinks.length > 0}
				<nav class="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700" aria-label="More Wordle answers from this week">
					<h2 class="text-lg font-bold text-slate-900 dark:text-slate-50">More Wordle answers from this week</h2>
					<ul class="mt-3 flex flex-wrap gap-2">
						{#each data.weekLinks as link}
							<li>
								<a
									href={link.href}
									rel={link.rel}
									class="inline-block rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-700 dark:hover:text-teal-300"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/if}
		</div>
	</section>
</div>
