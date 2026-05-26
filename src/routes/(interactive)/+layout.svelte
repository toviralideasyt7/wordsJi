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
                <Navigation />
                <main class="site-main flex-grow">
                        {@render children()}
                </main>
                <Footer />
        </ErrorBoundary>
</div>
