<script lang="ts">
  import type { FramedGameConfig } from '$lib/framed';

  let {
    game,
    answer,
    puzzleNumber,
    featured = false
  }: {
    game: FramedGameConfig;
    answer: string;
    puzzleNumber: number;
    featured?: boolean;
  } = $props();
</script>

<article class={`h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${featured ? 'shadow-md' : ''}`}>
  <div class={`h-1.5 bg-gradient-to-r ${game.gradient}`}></div>
  <div class={`flex h-full flex-col ${featured ? 'p-6 sm:p-7' : 'p-5'}`}>
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">{game.label}</p>
        <h3 class={`mt-2 font-bold text-slate-900 ${featured ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>{answer}</h3>
        <p class={`mt-1.5 leading-relaxed text-slate-500 ${featured ? 'min-h-0 text-base' : 'min-h-[3rem] text-sm'}`}>
          {game.description}
        </p>
      </div>
      <span class="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xl">
        {game.emoji}
      </span>
    </div>

    <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5 text-sm">
      <span class="text-slate-400 font-medium">Puzzle</span>
      <span class="rounded-md bg-slate-50 px-2 py-0.5 font-mono font-semibold text-slate-700 border border-slate-100">#{puzzleNumber}</span>
    </div>
  </div>
</article>
