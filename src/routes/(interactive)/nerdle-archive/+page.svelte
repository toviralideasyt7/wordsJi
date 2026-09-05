<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import { onMount } from 'svelte';
        import { fetchArchivePayload } from '$lib/archive-client';
        import { getNerdleTodayDateKey } from '$lib/nerdle';
        import type { NerdleAllModeAnswerData } from '$lib/nerdle-answers';

        interface RecentArchiveEntry {
                date: string;
                puzzleNumber: number | null;
                classicAnswer: string | null;
                modeCount: number;
        }

        let { data }: {
                data: {
                        recent: RecentArchiveEntry[];
                        totalEntries: number;
                        todayPuzzleNumber: number | null;
                        fetchError: string | null;
                };
        } = $props();

        const serverRecent = $derived(data?.recent ?? []);
        const serverTodayPuzzleNumber = $derived(data?.todayPuzzleNumber ?? null);
        const serverFetchError = $derived(data?.fetchError ?? null);

        const NERDLE_START_UTC_MS = Date.UTC(2022, 0, 20);
        const DAY_MS = 24 * 60 * 60 * 1000;
        const MONTH_NAMES = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
        ];
        const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const META = {
                title: 'Nerdle Archive - All Modes Answers by Date',
                description:
                        'Browse stored Nerdle answers by date for all modes: Classic, Micro, Mini, Midi, Maxi, Mini Bi, Quad, Speed, and Instant.',
                keywords:
                        'nerdle archive, nerdle all modes archive, nerdle classic micro mini midi maxi quad speed instant answers, nerdle previous answers',
                canonical: 'https://wordsolverx.com/nerdle-archive'
        };
        const SCHEMAS = JSON.stringify([
                {
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        name: 'Nerdle Archive',
                        description: META.description,
                        url: META.canonical
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'BreadcrumbList',
                        itemListElement: [
                                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://wordsolverx.com' },
                                { '@type': 'ListItem', position: 2, name: 'Archive', item: 'https://wordsolverx.com/archive' },
                                { '@type': 'ListItem', position: 3, name: 'Nerdle Archive', item: META.canonical }
                        ]
                },
                {
                        '@context': 'https://schema.org',
                        '@type': 'WebPage',
                        name: META.title,
                        description: META.description,
                        url: META.canonical,
                        image: 'https://wordsolverx.com/wordsolverx.webp'
                }
        ]);

        interface NerdleArchivePayload {
                selectedDateKey: string | null;
                selectedNerdle: NerdleAllModeAnswerData | null;
                todayDateKey: string;
        }

        function formatDateKey(date: Date): string {
                return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10);
        }

        function parseDateKey(dateKey: string | null): Date | null {
                if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
                        return null;
                }

                const [yearString, monthString, dayString] = dateKey.split('-');
                const year = Number(yearString);
                const month = Number(monthString) - 1;
                const day = Number(dayString);
                const utc = Date.UTC(year, month, day);
                const parsed = new Date(utc);
                if (
                        Number.isNaN(utc) ||
                        parsed.getUTCFullYear() !== year ||
                        parsed.getUTCMonth() !== month ||
                        parsed.getUTCDate() !== day
                ) {
                        return null;
                }

                return new Date(year, month, day);
        }

        function isNerdleDate(date: Date): boolean {
                const utcDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
                return utcDay >= NERDLE_START_UTC_MS;
        }

        function getPuzzleNumber(date: Date): number {
                const utcDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
                return Math.floor((utcDay - NERDLE_START_UTC_MS) / DAY_MS) + 1;
        }

        function tileStyle(char: string, index: number): string {
                const isOperator = ['+', '-', '*', '/', '='].includes(char);
                const isEquals = char === '=';
                const background = isEquals
                        ? 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)'
                        : isOperator
                                ? 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)'
                                : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)';
                return `width: 2.5rem; height: 3rem; font-size: 1.25rem; animation-delay: ${index * 50}ms; background: ${background};`;
        }

        function getTodayDate(): Date {
                return parseDateKey(getNerdleTodayDateKey()) ?? new Date();
        }

        let selectedDate = $state(new Date());
        let currentMonth = $state(new Date());
        let selectedRecord = $state<NerdleAllModeAnswerData | null>(null);
        let selectedModeId = $state('classic');
        let copiedToken = $state<string | null>(null);
        let isLoading = $state(false);
        let errorMessage = $state<string | null>(null);

        let selectedMode = $derived(
                selectedRecord?.modes.find((mode) => mode.id === selectedModeId) ??
                        (selectedRecord?.modes.length ? selectedRecord.modes[0] : null)
        );

        $effect(() => {
                if (selectedRecord?.modes.length && !selectedRecord.modes.some((mode) => mode.id === selectedModeId)) {
                        selectedModeId = selectedRecord.modes[0].id;
                }
        });

        function isFutureDate(date: Date): boolean {
                return formatDateKey(date) > formatDateKey(getTodayDate());
        }

        function isSelected(day: number): boolean {
                return (
                        selectedDate.getFullYear() === currentMonth.getFullYear() &&
                        selectedDate.getMonth() === currentMonth.getMonth() &&
                        selectedDate.getDate() === day
                );
        }

        function isToday(day: number): boolean {
                const todayDate = getTodayDate();
                return (
                        todayDate.getFullYear() === currentMonth.getFullYear() &&
                        todayDate.getMonth() === currentMonth.getMonth() &&
                        todayDate.getDate() === day
                );
        }

        function isCurrentMonthOrPast(): boolean {
                const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                const todayDate = getTodayDate();
                const todayMonthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
                return monthStart.getTime() < todayMonthStart.getTime();
        }

        async function fetchAnswer(date: Date): Promise<void> {
                const dateKey = formatDateKey(date);
                isLoading = true;
                errorMessage = null;

                try {
                        const payload = await fetchArchivePayload<NerdleArchivePayload>('nerdle', dateKey);
                        selectedRecord = payload.selectedNerdle;
                        if (!selectedRecord) {
                                errorMessage = `No answer stored for ${dateKey}.`;
                        }
                } catch {
                        errorMessage = 'Failed to load Nerdle data.';
                        selectedRecord = null;
                } finally {
                        isLoading = false;
                }
        }

        async function handleSelectDate(date: Date): Promise<void> {
                if (!isNerdleDate(date) || isFutureDate(date)) {
                        return;
                }

                selectedDate = date;
                await fetchAnswer(date);
        }

        async function goToPrev(): Promise<void> {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 1);
                if (isNerdleDate(prev)) {
                        await handleSelectDate(prev);
                }
        }

        async function goToNext(): Promise<void> {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 1);
                if (!isFutureDate(next)) {
                        await handleSelectDate(next);
                }
        }

        async function goToToday(): Promise<void> {
                await handleSelectDate(getTodayDate());
        }

        function prevMonth(): void {
                currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        }

        function nextMonth(): void {
                if (!isCurrentMonthOrPast()) {
                        return;
                }
                currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        }

        async function copyText(text: string, token: string): Promise<void> {
                await navigator.clipboard.writeText(text);
                copiedToken = token;
                setTimeout(() => {
                        if (copiedToken === token) {
                                copiedToken = null;
                        }
                }, 1400);
        }

        async function copyAllModeAnswers(): Promise<void> {
                if (!selectedMode || selectedMode.answers.length === 0) {
                        return;
                }
                await copyText(
                        selectedMode.answers.map((entry) => entry.answer).join('\n'),
                        `all-${selectedMode.id}`
                );
        }

        let daysInMonth = $derived(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate());
        let firstDayOfMonth = $derived(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay());
        let monthLabel = $derived(`${MONTH_NAMES[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`);

        onMount(async () => {
                const todayDate = getTodayDate();
                const params = new URLSearchParams(window.location.search);
                const dateParam = params.get('date');
                const fromUrl = parseDateKey(dateParam);
                const safeDate = fromUrl && isNerdleDate(fromUrl) && !isFutureDate(fromUrl) ? fromUrl : todayDate;

                if (window.location.search || window.location.hash) {
                        window.history.replaceState(window.history.state, '', window.location.pathname);
                }

                selectedDate = safeDate;
                currentMonth = new Date(safeDate.getFullYear(), safeDate.getMonth(), 1);
                await fetchAnswer(safeDate);
        });
</script>

<svelte:head>
        <title>{META.title}</title>
        <meta name="description" content={META.description} />
        <meta name="keywords" content={META.keywords} />
        <link rel="canonical" href={META.canonical} />
        <meta property="og:title" content={META.title} />
        <meta property="og:description" content={META.description} />
        <meta property="og:url" content={META.canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="WordSolverX" />
        <meta property="og:image" content="https://wordsolverx.com/og/nerdle-archive.svg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={META.title} />
        <meta name="twitter:description" content={META.description} />
        <meta name="twitter:image" content="https://wordsolverx.com/og/nerdle-archive.svg" />
        {@html `<script type="application/ld+json">${SCHEMAS}</script>`}
</svelte:head>

<section class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 text-slate-900">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <header class="mb-8">
                        <h1 class="text-3xl sm:text-4xl font-black">Nerdle Archive</h1>
                        <p class="text-slate-600 mt-2">Browse all stored Nerdle all-mode answers by date.</p>
                </header>

                <section class="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                        <div class="flex items-start justify-between gap-4 mb-3">
                                <div>
                                        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-400">Recent Nerdle Answers</p>
                                        <h2 class="mt-1 text-2xl font-black text-slate-900 dark:text-slate-50">Last {serverRecent.length} Classic Equations</h2>
                                        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                                                The most recent Nerdle Classic answers, baked into this page at build time so the list loads with the HTML and works without JavaScript. Use the calendar below to pick any other date and reveal every mode.
                                        </p>
                                </div>
                                {#if serverTodayPuzzleNumber !== null}
                                        <span class="hidden sm:inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                                                Latest puzzle #{serverTodayPuzzleNumber}
                                        </span>
                                {/if}
                        </div>

                        {#if serverFetchError}
                                <p class="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                                        Some entries could not be loaded at build time. The calendar below still works for any specific date.
                                </p>
                        {/if}

                        {#if serverRecent.length === 0}
                                <p class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                                        No stored entries are available right now. The interactive calendar below will load any specific date on click.
                                </p>
                        {:else}
                                <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                                <thead class="bg-slate-50 dark:bg-slate-900">
                                                        <tr>
                                                                <th scope="col" class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Puzzle #</th>
                                                                <th scope="col" class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                                                                <th scope="col" class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Classic Equation</th>
                                                                <th scope="col" class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Modes stored</th>
                                                        </tr>
                                                </thead>
                                                <tbody class="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
                                                        {#each serverRecent as entry}
                                                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                                        <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">
                                                                                #{entry.puzzleNumber ?? '—'}
                                                                        </td>
                                                                        <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                                                                {entry.date}
                                                                        </td>
                                                                        <td class="px-4 py-3 whitespace-nowrap">
                                                                                {#if entry.classicAnswer}
                                                                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                                                                                                {entry.classicAnswer}
                                                                                        </span>
                                                                                {:else}
                                                                                        <span class="text-xs text-slate-400">not stored</span>
                                                                                {/if}
                                                                        </td>
                                                                        <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                                                {entry.modeCount > 0 ? entry.modeCount : '—'}
                                                                        </td>
                                                                </tr>
                                                        {/each}
                                                </tbody>
                                        </table>
                                </div>
                                <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                        Showing {serverRecent.length} of {serverRecent.length} baked-in recent answers. Pick any other date on the calendar below to load that day&apos;s full all-mode breakdown.
                                </p>
                        {/if}
                </section>

                <div class="grid lg:grid-cols-3 gap-8">
                        <div class="lg:col-span-1">
                                <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                        <div class="flex items-center justify-between mb-4">
                                                <button aria-label="Previous month" onclick={prevMonth} type="button" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                </button>
                                                <h2 class="text-lg font-semibold">{monthLabel}</h2>
                                                <button
                                                        aria-label="Next month"
                                                        onclick={nextMonth}
                                                        type="button"
                                                        disabled={!isCurrentMonthOrPast()}
                                                        class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                </button>
                                        </div>

                                        <div class="grid grid-cols-7 gap-1 mb-2">
                                                {#each DAY_NAMES as dayName}
                                                        <div class="text-center text-xs text-slate-500 py-2">{dayName}</div>
                                                {/each}
                                        </div>

                                        <div class="grid grid-cols-7 gap-1">
                                                {#each Array(firstDayOfMonth) as _}
                                                        <div class="h-10" aria-hidden="true"></div>
                                                {/each}

                                                {#each Array(daysInMonth) as _, idx}
                                                        {@const day = idx + 1}
                                                        {@const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)}
                                                        {@const future = isFutureDate(dateObj)}
                                                        {#if !isNerdleDate(dateObj)}
                                                                <div class="h-10 flex items-center justify-center text-slate-300 text-sm">{day}</div>
                                                        {:else}
                                                                <button
                                                                        onclick={() => handleSelectDate(dateObj)}
                                                                        type="button"
                                                                        disabled={future}
                                                                        class={`h-10 rounded-lg flex items-center justify-center text-sm transition-all ${
                                                                                future
                                                                                        ? 'text-slate-300 bg-slate-50 dark:bg-slate-900 cursor-not-allowed'
                                                                                        : isSelected(day)
                                                                                                ? 'bg-teal-600 text-white font-bold'
                                                                                                : isToday(day)
                                                                                                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 font-medium hover:bg-teal-200 dark:hover:bg-teal-900/50'
                                                                                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                                                                        }`}
                                                                >
                                                                        {day}
                                                                </button>
                                                        {/if}
                                                {/each}
                                        </div>

                                        <div class="flex gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                                                <div class="flex items-center gap-1">
                                                        <div class="w-3 h-3 rounded bg-teal-600"></div>
                                                        <span>Selected</span>
                                                </div>
                                                <div class="flex items-center gap-1">
                                                        <div class="w-3 h-3 rounded bg-teal-200 dark:bg-teal-800"></div>
                                                        <span>Today</span>
                                                </div>
                                        </div>
                                </div>

                                <div class="mt-4 flex gap-2">
                                        <button onclick={goToToday} type="button" class="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors">
                                                Today
                                        </button>
                                        <button onclick={() => handleSelectDate(new Date(2022, 0, 20))} type="button" class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                                                First Puzzle
                                        </button>
                                </div>
                        </div>

                        <div class="lg:col-span-2">
                                <div class="flex items-center justify-between mb-6 gap-2">
                                        <button
                                                onclick={goToPrev}
                                                disabled={!isNerdleDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1))}
                                                type="button"
                                                class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                                </svg>
                                                Previous
                                        </button>

                                        <div class="text-center">
                                                <div class="text-2xl font-black text-slate-900 dark:text-slate-50">{formatDateKey(selectedDate)}</div>
                                                <div class="text-sm text-slate-600 dark:text-slate-400">
                                                        Puzzle #{selectedRecord?.classicPuzzleNumber ?? getPuzzleNumber(selectedDate)}
                                                </div>
                                        </div>

                                        <button
                                                onclick={goToNext}
                                                disabled={isFutureDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1))}
                                                type="button"
                                                class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                                Next
                                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                        </button>
                                </div>

                                <div class="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                        {#if isLoading}
                                                <div class="text-center py-12">
                                                        <div class="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                                                        <p class="text-slate-600 dark:text-slate-400">Loading answer...</p>
                                                </div>
                                        {:else if errorMessage}
                                                <div class="text-center py-12">
                                                        <p class="text-slate-600 dark:text-slate-400">{errorMessage}</p>
                                                </div>
                                        {:else if selectedRecord && selectedMode}
                                                <div>
                                                        <div class="flex flex-wrap justify-center gap-2 mb-6">
                                                                {#each selectedRecord.modes as mode}
                                                                        <button
                                                                                type="button"
                                                                                onclick={() => (selectedModeId = mode.id)}
                                                                                class={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                                                                        selectedModeId === mode.id
                                                                                                ? 'bg-teal-600 text-white'
                                                                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                                                                }`}
                                                                        >
                                                                                {mode.name}
                                                                        </button>
                                                                {/each}
                                                        </div>

                                                        <div class="text-center mb-6">
                                                                <p class="text-slate-700 dark:text-slate-300 font-semibold">{selectedMode.name}</p>
                                                                <p class="text-slate-500 dark:text-slate-400 text-sm">{selectedMode.description}</p>
                                                        </div>

                                                        {#if selectedMode.answers.length > 0}
                                                                <div class="space-y-6">
                                                                        {#each selectedMode.answers as answerEntry, index}
                                                                                <div class="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                                                                                        <div class="text-sm text-slate-600 dark:text-slate-400 mb-3 text-center">Puzzle #{answerEntry.puzzleNumber}</div>
                                                                                        <div class="flex justify-center gap-2 flex-wrap mb-4">
                                                                                                {#each answerEntry.answer.split('') as char, charIndex}
                                                                                                        <div class="rounded flex items-center justify-center font-bold text-white transition-all duration-200 hover:scale-105" style={tileStyle(char, charIndex)}>
                                                                                                                {char}
                                                                                                        </div>
                                                                                                {/each}
                                                                                        </div>
                                                                                        <button
                                                                                                type="button"
                                                                                                onclick={() => copyText(answerEntry.answer, `${selectedMode.id}-${index}`)}
                                                                                                class="w-full px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
                                                                                        >
                                                                                                {copiedToken === `${selectedMode.id}-${index}`
                                                                                                        ? 'Copied'
                                                                                                        : `Copy ${selectedMode.answers.length > 1 ? `Answer ${index + 1}` : 'Answer'}`}
                                                                                        </button>
                                                                                </div>
                                                                        {/each}
                                                                </div>

                                                                {#if selectedMode.answers.length > 1}
                                                                        <button
                                                                                type="button"
                                                                                onclick={copyAllModeAnswers}
                                                                                class="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                                                                        >
                                                                                {copiedToken === `all-${selectedMode.id}` ? 'Copied All' : 'Copy All Answers'}
                                                                        </button>
                                                                {/if}
                                                        {:else}
                                                                <div class="text-center py-8">
                                                                        <p class="text-slate-600 dark:text-slate-400">No stored answer for this mode on this date.</p>
                                                                </div>
                                                        {/if}
                                                </div>
                                        {:else}
                                                <div class="text-center py-12">
                                                        <p class="text-slate-600 dark:text-slate-400">Select a date to view answer details.</p>
                                                </div>
                                        {/if}
                                </div>

                                <div class="mt-6 flex justify-center gap-4 text-sm">
                                        <a href="/nerdle-answer-today" class="text-teal-700 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors">View Today&apos;s Answer -></a>
                                        <a href="https://www.nerdlegame.com/" target="_blank" rel="noopener noreferrer" class="text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Play on Nerdle -></a>
                                </div>
                        </div>
                </div>
        </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </section>

<!-- SEO Article Section -->
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-16">
  <div class="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-700 dark:bg-slate-800">
    <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 mb-6">Why the Nerdle Archive Matters</h2>
    <div class="prose prose-slate dark:prose-invert max-w-none">
      <p>Every Nerdle equation across all modes, from Classic to Instant, since January 2022. The calendar above is the fastest way to answer the one question that brings most visitors here: what was the Nerdle equation on a specific date. Pick the date, pick the mode, and the stored equation appears as tiles with a one-click copy button.</p>
      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How Nerdle Works</h3>
      <p>Each day, you guess a mathematical equation — digits, operators, and an equals sign. Green means right element in the right position, purple means right element in the wrong spot, black means it is not in the equation at all. Classic Nerdle uses an 8-character grid; the smaller modes shrink it and the larger ones stretch it. Every guess must itself be a valid, balanced equation, or the game rejects it — that single rule is what separates Nerdle strategy from Wordle strategy.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">What Each Mode Changes</h3>
      <p>The modes differ along three axes: equation length, number of simultaneous equations, and time pressure. Classic is the reference 8-cell game. Mini and Micro shorten the grid, which means fewer valid equations exist and the search space collapses faster — short modes reward testing operators early because each operator placed correctly eliminates a large share of the remaining candidates. Maxi and Midi lengthen the grid, which flips the priority: digit coverage matters more than operator placement on the first two guesses.</p>
      <p>Quad runs four equations at once, so guesses must pull duty across all four grids — the same logic as Quordle, except every guess also has to balance mathematically. Speed adds a timer, which punishes calculator-style play; the practical adjustment is to fix a small set of valid openers in advance rather than composing equations from scratch against the clock. Mini Bi pairs two short grids. Instant resolves immediately rather than over six guesses, so there is no narrowing phase at all — the first input is the whole game.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Reading the Tiles Without Wasting Guesses</h3>
      <p>Two properties of arithmetic do most of the work. First, addition and multiplication commute: 3+4 and 4+3 are both valid equations, so a purple 3 and purple 4 next to each other usually means the day's arrangement is the mirror of the guess, not a different pair of digits. Second, the equals sign can only sit in a handful of positions for a given grid length, so once it turns green the equation's shape is nearly fixed — everything left of it must evaluate to everything right of it.</p>
      <p>The common leak is spending guesses on rearrangements of confirmed digits while untested operators sit unused. Operators are the scarce resource: there are only four of them (+, −, ×, ÷) plus the equals sign, and most failed Nerdle boards come from locking digits early while the operator arrangement stays wrong. Test a fresh operator on every one of the first three guesses and the board resolves far more often. The <a href="/nerdle-solver" class="text-teal-600 hover:text-teal-700 underline">Nerdle solver</a> applies exactly this elimination order when it ranks candidates.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">How This Archive Stays Current</h3>
      <p>Stored equations on this page are baked in at build time and grow by one entry per mode each day. For the equation running right now — which may not be stored here yet if the site has not rebuilt today — use the <a href="/nerdle-answer-today" class="text-teal-600 hover:text-teal-700 underline">Nerdle answer today</a> page, which always carries the current puzzle. Dates before a mode existed show no stored answer, which is expected rather than a gap in the data.</p>

      <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mt-10 mb-4">Frequently Asked Questions</h3>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Does the archive cover all modes?</h4>
      <p>Yes — Classic, Micro, Mini, Midi, Maxi, Mini Bi, Quad, Speed, and Instant. Each mode has its own column in the archive table.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Can I search by equation?</h4>
      <p>You can browse by date. If you remember roughly when a puzzle ran, scroll to that date and you'll find it.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Are equations reused across modes?</h4>
      <p>Each mode gets its own equation every day. They rarely repeat, but the underlying math patterns can feel similar over time.</p>
      <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-50 mt-6 mb-2">Why did my correct math get marked wrong?</h4>
      <p>Because Nerdle scores the arrangement, not the arithmetic. An equation can be perfectly valid and still earn purple and black tiles when its digits sit in different positions than the day's equation. Validity gets a guess accepted; only matching the stored arrangement turns tiles green.</p>
    </div>
  </div>
</article>
