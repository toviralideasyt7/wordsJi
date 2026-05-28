<script lang="ts">
        import '../../interactive.css';
        import { onMount } from 'svelte';
        import { page } from '$app/stores';
        import Navigation from '$lib/components/Navigation.svelte';
        import Footer from '$lib/components/Footer.svelte';
        import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
        import SiteDefaultsHead from '$lib/components/SiteDefaultsHead.svelte';
        import { PerformanceMonitor, AnalyticsTracker } from '$lib/utils/performance';

        let { children } = $props();

        onMount(() => {
                if (import.meta.env.DEV || $page.url.searchParams.has('perfDebug')) {
                        PerformanceMonitor.init();
                }
        });

        $effect(() => {
                if ($page.url.pathname) {
                        AnalyticsTracker.trackPageView($page.url.pathname);
                }
        });
</script>

<SiteDefaultsHead />

<div class="site-shell min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <ErrorBoundary>
                <a
                        href="#main-content"
                        class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900"
                >
                        Skip to main content
                </a>
                <header class="site-header">
                        <Navigation />
                </header>
                <main id="main-content" class="site-main flex-grow">
                        {@render children()}
                </main>
                <Footer />
        </ErrorBoundary>
</div>
