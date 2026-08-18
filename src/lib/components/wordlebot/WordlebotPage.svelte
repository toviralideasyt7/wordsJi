<script lang="ts">
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import FAQSection from '$lib/components/FAQSection.svelte';
        import WordlebotWasmClient from '$lib/components/wordlebot/WordlebotWasmClient.svelte';
        import { getWordlebotStructuredData } from '$lib/wordlebot-wasm/route-config';
        import { getCanucklePagePath } from '$lib/wordlebot-wasm/routes';
        import type { WordlebotPageConfig } from '$lib/wordlebot-wasm/types';
        import StaticArticle from '$lib/components/StaticArticle.svelte';
        import { ARTICLE_CONTENT } from '$lib/content/registry';

        let { config }: { config: WordlebotPageConfig } = $props();

        let structuredData = $derived(getWordlebotStructuredData(config));
        const SOLVER_ARTICLE_KEYS: Record<string, string> = {
                canuckle: 'canuckle-solver',
                hardle: 'hardle-solver',
                warmle: 'warmle-solver',
                woodle: 'woodle-solver',
                'w-peaks': 'w-peaks-solver',
                xordle: 'xordle-solver',
                fibble: 'fibble-solver',
                dordle: 'dordle-solver',
                quordle: 'quordle-solver',
                octordle: 'octordle-solver',
                spotle: 'spotle-wordle-solver'
        };

        let isWordleLengthPage = $derived(
                config.appConfig.pageType === 'solver' && config.appConfig.game === 'wordle'
        );
        let isCanuckleTodayPage = $derived(config.appConfig.pageType === 'canuckle-daily');
        let solverArticleKey = $derived(
                config.appConfig.pageType === 'solver'
                        ? SOLVER_ARTICLE_KEYS[config.appConfig.game] ?? 'wordle-solver'
                        : null
        );
        let isCanuckleArchivePage = $derived(config.appConfig.pageType === 'canuckle-archive');
        let isCanuckleSolverPage = $derived(
                config.appConfig.pageType === 'solver' && config.appConfig.game === 'canuckle'
        );
        let isCanuckleFamilyPage = $derived(
                isCanuckleTodayPage || isCanuckleArchivePage || isCanuckleSolverPage
        );
        let ogType = $derived(isCanuckleTodayPage ? 'article' : 'website');
        let seoTitle = $derived(config.metaTitle ?? config.title);
        let canuckleTabs = [
                { key: 'today', label: 'Today', href: getCanucklePagePath('today') },
                { key: 'archive', label: 'Archive', href: getCanucklePagePath('archive') },
                { key: 'solver', label: 'Solver', href: getCanucklePagePath('solver') }
        ];
        let activeCanuckleTab = $derived(
                isCanuckleTodayPage ? 'today' : isCanuckleArchivePage ? 'archive' : 'solver'
        );
        let displayTitle = $derived(config.displayTitle ?? config.title);
</script>

<svelte:head>
        <title>{seoTitle}</title>
        <meta name="description" content={config.description} />
        <meta name="keywords" content={config.keywords.join(', ')} />
        {#if isCanuckleTodayPage}
                <meta
                        name="news_keywords"
                        content="canuckle answer today, canuckle today, canuckle answer, canuckle puzzle today"
                />
        {/if}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={config.description} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={config.pageUrl} />
        <meta property="og:site_name" content="WordSolverX" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={config.description} />
        <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
        <link rel="canonical" href={config.pageUrl} />
        {@html `<script type="application/ld+json">${structuredData}</script>`}
</svelte:head>

{#if isWordleLengthPage}
        <main class="min-h-screen bg-slate-50 dark:bg-slate-800/30">
                <section class="bg-gradient-to-r from-teal-600 to-teal-500 py-16 shadow-lg">
                        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <Breadcrumbs />
                                <div class="mt-6 text-center">
                                        <p class="text-sm font-bold uppercase tracking-[0.28em] text-teal-100">
                                                {config.eyebrow}
                                        </p>
                                        <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
                                                {config.title}
                                        </h1>
                                        <p class="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/90 sm:text-2xl">
                                                {config.description}
                                        </p>
                                        <div class="mt-8 flex flex-wrap justify-center gap-3 text-sm font-bold text-teal-100">
                                                {#each config.chips as chip}
                                                        <span class="rounded-full border border-white/20 bg-white/10 px-4 py-2">
                                                                {chip}
                                                        </span>
                                                {/each}
                                        </div>
                                        {#if config.cta}
                                                <a
                                                        class="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-teal-700 shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                                                        href={config.cta.href}
                                                >
                                                        {config.cta.label}
                                                </a>
                                        {/if}
                                </div>
                        </div>
                </section>

                <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <noscript>
                                <div class="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                                        <p class="text-sm font-bold uppercase tracking-[0.24em] text-teal-600">
                                                JavaScript disabled
                                        </p>
                                        <p class="mt-3 text-base leading-7 text-slate-600">
                                                {config.title} works best with JavaScript enabled. You can still use the
                                                guide, FAQ, and strategy sections below without the interactive solver.
                                        </p>
                                </div>
                        </noscript>
                        <WordlebotWasmClient config={config.appConfig} />
                </div>

                <div class="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
                        <div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
                                <FAQSection class="py-0" title={config.faqTitle} faqs={config.faqs} />
                        </div>
                </div>

                <section class="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
                        <div class="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
                                <h2 class="text-center text-3xl font-black tracking-tight text-slate-900">
                                        {config.howToTitle}
                                </h2>
                                <div class="mt-10 grid gap-8 md:grid-cols-3">
                                        {#each config.howToSteps as step, index}
                                                <div class="space-y-4 rounded-2xl bg-teal-50 p-6">
                                                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-black text-teal-700">
                                                                {index + 1}
                                                        </div>
                                                        <h3 class="text-xl font-bold text-slate-900">{step.name}</h3>
                                                        <p class="leading-7 text-slate-600">{step.text}</p>
                                                </div>
                                        {/each}
                                </div>                                        </div>

                </section>

                <div class="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
                        <div class="pt-4">
                                {#if solverArticleKey && ARTICLE_CONTENT[solverArticleKey]}
                                        <StaticArticle content={ARTICLE_CONTENT[solverArticleKey]} />
                                {/if}
                        </div>
                </div>
        </main>
{:else if isCanuckleFamilyPage}
        <main class="min-h-screen bg-[linear-gradient(180deg,#fff8f7_0%,#ffffff_42%,#f8fafc_100%)]">
                <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                        <Breadcrumbs />

                        <section class="overflow-hidden rounded-[2rem] border border-rose-100 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_34%),linear-gradient(135deg,#ffffff_0%,#fff5f5_40%,#f8fafc_100%)] p-6 shadow-[0_28px_80px_rgba(239,68,68,0.09)] sm:p-8">
                                <nav class="mb-6 flex flex-wrap gap-2" aria-label="Canuckle pages">
                                        {#each canuckleTabs as tab}
                                                <a
                                                        class={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                                                tab.key === activeCanuckleTab
                                                                        ? 'border-rose-300 bg-rose-600 text-white shadow-sm'
                                                                        : 'border-rose-200 bg-white/80 text-rose-700 hover:border-rose-300 hover:bg-rose-50'
                                                        }`}
                                                        href={tab.href}
                                                >
                                                        {tab.label}
                                                </a>
                                        {/each}
                                </nav>

                                <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                                        <div>
                                                <p class="inline-flex rounded-full border border-rose-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                                                        {config.eyebrow}
                                                </p>
                                                <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
                                                        {displayTitle}
                                                </h1>
                                                <p class="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                                                        {config.description}
                                                </p>
                                                <div class="mt-6 flex flex-wrap gap-3">
                                                        {#if config.cta}
                                                                <a
                                                                        class="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:bg-rose-500"
                                                                        href={config.cta.href}
                                                                >
                                                                        {config.cta.label}
                                                                </a>
                                                        {/if}
                                                        {#if activeCanuckleTab !== 'solver'}
                                                                <a
                                                                        class="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-5 py-3 text-sm font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                                                                        href={getCanucklePagePath('solver')}
                                                                >
                                                                        Open Canuckle solver
                                                                </a>
                                                        {/if}
                                                </div>
                                        </div>

                                        </div>
                        </section>
                </div>

                <div class="pb-10">
                        <noscript>
                                <div class="mx-auto max-w-5xl rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-sm">
                                        <p class="text-sm font-bold uppercase tracking-[0.24em] text-rose-600">
                                                JavaScript disabled
                                        </p>
                                        <p class="mt-3 text-base leading-7 text-slate-600">
                                                {config.title} works best with JavaScript enabled. The page guide and FAQ
                                                remain available even without the interactive solver.
                                        </p>
                                </div>
                        </noscript>
                        <WordlebotWasmClient config={config.appConfig} />
                </div>

                <div class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
                        <div class="pt-10">
                                {#if isCanuckleSolverPage && solverArticleKey && ARTICLE_CONTENT[solverArticleKey]}
                                        <StaticArticle content={ARTICLE_CONTENT[solverArticleKey]} />
                                {/if}
                        </div>

                        <div class="rounded-[2rem] border border-rose-100 bg-white p-2 shadow-[0_24px_70px_rgba(239,68,68,0.08)]">
                                <FAQSection class="py-0" title={config.faqTitle} faqs={config.faqs} />
                        </div>

                </div>
        </main>
{:else}
        <main class="min-h-screen bg-[linear-gradient(180deg,#f7fbf8_0%,#ffffff_36%,#f7f4eb_100%)]">
                <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                        <Breadcrumbs />

                        <section class="mb-8 overflow-hidden rounded-[2rem] border border-teal-100 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34%),linear-gradient(135deg,#ffffff_0%,#f7fbf8_45%,#f8f1e5_100%)] p-6 shadow-[0_28px_80px_rgba(16,185,129,0.08)] sm:p-8">
                                <div class="flex flex-wrap items-start justify-between gap-6">
                                        <div class="max-w-3xl">
                                                <p class="inline-flex rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                                                        {config.eyebrow}
                                                </p>
                                                <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                                                        {config.title}
                                                </h1>
                                                <p class="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                                                        {config.description}
                                                </p>

                                                {#if config.cta}
                                                        <a
                                                                class="mt-5 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50"
                                                                href={config.cta.href}
                                                        >
                                                                {config.cta.label}
                                                        </a>
                                                {/if}
                                        </div>

                                        <div class="flex flex-wrap gap-2">
                                                {#each config.chips as chip}
                                                        <span class="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700">
                                                                {chip}
                                                        </span>
                                                {/each}
                                        </div>
                                </div>
                        </section>

                        <section class="grid gap-4 md:grid-cols-3">
                                {#each config.howToSteps as step, index}
                                        <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                                <p class="text-sm font-bold uppercase tracking-[0.24em] text-teal-600">
                                                        Step {index + 1}
                                                </p>
                                                <h2 class="mt-3 text-xl font-black text-slate-900">{step.name}</h2>
                                                <p class="mt-3 leading-7 text-slate-600">{step.text}</p>
                                        </article>
                                {/each}
                        </section>
                </div>

                <div class="pb-10">
                        <noscript>
                                <div class="mb-8 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                                        <p class="text-sm font-bold uppercase tracking-[0.24em] text-teal-600">
                                                JavaScript disabled
                                        </p>
                                        <p class="mt-3 text-base leading-7 text-slate-600">
                                                {config.title} works best with JavaScript enabled. You can still read the
                                                overview, FAQ, and page sections below.
                                        </p>
                                </div>
                        </noscript>
                        <WordlebotWasmClient config={config.appConfig} />
                </div>

                <div class="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
                        <div class="pt-10">
                                {#if solverArticleKey && ARTICLE_CONTENT[solverArticleKey]}
                                        <StaticArticle content={ARTICLE_CONTENT[solverArticleKey]} />
                                {/if}
                        </div>

                        <div class="rounded-[2rem] border border-slate-200 bg-white/85 p-2 shadow-[0_24px_70px_rgba(148,163,184,0.12)]">
                                <FAQSection class="py-0" title={config.faqTitle} faqs={config.faqs} />
                        </div>

                </div>
        </main>
{/if}
