<script lang="ts">
	import { substituteVars } from '$lib/content/article-metrics';

	export interface FAQItem {
		question: string;
		answer: string;
	}

	let {
		title = 'Frequently Asked Questions',
		faqs,
		vars = {},
		class: className = ''
	}: {
		title?: string;
		faqs: FAQItem[];
		vars?: Record<string, string>;
		class?: string;
	} = $props();

	const renderedFaqs = $derived(
		faqs.map((faq) => ({
			question: substituteVars(faq.question, vars),
			answer: substituteVars(faq.answer, vars)
		}))
	);
</script>

<section class={`w-full ${className}`}>
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
		<h2 class="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mb-6 tracking-tight">
			{title}
		</h2>
		<div class="space-y-2">
			{#each renderedFaqs as faq}
				<details class="group rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
					<summary class="list-none cursor-pointer px-5 py-4 flex justify-between items-center gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
						<span class="text-[0.9375rem] font-semibold text-slate-800 dark:text-slate-200">
							{faq.question}
						</span>
						<svg
							class="w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 group-open:rotate-180"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
						</svg>
					</summary>
					<div class="px-5 pb-4 pt-0 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">
						<p class="pt-3">{faq.answer}</p>
					</div>
				</details>
			{/each}
		</div>
	</div>
</section>
