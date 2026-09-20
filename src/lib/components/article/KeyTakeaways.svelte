<script lang="ts">
  let {
    items,
    heading = 'Key takeaways'
  }: {
    items: string[];
    heading?: string;
  } = $props();
</script>

<!-- Scannable summary. Rendered as a plain list so the text is fully crawlable. -->
<aside class="mt-8 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-6 sm:p-7 dark:border-teal-800 dark:from-teal-950/40 dark:to-emerald-950/40">
  <h2 class="text-xs font-bold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">{heading}</h2>
  <ul class="mt-4 space-y-3">
    {#each items as item}
      <li class="flex items-start gap-3">
        <span
          class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white"
          aria-hidden="true">✓</span
        >
        <span class="leading-relaxed text-slate-700 dark:text-slate-200">{@html item}</span>
      </li>
    {/each}
  </ul>
</aside>
