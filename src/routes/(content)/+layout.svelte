<script lang="ts">
	import '../../content.css';
	import SiteDefaultsHead from '$lib/components/SiteDefaultsHead.svelte';
	import ContentNavigation from '$lib/components/ContentNavigation.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<SiteDefaultsHead />

<div class="site-shell min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
	<a
		href="#main-content"
		class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900"
	>
		Skip to main content
	</a>
	<header class="site-header">
		<ContentNavigation />
	</header>
	<!-- .wordsolverx-content is the Mediavine content selector; it must NOT constrain width -->
	<main id="main-content" class="wordsolverx-content site-main flex-grow">
		{@render children()}
	</main>
	<footer id="mv-content-footer" class="site-footer">
		<Footer />
	</footer>
</div>
