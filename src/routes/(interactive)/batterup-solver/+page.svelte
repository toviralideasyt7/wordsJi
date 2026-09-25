<script lang="ts">
  import { onMount } from 'svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import {
    filterPlayers,
    getBestGuesses,
    isEligibleForPool,
    type Player,
    type Color,
    type GuessEntry,
    type GuessResult,
    type GuessScore
  } from '$lib/batterup/solver';

  let { data } = $props();

  interface ColumnDef {
    key: keyof GuessResult;
    label: string;
    canYellow: boolean;
    hint: string;
  }

  const COLUMNS: ColumnDef[] = [
    { key: 'jersey', label: '#', canYellow: true, hint: 'Yellow = same tens digit' },
    { key: 'team', label: 'Team', canYellow: false, hint: 'Never yellow' },
    { key: 'div', label: 'Div', canYellow: true, hint: 'Yellow = same league' },
    { key: 'born', label: 'Born', canYellow: false, hint: 'Never yellow' },
    { key: 'age', label: 'Age', canYellow: true, hint: 'Yellow = within 2 yrs' },
    { key: 'pos', label: 'Pos', canYellow: true, hint: 'Yellow = same INF/OF group' }
  ];

  const COLOR_CYCLE: Record<Color, Color> = { white: 'yellow', yellow: 'green', green: 'white' };

  let allPlayers = $state<Player[]>([]);
  let poolLoading = $state(true);
  let searchQuery = $state('');
  let selected = $state<Player | null>(null);
  let colors = $state<Record<keyof GuessResult, Color>>({
    jersey: 'white', team: 'white', div: 'white', born: 'white', age: 'white', pos: 'white'
  });
  let remaining = $state<Player[]>([]);
  let guesses = $state<GuessEntry[]>([]);
  let suggestions = $state<GuessScore[]>([]);
  let computing = $state(false);

  onMount(async () => {
    try {
      // Lazy-load the ~1k player pool so the solver page stays light on first load.
      const mod = await import('$lib/data/batterup-players.json');
      const players = (mod.default ?? mod) as Player[];
      allPlayers = players.filter(isEligibleForPool);
      remaining = [...allPlayers];
    } catch (e) {
      console.error('Failed to load player pool', e);
    } finally {
      poolLoading = false;
    }
  });

  const searchResults = $derived(
    searchQuery.trim().length < 2
      ? []
      : allPlayers
          .filter((p) => p.player_name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
          .slice(0, 12)
  );

  function cycleColor(key: keyof GuessResult) {
    const def = COLUMNS.find((c) => c.key === key)!;
    const next = COLOR_CYCLE[colors[key]];
    // Team and Born never score yellow in the real game — skip straight to green.
    colors[key] = !def.canYellow && next === 'yellow' ? 'green' : next;
  }

  function pickPlayer(p: Player) {
    selected = p;
    searchQuery = p.player_name;
  }

  function applyGuess() {
    if (!selected) return;
    const result: GuessResult = { ...colors };
    guesses = [...guesses, { guess: selected, result }];
    remaining = filterPlayers(remaining, selected, result);
    suggestions = [];
    selected = null;
    searchQuery = '';
    colors = { jersey: 'white', team: 'white', div: 'white', born: 'white', age: 'white', pos: 'white' };
  }

  function computeSuggestions() {
    computing = true;
    // Let the UI paint the spinner before the heavy entropy pass.
    setTimeout(() => {
      try {
        suggestions = getBestGuesses(remaining, allPlayers, 10);
      } finally {
        computing = false;
      }
    }, 30);
  }

  function resetAll() {
    remaining = [...allPlayers];
    guesses = [];
    suggestions = [];
    selected = null;
    searchQuery = '';
  }

  function colorLabel(c: Color): string {
    return c === 'green' ? 'exact' : c === 'yellow' ? 'close' : 'miss';
  }

  function colorClass(c: Color): string {
    return c === 'green'
      ? 'bg-green-600 text-white border-green-600'
      : c === 'yellow'
        ? 'bg-amber-400 text-slate-900 border-amber-400'
        : 'bg-white text-slate-500 border-slate-300';
  }
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <link rel="canonical" href="https://wordsolverx.com/batterup-solver" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/batterup-solver" />
  <meta property="og:image" content={data.meta.socialImage} />
  <meta property="og:site_name" content="WordSolverX" />
</svelte:head>

<div class="min-h-screen bg-slate-50/60">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <Breadcrumbs hideSchema={true} />

    <h1 class="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Batter Up Solver</h1>
    <p class="mt-3 text-lg text-slate-600 leading-relaxed max-w-3xl">
      Play along with the real game: enter each guess and the feedback colors Batter Up gave you, and the solver narrows the MLB batter pool. When you are ready, it suggests the highest-information next guess using the same entropy + minimax scoring the helper app uses.
    </p>

    {#if poolLoading}
      <div class="mt-8 rounded-2xl bg-white p-10 text-center border border-slate-100 shadow-sm">
        <p class="text-slate-500">Loading the player pool…</p>
      </div>
    {:else}
      <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Step 1: pick a guess -->
        <section class="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">1. Your guess</h2>
          <label for="player-search" class="sr-only">Search players</label>
          <input
            id="player-search"
            type="search"
            bind:value={searchQuery}
            placeholder="Type a player name…"
            class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
          />
          {#if searchResults.length > 0 && !selected}
            <ul class="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
              {#each searchResults as p}
                <li>
                  <button
                    onclick={() => pickPlayer(p)}
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-sky-50 transition-colors"
                  >
                    <span class="font-semibold text-slate-900">{p.player_name}</span>
                    <span class="text-slate-500"> · {p.team_name} · {p.position[0]}</span>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
          {#if selected}
            <div class="mt-3 rounded-xl bg-sky-50 border border-sky-200 p-4">
              <p class="text-sm text-sky-700 font-semibold">Guessing</p>
              <p class="text-lg font-bold text-slate-900">{selected.player_name}</p>
              <p class="text-sm text-slate-600">{selected.team_name} · {selected.position.join(', ')} · #{selected.jersey_number ?? '—'}</p>
            </div>
          {/if}

          <!-- Step 2: colors -->
          <h2 class="mt-6 text-lg font-bold text-slate-900">2. Feedback colors</h2>
          <p class="text-xs text-slate-500 mt-1">Tap each cell to cycle. Team and Born skip yellow — the real game never scores them close.</p>
          <div class="mt-3 grid grid-cols-3 gap-2">
            {#each COLUMNS as col}
              <button
                onclick={() => cycleColor(col.key)}
                disabled={!selected}
                title={col.hint}
                class="rounded-xl border-2 px-2 py-3 text-center transition-all disabled:opacity-40 {colorClass(colors[col.key])}"
                aria-label={`${col.label}: ${colorLabel(colors[col.key])}. Tap to change.`}
              >
                <span class="block text-xs font-bold uppercase tracking-wider">{col.label}</span>
                <span class="block text-[11px] mt-0.5">{colorLabel(colors[col.key])}</span>
              </button>
            {/each}
          </div>

          <button
            onclick={applyGuess}
            disabled={!selected}
            class="mt-4 w-full rounded-xl bg-sky-700 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-sky-800 transition-colors disabled:opacity-40"
          >
            Apply guess
          </button>
          <button
            onclick={resetAll}
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </section>

        <!-- Remaining pool -->
        <section class="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">Remaining candidates</h2>
          <p class="mt-2 text-4xl font-extrabold text-sky-700">{remaining.length}</p>
          <p class="text-sm text-slate-500">of {allPlayers.length} batters in the pool</p>

          {#if guesses.length > 0}
            <h3 class="mt-6 text-sm font-bold text-slate-900 uppercase tracking-wider">Guesses so far</h3>
            <ul class="mt-2 space-y-2">
              {#each guesses as g}
                <li class="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm">
                  <p class="font-semibold text-slate-900">{g.guess.player_name}</p>
                  <div class="mt-1.5 flex flex-wrap gap-1">
                    {#each COLUMNS as col}
                      <span class="inline-block rounded px-1.5 py-0.5 text-[11px] font-bold {colorClass(g.result[col.key])}">{col.label}</span>
                    {/each}
                  </div>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="mt-6 text-sm text-slate-500">No guesses yet. Add your first guess from the real game board.</p>
          {/if}

          {#if remaining.length <= 25 && remaining.length > 0}
            <h3 class="mt-6 text-sm font-bold text-slate-900 uppercase tracking-wider">Still possible</h3>
            <ul class="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
              {#each remaining.slice(0, 25) as p}
                <li class="px-3 py-2 text-sm">
                  <span class="font-medium text-slate-900">{p.player_name}</span>
                  <span class="text-slate-500"> · {p.team_name} · {p.position[0]}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <!-- Suggestions -->
        <section class="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">Best next guesses</h2>
          <p class="mt-1 text-sm text-slate-500">Ranked by expected information (65% entropy, 35% minimax). Non-pool probe guesses are included — they often reveal more.</p>
          <button
            onclick={computeSuggestions}
            disabled={computing || remaining.length <= 1}
            class="mt-4 w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            {computing ? 'Scoring…' : 'Suggest guesses'}
          </button>
          {#if suggestions.length > 0}
            <ol class="mt-4 space-y-2">
              {#each suggestions as s, i}
                <li class="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm flex items-start justify-between gap-3">
                  <div>
                    <p class="font-semibold text-slate-900">#{i + 1} {s.player.player_name}</p>
                    <p class="text-xs text-slate-500">{s.player.team_name} · {s.player.position[0]} · #{s.player.jersey_number ?? '—'}</p>
                  </div>
                  <span class="text-xs font-mono text-slate-500 whitespace-nowrap">score {s.score.toFixed(3)}</span>
                </li>
              {/each}
            </ol>
          {/if}
        </section>
      </div>

      <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-4">How the solver thinks</h2>
        <div class="space-y-3 text-slate-600 leading-relaxed">
          <p>Every candidate guess is scored against the pattern distribution it would produce over the remaining pool. High entropy means the guess splits the pool into many small, even buckets — exactly what you want from an early probe.</p>
          <p>The minimax half of the score guards against the worst case: a guess that usually helps but occasionally leaves hundreds of candidates scores worse than a steadier one. When the pool is small, the solver only suggests candidates that can end the game.</p>
          <p>Feedback entry matches the real Batter Up rules: jersey yellow means same tens digit, division yellow means same league, position yellow means same infield/outfield group. Team and birthplace are never yellow.</p>
        </div>
      </section>
    {/if}

    <div class="mt-12">
      <InternalLinkSection currentGame="Batter Up" />
    </div>
  </div>
</div>
