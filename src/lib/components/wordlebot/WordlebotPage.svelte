<script lang="ts">
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import FAQSection from '$lib/components/FAQSection.svelte';
        import AuthorCard from '$lib/components/AuthorCard.svelte';
        import ArticleAttribution from '$lib/components/ArticleAttribution.svelte';
        import StaticArticle from '$lib/components/StaticArticle.svelte';
        import WordlebotWasmClient from '$lib/components/wordlebot/WordlebotWasmClient.svelte';
        import { getWordlebotStructuredData } from '$lib/wordlebot-wasm/route-config';
        import { getWordlebotGame } from '$lib/wordlebot-wasm/game-config';
        import { getCanucklePagePath } from '$lib/wordlebot-wasm/routes';
        import type { WordlebotPageConfig } from '$lib/wordlebot-wasm/types';
        import { ARTICLE_CONTENT } from '$lib/content/registry';
        import {
                PRESTON_HAYES_AUTHOR_DESCRIPTION,
                PRESTON_HAYES_AUTHOR_IMAGE,
                PRESTON_HAYES_AUTHOR_NAME
        } from '$lib/authors';

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

        /**
         * The solver card's own heading. It names the tool rather than repeating the
         * <h1>: the page title carries the search intent, this one tells you what the
         * box you are about to use does.
         */
        const MULTI_BOARD_GAMES = ['dordle', 'quordle', 'octordle'];

        let solverHeading = $derived.by(() => {
                const app = config.appConfig;
                if (app.pageType !== 'solver') return config.title;
                if (app.game === 'wordle') return `${app.wordLength ?? 5}-Letter Wordle Solver`;
                return `${getWordlebotGame(app.game).name} Solver`;
        });

        let solverHint = $derived.by(() => {
                const app = config.appConfig;
                return app.pageType === 'solver' && MULTI_BOARD_GAMES.includes(app.game)
                        ? 'Type a guess, match the clue tiles on every board, then review the ranked answers.'
                        : 'Type a guess, match the clue tiles to your puzzle, then review the ranked answers.';
        });

        /** The date the solver datasets were last rolled forward, from the loader. */
        let dataUpdated = $derived(config.dataUpdated ?? null);

        let solverArticleContent = $derived(
                solverArticleKey ? ARTICLE_CONTENT[solverArticleKey] : undefined
        );
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

<!--
  One shell for all three page families. The previous version had a separate
  gradient hero per family, a `grid lg:grid-cols-[1.2fr_0.8fr]` on the Canuckle
  panel with only one child (so the second column was permanently empty), and
  the solver mounted bare between two sections. Now the page is: heading block,
  the solver in a framed card with its own header and reserved height, the
  how-to steps, the article, the FAQ, and the author/corrections block.
-->
<div class="bg-slate-50 dark:bg-slate-900/40">
        <div class="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
                <Breadcrumbs />

                {#if isCanuckleFamilyPage}
                        <nav class="mb-5 flex flex-wrap gap-2" aria-label="Canuckle pages">
                                {#each canuckleTabs as tab}
                                        <a
                                                class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${tab.key ===
                                                activeCanuckleTab
                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100'}"
                                                href={tab.href}
                                                aria-current={tab.key === activeCanuckleTab ? 'page' : undefined}
                                        >
                                                {tab.label}
                                        </a>
                                {/each}
                        </nav>
                {/if}

                <header class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p class="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                                {config.eyebrow}
                        </p>
                        <h1 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                                {displayTitle}
                        </h1>
                        <p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
                                {config.description}
                        </p>

                        {#if config.chips.length > 0}
                                <ul class="mt-5 flex flex-wrap gap-2">
                                        {#each config.chips as chip}
                                                <li
                                                        class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600"
                                                >
                                                        {chip}
                                                </li>
                                        {/each}
                                </ul>
                        {/if}

                        {#if config.cta}
                                <p class="mt-5 text-sm">
                                        <a
                                                class="font-semibold text-teal-700 underline-offset-4 hover:underline"
                                                href={config.cta.href}
                                        >
                                                {config.cta.label}
                                        </a>
                                </p>
                        {/if}
                </header>

                {#if config.intentSplit}
                        <!-- Intent split: answer-seekers go to the daily page, solvers stay. -->
                        <div class="mt-6 rounded-2xl border border-teal-200 bg-teal-50 px-5 py-4">
                                <p class="text-sm leading-relaxed text-slate-700">
                                        {config.intentSplit.label}
                                        <a
                                                class="font-bold text-teal-700 underline-offset-4 hover:underline"
                                                href={config.intentSplit.href}
                                        >
                                                {config.intentSplit.linkText}
                                        </a>
                                </p>
                        </div>
                {/if}

                <!-- Solver card: the framing is the page's, the engine inside is untouched. -->
                <section
                        class="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                        aria-labelledby="solver-heading"
                >
                        <div
                                class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 px-5 py-4"
                        >
                                <div class="min-w-0">
                                        <h2 id="solver-heading" class="text-lg font-extrabold tracking-tight text-slate-900">
                                                {solverHeading}
                                        </h2>
                                        <p class="mt-0.5 text-sm text-slate-500">{solverHint}</p>
                                </div>
                                <p
                                        class="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800"
                                >
                                        Runs in your browser
                                </p>
                        </div>

                        <div class="bg-slate-50/60 px-3 py-4 sm:px-5 sm:py-6">
                                <WordlebotWasmClient config={config.appConfig} />
                        </div>

                        <noscript>
                                <p
                                        class="border-t border-slate-200 px-5 py-3 text-sm text-slate-600"
                                >
                                        The interactive solver needs JavaScript. The instructions, FAQ, and guide below
                                        work without it.
                                </p>
                        </noscript>
                </section>

                <section class="mt-8" aria-labelledby="solver-steps-heading">
                        <h2
                                id="solver-steps-heading"
                                class="text-2xl font-extrabold tracking-tight text-slate-900"
                        >
                                {config.howToTitle}
                        </h2>
                        <ol class="mt-5 grid gap-4 sm:grid-cols-3">
                                {#each config.howToSteps as step, index}
                                        <li class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                                <p
                                                        class="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white"
                                                        aria-hidden="true"
                                                >
                                                        {index + 1}
                                                </p>
                                                <h3 class="mt-3 font-bold text-slate-900">{step.name}</h3>
                                                <p class="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                                        </li>
                                {/each}
                        </ol>
                </section>

                {#if solverArticleContent}
                        <!-- Same presentation tier as the -answer-today pages (attribution
                             line, large type scale, scroll-reveal) but rendered from the
                             two data-free pieces. <AnswerArticle> is not used here: it
                             statically imports answer-deep-dives.ts, and none of the solver
                             articles have entries in it, so every solver page would preload
                             ~31 KB of daily-answer content it never renders. -->
                        <div class="mt-10">
                                <ArticleAttribution verified={dataUpdated} />
                                <StaticArticle
                                        content={solverArticleContent}
                                        containerClass="w-full max-w-none"
                                        scale="large"
                                        motion={true}
                                />
                        </div>
                {/if}

                <div class="mt-10 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
                        <FAQSection class="py-0" title={config.faqTitle} faqs={config.faqs} />
                </div>

                <div class="mt-10">
                        <AuthorCard
                                name={PRESTON_HAYES_AUTHOR_NAME}
                                image={PRESTON_HAYES_AUTHOR_IMAGE}
                                description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
                        />
                </div>

                <p class="mt-6 text-sm text-slate-500">
                        Spotted a wrong word or a broken suggestion?
                        <a href="/contact" class="font-semibold text-teal-700 underline-offset-2 hover:underline"
                                >Report it</a
                        >
                        and see
                        <a
                                href="/editorial-policy"
                                class="font-semibold text-teal-700 underline-offset-2 hover:underline"
                                >how corrections work</a
                        >.
                </p>
        </div>
</div>
