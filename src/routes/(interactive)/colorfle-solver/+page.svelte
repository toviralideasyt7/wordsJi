<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import {
    generateBreadcrumbSchema,
    generateFAQSchema,
    generateHowToSchema,
    generateWebPageSchema
  } from '$lib/seo';
  import {
    COLORS,
    COLOR_NAMES,
    checkGuess,
    getAllCombinations,
    getCombinationTargetColor,
    getContrastColor,
    isValidHex,
    normalizeHex,
    solveFromHexTopN,
    type SolveResult
  } from '$lib/colorfle';

  type Feedback = 'green' | 'yellow' | 'gray';

  interface GuessState {
    colors: number[];
    feedback: Array<Feedback | null>;
  }

  interface RgbChannels {
    r: number;
    g: number;
    b: number;
  }

  let hexInput = $state('');
  let errorMessage = $state('');
  let suggestions = $state<SolveResult[]>([]);
  let guesses = $state<GuessState[]>([]);
  let solved = $state(false);
  let showColorPicker = $state(false);
  let pickerColor = $state('#ff0000');
  let pickerHexInput = $state('#ff0000');
  let pickerRgb = $state<RgbChannels>({ r: 255, g: 0, b: 0 });

const faqs = [
        {
                question: 'What is Colorfle?',
                answer: 'Colorfle is a daily color puzzle game where you see a target hex color and must find the three source colors that mix to produce it. You have 6 guesses to find the correct combination. Each guess shows three color swatches, and you receive feedback indicating how close each source color is to the actual answer.'
        },
        {
                question: 'How does the Colorfle solver work?',
                answer: 'The Colorfle solver supports both directions: start from a visible target hex to find the best matching source colors, or enter feedback from your guesses to narrow the remaining combinations.'
        },
        {
                question: 'What is the difference between hex-solving and feedback-solving modes?',
                answer: 'Hex-solving works when you have a target color but no guesses yet. Enter the hex, get the top 5 closest three-color combinations. Feedback-solving works after you have made guesses and marked each swatch with green, yellow, or gray. Click Refine to filter out combinations that contradict your feedback.'
        },
        {
                question: 'Does the solver use the same Colorfle mixing logic?',
                answer: 'Yes. The solver uses the same color list, weighted mixing model, and feedback filtering logic from the source Colorfle project.'
        },
        {
                question: 'Why does the solver show multiple suggestions instead of one answer?',
                answer: 'Colorfle uses three source colors that mix together, so multiple combinations can produce similar target colors. The solver shows the top 5 matches ranked by similarity. Use the feedback from each guess to refine the list and converge on the exact answer.'
        },
        {
                question: 'What do the green, yellow, and gray feedback colors mean in Colorfle?',
                answer: 'Green means the color channel matches exactly — you have the right value. Yellow means you are close but not exact — the correct value is nearby. Gray means you are far off on that channel. Click each color swatch in the guess row to cycle through feedback states.'
        },
        {
                question: 'Can I use the color picker instead of typing a hex code?',
                answer: 'Yes. Click "Pick a Color Instead" below the hex input to open a visual color picker. Select any color, then click "Use This Color" to submit it as your target hex. This is useful when you can see the target color on screen but do not know its hex value.'
        },
        {
                question: 'How does color mixing work in Colorfle?',
                answer: 'Colorfle uses weighted RGB channel mixing. Each source color contributes to the final target by averaging its red, green, and blue channels with specific weights. The solver mirrors this exact mixing model so suggestions match what you would see in the actual game.'
        },
        {
                question: 'Why might a suggestion have a low similarity score?',
                answer: 'Similarity scores below 90% mean the three-color combination produces a noticeably different color than your target. This usually happens with mid-range targets where many combinations cluster together. Lower similarity does not mean the answer is wrong — it means the solver is showing you the closest matches from a limited color palette.'
        },
        {
                question: 'What should I do when refine returns no matches?',
                answer: 'Double-check your feedback settings. If even one swatch has incorrect feedback, the refine step will eliminate all valid combinations. Make sure green means exact match, yellow means close but not exact, and gray means far off. If you are stuck, clear your guesses and start over with a new hex or suggestion.'
        }
];

  const solverLinks = [
    { href: '/colorfle-answer-today', label: 'Colorfle Answer Today' },
    { href: '/colorfle-archive', label: 'Colorfle Archive' },
    { href: '/colordle-solver', label: 'Colordle Solver' },
    { href: '/wordle-solver', label: 'Wordle Solver' },
    { href: '/nerdle-solver', label: 'Nerdle Solver' },
    { href: '/spotle-solver', label: 'Spotle Solver' }
  ];

  function clampChannel(value: number): number {
    return Math.min(255, Math.max(0, Math.round(value)));
  }

  function hexToRgbChannels(hex: string): RgbChannels {
    const normalized = normalizeHex(hex);
    const safeHex = normalized.length === 7 ? normalized : '#ff0000';

    return {
      r: Number.parseInt(safeHex.slice(1, 3), 16),
      g: Number.parseInt(safeHex.slice(3, 5), 16),
      b: Number.parseInt(safeHex.slice(5, 7), 16)
    };
  }

  function rgbChannelsToHex(channels: RgbChannels): string {
    return `#${[channels.r, channels.g, channels.b]
      .map((value) => clampChannel(value).toString(16).padStart(2, '0'))
      .join('')}`;
  }

  function updatePickerChannel(channel: keyof RgbChannels, value: number) {
    const nextChannels = { ...pickerRgb, [channel]: clampChannel(value) };
    pickerRgb = nextChannels;
    pickerColor = rgbChannelsToHex(nextChannels);
  }

  function updatePickerHexInput(value: string) {
    pickerHexInput = value;

    if (!isValidHex(value)) {
      return;
    }

    pickerColor = normalizeHex(value);
  }

  $effect(() => {
    const normalized = normalizeHex(pickerColor);
    if (normalized.length !== 7) {
      return;
    }

    if (pickerHexInput !== normalized) {
      pickerHexInput = normalized;
    }

    const nextChannels = hexToRgbChannels(normalized);
    if (
      nextChannels.r !== pickerRgb.r ||
      nextChannels.g !== pickerRgb.g ||
      nextChannels.b !== pickerRgb.b
    ) {
      pickerRgb = nextChannels;
    }
  });

  function handleSolveHex() {
    if (!isValidHex(hexInput)) {
      errorMessage = 'Enter a valid hex color such as #8ce874.';
      return;
    }

    errorMessage = '';
    suggestions = solveFromHexTopN(normalizeHex(hexInput), 5);
    guesses = [];
    solved = false;
  }

  function applyPickerColor() {
    hexInput = pickerColor;
    showColorPicker = false;
    handleSolveHex();
  }

  function useSuggestion(result: SolveResult) {
    if (solved) return;
    guesses = [...guesses, { colors: result.colors, feedback: [null, null, null] }];
    suggestions = [];
  }

  function cycleFeedback(guessIndex: number, colorIndex: number) {
    const updated = guesses.map((guess, index) => {
      if (index !== guessIndex) return guess;

      const feedback = [...guess.feedback];
      const current = feedback[colorIndex];
      feedback[colorIndex] = current === null ? 'green' : current === 'green' ? 'yellow' : current === 'yellow' ? 'gray' : null;

      return {
        ...guess,
        feedback
      };
    });

    guesses = updated;
    const latest = updated[guessIndex];
    if (latest.feedback.every((value) => value === 'green')) {
      solved = true;
    }
  }

  function refineSuggestions() {
    if (solved || guesses.length === 0 || guesses.some((guess) => guess.feedback.some((value) => value === null))) {
      return;
    }

    const possibilities = getAllCombinations(0).filter((candidate) =>
      guesses.every((guess) => checkGuess(guess.colors, candidate, guess.feedback as Feedback[]))
    );

    if (possibilities.length === 0) {
      errorMessage = 'No combinations matched the selected feedback. Double-check your colors and feedback.';
      suggestions = [];
      return;
    }

    errorMessage = '';
    suggestions = possibilities.slice(0, 5).map((colors) => {
      const target = getCombinationTargetColor(colors, 0);
      return {
        colors,
        colorNames: colors.map((index) => COLOR_NAMES[index]),
        colorHexes: colors.map((index) => COLORS[index]),
        targetColor: target.rgb,
        targetHex: target.hex,
        similarity: 0
      };
    });
  }

  function resetSolver() {
    hexInput = '';
    errorMessage = '';
    suggestions = [];
    guesses = [];
    solved = false;
    showColorPicker = false;
  }

  function feedbackLabel(value: Feedback | null) {
    if (value === 'green') return 'Green';
    if (value === 'yellow') return 'Yellow';
    if (value === 'gray') return 'Gray';
    return 'Unset';
  }

  const pageTitle = 'Colorfle Solver - Free Colorfle Helper Tool | WordSolverX';
  const pageDescription =
    'Use the Colorfle solver to match target hex colors, test Colorfle feedback, and narrow the correct three-color combination fast.';
  const pageUrl = 'https://wordsolverx.com/colorfle-solver';
  const pageImage = 'https://wordsolverx.com/images/colorfle-solver.webp';
</script>

<svelte:head>
  <title>Colorfle Solver - Free Colorfle Helper Tool | WordSolverX</title>
  <meta name="description" content="Use the Colorfle solver to match target hex colors, test Colorfle feedback, and narrow the correct three-color combination fast." />
  <meta name="keywords" content="colorfle solver, colorfle helper, colorfle answer, colorfle color solver" />
  <link rel="canonical" href="https://wordsolverx.com/colorfle-solver" />
  <meta property="og:title" content="Colorfle Solver - Free Colorfle Helper Tool" />
  <meta property="og:description" content="Match Colorfle target hex values or refine guesses with Colorfle-style feedback filtering." />
  <meta property="og:url" content="https://wordsolverx.com/colorfle-solver" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content="https://wordsolverx.com/images/colorfle-solver.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Colorfle Solver" />
  <meta name="twitter:description" content="A static Colorfle solver for target hex matching and feedback-based elimination." />
  <meta name="twitter:image" content="https://wordsolverx.com/images/colorfle-solver.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      generateWebPageSchema(pageTitle, pageDescription, pageUrl, {
        image: pageImage
      }),
      {
        '@type': 'WebApplication',
        name: 'Colorfle Solver',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      generateFAQSchema(faqs),
      generateBreadcrumbSchema([
        { name: 'Home', url: 'https://wordsolverx.com' },
        { name: 'Solver', url: 'https://wordsolverx.com/solver' },
        { name: 'Colorfle Solver', url: 'https://wordsolverx.com/colorfle-solver' }
      ]),
      generateHowToSchema('How to use the Colorfle solver', [
        { name: 'Enter the target hex', text: 'Type or paste the target hex code from Colorfle into the input field, or use the color picker to select it visually.' },
        { name: 'Review suggestions', text: 'Click Solve to see the top 5 three-color combinations that produce the closest match to your target.' },
        { name: 'Use a suggestion as a guess', text: 'Click "Use This" on any suggestion to add it as a guess. Then set the feedback colors (green, yellow, gray) for each source color by clicking the swatches.' },
        { name: 'Refine with feedback', text: 'After setting feedback on all three colors, click Refine. The solver filters out combinations that contradict your feedback and shows updated suggestions.' }
      ])
    ]
  })}</script>`}
</svelte:head>

<main class="min-h-screen bg-pink-50">
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <Breadcrumbs />
  </div>

  <!-- Hero Banner -->
  <section class="mx-auto max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
    <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 px-6 py-8 shadow-2xl text-center space-y-4">
      <p class="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">Color Puzzle Solver</p>
      <h1 class="text-4xl font-black text-white sm:text-5xl">Colorfle Solver</h1>
      <p class="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">Paste your target hex or use the color picker to get matching three-color combinations. Refine with green, yellow, and gray feedback.</p>
    </div>
  </section>

  <!-- Interactive Component -->
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

    <section class="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <article class="rounded-3xl bg-white shadow-sm border border-slate-200 p-8 space-y-5">
        <div>
          <label for="colorfle-target-hex" class="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Target hex</label>
          <div class="mt-3 flex gap-3">
            <input id="colorfle-target-hex" class="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-slate-900" bind:value={hexInput} placeholder="#8ce874" />
            <button type="button" class="rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white hover:bg-pink-500" onclick={handleSolveHex}>Solve</button>
          </div>
          <p class="mt-2 text-sm text-slate-500">You can enter a hex with or without the leading #.</p>
          {#if errorMessage}
            <p class="mt-3 text-sm font-medium text-rose-600">{errorMessage}</p>
          {/if}
        </div>

        <!-- Color Picker Panel -->
        <div class="border-t border-slate-200 pt-5">
          <button
            type="button"
            class="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
            onclick={() => showColorPicker = !showColorPicker}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            {showColorPicker ? 'Hide Color Picker' : 'Pick a Color Instead'}
            <svg class="w-4 h-4 transition-transform {showColorPicker ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {#if showColorPicker}
            <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div class="flex flex-col sm:flex-row items-center gap-4">
                <div class="relative">
                  <input
                    type="color"
                    bind:value={pickerColor}
                    class="h-24 w-24 appearance-none rounded-xl border-2 border-slate-300 bg-white cursor-pointer shadow-sm"
                    style="-webkit-appearance: none; appearance: none;"
                  />
                </div>
                <div class="flex-1 space-y-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected Color</p>
                    <div class="mt-1 flex items-center gap-3">
                      <div class="h-10 w-10 rounded-lg border border-slate-200 shadow-sm" style="background: {pickerColor}"></div>
                      <span class="font-mono text-lg font-bold text-slate-900">{pickerColor}</span>
                    </div>
                  </div>
                  <div>
                    <label for="colorfle-picker-hex" class="text-xs font-semibold uppercase tracking-wider text-slate-400">Hex Input</label>
                    <input
                      id="colorfle-picker-hex"
                      type="text"
                      value={pickerHexInput}
                      inputmode="text"
                      autocapitalize="off"
                      autocomplete="off"
                      spellcheck="false"
                      placeholder="#ff0000"
                      class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-900"
                      oninput={(event) => updatePickerHexInput((event.currentTarget as HTMLInputElement).value)}
                    />
                  </div>
                  <p class="text-sm leading-6 text-slate-500">
                    If your mobile browser limits the native picker, type a hex value here or use the RGB sliders below to reach the exact shade.
                  </p>
                  <button
                    type="button"
                    class="w-full sm:w-auto rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-pink-500 transition-colors shadow-sm"
                    onclick={applyPickerColor}
                  >
                    Use This Color
                  </button>
                </div>
              </div>

              <div class="grid gap-3">
                <div class="grid grid-cols-[4rem_1fr_3rem] items-center gap-3">
                  <label for="colorfle-red" class="text-sm font-semibold text-slate-700">Red</label>
                  <input
                    id="colorfle-red"
                    type="range"
                    min="0"
                    max="255"
                    value={pickerRgb.r}
                    class="w-full accent-rose-500"
                    oninput={(event) =>
                      updatePickerChannel('r', Number((event.currentTarget as HTMLInputElement).value))}
                  />
                  <span class="text-right font-mono text-sm text-slate-600">{pickerRgb.r}</span>
                </div>
                <div class="grid grid-cols-[4rem_1fr_3rem] items-center gap-3">
                  <label for="colorfle-green" class="text-sm font-semibold text-slate-700">Green</label>
                  <input
                    id="colorfle-green"
                    type="range"
                    min="0"
                    max="255"
                    value={pickerRgb.g}
                    class="w-full accent-emerald-500"
                    oninput={(event) =>
                      updatePickerChannel('g', Number((event.currentTarget as HTMLInputElement).value))}
                  />
                  <span class="text-right font-mono text-sm text-slate-600">{pickerRgb.g}</span>
                </div>
                <div class="grid grid-cols-[4rem_1fr_3rem] items-center gap-3">
                  <label for="colorfle-blue" class="text-sm font-semibold text-slate-700">Blue</label>
                  <input
                    id="colorfle-blue"
                    type="range"
                    min="0"
                    max="255"
                    value={pickerRgb.b}
                    class="w-full accent-sky-500"
                    oninput={(event) =>
                      updatePickerChannel('b', Number((event.currentTarget as HTMLInputElement).value))}
                  />
                  <span class="text-right font-mono text-sm text-slate-600">{pickerRgb.b}</span>
                </div>
              </div>
            </div>
          {/if}
        </div>

        {#if guesses.length > 0}
          <div class="space-y-4 border-t border-slate-200 pt-6">
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-xl font-black text-slate-900">Guesses</h2>
              {#if !solved && guesses.length > 0 && guesses.every((guess) => guess.feedback.every((value) => value !== null))}
                <button type="button" class="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500" onclick={refineSuggestions}>Refine</button>
              {/if}
            </div>

            {#each guesses as guess, guessIndex}
              <div class="rounded-2xl border border-slate-200 p-4">
                <div class="grid grid-cols-3 gap-4">
                  {#each guess.colors as colorIndex, colorIndexPosition}
                    <button type="button" class="rounded-2xl border border-slate-200 p-3 text-center" onclick={() => cycleFeedback(guessIndex, colorIndexPosition)}>
                      <div class="mx-auto h-16 w-16 rounded-2xl border border-slate-200" style={`background:${COLORS[colorIndex]}`}></div>
                      <p class="mt-3 font-semibold text-slate-900">{COLOR_NAMES[colorIndex]}</p>
                      <p class="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{feedbackLabel(guess.feedback[colorIndexPosition])}</p>
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if solved}
          <div class="rounded-2xl border border-teal-300 bg-teal-50 p-5">
            <p class="text-lg font-black text-teal-800">Solved.</p>
            <p class="mt-2 text-sm text-teal-700">The latest feedback indicates the current suggestion is the exact Colorfle answer.</p>
          </div>
        {/if}
      </article>

      <article class="rounded-3xl bg-white shadow-sm border border-slate-200 p-8">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-2xl font-black text-slate-900">Suggestions</h2>
          <span class="text-sm text-slate-500">{suggestions.length} shown</span>
        </div>

        {#if suggestions.length === 0}
          <p class="mt-6 text-slate-600">Start by entering a target hex above or use the color picker. After that, you can use the feedback cycle to refine the remaining Colorfle combinations.</p>
        {:else}
          <div class="mt-6 space-y-4">
            {#each suggestions as suggestion}
              <div class="rounded-2xl border border-slate-200 overflow-hidden">
                <div class="grid gap-4 p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                  <div class="h-20 w-20 rounded-2xl border border-slate-200 flex items-center justify-center text-xs font-mono font-bold" style={`background:${suggestion.targetHex}; color:${getContrastColor(suggestion.targetHex)}`}>
                    {suggestion.targetHex}
                  </div>
                  <div>
                    <div class="flex flex-wrap gap-3">
                      {#each suggestion.colors as colorIndex, index}
                        <div class="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                          <span class="h-8 w-8 rounded-lg border border-slate-200" style={`background:${COLORS[colorIndex]}`}></span>
                          <div>
                            <p class="text-sm font-semibold text-slate-900">{COLOR_NAMES[colorIndex]}</p>
                            <p class="text-xs font-mono text-slate-500">{suggestion.colorHexes[index]}</p>
                          </div>
                        </div>
                      {/each}
                    </div>
                    {#if suggestion.similarity > 0}
                      <p class="mt-3 text-sm text-slate-500">Similarity {suggestion.similarity.toFixed(1)}%</p>
                    {/if}
                  </div>
                  <button type="button" class="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500" onclick={() => useSuggestion(suggestion)}>Use This</button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </article>
</section>

<div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <h2 class="text-3xl font-bold text-slate-900 mb-5">What Colorfle Is and Why It Is Harder Than It Looks</h2>
                <p class="text-slate-600 leading-relaxed">Colorfle is a daily puzzle where you see one target color and must find the three source colors that mix to produce it. The twist: you pick from a fixed palette of about 280 colors, and the mixing uses weighted RGB averaging. You have six guesses. Each guess shows three color swatches, and you get feedback on how close each one is to the answer. Green means exact match on that channel. Yellow means close. Gray means you are nowhere near. Most people expect to solve it like Wordle — just keep guessing until something clicks. They are wrong. The color space is large enough that brute-force guessing rarely works in six tries. The solver exists because finding the right three-color combination from 280 options is genuinely difficult without help.</p>
                <p class="text-slate-600 leading-relaxed mt-4">Here is why it trips people up: the game gives you feedback per color channel, not per color. If your red channel is wrong on any of the three source colors, you mark that swatch gray. If it is close, you mark it yellow. If it matches exactly, you mark it green. You do this for all three source colors in each guess. After two or three guesses, you have a dense web of constraints. The solver uses those constraints to eliminate impossible combinations and show you what remains.</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <h2 class="text-3xl font-bold text-slate-900 mb-5">How the Solver Finds Matching Color Combinations</h2>
                <p class="text-slate-600 leading-relaxed">When you enter a target hex, the solver calculates which three-color combinations from the palette produce the closest match. It runs through thousands of possible combinations and ranks them by similarity — how close the mixed result is to your target. The top five appear as suggestions. You can click "Use This" on any suggestion to add it as a guess and start marking feedback.</p>
                <p class="text-slate-600 leading-relaxed mt-4">The hex-solving approach works best when you are starting fresh and want a shortlist of candidates. You might see five combinations that all look plausible. That is normal. Colorfle has what designers call "color degeneracy" — multiple different recipes can produce nearly identical results. The solver does not know which one is correct. That is where the feedback system comes in. Make a guess, mark the feedback, and let the solver narrow things down.</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <h2 class="text-3xl font-bold text-slate-900 mb-5">Using Feedback to Eliminate Impossible Combinations</h2>
                <p class="text-slate-600 leading-relaxed">The feedback cycle is the real power of the solver. After you make a guess, click each source color swatch to cycle through green, yellow, and gray. Green means that color channel matches exactly. Yellow means the real answer is nearby on that channel. Gray means you are far off. Once you have marked all three swatches, the Refine button becomes active. Click it and the solver removes every combination that would produce different feedback.</p>
                <p class="text-slate-600 leading-relaxed mt-4">The logic is straightforward: if you marked a swatch gray, that channel on that source color must be significantly different from the actual answer. The solver checks each candidate combination and discards any where that channel would produce yellow or green instead. After two or three refinement cycles, you are usually looking at one or two combinations left. That is when you make your final guess with confidence.</p>
                <div class="mt-5 flex flex-wrap gap-4">
                        <div class="flex items-center gap-2">
                                <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white">G</span>
                                <span class="text-slate-700 font-medium">Exact match on this channel</span>
                        </div>
                        <div class="flex items-center gap-2">
                                <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-slate-900">Y</span>
                                <span class="text-slate-700 font-medium">Close but not exact</span>
                        </div>
                        <div class="flex items-center gap-2">
                                <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-400 text-sm font-bold text-white">X</span>
                                <span class="text-slate-700 font-medium">Far off on this channel</span>
                        </div>
                </div>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <h2 class="text-3xl font-bold text-slate-900 mb-5">The Color Picker Is Your Friend When You See But Cannot Type</h2>
                <p class="text-slate-600 leading-relaxed">If you are playing Colorfle on another tab or device, you might see the target color without knowing its hex code. You could try to guess the hex from memory. Do not. Click "Pick a Color Instead" below the hex input. A visual color picker appears. Use it to sample the exact color you see on screen, then click "Use This Color." The picker returns the precise hex value and the solver immediately calculates matching combinations.</p>
                <p class="text-slate-600 leading-relaxed mt-4">This works for anyone who uses a second monitor or plays on a different device. You do not need to transcribe hex codes by hand. The color picker reads the exact RGB values from whatever color you select. A few clicks and you have suggestions on screen. No memorization, no conversion, no guesswork.</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <h2 class="text-3xl font-bold text-slate-900 mb-5">Why Your Target Color Might Show Multiple Plausible Combinations</h2>
                <p class="text-slate-600 leading-relaxed">The color space in Colorfle is quantized. You pick from 280 specific colors, and mixing is done with weighted RGB averaging. This means different three-color combinations can and do produce the same, or nearly the same, target color. The solver calls this "color degeneracy." It is not a flaw in the solver — it is a property of the game itself.</p>
                <p class="text-slate-600 leading-relaxed mt-4">When you enter a hex and see five suggestions that all look reasonable, that is the degeneracy at work. The mixed result of combination A might be #7a9c3e and combination B might be #7b9d3f. Visually identical on screen. The similarity score tells you how close each combination gets, but it cannot tell you which one is the official answer. You narrow that down through feedback, not through similarity alone.</p>
                <p class="text-slate-600 leading-relaxed mt-4">Mid-range targets — colors that are neither very dark nor very saturated — tend to have the most degeneracy. Deep greens and bright reds tend to be more distinctive. If you are stuck between two suggestions, make one your next guess and pay attention to the feedback pattern. Small differences in feedback will quickly separate them.</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <h2 class="text-3xl font-bold text-slate-900 mb-5">How Weighted RGB Mixing Works in Colorfle</h2>
                <p class="text-slate-600 leading-relaxed">Colorfle does not use simple averaging. It uses weighted channel mixing where each source color contributes differently to the final result. The exact weights are the same ones used in the official Colorfle game. When you see a suggestion with 94% similarity, that means the weighted mix of those three colors produces a result within a few RGB points of your target. At 80%, the difference is more visible but still in the same color family.</p>
                <p class="text-slate-600 leading-relaxed mt-4">The solver mirrors this logic precisely. If you use the solver to find a combination and then enter it as a guess in the actual game, the feedback should be consistent. The colors will mix the same way in both places. If you ever see a mismatch between what the solver shows and what the game produces, the game itself may be using slightly different display settings or color profiles on your monitor.</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <h2 class="text-3xl font-bold text-slate-900 mb-5">When a Suggestion Has a Low Similarity Score</h2>
                <p class="text-slate-600 leading-relaxed">You might see a suggestion with 75% or 80% similarity and wonder if something is wrong. Nothing is wrong. That combination is the best match available from the fixed color palette. If your target is #5d7a3c, the solver found that the closest three-color mix produces #5c7b3d — close enough for government work, as they say, but not pixel-perfect. The game allows for this tolerance because not every hex falls exactly on a mixable coordinate.</p>
                <p class="text-slate-600 leading-relaxed mt-4">Low similarity scores appear more often with mid-range targets. Colors like #8c9ea3 or #6b7c85 — muted, middle-toned — sit in a region where many combinations cluster. High similarity scores are easier to hit when your target is very saturated or very dark. If you get a low score, do not panic. Enter the suggestion as a guess and see what feedback you get. The feedback will guide you more reliably than the similarity number ever could.</p>
        </div>

        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
                <h2 class="text-3xl font-bold text-slate-900 mb-5">What to Do When Refine Says No Matches Found</h2>
                <p class="text-slate-600 leading-relaxed">If you click Refine and get a "no combinations matched" error, your feedback is wrong. That is the most likely explanation. Maybe you marked a swatch green when it should have been yellow, or yellow when it should have been gray. One wrong mark eliminates all correct candidates. The solver cannot recover from incorrect feedback — it can only eliminate combinations that contradict it.</p>
                <p class="text-slate-600 leading-relaxed mt-4">When this happens, go back and re-examine your guess. The target is #7c8a3d and your swatch was #6b7c2d — is that channel exactly right or just close? If it is close but not exact, it should be yellow, not green. If you genuinely cannot tell, start fresh. Clear your guesses and try a different suggestion as your next guess. The feedback from a fresh guess is more valuable than a forced fit on a previous one.</p>
        </div>
</div>

<div class="rounded-3xl border border-slate-200 bg-white p-2 shadow-xl">
        <FAQSection class="py-0" title="Colorfle Solver FAQ" {faqs} />
    </div>

    <section class="rounded-3xl bg-slate-100 p-8 text-center space-y-6">
      <h2 class="text-2xl font-bold text-slate-900">More Solvers</h2>
      <div class="flex flex-wrap justify-center gap-3">
        {#each solverLinks as link}
          <a href={link.href} class="px-5 py-2.5 bg-white rounded-xl font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">{link.label}</a>
        {/each}
      </div>
    </section>
  </div>

    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />
    </div>
  </main>
