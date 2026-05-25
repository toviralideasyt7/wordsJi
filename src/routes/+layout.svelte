<script lang="ts">
	import CookieConsentBanner from '$lib/components/CookieConsentBanner.svelte';
	let { children } = $props();
</script>

{@render children()}
<CookieConsentBanner />
