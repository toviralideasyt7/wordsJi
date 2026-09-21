<script lang="ts">
  import GameDleAnswerPage from '$lib/components/GameDleAnswerPage.svelte';

  let { data }: { data: { answers: any[]; dateStr: string; error: string | null; } } = $props();

  const modeConfig = {
    classic: { name: 'LoLdle Classic Answer', icon: 'C', color: 'border-yellow-400', bg: 'bg-yellow-50' },
    splash: { name: 'LoLdle Splash Art Answer', icon: 'S', color: 'border-pink-400', bg: 'bg-pink-50' },
    ability: { name: 'LoLdle Ability Answer', icon: 'A', color: 'border-blue-400', bg: 'bg-blue-50' },
    quote: { name: 'LoLdle Quote Answer', icon: 'Q', color: 'border-teal-400', bg: 'bg-teal-50' },
  };
  const modes = ['splash', 'ability', 'quote', 'classic'];
  const regions = [
    { key: 'america', label: 'America', flag: '', accent: 'bg-blue-500' },
    { key: 'europe', label: 'Europe', flag: '', accent: 'bg-purple-500' },
  ];
  const crossLinks = [
    { href: '/narutodle-answer-today-updated', icon: '', label: 'Narutodle' },
    { href: '/pokedle-answer-today-updated', icon: '', label: 'Pokedle' },
    { href: '/smashdle-answer-today-updated', icon: '', label: 'Smashdle' },
    { href: '/dotadle-answer-today-updated', icon: '', label: 'Dotadle' },
  ];
  const schemas = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'FAQPage', mainEntity: [
      { '@type': 'Question', name: 'What is LoLdle?', acceptedAnswer: { '@type': 'Answer', text: 'LoLdle is a daily guessing game based on League of Legends champions, created by fans of the game.' } },
      { '@type': 'Question', name: 'How often does LoLdle reset?', acceptedAnswer: { '@type': 'Answer', text: 'The game resets every 24 hours at midnight UTC with a new champion to guess in each mode.' } },
      { '@type': 'Question', name: 'What are the LoLdle game modes?', acceptedAnswer: { '@type': 'Answer', text: 'LoLdle features four modes: Classic, Quote, Ability, and Splash Art.' } },
      { '@type': 'Question', name: 'Does LoLdle have different answers for different regions?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, LoLdle has separate daily answers for the America and Europe regions.' } },
      { '@type': 'Question', name: 'Is LoLdle free to play?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, LoLdle is completely free to play in your browser.' } },
    ]},
    { '@type': 'Article', headline: 'LoLdle Answer Today', description: "Today's LoLdle champion revealed — Classic, Ability, Splash, Quote, and Emoji mode answers all in one place. Updated daily.", mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://wordsolverx.com/loldle-answer-today-updated' }, author: { '@type': 'Person', name: 'Preston Hayes', image: 'https://wordsolverx.com/author-wordsolverx.webp', url: 'https://wordsolverx.com/about#preston-hayes' }, publisher: { '@type': 'Organization', name: 'WordSolverX', logo: { '@type': 'ImageObject', url: 'https://wordsolverx.com/images/loldle-answer-today.webp' } } },
  ]};
  const articleDate = $derived(data.answers?.[0]?.date ?? '');
</script>

<GameDleAnswerPage gameKey="loldle" gameTitle="LoLdle" apiGame="loldle" {modes} {modeConfig} {regions} {crossLinks} {schemas} {data}>
  {#snippet seoContent()}
    <article class="space-y-8">
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">What today's LoLdle board is asking</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          LoLdle gives you one League of Legends champion to identify, six guesses to do it, and a grid of attribute feedback after each attempt. Every guess is compared against the answer across gender, position, species, resource, range type, region, and release year. The grid does not tell you <em>how close</em> you are in the way Wordle does. It tells you which attributes matched exactly, which were partially right, and which were wrong — and that distinction is the whole game.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The practical consequence is that LoLdle rewards elimination over intuition. A guess you already know is wrong can still be the best guess on the board, because it splits the remaining pool more sharply than a guess that feels plausible.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">The four modes, and what each one tests</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Classic mode is the attribute grid described above, and it is the mode where systematic play pays off most. Ability mode shows you one ability icon and asks which champion it belongs to; it tests recognition rather than reasoning, and it is usually faster than Classic once you have seen a few hundred icons. Quote mode gives you a voice line. Splash Art mode shows a cropped fragment of a champion's splash art.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The modes are independent. A champion can be today's Classic answer and not appear anywhere else, so solving one mode tells you nothing about the others. Treat them as four separate puzzles that happen to share a timer.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Reading the attribute feedback properly</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Each cell in the Classic grid has three outcomes. An exact match means your guess and the answer share that attribute. A partial match means they are related but not identical — the classic case is a numeric attribute like release year, where the grid tells you whether you need to go earlier or later. A miss means the attribute is unrelated.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The two attributes most people misread are <strong>position</strong> and <strong>species</strong>, because both are multi-value. A champion can be played in more than one position, and species is not a single value either — a champion can be tagged as human and also as something else. A partial result there is information, not noise: it means the sets overlap.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">The attributes that end most streaks</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          <strong>Resource</strong> is the sharpest filter in the game and the one most players underuse. Mana is the default, so a champion that does not use it is immediately distinctive. Energy, fury, and manaless champions are all in that minority group, and a single feedback cell telling you the answer is not mana removes a large share of the roster in one guess.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          <strong>Release year</strong> is the other one, and it is where newer players lose games. The champion pool spans more than a decade of releases, and a 2024 champion sits at the opposite end of that range from one released in 2010. The grid tells you the direction you need to move, so treat the year cell as a compass rather than a fact to memorise.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">A repeatable opening plan for Classic</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Open with a champion whose attributes are unusual rather than one you like. The goal of guess one is to split the pool, not to be right. A champion with a rare resource, an uncommon species, or a distinctive combination of position and region gives you several cuts at once.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Guess two should chase whatever came back as a partial or a directional clue. If the grid told you the year is later, do not spend the guess on an old champion. If it told you the position overlaps, take the second most common position for the answer's likely role rather than repeating the first.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          From guess three onward you should be choosing between a short list rather than brainstorming. Write the attributes you have confirmed, cross them against the roster, and pick the guess that divides the survivors most evenly.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Splash Art, Ability and Quote without the guesswork</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Splash Art is the mode that punishes people who do not look at art. A crop can be a weapon edge, a piece of armour, or a colour gradient from the background, and there is no reasoning shortcut — only exposure. Browsing the champion gallery deliberately, rather than only when a game forces you to, is the only thing that reliably improves it.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Ability mode looks harder than it is. Ability icons tend to inherit a champion's palette, so once you have seen enough of them you begin to sort by colour and shape before you consciously recognise the champion. Working through the roster one role at a time builds that library faster than random attempts.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Quote mode depends on how much voice-line exposure you have. Every line is documented, so it is searchable; the practical move when a line is unfamiliar is to note the tone and the phrasing, because champions with a strong thematic register are recognisable from delivery alone.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">America and Europe are separate problems</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          LoLdle runs two regional pools, America and Europe, and they hold different answers on the same day. Solving the European Classic board does not tell you the American one, and vice versa. This page tracks both, which matters if you play across regions or just want to compare what the pools picked.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          Because the pools are independent, an attribute plan that worked in one region yesterday can be worth repeating in the other today. The champions available are the same; only the daily selection differs.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">When the solver is the right move</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The solver is not a substitute for reasoning, but it is a much better use of a guess than staring at the board. Feed it the feedback you already have — the exact matches, the partials, and the mismatches — and it returns the champions still consistent with everything the grid has told you.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The habit worth building is to guess <em>first</em> and check second. Committing to an answer and then seeing whether the solver agrees teaches you something; letting the solver play the game for you does not.
        </p>
      </section>
            <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">How to build champion knowledge that actually transfers</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Reading about champions is much weaker than seeing them scored. The attribute grid rewards recall of properties you have never had a reason to memorise, and the fastest way to acquire those is to play a small number of games across as many roles as possible rather than many games in one role.
        </p>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The reason is coverage. Playing mid lane every day teaches you mid lane champions deeply and the rest of the roster barely at all, and the puzzle draws from the whole roster. A rotating queue that forces you onto unfamiliar champions covers more of the attribute space per hour than any amount of deliberate practice on a favourite.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          If you would rather not play, the champion list itself is the study material. Reading it in roster order, and noting resource and species as you go, is dull but effective, because those two columns are where the board is actually decided.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">What the solver knows, and what it cannot know</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          The solver reasons only from the feedback you give it. It has no access to the board, so a mis-entered cell produces a confidently wrong shortlist. That is worth saying plainly, because the most common way people misuse it is to enter a partial match as an exact one when they are unsure.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          What it does well is arithmetic you would rather not do by hand: taking a set of attribute constraints and intersecting them against the roster. Once you are past guess three, that intersection is the whole game, and doing it in your head is where mistakes creep in.
        </p>
      </section>
      <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Why the same attributes catch the same people out</h2>
        <p class="text-slate-600 mb-4 leading-relaxed sm:text-lg">
          Most repeated mistakes in Classic cluster around three attributes: resource, species and release year. Resource because mana is so dominant that the exceptions are genuinely surprising. Species because it is multi-valued and people read partial results as errors. Release year because the roster spans more than a decade and nobody holds that range in their head accurately.
        </p>
        <p class="text-slate-600 leading-relaxed sm:text-lg">
          The fix is not to memorise harder. It is to slow down on exactly those three columns and read them before looking at the rest of the grid. A guess is only wasted if you misread the feedback, and that is where most of them are wasted.
        </p>
      </section>
<section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900 mb-5 sm:text-3xl">Frequently asked questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">What time does LoLdle reset?</h3>
            <p class="leading-relaxed">LoLdle switches to a new champion every 24 hours at midnight UTC. If you are in a negative-offset timezone the new puzzle lands during your previous evening.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Why are the America and Europe answers different?</h3>
            <p class="leading-relaxed">The two regions are served from separate daily pools, so the same day can have a different champion in each. This page lists both.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">How many champions are in the LoLdle pool?</h3>
            <p class="leading-relaxed">The pool follows the live League of Legends roster, which grows with every champion release. Newer champions are harder to guess because fewer players have memorised their attributes.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Is LoLdle free, and is there an app?</h3>
            <p class="leading-relaxed">LoLdle is free and browser-based. There is no official app, though it works on mobile browsers.</p>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Does solving one mode help with the others?</h3>
            <p class="leading-relaxed">No. Each mode picks its own champion, so the Classic answer tells you nothing about Quote, Ability or Splash Art.</p>
          </div>
        </div>
      </section>
    </article>
  {/snippet}
</GameDleAnswerPage>

