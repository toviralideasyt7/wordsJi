<script lang="ts">
  import GameDleAnswerPage from '$lib/components/GameDleAnswerPage.svelte';

  let { data }: { data: { answers: any[]; dateStr: string; error: string | null; } } = $props();

  const modeConfig = {
    classic: { name: 'Pokédle Classic Answer', icon: 'C', color: 'border-yellow-400', bg: 'bg-yellow-50' },
    silhouette: { name: 'Pokédle Silhouette Answer', icon: 'S', color: 'border-purple-400', bg: 'bg-purple-50' },
    flavor: { name: 'Pokédle Flavor Text Answer', icon: 'F', color: 'border-teal-400', bg: 'bg-teal-50' },
    card: { name: 'Pokédle Card Answer', icon: 'C', color: 'border-blue-400', bg: 'bg-blue-50' },
  };
  const modes = ['classic', 'silhouette', 'flavor', 'card'];
  const regions = [
    { key: 'america', label: 'America', flag: '', accent: 'bg-yellow-500' },
    { key: 'europe', label: 'Europe', flag: '', accent: 'bg-red-500' },
  ];
  const crossLinks = [
    { href: '/narutodle-answer-today-updated', icon: '', label: 'Narutodle' },
    { href: '/loldle-answer-today-updated', icon: '', label: 'LoLdle' },
    { href: '/smashdle-answer-today-updated', icon: '', label: 'Smashdle' },
    { href: '/dotadle-answer-today-updated', icon: '', label: 'Dotadle' },
  ];
  const schemas = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is Pokedle?', acceptedAnswer: { '@type': 'Answer', text: 'Pokedle is a Pokémon-themed daily guessing game inspired by Wordle, featuring modes for Classic guessing, Silhouette, Flavor Text, and Card identification.' } },
      { '@type': 'Question', name: 'What are the Pokedle game modes?', acceptedAnswer: { '@type': 'Answer', text: 'Pokedle features four modes: Classic, Silhouette, Flavor Text, and Card.' } },
      { '@type': 'Question', name: 'How many Pokémon are in Pokedle?', acceptedAnswer: { '@type': 'Answer', text: 'Pokedle includes Pokémon from across all generations, with over 1,000 species in the database.' } },
      { '@type': 'Question', name: 'When does Pokedle reset?', acceptedAnswer: { '@type': 'Answer', text: 'Pokedle resets daily at midnight UTC with new puzzles for all modes.' } },
      { '@type': 'Question', name: 'Is Pokedle free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Pokedle is completely free to play in your browser.' } },
    ]},
    { '@type': 'Article', headline: 'Pokedle Answer Today', description: "Today's Pokedle Pokemon revealed — Classic, Type, and Generation mode answers. Check your guess or browse the archive.", mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/pokedle-answer-today-updated' }, author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' }, publisher: { '@type': 'Organization', name: 'WordSolverX', logo: { '@type': 'ImageObject', url: 'https://wordsolverx.com/images/pokedle-answer-today.webp' } } },
  ]};
  const articleDate = $derived(data.answers?.[0]?.date ?? '');
</script>

<GameDleAnswerPage gameKey="pokedle" gameTitle="Pokedle" apiGame="pokedle" {modes} {modeConfig} {regions} {crossLinks} {schemas} {data}>
  {#snippet seoContent()}
    <article class="space-y-8">
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">What today's Pokedle grid is telling you</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Pokedle asks you to name a Pokemon from an attribute grid. Each guess is scored against the answer on type one, type two, habitat, colour, evolution stage, height, and weight. Every cell comes back as an exact match, a partial match, or a miss, exactly like the other daily 'dle games built on this format.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Two of those attributes are numeric — height and weight — and numeric attributes behave differently from categorical ones. A partial result on height does not mean 'close enough'. It tells you which direction to move, so the useful reading is the arrow, not the nearness.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Type is the first real cut, and dual types are the trap</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Type one is the strongest single filter, because eleven types split the Pokedex into groups of very different sizes. A guess that returns a miss on type one removes an entire family of Pokemon in one line, which is why opening with a common type is usually a mistake: it removes less than opening with something rarer.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Type two is where people misread the grid. Plenty of Pokemon have only one type, and a single-type Pokemon still carries a value in that column. If your guess is dual-typed and the answer is not, the type two cell will not behave the way a normal mismatch does. Read it as 'the answer has no second type', not as 'wrong second type'.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Habitat and colour: cheap cuts, easy to forget</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Habitat is one of the most underrated attributes on the board. It is a small set of values, and it does not correlate cleanly with type — there are water-typed Pokemon outside any water habitat, and grassland residents across several types. That means a habitat result is close to independent information, which is exactly what you want from an early guess.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Colour is similar, with one caveat: it tracks the Pokemon's official colour classification, not what its artwork actually looks like to you. A Pokemon that reads as purple in a particular game's render may be filed under a different colour. Trust the grid over your eye when the two disagree.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Evolution stage is the attribute that narrows fastest</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Evolution stage is a small ordered set, so a single exact match eliminates most of the Pokedex immediately. It is also the attribute that causes the most wasted guesses, because people assume stage one for anything that looks small and cute and it is not always right.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The useful pattern is to treat evolution stage as a late-game confirmation rather than an early filter. Use type, habitat and colour to get to a shortlist first, then let evolution stage decide between the survivors.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Reading height and weight as direction</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Height and weight are the two attributes that reward attention to the feedback arrows. The grid tells you whether the answer is taller or shorter, heavier or lighter. One guess therefore does two jobs: it tests everything else about that Pokemon and it points you along the size axis.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          This is why a deliberately extreme guess is often correct play. Picking a famously small Pokemon or a famously large one produces the largest possible movement on the size axis, which collapses the candidate set faster than picking something mid-range.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">A repeatable opening plan</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Lead with a Pokemon whose type is uncommon and whose habitat does not overlap with most of the Pokedex. The objective of guess one is information, not accuracy — you are trying to make guesses three and four trivial.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Guess two should chase whichever attribute came back as a partial or a directional clue. If the grid told you the answer is larger, take a larger Pokemon; do not split the difference.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          From guess three onward you should be choosing from a written shortlist. Note the confirmed type, habitat, colour and evolution stage, filter the Pokedex against them, and pick the guess that divides the survivors most evenly rather than the one you like best.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">What Pokedle does not test</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Pokedle does not ask about moves, abilities, base stats, held items, or which game a Pokemon first appeared in. All of its attributes are identity facts about the species. That is good news if you know the Pokedex as a list, and awkward if what you actually know well is competitive play, where a narrow set of Pokemon dominates and most of the roster never appears.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          It also does not use regional forms or cosmetic variants. The grid scores the species, not the particular form you happened to picture.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Studying without grinding</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The fastest improvement comes from learning the shape of the type chart rather than memorising entries. If you know which type combinations exist at all, a grid result that implies an impossible pairing can be discarded immediately, and that is often worth more than remembering any specific Pokemon.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The second habit worth building is size awareness by type. Once you can guess roughly which types run large and which run small, the height and weight columns stop feeling random and start acting like an extra filter.
        </p>
      </section>
            <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Generations change which answers are reasonable</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The Pokedex grew in discrete generations, and each one added Pokemon with types and combinations that did not previously exist. That matters for the puzzle because the plausible candidate set for a given grid shifts depending on how many generations you are carrying in your head.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          A type combination that was unique in an early generation now belongs to several species. If you are reasoning from an older mental model, you will systematically underestimate how many candidates fit a grid and therefore over-commit to a guess too early.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The correction is to treat the type chart as the stable fact and individual species as the volatile one. The chart has only been extended a handful of times; the roster behind it grows every generation.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Type combinations that cannot exist</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          One of the most useful pieces of Pokedex knowledge is negative knowledge: which type pairings have never been used. If a grid result implies a combination that does not exist, the constraint is contradictory and you have almost certainly misread a cell.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          That check is worth running before every third guess. It costs a few seconds and it catches the single most expensive category of mistake, which is compounding an early misreading into three more wasted guesses.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Why evolution stage reads as harder than it is</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Evolution stage looks straightforward and is not, because the stage a species occupies depends on how you count. A species in a three-stage line is a different stage from a species in a two-stage line, and some species sit outside any line at all.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Because the set is ordered and small, one exact match removes a very large share of the roster, which makes it tempting to spend an early guess on it. The better use is as a confirmation column: get close on type and habitat first, then let evolution stage break the tie. An early stage guess is high-risk and often unnecessary.
        </p>
      </section>
      <section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Habitat and colour, and how the official data behaves</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Habitat is stored as a small set of environment categories, and it does not map cleanly onto type. That independence is what makes it valuable as an early filter: a habitat result tells you something the type columns cannot, and it is one of the few columns that reliably adds new information rather than restating what you already know.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          One consequence is worth flagging. Because habitat is coarse, several very different species share one value, so a habitat match narrows less than an exact type match would. The right way to read it is as a broad cut that makes the later guesses easier rather than as a shortcut to the answer.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Colour is the column most likely to contradict your intuition, because it reflects the official classification rather than the way a species looks in any particular artwork. A Pokemon that reads as one colour to you may be recorded as another, and the grid will score the record.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The practical lesson is to stop arguing with the colour column. When it disagrees with your expectation, treat that as a signal that your model of the species is incomplete, and adjust the candidate list rather than the column.
        </p>
      </section>
<section class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Frequently asked questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">How often does Pokedle update?</h3>
            <p class="leading-relaxed">A new Pokemon is set once every 24 hours, on the same daily reset the other attribute-grid games use.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">What attributes does Pokedle compare?</h3>
            <p class="leading-relaxed">Type one, type two, habitat, colour, evolution stage, height and weight, each scored as exact, partial or miss.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Does Pokedle include every Pokemon?</h3>
            <p class="leading-relaxed">The pool follows the current Pokedex, which grows as new generations are released. Newer entries are harder because fewer players have their attributes memorised.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Why did my type two cell look wrong?</h3>
            <p class="leading-relaxed">Single-type Pokemon still occupy that column. If your guess has two types and the answer has one, the mismatch is telling you the answer has no second type.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Is Pokedle the same format as LoLdle and Narutodle?</h3>
            <p class="leading-relaxed">It shares the attribute-grid format but uses the Pokemon roster and its own attribute set. Each game has separate daily answers.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Do I need to play the games to solve Pokedle?</h3>
            <p class="leading-relaxed">No. Every attribute Pokedle scores is a Pokedex fact, not a gameplay outcome.</p>
          </div>
        </div>
      </section>
    </article>
  {/snippet}
</GameDleAnswerPage>

