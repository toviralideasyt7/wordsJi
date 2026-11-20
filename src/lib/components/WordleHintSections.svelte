<script lang="ts">
  interface HintFact {
    label: string;
    value: string;
  }

  interface HintSection {
    slug: string;
    label: string;
    question: string;
    value: string;
    explain: string;
    emptyNote: string;
    extraFacts: HintFact[];
  }

  interface Props {
    sections: HintSection[];
    formattedDate: string;
    wordleNumber: number;
    aiOneLiner?: string;
    difficultyLabel?: string;
    difficultyScore?: number;
    difficultyReason?: string;
  }

  let {
    sections,
    formattedDate,
    wordleNumber,
    aiOneLiner = '',
    difficultyLabel = '',
    difficultyScore = 0,
    difficultyReason = ''
  }: Props = $props();
</script>

<!-- The 12 daily Wordle hint sections, rendered on the answer page itself.
     Values come from the deterministic buildHintContent builders, computed in
     the page's server load from the same word the page reveals, so a hint can
     never contradict the answer above it. -->
<section aria-label="Wordle hints" class="bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-8">
  <h2 class="text-2xl font-bold text-gray-900 mb-2">Wordle Hints for {formattedDate}</h2>
  <p class="text-gray-600 leading-relaxed mb-6">
    Twelve hints for Wordle #{wordleNumber}, ordered from gentlest to strongest. The early ones only
    narrow the word down — a starting letter, a vowel count. The last one, the definition, all but
    gives the word away. Take only as much help as you need.
  </p>

  {#if aiOneLiner}
    <aside class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
      <p class="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-1">Bonus clue</p>
      <p class="text-gray-800 italic">{aiOneLiner}</p>
    </aside>
  {/if}

  {#if difficultyLabel}
    <div class="flex flex-wrap items-center gap-2 mb-8">
      <span class="text-sm font-medium text-gray-600">Difficulty:</span>
      <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
        {difficultyLabel}{#if difficultyScore > 0}&nbsp;({difficultyScore}/10){/if}
      </span>
      {#if difficultyReason}
        <span class="text-xs text-gray-500">{difficultyReason}</span>
      {/if}
    </div>
  {/if}

  <nav aria-label="Hint sections" class="mb-10">
    <div class="flex flex-wrap gap-2">
      {#each sections as section}
        <a
          href={`#${section.slug}`}
          class="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-800 hover:border-emerald-400 hover:shadow-sm transition"
        >
          {section.label}
        </a>
      {/each}
    </div>
  </nav>

  <div class="space-y-6">
    {#each sections as section}
      <section id={section.slug} aria-label={section.question} class="bg-emerald-50/40 rounded-2xl border border-emerald-100 p-6 sm:p-8 scroll-mt-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4">{section.question}</h3>
        {#if section.value}
          <p class="text-4xl sm:text-5xl font-black text-emerald-600 tracking-widest break-words text-center py-2">
            {section.value}
          </p>
        {:else}
          <p class="text-lg text-gray-600 text-center py-2">{section.emptyNote}</p>
        {/if}
        <p class="text-gray-700 leading-relaxed mt-4">{section.explain}</p>

        {#if section.extraFacts.length > 0}
          <dl class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
            {#each section.extraFacts as fact}
              <div class="bg-white rounded-xl border border-emerald-100 px-4 py-3 text-center">
                <dt class="text-xs uppercase tracking-wide text-gray-500">{fact.label}</dt>
                <dd class="text-xl font-bold text-gray-900">{fact.value}</dd>
              </div>
            {/each}
          </dl>
        {/if}
      </section>
    {/each}
  </div>
</section>
