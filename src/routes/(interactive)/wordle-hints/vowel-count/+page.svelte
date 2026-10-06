<script lang="ts">
  import WordleHintPage from '$lib/components/WordleHintPage.svelte';

  let { data } = $props();
</script>

<WordleHintPage
  shortTitle={data.shortTitle}
  question={data.question}
  canonical={data.canonical}
  meta={data.meta}
  formattedDate={data.formattedDate}
  wordleNumber={data.wordleNumber}
  hasAnswer={data.hasAnswer}
  value={data.value}
  explain={data.explain}
  emptyNote={data.emptyNote}
  extraFacts={data.extraFacts}
  aiOneLiner={data.aiOneLiner}
  difficultyLabel={data.difficultyLabel}
  difficultyScore={data.difficultyScore}
  difficultyReason={data.difficultyReason}
  otherPages={data.otherPages}
  faqs={data.faqs}
  faqSchema={data.faqSchema}
/>
