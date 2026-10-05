<script lang="ts">
  import { STRATEGY_DEEP_DIVES } from '$lib/content/strategy-deep-dives';

  interface Props {
    /** Route slug key in STRATEGY_DEEP_DIVES, e.g. 'wordle-answer-today'. */
    slug: string;
  }

  let { slug }: Props = $props();

  const sections = $derived(STRATEGY_DEEP_DIVES[slug] ?? []);
</script>

{#if sections.length > 0}
  <section aria-label="Strategy guide" class="space-y-6">
    {#each sections as section}
      <div class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">
          {section.heading}
        </h2>
        {#each section.blocks as block}
          {#if block.type === 'paragraphs'}
            {#each block.paragraphs as paragraph}
              <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">{@html paragraph}</p>
            {/each}
          {:else if block.type === 'subhead'}
            <h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">{block.heading}</h3>
            {#each block.paragraphs as paragraph}
              <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">{@html paragraph}</p>
            {/each}
          {:else if block.type === 'list'}
            {#if block.ordered}
              <ol class="list-decimal ml-6 mb-4 space-y-3 text-slate-600 leading-relaxed sm:text-lg">
                {#each block.items as item}
                  <li>{@html item}</li>
                {/each}
              </ol>
            {:else}
              <ul class="list-disc ml-6 mb-4 space-y-3 text-slate-600 leading-relaxed sm:text-lg">
                {#each block.items as item}
                  <li>{@html item}</li>
                {/each}
              </ul>
            {/if}
          {:else if block.type === 'faq'}
            <div class="mt-4 space-y-3">
              {#each block.items as item}
                <div class="rounded-2xl bg-slate-50 p-5">
                  <h3 class="font-bold text-slate-900 mb-1">{item.question}</h3>
                  <p class="text-slate-600 leading-relaxed">{@html item.answer}</p>
                </div>
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  </section>
{/if}
