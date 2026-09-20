<script lang="ts">
  /**
   * Decorative scroll-progress bar. Purely additive: it starts at zero width,
   * is aria-hidden, and never captures pointer events, so it contributes
   * nothing to the document's content or accessibility tree. With JS disabled
   * it simply stays at zero width and is invisible.
   */
  let progress = $state(0);

  $effect(() => {
    if (typeof window === 'undefined') return;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  });
</script>

<div class="pointer-events-none fixed inset-x-0 top-0 z-50 h-1" aria-hidden="true">
  <div
    class="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
    style="width: {progress * 100}%;"
  ></div>
</div>
