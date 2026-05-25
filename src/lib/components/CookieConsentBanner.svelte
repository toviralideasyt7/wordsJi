<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	type ConsentPreference = 'accepted' | 'rejected' | null;
	type WordSolverXWindow = Window & {
		__wordsolverxSetConsent?: (value: Exclude<ConsentPreference, null>) => void;
	};

	const CONSENT_KEY = 'wordsolverx-consent-v1';
	let visible = $state(false);
	let preference = $state<ConsentPreference>(null);

	function readConsent(): ConsentPreference {
		if (!browser) {
			return null;
		}

		const value = (window as WordSolverXWindow).localStorage.getItem(CONSENT_KEY);
		return value === 'accepted' || value === 'rejected' ? value : null;
	}

	function syncConsent() {
		preference = readConsent();
		visible = preference === null;
	}

	function saveConsent(nextPreference: Exclude<ConsentPreference, null>) {
		if (!browser) {
			return;
		}

		const wordsolverxWindow = window as WordSolverXWindow;
		if (typeof wordsolverxWindow.__wordsolverxSetConsent === 'function') {
			wordsolverxWindow.__wordsolverxSetConsent(nextPreference);
		} else {
			wordsolverxWindow.localStorage.setItem(CONSENT_KEY, nextPreference);
			wordsolverxWindow.dispatchEvent(
				new CustomEvent('wordsolverx:consent-updated', {
					detail: { value: nextPreference }
				})
			);
		}

		preference = nextPreference;
		visible = false;
	}

	function openConsentSettings() {
		visible = true;
	}

	onMount(() => {
		syncConsent();

		window.addEventListener('wordsolverx:consent-open', openConsentSettings);
		window.addEventListener('wordsolverx:consent-updated', syncConsent);

		return () => {
			window.removeEventListener('wordsolverx:consent-open', openConsentSettings);
			window.removeEventListener('wordsolverx:consent-updated', syncConsent);
		};
	});
</script>

{#if visible}
	<section
		id="cookie-settings"
		aria-label="Cookie consent"
		class="fixed inset-x-0 bottom-0 z-[70] border-t border-slate-200 bg-white/95 backdrop-blur shadow-[0_-16px_48px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900/95"
	>
		<div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
			<div class="max-w-3xl">
				<p class="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">Privacy choices</p>
				<h2 class="mt-1 text-lg font-bold text-slate-900 dark:text-slate-50">Choose how WordSolverX loads cookies and ads</h2>
				<p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
					We use browser storage for site preferences, plus optional analytics and advertising scripts.
					Accepting enables Google Analytics and AdSense. Rejecting keeps only the site features needed
					to browse answer pages and tools. Details live in our <a class="font-semibold text-teal-600 hover:text-teal-500" href="/privacy-policy">Privacy Policy</a>.
				</p>
			</div>

			<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
				<button
					type="button"
					class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
					onclick={() => saveConsent('rejected')}
				>
					Reject optional cookies
				</button>
				<button
					type="button"
					class="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500"
					onclick={() => saveConsent('accepted')}
				>
					Accept analytics and ads
				</button>
			</div>
		</div>
	</section>
{/if}
