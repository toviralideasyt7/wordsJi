<script lang="ts">
  import { parseArchiveDateKey, toMonthDayYearKey } from '$lib/archive-page';
  import { KEEP_EXPLORING_CONFIG, type KeepExploringSlug } from '$lib/keep-exploring';

  interface ExploreCard {
    title: string;
    sub: string;
    href: string;
    icon: string;
  }

  let {
    slug,
    puzzleDate = null
  }: {
    slug: KeepExploringSlug;
    /**
     * The page's own puzzle date (YYYY-MM-DD) — the same date the page rendered
     * as "today". The "yesterday" link is derived from it by subtracting one
     * day, never hardcoded. When it is missing or invalid the yesterday card is
     * omitted rather than guessed.
     */
    puzzleDate?: string | null;
  } = $props();

  const config = $derived(KEEP_EXPLORING_CONFIG[slug]);
  const gameName = $derived(config.gameName);

  const puzzleDay = $derived(parseArchiveDateKey(puzzleDate ?? ''));

  function shiftDaysUTC(day: Date, delta: number): Date {
    const d = new Date(day.getTime());
    d.setUTCDate(d.getUTCDate() + delta);
    return d;
  }

  function formatLongUTC(day: Date): string {
    return day.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  const yesterday = $derived(puzzleDay ? shiftDaysUTC(puzzleDay, -1) : null);

  const cards = $derived.by((): ExploreCard[] => {
    const list: ExploreCard[] = [];

    if (config.datedPrefix && yesterday) {
      // Games with prerendered per-day dated pages: link straight to
      // yesterday's answer page, e.g. /wordle-answer-for-october-4-2026.
      list.push({
        title: `Yesterday's ${gameName} answer`,
        sub: formatLongUTC(yesterday),
        href: `/${config.datedPrefix}-answer-for-${toMonthDayYearKey(yesterday)}`,
        icon: '📅'
      });
    } else if (config.archiveHref) {
      // No dated pages, but the game archive lists every past answer by date —
      // yesterday's answer is in there.
      list.push({
        title: `Yesterday's ${gameName} answer`,
        sub: `Find it in the ${gameName} archive`,
        href: config.archiveHref,
        icon: '📅'
      });
    }

    list.push({
      title: config.solverLabel,
      sub: config.solverSub,
      href: config.solverHref,
      icon: '🧩'
    });

    if (config.archiveHref) {
      if (config.datedPrefix) {
        // Yesterday already has its own dated page, so the archive card is for
        // browsing the full history.
        list.push({
          title: `${gameName} archive`,
          sub: 'Every past answer, date by date',
          href: config.archiveHref,
          icon: '🗂️'
        });
      } else {
        // Yesterday points at the archive already — this card goes to the
        // all-games today hub instead.
        list.push({
          title: `Today's answers`,
          sub: 'Every game, updated daily',
          href: '/today',
          icon: '🎮'
        });
      }
    } else {
      // Games with neither dated pages nor their own archive.
      list.push({
        title: `Today's answers`,
        sub: 'Every game, updated daily',
        href: '/today',
        icon: '🎮'
      });
      list.push({
        title: 'Archive hub',
        sub: 'Past answers for every game',
        href: '/archive',
        icon: '🗂️'
      });
    }

    return list;
  });

  // Slim footer link to the /today hub, unless a card already covers it.
  const showTodayStrip = $derived(!cards.some((card) => card.href === '/today'));
</script>

<section aria-label="Keep exploring" class="mt-10">
  <h2 class="text-xl font-bold text-gray-900 mb-4">Keep exploring</h2>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {#each cards as card}
      <a
        href={card.href}
        class="group flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-teal-400 hover:shadow-md"
      >
        <span aria-hidden="true" class="text-2xl leading-none">{card.icon}</span>
        <span>
          <span class="block font-semibold text-gray-900 group-hover:text-teal-700">{card.title}</span>
          <span class="block text-sm text-gray-500">{card.sub}</span>
        </span>
      </a>
    {/each}
  </div>
  {#if showTodayStrip}
    <p class="mt-4 text-sm text-gray-600">
      Playing more than one game?
      <a href="/today" class="font-semibold text-teal-700 hover:underline">See all of today's answers →</a>
    </p>
  {/if}
</section>
