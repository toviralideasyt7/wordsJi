/**
 * Reveal-on-scroll actions for article figures.
 *
 * Safety contract (mirrored by the @media (prefers-reduced-motion: reduce)
 * guard in theme.css):
 *
 *  1. The stylesheet default for every element is *fully visible, no opacity,
 *     no transform*. Nothing is hidden until an action adds `reveal-armed`,
 *     and that only ever happens from client JS after hydration. A prerendered
 *     page with JS disabled is therefore complete and readable.
 *  2. We bail out entirely under `prefers-reduced-motion: reduce` or when
 *     IntersectionObserver is unavailable.
 *  3. We only arm a node that starts below the fold (top > 0.9 * viewport), so
 *     nothing above the fold can flash.
 *  4. The observer is disconnected as soon as the node reveals, and on destroy.
 *
 * Tabs, per repo convention for .ts files.
 */

const ARMED = 'reveal-armed';
const REVEALED = 'reveal-in';
const STAGGER_ROOT = 'article-reveal-stagger';

function motionAllowed(): boolean {
	if (typeof window === 'undefined') return false;
	if (typeof IntersectionObserver === 'undefined') return false;
	return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function belowFold(node: HTMLElement): boolean {
	const rect = node.getBoundingClientRect();
	return rect.top > window.innerHeight * 0.9;
}

function createReveal(stagger: boolean) {
	return (node: HTMLElement, enabled = false) => {
		let observer: IntersectionObserver | null = null;
		let armed = false;

		const clear = () => {
			observer?.disconnect();
			observer = null;
		};

		const start = () => {
			if (!enabled || armed) return;
			if (!motionAllowed() || !belowFold(node)) return;

			armed = true;
			if (stagger) node.classList.add(STAGGER_ROOT);
			node.classList.add(ARMED);

			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (!entry.isIntersecting) continue;
						node.classList.add(REVEALED);
						clear();
					}
				},
				{ rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
			);
			observer.observe(node);
		};

		start();

		return {
			update(next: boolean) {
				enabled = next;
				if (!enabled) {
					// Renderer turned motion off: undo any arming so the node is
					// in exactly the state a JS-less client would see.
					clear();
					node.classList.remove(ARMED, REVEALED, STAGGER_ROOT);
					armed = false;
					return;
				}
				start();
			},
			destroy: clear
		};
	};
}

/** Fade/rise a single block into view. */
export const reveal = createReveal(false);

/**
 * Fade/rise a container and stagger its `.article-tile` / `.article-bar`
 * children (the delay per child comes from `--stagger-index`).
 */
export const revealStagger = createReveal(true);
