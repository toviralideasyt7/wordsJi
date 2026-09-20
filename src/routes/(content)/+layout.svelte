<script lang="ts">
	import '../../content.css';
	import SiteDefaultsHead from '$lib/components/SiteDefaultsHead.svelte';
	import ContentNavigation from '$lib/components/ContentNavigation.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<SiteDefaultsHead />

<!-- Skip to main content for accessibility -->
<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900"
>
	Skip to main content
</a>

<!-- Main site wrapper with Mediavine-compatible structure -->
<div class="wordsolverx-site min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
	
	<!-- Header with navigation -->
	<header class="site-header">
		<ContentNavigation />
	</header>
	
	<!-- Main content area - Mediavine uses .wordsolverx-content selector -->
	<main id="main-content" class="wordsolverx-content site-main flex-grow">
		{@render children()}
	</main>
	
	<!-- Sidebar for ads (optional) -->
	<aside class="site-sidebar" aria-label="Sidebar advertisements">
		<div class="ad-slot sidebar-ad"></div>
	</aside>
	
	<!-- Footer with unique ID for Mediavine targeting -->
	<footer id="mv-content-footer" class="site-footer">
		<Footer />
	</footer>
	
</div>

<style>
	/* Mediavine requires proper typography */
	.wordsolverx-content {
		font-size: 18px;
		line-height: 1.6;
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}
	
	.site-footer {
		margin-top: 60px;
		padding: 40px 20px;
		background: #f8fafc;
		border-top: 1px solid #e2e8f0;
		clear: both;
	}
	
	.ad-slot {
		margin: 30px 0;
		min-height: 100px;
		background: #f1f5f9;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
	}
	
	@media (max-width: 1024px) {
		.site-sidebar {
			display: none;
		}
	}
	
	@media (max-width: 768px) {
		.wordsolverx-content {
			padding: 15px;
			font-size: 16px;
		}
	}
</style>
