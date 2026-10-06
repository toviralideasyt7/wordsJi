<script lang="ts">
  import GameDleAnswerPage from '$lib/components/GameDleAnswerPage.svelte';
  import UpdatedStamp from '$lib/components/UpdatedStamp.svelte';
  import AIHintCards from '$lib/components/AIHintCards.svelte';
  import FactBlock from '$lib/components/FactBlock.svelte';
  import PaaHints from '$lib/components/PaaHints.svelte';
  import type { AIHints } from '$lib/ai-hints';

  interface Facts {
    mode: string;
    number: number | string;
    name: string;
    firstLetter: string;
    lastLetter: string;
    vowelCount: number;
    repeatText: string;
  }

  let { data }: { data: {
    answers: any[];
    dateStr: string;
    error: string | null;
    answerText?: string;
    dateLong?: string;
    updatedStamp?: string;
    hintFaqs?: { question: string; answer: string }[];
    aiHints?: AIHints;
    facts?: Facts | null;
    meta?: { title?: string };
  } } = $props();

  const modeConfig = {
    classic: { name: 'Dotadle Classic Answer', icon: 'C', color: 'border-yellow-400', bg: 'bg-yellow-50' },
    ability: { name: 'Dotadle Ability Answer', icon: 'A', color: 'border-blue-400', bg: 'bg-blue-50' },
    quote: { name: 'Dotadle Quote Answer', icon: 'Q', color: 'border-teal-400', bg: 'bg-teal-50' },
    loadingscreen: { name: 'Dotadle Loading Screen Answer', icon: 'L', color: 'border-purple-400', bg: 'bg-purple-50' },
  };
  const modes = ['ability', 'quote', 'classic', 'loadingscreen'];
  const crossLinks = [
    { href: '/narutodle-answer-today-updated', icon: '', label: 'Narutodle' },
    { href: '/loldle-answer-today-updated', icon: '', label: 'LoLdle' },
    { href: '/pokedle-answer-today-updated', icon: '', label: 'Pokedle' },
    { href: '/smashdle-answer-today-updated', icon: '', label: 'Smashdle' },
  ];
  const schemas = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'When does Dotadle reset?', acceptedAnswer: { '@type': 'Answer', text: 'Dotadle resets daily at midnight UTC, providing fresh puzzles for all game modes.' } },
      { '@type': 'Question', name: 'What is Dotadle?', acceptedAnswer: { '@type': 'Answer', text: 'Dotadle is a daily Dota 2 puzzle game where players guess heroes based on attributes, quotes, abilities, and loading screens.' } },
      { '@type': 'Question', name: 'How many modes does Dotadle have?', acceptedAnswer: { '@type': 'Answer', text: 'Dotadle has four game modes: Classic, Ability, Quote, and Loading Screen.' } },
      { '@type': 'Question', name: 'Can I play Dotadle on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, Dotadle is a browser-based game that works on mobile devices and desktop browsers.' } },
      { '@type': 'Question', name: 'Does Dotadle cost money?', acceptedAnswer: { '@type': 'Answer', text: 'No, Dotadle is completely free to play.' } },
      ...(data.hintFaqs ?? []).map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
    ]},
    { '@type': 'Article', headline: 'Dotadle Answer Today', description: "Today's Dotadle hero revealed — Classic, Ability, Item, and Quote mode answers. Check your guess or jump to the solver.", mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/dotadle-answer-today-updated' }, author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' }, publisher: { '@type': 'Organization', name: 'WordSolverX', logo: { '@type': 'ImageObject', url: 'https://wordsolverx.com/images/dotadle-answer-today.webp' } } },
  ]};
  const articleDate = $derived(data.answers?.[0]?.date ?? '');
</script>

<GameDleAnswerPage gameKey="dotadle" gameTitle="Dotadle" apiGame="dotadle" {modes} {modeConfig} {crossLinks} {schemas} {data}>
  {#snippet stampSnippet()}
    {#if data.updatedStamp}
      <div class="mb-6 flex justify-center">
        <UpdatedStamp stamp={data.updatedStamp} />
      </div>
    {/if}
  {/snippet}
  {#snippet hintsSnippet()}
    {#if data.aiHints && data.answerText}
      <div class="mb-8">
        <AIHintCards gameName="Dotadle" answer={data.answerText} hints={data.aiHints} />
        <p class="mt-4 text-center text-sm text-slate-600">
          Need help solving? Try the free <a href="/dotadle-solver" class="font-bold text-teal-700 underline underline-offset-2 hover:text-teal-600">Dotadle Solver →</a>
        </p>
      </div>
    {/if}
  {/snippet}
  {#snippet factsSnippet()}
    {#if data.facts}
      <div class="mb-8">
        <FactBlock
          gameName={(modeConfig as Record<string, { name: string }>)[data.facts.mode]?.name ?? 'Dotadle'}
          puzzleNumber={String(data.facts.number)}
          dateLong={data.dateLong ?? ''}
          firstLetter={data.facts.firstLetter}
          lastLetter={data.facts.lastLetter}
          vowelCount={data.facts.vowelCount}
          repeatText={data.facts.repeatText}
        />
      </div>
    {/if}
  {/snippet}
  {#snippet paaSnippet()}
    {#if data.aiHints && data.answerText}
      <div class="mb-8">
        <PaaHints gameName="Dotadle" hints={data.aiHints} />
      </div>
    {/if}
  {/snippet}
  {#snippet seoContent()}
    <article class="space-y-8">
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">What today's Dotadle board is asking</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Dotadle asks you to identify a Dota 2 hero from attribute feedback, and gives you a limited number of guesses to do it. Each guess is scored across gender, attribute, lane, range type, species, complexity, and release year. The grid is the same idea as LoLdle's, but the attribute set is different, and a few of those attributes behave in ways people do not expect.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Because Dota's hero pool is smaller and its attributes are coarser, Dotadle is usually more forgiving than its League counterpart. That also means a single well-chosen guess can collapse the pool very quickly — if you pick for information rather than for plausibility.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">The attributes that matter most</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          <strong>Primary attribute</strong> is the first real cut. Strength, agility and intelligence divide the roster into three roughly comparable groups, so one feedback cell telling you the hero is not strength removes about a third of the pool immediately.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          <strong>Lane</strong> is the attribute people underuse. It is a multi-value field, which means partial matches are common and informative: if your guess and the answer share one lane but not another, you have learned that the answer is more flexible than your guess rather than that you were wrong.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          <strong>Complexity</strong> is the quiet filter. It is a small set of bands, so a single match narrows the roster sharply, and it correlates with how often a hero appears in ranked play — which is a useful cross-check when you are down to a short list.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Range type, and why it surprises people</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Range type reads as a binary — melee or ranged — but the roster does not split evenly, and a handful of heroes sit on the boundary in ways players misremember. If the grid returns a miss on range, trust it over your recollection and cut accordingly.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The trap is using range as your first guess's main signal. It removes less than primary attribute and less than lane, so it is better used as a tiebreaker once you are down to a handful of candidates.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Release year is a compass, not a fact</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Dotadle's release year attribute is the one that decides close games. Dota's roster was built across more than a decade, and the feedback cell does not just tell you whether you matched — it tells you which direction to move. When a guess returns year feedback, the next guess should move decisively in that direction rather than nudging by a year or two.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Note that hero release year is not the same as when a hero became popular or when their abilities were last reworked. The attribute tracks the original introduction, so a hero who feels modern may still sit early in the range.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">A repeatable opening plan</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Open with a hero whose attribute combination is uncommon. The aim of guess one is not to be correct, it is to make guesses three and four easy. A hero with an unusual lane pair or a rare complexity band gives you several cuts in one line.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Guess two should exploit direction. If the grid pointed the year later, take a later hero. If it told you the primary attribute is different, switch attribute entirely rather than hunting within the wrong group.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          By guess three you should be choosing between named candidates. Write down the confirmed attributes, filter the roster, and take the guess that divides the survivors most evenly. When two candidates remain and you cannot separate them, play the more commonly seen hero — that is the safer bet on a pool where popular heroes are also better documented.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">What Dotadle is not testing</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Dotadle does not test whether you can play the hero, and it does not ask about item builds, ability order, or talent choices. The attributes are all identity and roster facts. That is good news if you know the hero list well but play a narrow set of positions, and bad news if you have learned the game purely through one role.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          It also does not use cosmetic or skin information. A hero's appearance in Dotadle is their default identity, not whichever set you happen to own.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Using the solver well</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The solver takes the feedback you have already been given and returns every hero still consistent with it. The value is not that it plays the game for you — it is that it tells you how much information you actually have, which is often more than it feels like.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The habit that improves your own play fastest is to commit to a guess, then check what the solver would have picked. When the two differ, work out which attribute you misread. That single loop fixes most repeat mistakes within a couple of weeks.
        </p>
      </section>
            <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">How Dota's roster is organised, and why it matters here</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Dota's hero pool was built in waves rather than continuously, and that history shows up in the attributes. Early heroes cluster in the simpler complexity bands and in the classic lane roles. Later additions are more likely to be flexible across lanes and to sit in the higher complexity bands.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          That correlation is useful, because it means complexity and release year are not fully independent signals. If the grid tells you the hero is complex and late, you have effectively confirmed one of the two, and the remaining guesses should spend themselves on lane and attribute instead.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          It also explains why some attributes feel more reliable than others. Attributes that map onto the roster's history carry more information than attributes that were assigned afterwards for the puzzle's convenience.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Reading partial matches without overreading them</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          A partial match means the sets overlap, not that you were nearly right. The distinction matters most on multi-valued attributes like lane and species, where two heroes can share one value out of three and be otherwise unrelated.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The practical response is to treat a partial as a constraint rather than a hint. It tells you the answer belongs to the overlapping set, which is a much stronger statement than 'you were close', and it should eliminate more than it suggests.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Where partials genuinely mislead is on single-valued attributes with a numeric flavour, such as complexity. There, a partial usually means the bands are adjacent, and nudging one band is the correct next move.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Turning the solver into practice</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The most useful thing the solver does is disagree with you. Entering a board, committing to your own guess first, and then comparing is a training loop, and it surfaces your specific misreadings rather than a general sense that you are bad at the game.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Once you can predict the solver's top two candidates before running it, you have effectively internalised the attribute model, and the remaining gains come from familiarity with the roster rather than from better reasoning.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">What to do when two heroes remain</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The endgame of a Dotadle board looks different from the opening. Once two candidates remain, the remaining columns are the ones you have not yet exercised, and the correct move is almost always the attribute you have tested least, not the guess that feels closest.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          If both survivors agree on every piece of feedback you have received, then no guess can separate them, and the board is decided by which attribute the puzzle actually varies. In practice that means spending the guess on lane or complexity rather than on the hero's identity, because those are the columns most likely to still carry information.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The second endgame rule is to prefer the better-documented hero. Puzzle pools favour heroes whose attributes are unambiguous, so when two candidates fit equally well, the one with cleaner attribute data is the more likely answer.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Finally, accept that some boards cannot be solved in the remaining guesses without a lucky pick. When that happens, take the hero whose attributes you are least uncertain about, because an uncertain attribute is the one most likely to have been misread earlier and to have put you on the wrong track entirely.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Closing out a Dotadle board you are behind on</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Being behind is normal, and the recovery is not to guess faster. It is to guess wider. When two or three guesses remain and the candidate list is still long, the highest-value move is the attribute you have tested least, even if the hero that tests it feels irrelevant.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Wide guesses feel wasteful because they are unlikely to be correct, but correctness is not what you are buying. You are buying a column's worth of information that you can then apply to every remaining candidate at once, and on a smaller roster like Dota's, one clean cut is often enough to finish the board.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The last guess should always be the best-supported candidate rather than the most interesting one. There is no merit in a brave miss, and the attribute data is there to be used.
        </p>
      </section>
<section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Frequently asked questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">How often does Dotadle change?</h3>
            <p class="leading-relaxed">A new hero is set every 24 hours, in line with the daily reset the other 'dle games use.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">What attributes does Dotadle compare?</h3>
            <p class="leading-relaxed">Gender, primary attribute, lane, range type, species, complexity and release year, each scored as exact, partial or miss.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Does Dotadle cover every Dota 2 hero?</h3>
            <p class="leading-relaxed">The pool follows the live hero roster, which grows as new heroes are released.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Is Dotadle the same as LoLdle?</h3>
            <p class="leading-relaxed">No. They share the attribute-grid idea but use different rosters, different attributes and separate daily answers. This site tracks both.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Do I need to own or play Dota 2 to solve it?</h3>
            <p class="leading-relaxed">No. Everything Dotadle asks about is roster information, not gameplay.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">When was this page last updated?</h3>
            <p class="leading-relaxed">{data.updatedStamp}</p>
          </div>
        </div>
      </section>
    </article>
  {/snippet}
</GameDleAnswerPage>

