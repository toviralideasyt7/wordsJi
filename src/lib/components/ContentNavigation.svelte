<script lang="ts">
	import { page } from '$app/stores';

	const navLinks = [
		{ name: 'Home', href: '/' },
		{ name: "Today's Answers", href: '/today' },
		{ name: 'Solvers', href: '/solver' },
		{ name: 'Archives', href: '/archive' },
		{ name: 'Guides', href: '/guides' },
		{ name: 'About', href: '/about' },
	];

	function isActive(pathname: string, href: string) {
		return pathname === href || (href !== '/' && pathname.startsWith(href));
	}
</script>

<nav aria-label="Primary" class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/40 shadow-[0_1px_3px_rgb(0_0_0/0.06)]">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-[60px]">
			<div class="flex items-center gap-2.5">
				<a href="/" class="flex items-center gap-2.5 group">
					<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-[0_2px_8px_rgb(20_184_166/0.3)] group-hover:shadow-[0_2px_12px_rgb(20_184_166/0.45)] transition-shadow duration-200">
						<span class="text-white font-extrabold text-sm leading-none">W</span>
					</div>
					<span class="text-[1.15rem] font-extrabold tracking-tight">
						<span class="text-slate-900 dark:text-slate-50">Word</span><span class="text-teal-600 dark:text-teal-400">Solver</span><span class="text-amber-500 dark:text-amber-400">X</span>
					</span>
				</a>
			</div>

			<ul class="hidden lg:flex lg:items-center lg:gap-0.5">
				{#each navLinks as link}
					{@const active = isActive($page.url.pathname, link.href)}
					<li>
						<a
							href={link.href}
							class={`relative px-3 py-1.5 rounded-md text-[0.8125rem] font-semibold transition-colors duration-200 ${
								active
									? 'text-teal-700 dark:text-teal-300'
									: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
							}`}
						>
							{link.name}
							{#if active}
								<span class="absolute -bottom-[9px] left-2 right-2 h-0.5 rounded-full bg-teal-500 dark:bg-teal-400"></span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<details class="relative flex items-center lg:hidden">
				<summary class="list-none p-2 -mr-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
					<span class="sr-only">Toggle menu</span>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</summary>
				<div class="absolute top-full right-0 mt-1 w-64 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-2">
					<ul class="space-y-0.5">
						{#each navLinks as link}
							{@const active = isActive($page.url.pathname, link.href)}
							<li>
								<a
									href={link.href}
									class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {active
										? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20'
										: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}"
								>
									{link.name}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</details>
		</div>
	</div>
</nav>

<style>
	details summary::-webkit-details-marker {
		display: none;
	}
</style>
