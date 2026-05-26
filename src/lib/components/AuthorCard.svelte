<script lang="ts">
  import { PRESTON_HAYES_AUTHOR_SAME_AS } from '$lib/authors';

  let {
    name,
    image,
    description
  }: {
    name: string;
    image: string;
    description: string;
  } = $props();
</script>

<section
  class="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
  aria-labelledby="author-heading"
>
  <div class="flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:p-7 sm:text-left">
    <div class="shrink-0 rounded-3xl bg-gradient-to-br from-teal-50 via-white to-sky-50 p-2 shadow-sm ring-1 ring-black/5 dark:from-teal-950/30 dark:via-slate-900 dark:to-sky-950/30 dark:ring-white/10">
      <img
        src={image}
        alt={`Photo of ${name}`}
        width="96"
        height="96"
        class="h-20 w-20 rounded-full object-cover shadow-md sm:h-24 sm:w-24"
        loading="lazy"
        decoding="async"
      />
    </div>

    <div class="min-w-0 flex-1">
      <p class="text-xs font-semibold uppercase tracking-[0.28em] text-teal-600 dark:text-teal-400">
        Written by
      </p>
      <h2 id="author-heading" class="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 md:text-3xl">
        {name}
      </h2>
      <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
        {description}
      </p>
      <!-- E-E-A-T: External profile links so readers and Google can verify the author's identity -->
      <div class="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
        {#each PRESTON_HAYES_AUTHOR_SAME_AS as profileUrl}
          {@const label = profileUrl.includes('pinterest.com') ? 'Pinterest' : 'Profile'}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors"
          >
            {label}
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>
