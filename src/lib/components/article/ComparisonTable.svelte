<script lang="ts">
  import type { StaticArticleTableFigure } from '$lib/content/registry';

  let { visual }: { visual: StaticArticleTableFigure } = $props();
</script>

<div class="overflow-x-auto">
  <table class="w-full border-collapse text-left text-sm">
    <thead>
      <tr class="border-b border-slate-200 dark:border-slate-700">
        <th scope="col" class="py-2 pr-4 font-bold text-slate-500 dark:text-slate-400">{visual.headers[0]}</th>
        <th scope="col" class="py-2 font-bold text-slate-500 dark:text-slate-400">{visual.headers[1]}</th>
      </tr>
    </thead>
    <tbody>
      {#each visual.rows as row}
        <tr
          class="border-b border-slate-100 last:border-b-0 dark:border-slate-700/60 {row.highlight
            ? 'bg-teal-50 dark:bg-teal-900/20'
            : ''}"
        >
          <th
            scope="row"
            class="py-2.5 pr-4 font-semibold text-slate-800 dark:text-slate-100 {row.highlight ? 'text-teal-800 dark:text-teal-200' : ''}"
          >
            {row.label}
          </th>
          <td class="py-2.5 text-slate-600 dark:text-slate-300">{row.value}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
