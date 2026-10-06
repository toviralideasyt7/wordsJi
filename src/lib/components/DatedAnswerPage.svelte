<script lang="ts">
	import { generatePersonAuthorSchema } from '$lib/seo';

	interface Props {
		gameLabel: string;
		gameKey: string;
		/** ISO dateKey, e.g. "2026-10-05". */
		dateKey: string;
		/** Long date, e.g. "October 5, 2026". */
		dateLong: string;
		numberText: string;
		answerText: string;
		/** month-day-year slug, e.g. "october-4-2026", or null at the window edge. */
		prevDateParam: string | null;
		nextDateParam: string | null;
		prose: string | null;
	}

	let {
		gameLabel,
		gameKey,
		dateKey,
		dateLong,
		numberText,
		answerText,
		prevDateParam,
		nextDateParam,
		prose
	}: Props = $props();

	const MONTH_NAMES = [
		'january', 'february', 'march', 'april', 'may', 'june',
		'july', 'august', 'september', 'october', 'november', 'december'
	];

	function toDateParam(key: string): string {
		const [y, m, d] = key.split('-').map(Number);
		return `${MONTH_NAMES[m - 1]}-${d}-${y}`;
	}

	function paramToLong(param: string): string {
		const [month, day, year] = param.split('-');
		const name = month.charAt(0).toUpperCase() + month.slice(1);
		return `${name} ${day}, ${year}`;
	}

	const dateParam = toDateParam(dateKey);
	const canonicalUrl = `https://wordsolverx.com/${gameKey}-answer-for-${dateParam}`;
	const title = `${gameLabel} Answer for ${dateLong} - ${answerText} (${numberText})`;
	const description = `The ${gameLabel} answer for ${dateLong} (${numberText}) was ${answerText}. See the letter hints, the confirmed solution, and more ${gameLabel} answers from the archive.`;

	const articleSchema = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: title,
		datePublished: `${dateKey}T00:00:00Z`,
		dateModified: `${dateKey}T00:00:00Z`,
		author: generatePersonAuthorSchema(
			'Preston Hayes',
			'https://wordsolverx.com/about#preston-hayes',
			'https://wordsolverx.com/author-wordsolverx.webp'
		),
		publisher: {
			'@type': 'Organization',
			name: 'WordSolverX',
			logo: { '@type': 'ImageObject', url: 'https://wordsolverx.com/wordsolverx.webp' }
		},
		description,
		mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl }
	};
	const schemas = JSON.stringify([articleSchema]);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonicalUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{@html `<script type="application/ld+json">${schemas}</script>`}
</svelte:head>

<!-- NOTE: the layout already renders <main id="main-content"> — this page must not
	nest a second <main> (invalid HTML that confuses ad content extraction). -->
<div class="min-h-screen bg-slate-50 dark:bg-slate-800/30">
	<section class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
			<nav class="mb-6 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
				<a href="/" class="hover:text-teal-600 dark:hover:text-teal-400">Home</a>
				<span class="mx-2">/</span>
				<a href="/{gameKey}-answer-today" class="hover:text-teal-600 dark:hover:text-teal-400">{gameLabel} answer today</a>
				<span class="mx-2">/</span>
				<span>{dateLong}</span>
			</nav>

			<h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
				{gameLabel} Answer for {dateLong}
			</h1>
			<p class="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{gameLabel} {numberText}</p>

			<div class="mt-6 rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800/40 dark:bg-green-900/20">
				<div class="text-4xl sm:text-5xl font-black tracking-[0.3em] text-green-700 dark:text-green-300 uppercase">
					{answerText}
				</div>
			</div>
			<p class="mt-6 text-base leading-7 text-slate-600 dark:text-slate-300">
				The {gameLabel} answer for {dateLong} was
				<strong class="font-bold text-slate-900 dark:text-slate-50 uppercase">{answerText}</strong>
				({numberText}).
			</p>

			{#if prose}
				<p class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
					{prose}
				</p>
			{/if}

			<div class="mt-8 flex flex-wrap gap-3">
				<a
					href="/{gameKey}-answer-today"
					class="inline-flex items-center rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-500"
				>
					Today's {gameLabel} answer
				</a>
				<a
					href="/{gameKey}-archive"
					class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
				>
					{gameLabel} archive
				</a>
			</div>

			<nav class="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700" aria-label="Older and newer answers">
				{#if prevDateParam}
					<a
						href="/{gameKey}-answer-for-{prevDateParam}"
						rel="prev"
						class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-700 dark:hover:text-teal-300"
					>
						← Older: {paramToLong(prevDateParam)}
					</a>
				{:else}
					<span></span>
				{/if}
				{#if nextDateParam}
					<a
						href="/{gameKey}-answer-for-{nextDateParam}"
						rel="next"
						class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-teal-700 dark:hover:text-teal-300"
					>
						Newer: {paramToLong(nextDateParam)} →
					</a>
				{/if}
			</nav>
		</div>
	</section>
</div>
