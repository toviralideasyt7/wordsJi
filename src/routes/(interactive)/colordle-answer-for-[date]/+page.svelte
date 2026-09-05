<script lang="ts">
	interface ColorFacts {
		family: string;
		rgbLabel: string;
		shortHex: string;
	}

	interface WeekLink {
		href: string;
		label: string;
		isToday: boolean;
		rel: 'prev' | 'next' | null;
	}

	interface DatedData {
		dateKey: string;
		formattedDate: string;
		colorName: string | null;
		colorHex: string | null;
		dayNum: number | null;
		schemas: string;
		title: string;
		description: string;
		canonicalUrl: string;
		prevDateKey: string | null;
		nextDateKey: string | null;
		nextIsToday: boolean;
		colorFacts: ColorFacts | null;
		weekLinks: WeekLink[];
	}

	let { data }: { data: DatedData } = $props();

	let swatchStyle = $derived(
		data.colorHex ? `background-color: ${data.colorHex};` : ''
	);
</script>

<svelte:head>
	<title>{data.title}</title>
	<meta name="description" content={data.description} />
	<link rel="canonical" href={data.canonicalUrl} />
	<!-- Dated archive URLs are kept for Bing/Yandex/AI crawlers; Google is asked to
	     concentrate on the canonical today + hub pages instead of 1,100 near-identical
	     dated URLs. Bingbot and AI agents ignore googlebot-scoped directives. -->
	<meta name="googlebot" content="noindex, follow" />
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
				<a href="/colordle-archive" class="hover:text-teal-600 dark:hover:text-teal-400">Colordle archive</a>
			</nav>

			<h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">
				Colordle Answer for {data.formattedDate}
			</h1>
			{#if data.dayNum}
				<p class="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Colordle #{data.dayNum}</p>
			{/if}

			{#if data.colorName}
				<div class="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-8 text-center dark:border-teal-800/40 dark:bg-teal-900/20">
					<div
						class="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-white shadow-md dark:border-slate-700"
						style={swatchStyle}
						aria-label="{data.colorName} color swatch"
					></div>
					<div class="text-3xl sm:text-4xl font-black tracking-tight text-teal-700 dark:text-teal-300">
						{data.colorName}
					</div>
					{#if data.colorHex}
						<div class="mt-2 font-mono text-lg text-slate-600 dark:text-slate-300 uppercase">{data.colorHex}</div>
					{/if}
				</div>
				<p class="mt-6 text-base leading-7 text-slate-600 dark:text-slate-300">
					The Colordle answer for {data.formattedDate} was
					<strong class="font-bold text-slate-900 dark:text-slate-50">{data.colorName}</strong>{#if data.colorHex}
						with hex code <strong class="font-mono text-slate-900 dark:text-slate-50 uppercase">{data.colorHex}</strong>{/if}.{#if data.dayNum}
						This was Colordle day {data.dayNum}.{/if}
				</p>
				{#if data.colorFacts}
					<ul class="mt-6 grid grid-cols-3 gap-3 text-center" aria-label="Color facts">
						<li class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
							<span class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Family</span>
							<span class="mt-1 block text-lg font-black capitalize text-slate-900 dark:text-slate-50">{data.colorFacts.family}</span>
						</li>
						<li class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
							<span class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">RGB</span>
							<span class="mt-1 block text-lg font-black text-slate-900 dark:text-slate-50">{data.colorFacts.rgbLabel}</span>
						</li>
						<li class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
							<span class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Hex start</span>
							<span class="mt-1 block font-mono text-lg font-black text-slate-900 dark:text-slate-50">{data.colorFacts.shortHex}</span>
						</li>
					</ul>
				{/if}
			{:else}
				<div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-800/40 dark:bg-amber-900/20">
					<p class="text-slate-700 dark:text-slate-200">
						We don't have the Colordle answer for this date yet. Check the full archive for the complete history.
					</p>
				</div>
			{/if}

			<div class="mt-8 flex flex-wrap gap-3">
				<a
					href="/colordle-answer-today"
					class="inline-flex items-center rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-500"
				>
					Today's Colordle answer
				</a>
				<a
					href="/colordle-solver"
					class="inline-flex items-center rounded-full border border-teal-200 bg-white px-5 py-2.5 text-sm font-bold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-300"
				>
					Colordle solver
				</a>
				<a
					href="/colordle-archive"
					class="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
				>
					Full archive
				</a>
			</div>

			{#if data.colorName}
				<section class="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700" aria-label="Frequently asked questions">
					<h2 class="text-lg font-bold text-slate-900 dark:text-slate-50">Frequently asked questions</h2>
					<h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">
						What was the Colordle answer on {data.formattedDate}?
					</h3>
					<p class="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
						The Colordle answer for {data.formattedDate} was
						<strong class="font-bold text-slate-900 dark:text-slate-50">{data.colorName}</strong>{#if data.colorHex}
							with hex code <strong class="font-mono text-slate-900 dark:text-slate-50 uppercase">{data.colorHex}</strong>{/if}.
					</p>
					{#if data.dayNum}
						<h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-slate-50">
							What was Colordle day {data.dayNum}?
						</h3>
						<p class="mt-1 text-base leading-7 text-slate-600 dark:text-slate-300">
							Colordle day {data.dayNum}, published {data.formattedDate}, was
							<strong class="font-bold text-slate-900 dark:text-slate-50">{data.colorName}</strong>{#if data.colorHex}
								with hex code <strong class="font-mono text-slate-900 dark:text-slate-50 uppercase">{data.colorHex}</strong>{/if}.
						</p>
					{/if}
				</section>
			{/if}

			{#if data.weekLinks.length > 0}
				<nav class="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700" aria-label="More Colordle answers from this week">
					<h2 class="text-lg font-bold text-slate-900 dark:text-slate-50">More Colordle answers from this week</h2>
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
