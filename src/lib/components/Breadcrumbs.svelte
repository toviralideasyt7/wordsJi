<script lang="ts">
	import { page } from '$app/stores';
	import FiHome from '$lib/components/icons/FiHome.svelte';
	import FiChevronRight from '$lib/components/icons/FiChevronRight.svelte';
	let { hideSchema = false }: { hideSchema?: boolean } = $props();

	let pathname = $derived($page.url.pathname);
	let pathSegments = $derived(pathname.split('/').filter((segment: string) => segment !== ''));

	let breadcrumbItems = $derived(
		pathSegments.map((segment: string, index: number) => {
			const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
			let name = segment
				.split('-')
				.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ');

			if (name === 'All Wordle Solver') name = 'All Wordle Solver';
			if (name.includes('Wordle Answer For')) {
				name = name.replace('Wordle Answer For', 'Wordle Answer');
			}

			return { name, href, isLast: index === pathSegments.length - 1 };
		})
	);

	let schemaJson = $derived(JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://wordauditor.com',
			},
			...breadcrumbItems.map((item: { name: string; href: string }, index: number) => ({
				'@type': 'ListItem',
				position: index + 2,
				name: item.name,
				item: `https://wordauditor.com${item.href}`,
			})),
		],
	}));
</script>

<svelte:head>
	{#if pathname !== '/' && !hideSchema}
		{@html `<script type="application/ld+json">${schemaJson}</script>`}
	{/if}
</svelte:head>

{#if pathname !== '/'}
	<nav class="flex mb-6 text-sm overflow-x-auto whitespace-nowrap pb-1" aria-label="Breadcrumb">
		<ol class="inline-flex items-center space-x-1.5">
			<li class="inline-flex items-center">
				<a
					href="/"
					class="inline-flex items-center text-slate-400 hover:text-teal-600 dark:text-slate-500 dark:hover:text-teal-400 transition-colors"
				>
					<FiHome class="mr-1.5 h-3.5 w-3.5" />
					<span class="font-medium">Home</span>
				</a>
			</li>
			{#each breadcrumbItems as item}
				<li class="flex items-center">
					<FiChevronRight class="h-3 w-3 text-slate-300 dark:text-slate-600 mx-0.5" />
					{#if item.isLast}
						<span class="text-slate-900 dark:text-slate-100 font-semibold ml-0.5">
							{item.name}
						</span>
					{:else}
						<a
							href={item.href}
							class="text-slate-400 hover:text-teal-600 dark:text-slate-500 dark:hover:text-teal-400 transition-colors ml-0.5"
						>
							{item.name}
						</a>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}
