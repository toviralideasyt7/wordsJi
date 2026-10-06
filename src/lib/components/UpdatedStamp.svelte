<script lang="ts">
  // Renders a pre-computed "last updated" stamp verbatim. The same string is
  // placed in the page FAQ, so do not reformat it here.
  let { stamp = '' }: { stamp?: string } = $props();
</script>

{#if stamp}
  <div class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
    <svg class="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
    <p class="text-sm text-slate-600 dark:text-slate-400">{stamp}</p>
  </div>
{/if}
