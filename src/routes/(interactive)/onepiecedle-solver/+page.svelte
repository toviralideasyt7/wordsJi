<script lang="ts">
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import { PRESTON_HAYES_AUTHOR_NAME, PRESTON_HAYES_AUTHOR_IMAGE, PRESTON_HAYES_AUTHOR_DESCRIPTION } from '$lib/authors';
        import GameDleSolverPage from '$lib/components/GameDleSolverPage.svelte';
</script>

<GameDleSolverPage gameKey="onepiecedle" />


<div class="mx-auto max-w-4xl px-4 pb-16">
  <AuthorCard
    name={PRESTON_HAYES_AUTHOR_NAME}
    image={PRESTON_HAYES_AUTHOR_IMAGE}
    description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
  />
</div>