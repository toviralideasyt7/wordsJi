<script lang="ts">
  import GameDleAnswerPage from '$lib/components/GameDleAnswerPage.svelte';

  let { data }: { data: { answers: any[]; dateStr: string; error: string | null; } } = $props();

  const modeConfig = {
    classic: { name: 'Smashdle Classic Answer', icon: 'C', color: 'border-yellow-400', bg: 'bg-yellow-50' },
    emoji: { name: 'Smashdle Emoji Answer', icon: 'E', color: 'border-pink-400', bg: 'bg-pink-50' },
    silhouette: { name: 'Smashdle Silhouette Answer', icon: 'S', color: 'border-purple-400', bg: 'bg-purple-50' },
    finalSmash: { name: 'Smashdle Final Smash Answer', icon: 'F', color: 'border-red-400', bg: 'bg-red-50' },
    kirby: { name: 'Smashdle Kirby Copy Answer', icon: 'K', color: 'border-pink-400', bg: 'bg-pink-50' },
  };
  const modes = ['classic', 'emoji', 'silhouette', 'finalSmash', 'kirby'];
  const gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  const regions = [
    { key: 'america', label: 'America', flag: '', accent: 'bg-red-500' },
    { key: 'europe', label: 'Europe', flag: '', accent: 'bg-pink-500' },
  ];
  const crossLinks = [
    { href: '/narutodle-answer-today-updated', icon: '', label: 'Narutodle' },
    { href: '/loldle-answer-today-updated', icon: '', label: 'LoLdle' },
    { href: '/pokedle-answer-today-updated', icon: '', label: 'Pokedle' },
    { href: '/dotadle-answer-today-updated', icon: '', label: 'Dotadle' },
  ];
  const schemas = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is Smashdle?', acceptedAnswer: { '@type': 'Answer', text: 'Smashdle is a daily trivia game based on Super Smash Bros Ultimate characters, featuring Classic, Emoji, Silhouette, Final Smash, and Kirby Copy modes.' } },
      { '@type': 'Question', name: 'What are the Smashdle modes?', acceptedAnswer: { '@type': 'Answer', text: 'Smashdle has five modes: Classic, Emoji, Silhouette, Final Smash, and Kirby Copy.' } },
      { '@type': 'Question', name: 'How many fighters are in Smashdle?', acceptedAnswer: { '@type': 'Answer', text: 'Smashdle draws from the Super Smash Bros Ultimate roster of 89 fighters.' } },
      { '@type': 'Question', name: 'When does Smashdle reset?', acceptedAnswer: { '@type': 'Answer', text: 'Smashdle resets daily at midnight UTC.' } },
      { '@type': 'Question', name: 'Is Smashdle free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Smashdle is completely free to play in your browser.' } },
    ]},
    { '@type': 'Article', headline: 'Smashdle Answer Today', description: "Today's Smashdle character revealed — Classic, Final Smash, and Stage mode answers. Updated daily.", mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/smashdle-answer-today-updated' }, author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' }, publisher: { '@type': 'Organization', name: 'WordSolverX', logo: { '@type': 'ImageObject', url: 'https://wordsolverx.com/images/smashdle-answer-today.webp' } } },
  ]};
  const articleDate = $derived(data.answers?.[0]?.date ?? '');
</script>

<GameDleAnswerPage gameKey="smashdle" gameTitle="Smashdle" apiGame="smashdle" {modes} {modeConfig} {gridCols} {regions} {crossLinks} {schemas} {data}>
  {#snippet seoContent()}
    <article class="space-y-8">
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">What today's Smashdle grid is asking</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Smashdle asks you to identify a Super Smash Bros. fighter from a grid of attribute feedback. Each guess is scored on gender, universe, which games the fighter has appeared in, availability, weight, jump count, species, and origin year. The format is the same exact/partial/miss grid the other daily character games use, but the attribute mix is broader than most, which changes how you should open.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The most unusual columns are the series-based ones. Universe and games describe where a fighter comes from and when they joined the roster, and both are multi-value. That makes partial matches common and, used well, unusually informative.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Universe is the strongest opening filter</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Universe is the field that splits the roster into groups of very different sizes. Some universes contribute a single representative; a few contribute a large family. Opening with a fighter from a large universe removes less than it feels like, because the answer probably shares that universe with several candidates.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The reverse is the useful play. A fighter from a small universe, or a third-party guest, produces a much sharper cut on the first guess. If the grid comes back with a miss on universe, you have just eliminated an entire franchise in one line.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Games and availability are different questions</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          It is easy to read the games column as a proxy for availability and treat them as one filter. They are not the same thing. A fighter can have appeared in an early entry and then been absent from a later one, and availability describes the roster status rather than the history.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Read them as two independent signals. A partial match on games means your guess and the answer share at least one title but not all of them — which usually means the answer has appeared more recently than your guess, or was in the very first roster and then left.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Weight and jumps are the numeric columns</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Smashdle scores two numbers: weight and jump count. Weight is a real in-game value and a meaningful one — it determines how hard a fighter is to launch — while jump count is a small ordered set. Both behave like LoLdle's release year: a partial result tells you the direction to move.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          This is why an extreme guess is often the best second move. A heavyweight answers a different question than a lightweight, and the resulting arrow moves you further along the axis than a mid-weight pick would.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Origin year, and why it surprises people</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Origin year is not the year the fighter joined Smash. It is the year the character first appeared in their own series, which for a few fighters is decades earlier than players expect. A fighter added in a recent entry can carry an origin year from the eighties.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          That gap is the single most common reason people misread this column, and it is worth internalising: treat the year as a fact about the character's history, not about the Smash roster's.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">A repeatable opening plan</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Open with a fighter from a small universe or a guest character rather than the obvious lead. Guess one exists to split the pool, and a distinctive franchise does that better than a popular pick.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Guess two should exploit direction. If the grid pointed the origin year earlier, take an earlier character. If it told you the weight is higher, choose a heavier fighter rather than a similar one.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          By guess three you should be choosing between named candidates. Write the confirmed universe, games and availability, filter the roster against them, and take the guess that divides what remains most evenly.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Where streaks break</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The most common failure is treating this like a Smash knowledge quiz rather than a logic puzzle. Recognising fighters is not the same skill as narrowing a roster, and players who know the game well often guess the character they find most interesting rather than the one that removes the most candidates.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The second failure is ignoring species. It is a multi-value column, so partial matches happen, and a species result that looks ambiguous is usually telling you something precise about how the fighter is classified rather than that the data is fuzzy.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Using the solver</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The solver takes the feedback already on your board and returns every fighter still consistent with it. Its real value is showing you how much information one guess produced, which is usually more than it feels like.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The loop that improves your own play is to commit to an answer first and check the solver second. When they disagree, work out which column you misread. That is where most repeat mistakes actually live.
        </p>
      </section>
            <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Third-party fighters break the usual assumptions</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Guest fighters sit outside the franchise logic that governs the rest of the roster. They usually belong to a universe with a single representative, which makes them excellent opening guesses, and they often carry origin years far outside the range the rest of the roster occupies.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          That combination means a guest fighter can both narrow the universe column hard and move the origin-year arrow a long way in one guess. If you are stuck, spending a guess on a guest is among the highest-value moves available.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The caveat is that guests are added in later entries, so their games column behaves differently from a first-generation fighter's. Read games and availability separately when the answer is a guest.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">The roster grew in waves, and the grid remembers</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Each Smash entry added fighters in a batch, and the games column preserves that history. A fighter who has appeared in every entry carries a full set; one added recently carries a short one.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          That makes the games column a partial proxy for age, though not a reliable one on its own, because a handful of fighters skipped an entry and then returned. Where the two disagree, trust the games column, since it is the one being scored.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Weight as a memory aid rather than a number</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Nobody remembers the numeric weight of the whole roster, and you do not need to. What the column actually requires is a rough ordering: which fighters belong to the heaviest group, which to the lightest, and roughly where the middle sits.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Building that ordering is a small, finite task and it pays off immediately, because it converts a column that feels like noise into a direction arrow. Sorting fighters into three bands takes far less effort than learning exact values and produces nearly all of the same information.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Species, echoes and how the roster is classified</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Species is a multi-value column, and it is broader than people assume. It covers not just the obvious categories but also the classifications applied to fighters who are not quite human and not quite anything else, which is where most of the interesting partial matches come from.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Echo fighters are the other complication. A fighter who shares a moveset with another may still be classified separately, and their weight, jumps and origin year can differ from the fighter they echo. Treating an echo as a copy of its counterpart is a reliable way to misread three columns at once.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The useful discipline is to read species last. It is informative, but it is also the column most likely to be ambiguous, and an ambiguous column read too early tends to anchor the rest of your reasoning on a false premise.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          If you want a single heuristic for the whole board: trust the numeric columns for direction, trust universe and games for cuts, and treat species and availability as confirmation once the shortlist is already small.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Putting the columns in the order that solves boards</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          A Smashdle board has one clear ordering that works. Universe and games go first, because they cut the roster hardest and their values are the least ambiguous. Weight and jumps go second, because they are numeric and therefore give direction as well as information. Species and availability close, because they are the columns most often read ambiguously.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Following that order matters more than it sounds. The common failure mode is spending an early guess on species because it feels concrete, then discovering that the ambiguous result cannot be combined with anything else you have learned.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          One refinement: origin year is the strongest tiebreaker on the board, because it is exact and because it is the column players most often misremember. When two candidates survive every other column, spend the guess on origin year rather than on the fighter you find more plausible.
        </p>
      </section>
<section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Frequently asked questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">How often does Smashdle change?</h3>
            <p class="leading-relaxed">A new fighter is set every 24 hours, on the same daily reset the other attribute-grid games use.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">What attributes does Smashdle compare?</h3>
            <p class="leading-relaxed">Gender, universe, games appeared in, availability, weight, jump count, species and origin year, each scored as exact, partial or miss.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Is origin year the same as when a fighter joined Smash?</h3>
            <p class="leading-relaxed">No. Origin year is when the character first appeared in their own series, which is often much earlier than their Smash debut.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Does Smashdle cover every fighter?</h3>
            <p class="leading-relaxed">The pool follows the Smash roster, which grows with each new entry in the series.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Is Smashdle related to Narutodle and Pokedle?</h3>
            <p class="leading-relaxed">It uses the same attribute-grid format but a different roster and attribute set, with separate daily answers for each game.</p>
          </div>
        </div>
      </section>
    </article>
  {/snippet}
</GameDleAnswerPage>

