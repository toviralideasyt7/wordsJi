<script lang="ts">
        import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
        import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
        import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import AnswerArticle from '$lib/components/AnswerArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
        import type { NerdleModeData } from '$lib/nerdle-answers';
        import {
                PRESTON_HAYES_AUTHOR_DESCRIPTION,
                PRESTON_HAYES_AUTHOR_IMAGE,
                PRESTON_HAYES_AUTHOR_NAME
        } from '$lib/authors';
        import { PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES, stripStructuredDataTypes } from '$lib/seo';

        let { data } = $props();

        let h1Title = $derived(`Nerdle Answer Today ( ${data.formattedDate} )`);
        let modes = $derived((data.answerData?.modes ?? []) as NerdleModeData[]);
        const publishedDate = $derived(
                data.answerData?.date ? `${data.answerData.date}T00:00:00Z` : null
        );
        const noscriptAnswer = $derived.by(() =>
                (data.answerData?.modes ?? [])
                        .flatMap((mode: NerdleModeData) =>
                                mode.answers.map((answerEntry) => `${mode.name}: ${answerEntry.answer}`)
                        )
                        .join(' | ')
        );
        const cleanedSchemas = $derived(
                stripStructuredDataTypes(data.schemas, PAGE_LEVEL_DUPLICATE_SCHEMA_TYPES)
        );

        function getTileStyle(_char: string, index: number): string {
                const background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                const shadow = '0 4px 20px rgba(16, 185, 129, 0.4)';
                return `animation-delay: ${index * 100}ms; background: ${background}; box-shadow: ${shadow};`;
        }
</script>

<svelte:head>
        <title>{data.meta.title}</title>
        <meta name="description" content={data.meta.description} />
        <meta name="keywords" content={data.meta.keywords} />
        <link rel="canonical" href={data.meta.canonical} />
        <meta property="og:title" content={data.meta.title} />
        <meta property="og:description" content={data.meta.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={data.meta.canonical} />
        <meta property="og:image" content="https://wordsolverx.com/images/nerdle-answer-today.webp" />
        <meta property="og:site_name" content="WordSolverX" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.meta.title} />
        <meta name="twitter:description" content={data.meta.description} />
        <meta name="twitter:image" content="https://wordsolverx.com/images/nerdle-answer-today.webp" />
        {#if cleanedSchemas}
                {@html `<script type="application/ld+json">${cleanedSchemas}</script>`}
        {/if}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Nerdle" answer={noscriptAnswer || null} />

<section class="min-h-screen bg-slate-50 text-slate-900">
        <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <div class="space-y-8">
                        <section class="text-center">
                                <p class="text-sm font-medium uppercase tracking-[0.22em] text-teal-700">Today&apos;s Puzzle</p>
                                <h1 class="mt-3 text-3xl font-black leading-tight sm:text-4xl">{h1Title}</h1>
                                <p class="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                                        Today's Nerdle equations across all modes — Classic, Mini, Micro, and the rest.
                                        Check your work or jump to the solver.
                                </p>
                                <div class="mt-5 flex flex-wrap items-center justify-center gap-3">
                                        <div class="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-4 py-2 shadow-sm">
                                                <span class="text-slate-600">Classic Puzzle #</span>
                                                <span class="font-bold text-teal-700">
                                                        {Number.isFinite(data.answerData.classicPuzzleNumber) ? data.answerData.classicPuzzleNumber : 'N/A'}
                                                </span>
                                        </div>
                                        <a
                                                href="/nerdle-solver"
                                                class="inline-flex items-center rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-colors hover:bg-teal-500"
                                        >
                                                Use Nerdle Solver
                                        </a>
                                </div>
                        </section>

                        {#if modes.length > 0}
                                <div class="space-y-8">
                                        {#each modes as mode}
                                                <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                                        <div class="mb-6">
                                                                <h2 class="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                                                        Nerdle {mode.name} Answer for {data.formattedDate}
                                                                </h2>
                                                                <p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                                                                        {mode.description}. {mode.answers.length > 1
                                                                                ? `This mode has ${mode.answers.length} answers today.`
                                                                                : 'This mode has one answer today.'}
                                                                </p>
                                                        </div>

                                                        {#if mode.answers.length > 0}
                                                                <div class="space-y-6">
                                                                        {#each mode.answers as answerEntry, index}
                                                                                <div class="rounded-xl border border-slate-200 p-4">
                                                                                        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                                                                                                <p class="text-sm font-medium text-slate-700">
                                                                                                        Puzzle #{answerEntry.puzzleNumber}
                                                                                                </p>
                                                                                                <button
                                                                                                        type="button"
                                                                                                        data-copy-value={answerEntry.answer}
                                                                                                        data-copy-default="Copy Answer"
                                                                                                        data-copy-success="Copied"
                                                                                                        class="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
                                                                                                >
                                                                                                        Copy Answer
                                                                                                </button>
                                                                                        </div>

                                                                                        <div class="mb-4 flex flex-wrap justify-center gap-2 md:gap-3">
                                                                                                {#each answerEntry.answer.split('') as char, charIndex}
                                                                                                        <div
                                                                                                                class="flex h-12 w-10 items-center justify-center rounded-lg text-lg font-bold text-white transition-all duration-300 hover:scale-105 sm:h-14 sm:w-12 sm:text-2xl"
                                                                                                                style={getTileStyle(char, charIndex)}
                                                                                                        >
                                                                                                                {char === '_' ? '?' : char}
                                                                                                        </div>
                                                                                                {/each}
                                                                                        </div>

                                                                                        <p class="text-center text-sm text-slate-500">
                                                                                                {answerEntry.type === 'hint' ? 'Hints:' : 'Answer:'} <span class="font-semibold text-slate-800">{answerEntry.answer}</span>
                                                                                        </p>
                                                                                </div>
                                                                        {/each}
                                                                </div>
                                                        {:else}
                                                                <p class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                                                        No answer stored for this mode yet.
                                                                </p>
                                                        {/if}
                                                </section>
                                        {/each}
                                </div>
                        {:else}
                                <section class="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-900 shadow-sm">
                                        <h2 class="text-xl font-bold">No Nerdle mode data is available yet.</h2>
                                        <p class="mt-2 text-sm sm:text-base">
                                                The page will show all modes as soon as the latest Nerdle data is available in the worker.
                                        </p>
                                </section>
                        {/if}

                        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                <h2 class="text-2xl font-black tracking-tight text-slate-900">More Nerdle Help</h2>
                                <div class="mt-4 grid gap-4 sm:grid-cols-2">
                                        <a
                                                href="/nerdle-solver"
                                                class="rounded-2xl border border-teal-200 bg-teal-50 p-5 transition-colors hover:bg-teal-100"
                                        >
                                                <h3 class="text-lg font-bold text-teal-900">Nerdle Solver</h3>
                                                <p class="mt-2 text-sm leading-6 text-teal-800">
                                                        Use the solver when you want help narrowing equations without directly revealing the answer first.
                                                </p>
                                        </a>
                                        <a
                                                href={`/nerdle-archive?date=${data.answerData.date}`}
                                                class="rounded-2xl border border-violet-200 bg-violet-50 p-5 transition-colors hover:bg-violet-100"
                                        >
                                                <h3 class="text-lg font-bold text-violet-900">Nerdle Archive</h3>
                                                <p class="mt-2 text-sm leading-6 text-violet-800">
                                                        Check older Nerdle answers by date and browse past mode history from the archive page.
                                                </p>
                                        </a>
                                </div>
                        </section>

                        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                <h2 class="text-2xl font-black tracking-tight text-slate-900">Nerdle Answer Today FAQs</h2>
                                <div class="mt-6 space-y-4">
                                        {#each data.faqItems as faq}
                                                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                        <h3 class="text-lg font-bold text-slate-900">{faq.question}</h3>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{faq.answer}</p>
                                                </div>
                                        {/each}
                                </div>
                        </section>

                        <div class="mt-12">
                                <AnswerArticle content={ARTICLE_CONTENT['nerdle-answer-today']}
                                        verified={data.answerData.date}
                                />
                        </div>

<AuthorCard
                                name={PRESTON_HAYES_AUTHOR_NAME}
                                image={PRESTON_HAYES_AUTHOR_IMAGE}
                                description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
                        />

      <InternalLinkSection currentGame="Nerdle" />

                        <article class="space-y-8">
                                <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                                        <h2 class="text-2xl font-black tracking-tight text-slate-900">Playing Nerdle Daily</h2>
                                        <p class="mt-4 text-base leading-7 text-slate-600">
                                                Nerdle is Wordle for math people. You get six guesses to find a valid equation — digits, operators, equals sign, the works. Created by Richard Mann in February 2022 after he watched his daughter play Wordle, it now has Classic, Mini, Micro, Midi, Maxi, Quad, Speed, and Instant modes. This page tracks them all.
                                        </p>
                                        <p class="mt-3 text-base leading-7 text-slate-600">
                                                The equals sign is usually in position 5, 6, or 7. The right side is always a single number. No parentheses allowed, so multiplication and division always happen first — same PEMDAS rules you learned in school.
                                        </p>
                                </section>

                                <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                                        <h2 class="text-2xl font-black tracking-tight text-slate-900">Tips That Actually Help</h2>
                                        <div class="mt-4 space-y-4">
                                                <div class="rounded-2xl bg-slate-50 p-5">
                                                        <h3 class="text-base font-bold text-slate-900">Openers that use six different digits</h3>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600">56+23=79 tests digits 2, 3, 5, 6, 7, and 9 in one shot. 9*8-7=65 covers five digits plus multiplication and subtraction. Avoid 12+12=24 — it only tests three digits and wastes a guess.</p>
                                                </div>
                                                <div class="rounded-2xl bg-slate-50 p-5">
                                                        <h3 class="text-base font-bold text-slate-900">The equals sign position is your biggest lever</h3>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600">If your first guess puts = in position 6 and it goes dark, the answer uses position 5 or 7. That cuts roughly a third of valid structures immediately. Get this right early and the rest falls into place.</p>
                                                </div>
                                                <div class="rounded-2xl bg-slate-50 p-5">
                                                        <h3 class="text-base font-bold text-slate-900">Work backward from the result</h3>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600">If the result ends in 0, the left side probably involves multiplication by 5 (with an even number) or by 10. If it ends in 5, look for odd multiples. The result digit narrows the left-side options more than most players realize.</p>
                                                </div>
                                                <div class="rounded-2xl bg-slate-50 p-5">
                                                        <h3 class="text-base font-bold text-slate-900">3+8=11 and 8+3=11 are different answers</h3>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600">Nerdle cares about position. Swapped operands show purple (right digit, wrong spot). And remember: every result must be a whole number — 7/3=2.33 gets rejected. Mix up your equation structures across guesses so you are not stuck testing the same pattern three times.</p>
                                                </div>
                                        </div>
                                </section>

                                <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                                        <h2 class="text-2xl font-black tracking-tight text-slate-900">Nerdle FAQ</h2>
                                        <div class="mt-4 divide-y divide-slate-100">
                                                <details class="group py-4 first:pt-0 last:pb-0">
                                                        <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
                                                                When does Nerdle reset?
                                                                <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                                        </summary>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600">Midnight JST. Each mode has its own puzzle number that increments daily. Classic #{data.answerData.classicPuzzleNumber} is today's main puzzle.</p>
                                                </details>
                                                <details class="group py-4 first:pt-0 last:pb-0">
                                                        <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
                                                                How many modes does Nerdle have?
                                                                <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                                        </summary>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600">Eight: Classic (8 chars), Mini, Micro (6 chars), Midi (10), Maxi (11), Quad (four at once), Speed (timed), and Instant (one guess). Each has its own daily answer.</p>
                                                </details>
                                                <details class="group py-4 first:pt-0 last:pb-0">
                                                        <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
                                                                Is there a Nerdle solver I can use?
                                                                <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                                        </summary>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600">Yes — the <a href="/nerdle-solver" class="font-semibold text-teal-600 underline underline-offset-2 hover:text-teal-500">Nerdle solver</a> on this site lets you enter your guesses and color feedback to see remaining valid equations.</p>
                                                </details>
                                                <details class="group py-4 first:pt-0 last:pb-0">
                                                        <summary class="flex cursor-pointer items-center justify-between font-bold text-slate-900">
                                                                Can I check past Nerdle answers?
                                                                <svg class="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                                        </summary>
                                                        <p class="mt-2 text-sm leading-6 text-slate-600">The <a href="/nerdle-archive" class="font-semibold text-teal-600 underline underline-offset-2 hover:text-teal-500">Nerdle archive</a> has every past answer searchable by date and mode.</p>
                                                </details>
                                        </div>
                                </section>
                        </article>
                </div>
        </div>
</section>
