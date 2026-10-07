<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let scrolled = $state(false);

	const navLinks = [
		{ name: 'Home', href: '/' },
		{ name: "Today's Answers", href: '/today' },
		{ name: 'Solvers', href: '/solver' },
		{ name: 'Archives', href: '/archive' },
		{ name: 'Guides', href: '/guides' },
		{ name: 'About', href: '/about' },
	];

	onMount(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 10;
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<nav
	aria-label="Primary"
	class={`sticky top-0 z-50 transition-all duration-300 ${
		scrolled
			? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/40 shadow-[0_1px_3px_rgb(0_0_0/0.06)]'
			: 'bg-white dark:bg-slate-900 border-b border-transparent'
	}`}
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between h-[60px]">
			<!-- Logo -->
			<div class="flex items-center gap-2.5">
				<a href="/" class="flex items-center gap-2.5 group">
					<div aria-hidden="true" class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-[0_2px_8px_rgb(20_184_166/0.3)] group-hover:shadow-[0_2px_12px_rgb(20_184_166/0.45)] transition-shadow duration-200">
						<span class="text-white font-extrabold text-sm leading-none">W</span>
					</div>
					<span class="text-[1.15rem] font-extrabold tracking-tight">
						<span class="text-slate-900 dark:text-slate-50">Word</span><span class="text-teal-600 dark:text-teal-400">Solver</span><span class="text-amber-500 dark:text-amber-400">X</span>
					</span>
				</a>
			</div>

			<!-- Desktop Nav -->
			<ul class="hidden lg:flex lg:items-center lg:gap-0.5">
				{#each navLinks as link}
					{@const isActive = $page.url.pathname === link.href || (link.href !== '/' && $page.url.pathname?.startsWith(link.href))}
					<li>
						<a
							href={link.href}
							class={`relative px-3 py-1.5 rounded-md text-[0.8125rem] font-semibold transition-colors duration-200 ${
								isActive
									? 'text-teal-700 dark:text-teal-300'
									: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
							}`}
						>
							{link.name}
							{#if isActive}
								<span class="absolute -bottom-[9px] left-2 right-2 h-0.5 rounded-full bg-teal-500 dark:bg-teal-400"></span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>

			<!-- Mobile menu: CSS-only <details> disclosure so the hamburger works
			     with zero JavaScript (csr=false prerendered pages). The panel
			     is absolutely positioned against <nav> (sticky), full width. -->
			<details class="mobile-nav flex items-center lg:hidden">
				<summary class="mobile-nav-summary cursor-pointer list-none rounded-lg p-2 -mr-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
					<span class="sr-only">Toggle menu</span>
					<svg class="nav-icon-open w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
					<svg class="nav-icon-close w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</summary>
				<div class="mobile-nav-panel absolute inset-x-0 top-full z-50 border-t border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-900 lg:hidden">
					<ul class="px-4 py-3 space-y-0.5">
						{#each navLinks as link}
							{@const isActive = $page.url.pathname === link.href || (link.href !== '/' && $page.url.pathname?.startsWith(link.href))}
							<li>
								<a
									href={link.href}
									class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive
										? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20'
										: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}"
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
	.mobile-nav summary {
		list-style: none;
	}
	.mobile-nav summary::-webkit-details-marker {
		display: none;
	}
	.mobile-nav summary::marker {
		display: none;
	}
	.mobile-nav .nav-icon-close {
		display: none;
	}
	.mobile-nav[open] .nav-icon-open {
		display: none;
	}
	.mobile-nav[open] .nav-icon-close {
		display: block;
	}
	.mobile-nav[open] .mobile-nav-panel {
		animation: nav-slide-down 0.18s ease;
	}
	@keyframes nav-slide-down {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
