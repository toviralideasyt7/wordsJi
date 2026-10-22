<script lang="ts">
  import { clockTime, embedUrl } from '$lib/video-seo';

  let { data } = $props();
  const video = $derived(data.video);
  const playerSrc = $derived(`${embedUrl(video.videoId)}?rel=0`);
  const evidenceText = $derived(
    video.evidence && video.evidence.length > 1600
      ? `${video.evidence.slice(0, 1597)}...`
      : video.evidence
  );

  // Honours the ?t=<seconds> deep links used by the VideoObject Clip
  // markup and the chapter list: restarts the (already rendered) player at
  // the requested offset. The iframe itself is in the initial HTML at full
  // size — this script only adjusts its start position after a deep link.
  const SEEK_SCRIPT = `<script>
(function () {
  function seek() {
    var t = null;
    try {
      t = new URLSearchParams(window.location.search).get('t');
    } catch (e) {
      return;
    }
    if (!t) return;
    var start = parseInt(t, 10);
    if (!(start > 0)) return;
    var frame = document.querySelector('iframe[data-wsx-watch]');
    if (!frame) return;
    frame.src =
      'https://www.youtube-nocookie.com/embed/' +
      frame.getAttribute('data-video-id') +
      '?start=' +
      start +
      '&autoplay=1&rel=0';
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', seek);
  } else {
    seek();
  }
})();
<\/script>`;
</script>

<svelte:head>
  <title>{video.title}</title>
  <meta name="description" content={video.description} />
  <link rel="canonical" href={video.watchUrl} />
  <meta property="og:title" content={video.title} />
  <meta property="og:description" content={video.description} />
  <meta property="og:type" content="video.other" />
  <meta property="og:url" content={video.watchUrl} />
  <meta property="og:site_name" content="WordSolverX" />
  <meta property="og:image" content={video.thumbnailUrl} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={video.title} />
  <meta name="twitter:description" content={video.description} />
  <meta name="twitter:image" content={video.thumbnailUrl} />
  {@html `<script type="application/ld+json">${data.schemaJson}</script>`}
  {@html SEEK_SCRIPT}
</svelte:head>

<div class="mx-auto w-full max-w-[880px] px-4 py-10">
  <nav aria-label="Breadcrumb" class="text-sm font-medium text-slate-500">
    <a class="hover:text-slate-900" href="/">Home</a>
    <span aria-hidden="true"> / </span>
    <a class="hover:text-slate-900" href="/{video.game}-answer-today">{video.gameName} Answer Today</a>
    <span aria-hidden="true"> / </span>
    <span class="text-slate-900">Watch — {video.dateStr}</span>
  </nav>

  <h1 class="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{video.title}</h1>

  <div class="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl">
    <iframe
      class="absolute inset-0 h-full w-full border-0"
      src={playerSrc}
      title={video.title}
      loading="lazy"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowfullscreen
      data-wsx-watch
      data-video-id={video.videoId}
    ></iframe>
  </div>

  <p class="mt-4 text-sm font-medium text-slate-500">
    {video.gameName} video solve for {video.dateStr}
    {#if video.durationS}
      · {clockTime(video.durationS)} long
    {/if}
  </p>

  <p class="mt-4 text-base leading-relaxed text-slate-700">{video.description}</p>

  {#if video.answer || video.answers}
    <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-xl font-extrabold text-slate-900">
        The {video.gameName} answer for {video.dateStr}
      </h2>
      {#if video.answers}
        <ul class="mt-3 space-y-1.5 text-base text-slate-700">
          {#each video.answers as entry}
            <li><strong class="text-slate-900">{entry.mode}:</strong> {entry.value}</li>
          {/each}
        </ul>
      {:else}
        <p class="mt-3 text-lg font-bold text-slate-900">{video.answer}</p>
      {/if}
      <p class="mt-4 text-sm text-slate-600">
        Prefer to read it?
        <a class="font-semibold text-purple-700 underline" href={video.answerPath}>
          Read the full {video.gameName} answer for {video.dateStr}
        </a>
      </p>
    </section>
  {/if}

  {#if video.chapters.length > 1}
    <section class="mt-8">
      <h2 class="text-xl font-extrabold text-slate-900">Chapters</h2>
      <ol class="mt-3 space-y-1.5">
        {#each video.chapters as chapter}
          <li>
            <a
              class="font-medium text-purple-700 underline"
              href="{video.watchPath}?t={chapter.start}"
            >
              {clockTime(chapter.start)} — {chapter.label}
            </a>
          </li>
        {/each}
      </ol>
    </section>
  {/if}

  {#if evidenceText}
    <section class="mt-8">
      <h2 class="text-xl font-extrabold text-slate-900">How this solve went</h2>
      <p class="mt-3 text-base leading-relaxed text-slate-700">{evidenceText}</p>
    </section>
  {/if}

  <nav class="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 pt-6 text-sm font-semibold">
    <a class="text-purple-700 underline" href={video.answerPath}>
      {video.gameName} answer for {video.dateStr}
    </a>
    <a class="text-purple-700 underline" href="/{video.game}-answer-today">
      Latest {video.gameName} answer
    </a>
    {#if data.prev}
      <a class="text-purple-700 underline" href={data.prev.watchPath}>
        ← Previous day ({data.prev.dateStr})
      </a>
    {/if}
    {#if data.next}
      <a class="text-purple-700 underline" href={data.next.watchPath}>
        Next day ({data.next.dateStr}) →
      </a>
    {/if}
  </nav>
</div>
