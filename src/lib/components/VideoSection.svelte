<script lang="ts">
  // Click-to-play YouTube facade for the daily answer pages.
  //
  // Published: renders the poster + play button only — NO iframe in the
  // initial HTML — and swaps in the privacy-domain player on click.
  // Not yet published: renders the exact same reserved 16:9 frame with a
  // "Video will be published soon" message, so the page never shifts
  // layout when the video lands.
  //
  // Why the click is wired by a tiny delegated script instead of a Svelte
  // state toggle: most of these answer pages ship with `csr = false`, so
  // no framework JavaScript ever runs on them and a hydrated onclick
  // would be dead. The component therefore emits one small inline script
  // (in <svelte:head>, published branch only) that listens for clicks on
  // [data-wsx-video] buttons and swaps in the iframe. It uses no fixed
  // element IDs and no global styles — everything is keyed to the data
  // attributes this component renders. The same listener (capture phase)
  // swaps a failed maxres poster for the hq fallback.
  interface Props {
    /** YouTube video id for the page's own date, or null when unpublished. */
    videoId: string | null;
    /** Display name of the game, e.g. "Spotle". */
    gameName: string;
    /** Human-readable date the page is displaying, e.g. "October 20, 2026". */
    dateStr: string;
    /** ISO publish timestamp from the database, when known. */
    uploadDate?: string | null;
    /** Path of the video's dedicated watch page (published branch only). */
    watchUrl?: string | null;
  }

  let { videoId, gameName, dateStr, uploadDate = null, watchUrl = null }: Props = $props();

  const title = $derived(`${gameName} Answer Today — ${dateStr} (Video Solve)`);
  const posterMax = $derived(
    videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null
  );
  const posterHq = $derived(videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null);

  const videoSchema = $derived(
    videoId
      ? JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: title,
          description: `Watch the ${gameName} solve for ${dateStr}: the confirmed answer, the clues, and how the puzzle was cracked.`,
          // hqdefault only: it is the one thumbnail URL guaranteed to
          // exist for every public video, and it must match the URL the
          // watch page and the video sitemap declare for this video.
          // (No contentUrl: for a YouTube embed there is no direct media
          // file URL, and Google requires contentUrl to be exactly that.)
          thumbnailUrl: [posterHq],
          ...(uploadDate ? { uploadDate } : {}),
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`
        })
      : null
  );

  // Delegated click-to-play + poster fallback. Plain classic script (no
  // template literals inside) registered once per page via a window flag.
  const FACADE_SCRIPT = `<script>
(function () {
  if (window.__wsxVideoFacade) return;
  window.__wsxVideoFacade = true;
  document.addEventListener('click', function (event) {
    var node = event.target;
    var button = node && node.closest ? node.closest('[data-wsx-video]') : null;
    if (!button) return;
    var id = button.getAttribute('data-video-id');
    if (!id) return;
    var iframe = document.createElement('iframe');
    iframe.src =
      'https://www.youtube-nocookie.com/embed/' +
      id +
      '?autoplay=1&rel=0&modestbranding=1';
    iframe.title = button.getAttribute('data-video-title') || 'Video';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    iframe.setAttribute('allowfullscreen', '');
    button.replaceWith(iframe);
  });
  document.addEventListener(
    'error',
    function (event) {
      var img = event.target;
      if (!img || img.tagName !== 'IMG' || !img.hasAttribute('data-wsx-poster')) return;
      var fallback = img.getAttribute('data-poster-fallback');
      if (fallback && img.src !== fallback) img.src = fallback;
    },
    true
  );
})();
<\/script>`;
</script>

<svelte:head>
  {#if videoSchema}
    {@html `<script type="application/ld+json">${videoSchema}</script>`}
    {@html FACADE_SCRIPT}
  {/if}
</svelte:head>

<div class="yt-embed">
  <div class="yt-glow" aria-hidden="true"></div>
  <div class="yt-frame">
    <div class="yt-inner">
      {#if videoId}
        <button
          type="button"
          class="yt-play"
          aria-label="Play video: {title}"
          data-wsx-video
          data-video-id={videoId}
          data-video-title={title}
        >
          <img
            class="yt-poster"
            alt=""
            loading="lazy"
            src={posterMax}
            data-wsx-poster
            data-poster-fallback={posterHq}
          />
          <span class="yt-shade"></span>
          <span class="yt-wrap">
            <span class="yt-ping"></span>
            <span class="yt-circle">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </span>
          <span class="yt-pill"><i></i>Watch the solve</span>
        </button>
      {:else}
        <div class="yt-soon" role="status">
          <span class="yt-soon-circle" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </span>
          <p class="yt-soon-text">Video will be published soon</p>
          <p class="yt-soon-sub">{gameName} &middot; {dateStr}</p>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if videoId && watchUrl}
  <p class="yt-watch-row">
    <a class="yt-watch-link" href={watchUrl}>Watch the full solve on its own watch page</a>
  </p>
{/if}

<style>
  .yt-embed {
    --yt-accent: #a855f7;
    --yt-rgb: 168, 85, 247;
    position: relative;
    isolation: isolate;
    width: 100%;
    max-width: 880px;
    margin-inline: auto;
  }
  .yt-glow {
    position: absolute;
    inset: -2rem;
    z-index: -1;
    opacity: 0.6;
    filter: blur(60px);
    pointer-events: none;
    background: radial-gradient(
      60% 60% at 50% 40%,
      rgba(var(--yt-rgb), 0.35),
      rgba(var(--yt-rgb), 0.18) 45%,
      transparent 70%
    );
  }
  .yt-frame {
    position: relative;
    z-index: 1;
    border-radius: 1.6rem;
    padding: 1px;
    background: linear-gradient(
      to bottom right,
      rgba(var(--yt-rgb), 0.45),
      rgba(149, 142, 160, 0.15) 50%,
      rgba(208, 188, 255, 0.35)
    );
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
  }
  .yt-inner {
    position: relative;
    overflow: hidden;
    border-radius: calc(1.6rem - 1px);
    background: #05050d;
    aspect-ratio: 16 / 9;
  }
  /* The iframe is swapped in by the facade script at click time, so it
     never appears in static markup — :global keeps the rule scoped to
     .yt-inner descendants without tripping the unused-selector check. */
  .yt-inner :global(iframe) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
  .yt-play {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    display: block;
    outline: none;
  }
  .yt-play:focus-visible {
    box-shadow: inset 0 0 0 2px rgba(var(--yt-rgb), 0.7);
  }
  .yt-poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.01);
    transition: transform 700ms ease-out;
  }
  .yt-play:hover .yt-poster {
    transform: scale(1.06);
  }
  .yt-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(5, 5, 13, 0.75),
      rgba(5, 5, 13, 0.1) 50%,
      rgba(5, 5, 13, 0.3)
    );
  }
  .yt-wrap {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .yt-ping {
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: 999px;
    background: rgba(var(--yt-rgb), 0.4);
    filter: blur(12px);
    animation: ytPing 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
    opacity: 0;
  }
  .yt-play:hover .yt-ping {
    opacity: 0.9;
  }
  @keyframes ytPing {
    75%,
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }
  .yt-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 4.5rem;
    width: 4.5rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 0 32px rgba(var(--yt-rgb), 0.45);
    transition: transform 0.3s ease-out;
  }
  .yt-play:hover .yt-circle {
    transform: scale(1.1);
  }
  .yt-play:active .yt-circle {
    transform: scale(0.95);
  }
  .yt-circle svg {
    margin-left: 0.25rem;
    height: 2rem;
    width: 2rem;
    fill: #fff;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }
  .yt-pill {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: rgba(0, 0, 0, 0.4);
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .yt-pill i {
    height: 0.375rem;
    width: 0.375rem;
    border-radius: 999px;
    background: #4edea3;
    box-shadow: 0 0 8px rgba(78, 222, 163, 0.8);
  }
  .yt-watch-row {
    margin-top: 0.9rem;
    text-align: center;
  }
  .yt-watch-link {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgb(var(--yt-rgb));
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .yt-soon {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    padding: 1.5rem;
    text-align: center;
    background: radial-gradient(
      60% 60% at 50% 40%,
      rgba(var(--yt-rgb), 0.14),
      transparent 70%
    );
  }
  .yt-soon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 4.5rem;
    width: 4.5rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.05);
  }
  .yt-soon-circle svg {
    margin-left: 0.25rem;
    height: 2rem;
    width: 2rem;
    fill: rgba(255, 255, 255, 0.45);
  }
  .yt-soon-text {
    font-size: 1.05rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
  }
  .yt-soon-sub {
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.45);
  }
  @media (prefers-reduced-motion: reduce) {
    .yt-ping {
      animation: none;
    }
    .yt-poster,
    .yt-circle {
      transition: none;
    }
  }
</style>
