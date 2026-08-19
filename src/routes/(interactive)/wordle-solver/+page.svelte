<script lang="ts">
	import WordlebotPage from '$lib/components/wordlebot/WordlebotPage.svelte';

	let { data }: { data: { config: import('$lib/wordlebot-wasm/types').WordlebotPageConfig } } = $props();
</script>

<WordlebotPage config={data.config} />
