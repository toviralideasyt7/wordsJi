<script lang="ts">
  import { ARCHIVE_STATIC_ROUTES, TODAY_STATIC_ROUTES } from '$lib/route-registry';

  interface GameLink {
    name: string;
    href: string;
    icon: string;
  }

  let { currentGame = '' }: { currentGame?: string } = $props();

  const GAME_CLUSTERS: Record<string, string[]> = {
    // Word Puzzle cluster
    wordle: ['quordle', 'nerdle', 'phoodle', 'phrazle', 'waffle', 'canuckle', 'worgle', 'betweenle'],
    quordle: ['wordle', 'nerdle', 'phoodle', 'phrazle', 'waffle', 'canuckle'],
    nerdle: ['wordle', 'quordle', 'phoodle', 'betweenle'],
    phoodle: ['wordle', 'quordle', 'waffle', 'canuckle'],
    phrazle: ['wordle', 'quordle', 'waffle'],
    waffle: ['wordle', 'quordle', 'phoodle', 'phrazle'],
    canuckle: ['wordle', 'quordle', 'phoodle', 'worgle'],
    worgle: ['wordle', 'canuckle', 'phoodle'],
    betweenle: ['wordle', 'nerdle', 'quordle'],
    // Geography cluster
    worldle: ['globle', 'countryle'],
    globle: ['worldle', 'countryle'],
    countryle: ['worldle', 'globle'],
    // Character Guessing cluster
    loldle: ['dotadle', 'narutodle', 'onepiecedle', 'pokedle', 'smashdle'],
    dotadle: ['loldle', 'narutodle', 'onepiecedle', 'pokedle', 'smashdle'],
    narutodle: ['loldle', 'dotadle', 'onepiecedle', 'pokedle', 'smashdle'],
    onepiecedle: ['loldle', 'dotadle', 'narutodle', 'pokedle', 'smashdle'],
    pokedle: ['loldle', 'dotadle', 'narutodle', 'onepiecedle', 'smashdle'],
    smashdle: ['loldle', 'dotadle', 'narutodle', 'onepiecedle', 'pokedle'],
    // Logic & Semantic cluster
    contexto: ['semantle', 'searchle'],
    semantle: ['contexto', 'searchle'],
    searchle: ['contexto', 'semantle'],
    // Visual & Color cluster
    colordle: ['colorfle', 'framed', 'spotle'],
    colorfle: ['colordle', 'framed', 'spotle'],
    framed: ['colordle', 'colorfle', 'spotle'],
    spotle: ['colordle', 'colorfle', 'framed'],
  };

  const GAME_DISPLAY_NAMES: Record<string, string> = {
    wordle: 'Wordle', quordle: 'Quordle', nerdle: 'Nerdle', phoodle: 'Phoodle',
    phrazle: 'Phrazle', waffle: 'Waffle', canuckle: 'Canuckle', worgle: 'Worgle',
    betweenle: 'Betweenle', worldle: 'Worldle', globle: 'Globle', countryle: 'Countryle',
    loldle: 'LoLdle', dotadle: 'Dotadle', narutodle: 'Narutodle', onepiecedle: 'Onepiecedle',
    pokedle: 'Pokedle', smashdle: 'Smashdle', contexto: 'Contexto', semantle: 'Semantle',
    searchle: 'Searchle', colordle: 'Colordle', colorfle: 'Colorfle', framed: 'Framed',
    spotle: 'Spotle',
  };

  const todayIconMap: Record<string, string> = {
    Wordle: 'Wd',
    Canuckle: 'Ca',
    Worldle: 'Wr',
    Betweenle: 'Bt',
    Colorfle: 'Cf',
    Nerdle: 'Nd',
    Phoodle: 'Ph',
    Quordle: 'Qd',
    Colordle: 'Cd',
    Countryle: 'Cy',
    Framed: 'Fr',
    Semantle: 'Se',
    Waffle: 'Wf',
    Globle: 'Gb',
    Contexto: 'Cx',
    Searchle: 'Sr',
    Phrazle: 'Pz',
    Spotle: 'Sp'
  };

  const archiveIconMap: Record<string, string> = {
    Wordle: 'Wd',
    Canuckle: 'Ca',
    Quordle: 'Qd',
    Colorfle: 'Cf',
    Colordle: 'Cd',
    Countryle: 'Cy',
    Framed: 'Fr',
    Semantle: 'Se',
    Phoodle: 'Ph',
    Globle: 'Gb',
    Waffle: 'Wf',
    Worldle: 'Wr',
    Nerdle: 'Nd',
    Searchle: 'Sr',
    Contexto: 'Cx',
    Phrazle: 'Pz',
    Spotle: 'Sp'
  };

  function prettifyRoute(route: string) {
    return route
      .replace(/^\//, '')
      .replace(/-answer-today(-updated)?$/, '')
      .replace(/-archive$/, '')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  function buildLinkName(route: string, suffix: 'Today' | 'Archive') {
    const baseName = prettifyRoute(route);
    return `${baseName} ${suffix}`;
  }

  const answerTodayLinks: GameLink[] = TODAY_STATIC_ROUTES
    .filter((route) => route !== '/today')
    .map((route) => {
      const baseName = prettifyRoute(route);
      return {
        name: buildLinkName(route, 'Today'),
        href: route,
        icon: todayIconMap[baseName] ?? baseName.slice(0, 2)
      };
    })
    .filter((link) => link.name.split(' ')[0] !== currentGame)
    .slice(0, 10);

  const archiveLinks: GameLink[] = ARCHIVE_STATIC_ROUTES
    .map((route) => {
      const baseName = prettifyRoute(route);
      return {
        name: buildLinkName(route, 'Archive'),
        href: route,
        icon: archiveIconMap[baseName] ?? baseName.slice(0, 2)
      };
    })
    .filter((link) => link.name.split(' ')[0] !== currentGame)
    .slice(0, 10);

  // GameDle answer pages were renamed to the -updated permalink (old URLs 301
  // to the new ones), so those related links must use the -updated suffix.
  const GAMEDLE_ANSWER_SUFFIX_KEYS = new Set(['loldle', 'dotadle', 'pokedle', 'smashdle', 'narutodle', 'onepiecedle']);
  const currentGameKey = $derived(currentGame.toLowerCase().replace(/\s+/g, ''));
  const relatedGameKeys = $derived((GAME_CLUSTERS[currentGameKey] ?? []).slice(0, 5));
  const relatedGames = $derived(
    relatedGameKeys.map((key) => ({
      name: GAME_DISPLAY_NAMES[key] ?? key,
      href: GAMEDLE_ANSWER_SUFFIX_KEYS.has(key) ? `/${key}-answer-today-updated` : `/${key}-answer-today`,
      icon: (GAME_DISPLAY_NAMES[key] ?? key).slice(0, 2)
    }))
  );
</script>

<section class="mt-16 border-t border-slate-200 dark:border-slate-700 pt-12 max-w-4xl mx-auto px-4">
  <div class="mb-6 inline-flex items-center gap-1.5 text-xs text-slate-500">
    <span class="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
    Updated Daily
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
    <div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
        <span aria-hidden="true" class="text-2xl">TD</span> Today's Game Answers
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each answerTodayLinks as link}
          <a
            href={link.href}
            class="flex items-center gap-3 p-3 rounded-xl border transition-all {currentGame === link.name.split(' ')[0]
              ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800 pointer-events-none'
              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-sm'}"
          >
            <span aria-hidden="true" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">{link.icon}</span>
            <span class="font-medium {currentGame === link.name.split(' ')[0] ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}">
              {link.name}
            </span>
          </a>
        {/each}
      </div>
    </div>

    <div>
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
        <span aria-hidden="true" class="text-2xl">AR</span> Past Solutions Archive
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {#each archiveLinks as link}
          <a
            href={link.href}
            class="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-sm"
          >
            <span aria-hidden="true" class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">{link.icon}</span>
            <span class="text-slate-700 dark:text-slate-300 font-medium">{link.name}</span>
          </a>
        {/each}
      </div>
    </div>
  </div>

  {#if relatedGames.length > 0}
    <div class="mt-12">
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6 flex items-center gap-2">
        <span aria-hidden="true" class="text-2xl">RG</span> Related Games
      </h2>
      <div class="flex flex-wrap gap-2">
        {#each relatedGames as rg}
          <a
            href={rg.href}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-sm transition-all"
          >
            <span aria-hidden="true" class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">{rg.icon}</span>
            {rg.name}
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <div class="mt-12 text-center p-6 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/10 dark:to-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
    <p class="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
      Stuck on a tricky puzzle?
      <a href="/wordle-solver" class="text-blue-700 dark:text-blue-300 hover:underline mx-1 font-bold">Try our 5-Letter Wordle Solver</a>
      to filter clues fast, rank next guesses, and move into the right 3 to 11 letter Wordle page when you need a different board size.
    </p>
  </div>
</section>
