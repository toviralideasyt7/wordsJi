<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import type { ApiColorfleAnswer } from '$lib/color-answers-api';
  import ArchiveCalendar from '$lib/components/ArchiveCalendar.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import { fetchArchivePayload } from '$lib/archive-client';
  import { getContrastColor } from '$lib/colorfle';
  import { parseArchiveDateKey } from '$lib/archive-page';

  interface ColorfleArchivePayload {
    availableDateStrings: string[];
    selectedDateKey: string | null;
    selectedColorfle: ApiColorfleAnswer | null;
  }

  const fallbackStartDate = new Date(2022, 3, 25);

  let data = $state<ColorfleArchivePayload>({
    availableDateStrings: [],
    selectedDateKey: null,
    selectedColorfle: null
  });
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  let availableDates = $derived(
    (data.availableDateStrings ?? [])
      .map((dateString) => parseArchiveDateKey(dateString))
      .filter((date): date is Date => date !== null)
  );
  let startDate = $derived(availableDates[0] ?? fallbackStartDate);
  let selectedDateParam = $state<string | null>(
    browser ? new URL(window.location.href).searchParams.get('date') : null
  );

  onMount(() => {
    if (window.location.search || window.location.hash) {
      window.history.replaceState(window.history.state, '', window.location.pathname);
    }
  });

  function handleDateSelect(dateKey: string): void {
    selectedDateParam = dateKey;
  }

  async function loadArchive(dateKey: string | null): Promise<void> {
    const requestDateKey = dateKey;
    isLoading = true;
    loadError = null;

    try {
      const payload = await fetchArchivePayload<ColorfleArchivePayload>('colorfle', requestDateKey);

      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.availableDateStrings = payload.availableDateStrings ?? [];
      data.selectedDateKey = payload.selectedDateKey;
      data.selectedColorfle = payload.selectedColorfle;
    } catch (error) {
      if (selectedDateParam !== requestDateKey) {
        return;
      }

      data.selectedDateKey = requestDateKey;
      data.selectedColorfle = null;
      loadError = error instanceof Error ? error.message : 'Failed to load the Colorfle archive entry.';
    } finally {
      if (selectedDateParam === requestDateKey) {
        isLoading = false;
      }
    }
  }

  $effect(() => {
    if (!browser) {
      return;
    }

    void loadArchive(selectedDateParam);
  });

  function formatWeight(weight: number | undefined): string {
    return typeof weight === 'number' ? `${Math.round(weight * 100)}%` : '';
  }
</script>

<svelte:head>
  <title>Colorfle Archive - Normal and Hard Answers by Date</title>
  <meta
    name="description"
    content="Browse the full Colorfle archive with normal and hard answers for every past date, plus the blended colour and its source swatches for each puzzle."
  />
  <link rel="canonical" href="https://wordsolverx.com/colorfle-archive" />
  <meta property="og:title" content="Colorfle Archive - Normal and Hard Answers by Date" />
  <meta
    property="og:description"
    content="Look up any Colorfle date and see the exact normal and hard mode color mixes."
  />
  <meta property="og:url" content="https://wordsolverx.com/colorfle-archive" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<ArchiveCalendar
  gameName="Colorfle"
  gameColor="orange"
  gameIcon="Cf"
  {startDate}
  {availableDates}
  basePath="/colorfle-archive"
  selectedDate={data.selectedDateKey}
  description="Every Colorfle answer in both normal and hard mode."
  onSelectDate={handleDateSelect}
/>

<section id="archive-answer" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 scroll-mt-28">
  {#if data.selectedColorfle}
    <div class="rounded-3xl border border-orange-100 bg-white p-6 shadow-lg sm:p-8">
      <div class="mb-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Selected archive date</p>
        <h2 class="mt-3 text-3xl font-black text-slate-900">
          Colorfle answers for {data.selectedColorfle.formattedDate}
        </h2>
        <p class="mt-2 text-sm text-slate-500">
          Puzzle #{data.selectedColorfle.puzzleNumber} with both normal and hard mode mixes.
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        {#each [data.selectedColorfle.normal, data.selectedColorfle.hard] as modeAnswer}
          <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
                  {modeAnswer.label} mode
                </p>
                <h3 class="mt-2 text-2xl font-bold text-slate-900">
                  {modeAnswer.colors.length} source colors
                </h3>
              </div>
              <div class="rounded-2xl border border-white/70 bg-white px-4 py-3 text-right shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Target</p>
                <p class="mt-2 font-mono text-sm font-bold text-slate-900">
                  {modeAnswer.targetColor.hex}
                </p>
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              {#each modeAnswer.colors as color}
                <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div class="flex items-center gap-4">
                    <div
                      class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 shadow-inner"
                      style={`background:${color.hex}; color:${getContrastColor(color.hex)}`}
                    >
                      <span class="text-xs font-black uppercase tracking-[0.16em]">
                        {formatWeight(color.weight)}
                      </span>
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-slate-900">{color.name}</p>
                      <p class="mt-1 font-mono text-xs text-slate-500">{color.hex}</p>
                      {#if typeof color.weight === 'number'}
                        <p class="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                          {formatWeight(color.weight)}
                        </p>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>

            <div class="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Mixed result</p>
              <div class="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <div class="flex items-center gap-4">
                  <div
                    class="h-20 w-20 rounded-full border-4 border-white shadow-lg"
                    style={`background:${modeAnswer.targetColor.hex}`}
                  ></div>
                  <div>
                    <p class="font-mono text-lg font-bold text-slate-900">{modeAnswer.targetColor.hex}</p>
                    <p class="text-sm text-slate-500">
                      RGB({modeAnswer.targetColor.rgb.r}, {modeAnswer.targetColor.rgb.g},
                      {modeAnswer.targetColor.rgb.b})
                    </p>
                  </div>
                </div>
                <div class="text-sm leading-6 text-slate-600 sm:max-w-xs sm:text-right">
                  The worker provides the exact source colors. WordSolverX computes the blended target
                  preview for this archive card from those verified inputs.
                </div>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </div>
  {:else if loadError}
    <div class="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
      <h2 class="text-2xl font-bold text-rose-900">We couldn't load that Colorfle date</h2>
      <p class="mt-3 text-rose-700">{loadError}</p>
    </div>
  {:else if isLoading}
    <div class="rounded-3xl border border-slate-200 bg-white p-8 text-center">
      <h2 class="text-2xl font-bold text-slate-900">Loading Colorfle archive data...</h2>
      <p class="mt-3 text-slate-600">
        Pulling the selected Colorfle normal and hard answers from the worker API.
      </p>
    </div>
  {:else}
    <div class="rounded-3xl border border-slate-200 bg-white p-8 text-center">
      <h2 class="text-2xl font-bold text-slate-900">Choose a Colorfle date from the archive</h2>
      <p class="mt-3 text-slate-600">
        Pick any archived date above to load the verified normal and hard answers on this page.
      </p>
    </div>
  {/if}
</section>

<article class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
  <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <h2 class="text-3xl font-black text-slate-900">Why this Colorfle archive is more useful now</h2>
    <div class="mt-6 space-y-4 text-base leading-8 text-slate-600">
      <p>
        This archive now reads straight from the same worker-backed answer source used for the new
        Colorfle hub. That means every date resolves from the live API instead of relying on a small
        local snapshot or a single-mode approximation.
      </p>
      <p>
        Each selected date shows both modes. Normal mode keeps the familiar three-color mix, while
        hard mode adds the fourth block and its smaller weight. Seeing both together makes it much
        easier to study how the game changes difficulty from one mode to the next.
      </p>
      <p>
        If you mainly use the archive to double-check a missed puzzle, this page is now simpler too:
        pick a date, wait for the API call, and you get the verified source colors immediately.
      </p>
    </div>
  </div>

  <div class="mt-12">
    <AuthorCard
      name={PRESTON_HAYES_AUTHOR_NAME}
      image={PRESTON_HAYES_AUTHOR_IMAGE}
      description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
    />
  </div>
</article>
