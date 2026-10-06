<script lang="ts">
    import DatedAnswerPage from '$lib/components/DatedAnswerPage.svelte';
    import type { ComponentProps } from 'svelte';

    let { data }: { data: ComponentProps<typeof DatedAnswerPage> } = $props();
</script>

<DatedAnswerPage
    gameLabel={data.gameLabel}
    gameKey={data.gameKey}
    dateKey={data.dateKey}
    dateLong={data.dateLong}
    numberText={data.numberText}
    answerText={data.answerText}
    prevDateParam={data.prevDateParam}
    nextDateParam={data.nextDateParam}
    prose={data.prose}
/>
