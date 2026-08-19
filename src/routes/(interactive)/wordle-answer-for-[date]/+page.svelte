<script lang="ts">
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
	}

	let { data }: { data: DatedData } = $props();
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalUrl} />
	<meta property="og:title" content={data.title} />
	<meta property="og:description" content={data.description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={data.canonicalUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.title} />
	<meta name="twitter:description" content={data.description} />
	{@html `<script type="application/ld+json">${data.schemas}</script>`}
</svelte:head>

<main class="min-h-screen bg-slate-50 dark:bg-slate-800/30">
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
		</div>
	</section>
</main>
