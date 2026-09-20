<script lang="ts">
  import { GUIDES } from '$lib/content/guides';

  let {
    slug,
    group,
    limit = 4
  }: {
    slug: string;
    group: string;
    limit?: number;
  } = $props();

  /** Same-group siblings first, then the rest — every link is a real route. */
  const related = $derived.by(() => {
    const others = GUIDES.filter((guide) => guide.slug !== slug);
    const sameGroup = others.filter((guide) => guide.group === group);
    const rest = others.filter((guide) => guide.group !== group);
    return [...sameGroup, ...rest].slice(0, limit);
  });
</script>

<section class="mt-12">
  <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Related guides</h2>
  <p class="mt-2 text-slate-500 dark:text-slate-400">Keep going with the guides that pair with this one.</p>
  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    {#each related as guide}
      <a
        href="/guides/{guide.slug}"
        class="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-teal-700"
      >
        <span
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br {guide.gradient} text-xl"
          aria-hidden="true">{guide.icon}</span
        >
        <span class="min-w-0">
          <span class="block font-bold leading-snug text-slate-900 dark:text-slate-50">{guide.cardTitle}</span>
          <span class="mt-1 block text-sm leading-relaxed text-slate-500 dark:text-slate-400">{guide.description}</span>
        </span>
      </a>
    {/each}
  </div>
</section>
