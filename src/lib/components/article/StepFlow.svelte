<script lang="ts">
  import type { StaticArticleStepFigure } from '$lib/content/registry';

  let { visual }: { visual: StaticArticleStepFigure } = $props();
</script>

<ol class="space-y-4">
  {#each visual.steps as step, i}
    <li class="flex gap-4">
      <span
        class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-sm font-bold text-white"
        aria-hidden="true">{i + 1}</span
      >
      <div class="min-w-0">
        <p class="font-bold text-slate-900 dark:text-slate-50">{step.title}</p>
        <p class="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">{step.body}</p>
      </div>
    </li>
  {/each}
</ol>
