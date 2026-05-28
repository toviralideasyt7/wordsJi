<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let isOpen = $state(false);
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
			if (isOpen) return;
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

			<!-- Mobile toggle -->
			<div class="flex items-center lg:hidden">
				<button
					type="button"
					class="p-2 -mr-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
					aria-controls="mobile-menu"
					aria-expanded={isOpen}
					onclick={() => isOpen = !isOpen}
				>
					<span class="sr-only">Toggle menu</span>
					<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						{#if isOpen}
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
						{/if}
					</svg>
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if isOpen}
		<div class="lg:hidden border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 animate-slide-down">
			<ul class="px-4 py-3 space-y-0.5">
				{#each navLinks as link}
					{@const isActive = $page.url.pathname === link.href || (link.href !== '/' && $page.url.pathname?.startsWith(link.href))}
					<li>
						<a
							href={link.href}
							class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors {isActive
								? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20'
								: 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}"
							onclick={() => isOpen = false}
						>
							{link.name}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</nav>
