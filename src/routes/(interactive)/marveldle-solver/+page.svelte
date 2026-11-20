<script lang="ts">
  import { onMount } from 'svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import {
    getComicsTiles,
    getMCUTiles,
    cycleTileColor,
    getColorHex,
    formatTileValue,
    loadCharacters,
    type CharacterData,
    type TileState,
    type GuessEntry,
    type MarveldleMode
  } from '$lib/marveldle/types';
  import { filterCharacters, getSuggestions, type SuggestionScore } from '$lib/marveldle/solver';

  let { data } = $props();

  let mode = $state<MarveldleMode>('comics');
  let allChars = $state<CharacterData[]>([]);
  let poolLoading = $state(true);
  let searchQuery = $state('');
  let selected = $state<CharacterData | null>(null);
  let tiles = $state<TileState[]>([]);
  let guesses = $state<GuessEntry[]>([]);
  let remaining = $state<CharacterData[]>([]);
  let suggestions = $state<SuggestionScore[]>([]);

  async function loadMode(m: MarveldleMode) {
    poolLoading = true;
    resetAll(false);
    try {
      allChars = await loadCharacters(m);
      remaining = [...allChars];
    } catch (e) {
      console.error('Failed to load character database', e);
    } finally {
      poolLoading = false;
    }
  }

  onMount(() => loadMode('comics'));

  function switchMode(m: MarveldleMode) {
    if (m === mode) return;
    mode = m;
    searchQuery = '';
    loadMode(m);
  }

  const searchResults = $derived(
    searchQuery.trim().length < 2
      ? []
      : allChars
          .filter((c) => c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
          .slice(0, 12)
  );

  function pickCharacter(c: CharacterData) {
    selected = c;
    searchQuery = c.name;
    tiles = (mode === 'comics' ? getComicsTiles(c) : getMCUTiles(c)).map((t) => ({ ...t }));
  }

  function tapTile(i: number) {
    const next = cycleTileColor(tiles[i]);
    tiles[i] = { ...tiles[i], color: next };
  }

  function applyGuess() {
    if (!selected) return;
    guesses = [...guesses, { character: selected, tiles: tiles.map((t) => ({ ...t })) }];
    const excluded = guesses.map((g) => g.character.id);
    remaining = filterCharacters(allChars, guesses, excluded);
    suggestions = getSuggestions(remaining, guesses, 15);
    selected = null;
    searchQuery = '';
    tiles = [];
  }

  function resetAll(clearMode = true) {
    guesses = [];
    suggestions = [];
    selected = null;
    searchQuery = '';
    tiles = [];
    remaining = [...allChars];
    if (clearMode) remaining = [...allChars];
  }

  function tileHint(t: TileState): string {
    if (t.isNumeric) return 'Tap: untouched → exact → higher → lower';
    return 'Tap: untouched → exact → partial';
  }
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description} />
  <meta name="keywords" content={data.meta.keywords} />
  <link rel="canonical" href="https://wordsolverx.com/marveldle-solver" />
  <meta property="og:title" content={data.meta.title} />
  <meta property="og:description" content={data.meta.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/marveldle-solver" />
  <meta property="og:image" content={data.meta.socialImage} />
  <meta property="og:site_name" content="WordSolverX" />
</svelte:head>

<div class="min-h-screen bg-slate-50/60">
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <Breadcrumbs hideSchema={true} />

    <h1 class="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Marveldle Solver</h1>
    <p class="mt-3 text-lg text-slate-600 leading-relaxed max-w-3xl">
      Play along with the real game: pick the character you guessed, tap each tile to match the colors Marveldle showed you, and the solver narrows the pool and suggests your next guess.
    </p>

    <div class="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        onclick={() => switchMode('comics')}
        class="rounded-lg px-5 py-2 text-sm font-semibold transition-colors {mode === 'comics' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}"
      >
        Comics
      </button>
      <button
        onclick={() => switchMode('mcu')}
        class="rounded-lg px-5 py-2 text-sm font-semibold transition-colors {mode === 'mcu' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}"
      >
        MCU
      </button>
    </div>

    {#if poolLoading}
      <div class="mt-6 rounded-2xl bg-white p-10 text-center border border-slate-100 shadow-sm">
        <p class="text-slate-500">Loading the {mode === 'comics' ? 'Comics' : 'MCU'} character database…</p>
      </div>
    {:else}
      <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Step 1: pick the guess -->
        <section class="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">1. Your guess</h2>
          <label for="char-search" class="sr-only">Search characters</label>
          <input
            id="char-search"
            type="search"
            bind:value={searchQuery}
            placeholder="Type a character name…"
            class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          />
          {#if searchResults.length > 0 && !selected}
            <ul class="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
              {#each searchResults as c}
                <li>
                  <button
                    onclick={() => pickCharacter(c)}
                    class="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 transition-colors"
                  >
                    <span class="font-semibold text-slate-900">{c.name}</span>
                    <span class="text-slate-500"> · {c.type}</span>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
          {#if selected}
            <div class="mt-3 rounded-xl bg-red-50 border border-red-200 p-4">
              <p class="text-sm text-red-700 font-semibold">Guessed</p>
              <p class="text-lg font-bold text-slate-900">{selected.name}</p>
              <p class="text-sm text-slate-600">{selected.gender} {selected.type} · {selected.origin}</p>
            </div>
          {/if}

          <!-- Step 2: tiles -->
          {#if selected}
            <h2 class="mt-6 text-lg font-bold text-slate-900">2. Tile colors</h2>
            <p class="text-xs text-slate-500 mt-1">Tap each tile to match the game board. Untouched tiles are ignored.</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              {#each tiles as t, i}
                <button
                  onclick={() => tapTile(i)}
                  title={tileHint(t)}
                  class="rounded-xl border border-white/60 px-3 py-3 text-left text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style="background-color: {getColorHex(t.color)}"
                  aria-label={`${t.label}: ${t.color}. Tap to change.`}
                >
                  <span class="block text-[11px] font-bold uppercase tracking-wider opacity-90">{t.label}</span>
                  <span class="block text-sm font-semibold truncate">{formatTileValue(t)}</span>
                  <span class="block text-[11px] opacity-80 capitalize">{t.color === 'none' ? 'untouched' : t.color}</span>
                </button>
              {/each}
            </div>
            <button
              onclick={applyGuess}
              class="mt-4 w-full rounded-xl bg-red-700 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-red-800 transition-colors"
            >
              Apply guess
            </button>
          {/if}
          <button
            onclick={() => resetAll()}
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </section>

        <!-- Remaining pool -->
        <section class="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">Remaining candidates</h2>
          <p class="mt-2 text-4xl font-extrabold text-red-700">{remaining.length}</p>
          <p class="text-sm text-slate-500">of {allChars.length} characters in {mode === 'comics' ? 'Comics' : 'MCU'} mode</p>

          {#if guesses.length > 0}
            <h3 class="mt-6 text-sm font-bold text-slate-900 uppercase tracking-wider">Guesses so far</h3>
            <ul class="mt-2 space-y-2">
              {#each guesses as g}
                <li class="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm">
                  <p class="font-semibold text-slate-900">{g.character.name}</p>
                  <div class="mt-1.5 flex flex-wrap gap-1">
                    {#each g.tiles as t}
                      {#if t.color !== 'none'}
                        <span
                          class="inline-block rounded px-1.5 py-0.5 text-[11px] font-bold text-white"
                          style="background-color: {getColorHex(t.color)}"
                        >{t.label}</span>
                      {/if}
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
              {#each remaining.slice(0, 25) as c}
                <li class="px-3 py-2 text-sm">
                  <span class="font-medium text-slate-900">{c.name}</span>
                  <span class="text-slate-500"> · {c.type}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </section>

        <!-- Suggestions -->
        <section class="rounded-2xl bg-white p-6 border border-slate-100 shadow-sm">
          <h2 class="text-lg font-bold text-slate-900">Suggested next guesses</h2>
          <p class="mt-1 text-sm text-slate-500">Ranked by expected information: unprobed genders, types and origins score higher, as do partial species/power overlaps.</p>
          {#if suggestions.length > 0}
            <ol class="mt-4 space-y-2">
              {#each suggestions as s, i}
                <li class="rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm">
                  <p class="font-semibold text-slate-900">#{i + 1} {s.char.name}</p>
                  <p class="text-xs text-slate-500">{s.char.type} · {s.char.origin}{s.reason.length > 0 ? ` · ${s.reason.join(', ')}` : ''}</p>
                </li>
              {/each}
            </ol>
          {:else}
            <p class="mt-4 text-sm text-slate-500">Suggestions appear after your first guess.</p>
          {/if}
        </section>
      </div>

      <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold text-slate-900 mb-4">How the solver thinks</h2>
        <div class="space-y-3 text-slate-600 leading-relaxed">
          <p>Each guess you enter becomes a set of constraints: exact tiles must match, partial tiles must share at least one item, and the year tile in Comics mode gives a direction (higher or lower). Every character inconsistent with any constraint leaves the pool.</p>
          <p>Suggestions are ranked by information value. Characters whose gender, type or origin you have not probed yet score higher, because they split the pool along a fresh axis. Partial overlaps on species and powers score well too — they cut sharply when they hit.</p>
          <p>One honest limitation, carried over from the original solver: tiles you leave untouched are ignored entirely. The real game's brown "no match" tiles are strong eliminations, but the original engine has no way to express them, so treat untouched tiles as "no information", not "miss".</p>
        </div>
      </section>
    {/if}

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">How to play Marveldle</h2>
      <div class="space-y-3 text-slate-600 leading-relaxed">
        <p>Marveldle posts one mystery Marvel character every day, in two separate modes: <strong class="text-slate-800">Comics</strong> and <strong class="text-slate-800">MCU</strong>. Each mode has its own character pool and its own answer, so a day has two solutions, not one. You name a character, and the game scores your guess tile by tile.</p>
        <p>Comics mode uses six tiles: gender, type, species, powers, origin and debut year. MCU mode swaps the year for two extra list tiles — appearances and teams — because screen characters are defined more by where they show up and who they stand with than by a first issue. Green means an exact match. Orange means a partial match: on the list tiles (species, powers, appearances, teams) your guess and the answer share at least one entry, but not the whole list. The plain miss color means no overlap at all. The year tile in Comics mode is the exception — instead of a plain miss it points: the answer debuted higher (later) or lower (earlier) than your guess.</p>
      </div>
    </section>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">How to use this solver</h2>
      <ol class="list-decimal pl-5 space-y-2 text-slate-600 leading-relaxed">
        <li>Set the mode first — Comics or MCU. The pools are different, and filtering the wrong pool gives confident, useless results.</li>
        <li>Play your guess in the real game and note every tile's color.</li>
        <li>Search for that character here and select them. The tile row fills in with that character's actual attributes.</li>
        <li>Tap each tile to match your game board: untouched → exact → partial. The year tile keeps cycling to higher and lower, for the arrow the game showed you.</li>
        <li>Press <strong class="text-slate-800">Apply guess</strong>. The pool drops to the characters consistent with everything you entered, and ranked suggestions for your next guess appear.</li>
      </ol>
      <p class="mt-3 text-slate-600 leading-relaxed">One limitation to play around: tiles you leave untouched are ignored by the filter rather than treated as a miss. A brown "no match" tile in the real game eliminates hard, so when a tile misses completely, the pool here can stay a little wider than the game board implies — the suggestions still rank by the constraints you did enter.</p>
    </section>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Strategy: reading partial tiles</h2>
      <div class="space-y-3 text-slate-600 leading-relaxed">
        <p><strong class="text-slate-800">Open with a character who tests many lists at once.</strong> A well-connected hero — several powers, a famous team, multiple appearances — puts entries on nearly every list tile, so a single guess probes most of the axes the game scores. An obscure character with one power and no team tells you far less, even when you suspect them.</p>
        <p><strong class="text-slate-800">Partial is information, not failure.</strong> An orange species or powers tile means the answer shares at least one entry with your guess. Go back to the game board and look at exactly which entries your guess carried — the shared one is in there. Two partials on the same axis from different guesses usually corner the overlap.</p>
        <p><strong class="text-slate-800">Use the year arrows to bracket, not to chase.</strong> In Comics mode, a higher arrow after a 1960s debut and a lower arrow after a 1990s debut leave a thirty-year window; one more guess inside it halves the pool again. Guessing year by year wastes the strongest tile on the board.</p>
        <p><strong class="text-slate-800">Type and origin settle arguments early.</strong> Hero, villain, anti-hero; Earth, cosmic, mystical — these two tiles split the pool into rough families. When both go green, the list tiles are usually all that remain between you and the answer.</p>
      </div>
    </section>

    <section class="mt-8 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Marveldle solver FAQ</h2>
      <div class="space-y-3">
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">What is the difference between Comics and MCU mode?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">Different pools, different answers, slightly different tiles. Comics mode covers the print universe and scores a debut-year tile with higher/lower arrows. MCU mode covers the screen universe and replaces the year with appearances and teams tiles. This solver has a mode switch at the top — always match it to the game you are playing.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">What does a partial (orange) tile mean?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">On list tiles — species, powers, appearances, teams — it means your guess and the answer share at least one entry but are not identical lists. On single-value tiles there is no partial: gender, type and origin are exact or a miss.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">Does the solver know today's answer?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">No. It filters the character pool using only the guesses and tile colors you enter, and everything runs in your browser. The confirmed answers for both modes are on the <a href="/marveldle-answer-today" class="text-red-700 hover:text-red-800 font-medium underline">Marveldle answer page</a>, updated daily.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">Why is a character I guessed still in the pool?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">Guessed characters are excluded automatically. If someone else you expected to vanish is still listed, one of the tiles you entered does not match your game board — most often a list tile set to exact that the game scored partial, or a tile left untouched, which the filter ignores.</p>
        </details>
        <details class="rounded-xl border border-slate-200 px-5 py-4">
          <summary class="font-semibold text-slate-900 cursor-pointer">Where can I check a past answer?</summary>
          <p class="mt-2 text-slate-600 leading-relaxed">The <a href="/marveldle-archive" class="text-red-700 hover:text-red-800 font-medium underline">Marveldle archive</a> lists every verified day with both the Comics and MCU answers side by side, searchable by character or date.</p>
        </details>
      </div>
    </section>

    <div class="mt-12">
      <InternalLinkSection currentGame="Marveldle" />
    </div>
  </div>
</div>
