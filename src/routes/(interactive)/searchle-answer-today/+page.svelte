<script lang="ts">
  import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
  import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
  import GeneratedTodayArticle from '$lib/components/GeneratedTodayArticle.svelte';
  import type { SearchleDailyPuzzle } from '$lib/searchle/daily';
  import {
    PRESTON_HAYES_AUTHOR_DESCRIPTION,
    PRESTON_HAYES_AUTHOR_IMAGE,
    PRESTON_HAYES_AUTHOR_NAME
  } from '$lib/authors';
  import {
    generateFAQSchema,
    generateHowToSchema,
    generatePersonAuthorSchema,
    generateWebPageSchema
  } from '$lib/seo';

  let { data } = $props<{
    data: {
      totalPuzzles: number;
      todayPuzzle: SearchleDailyPuzzle;
      meta?: {
        description?: string;
      };
    };
  }>();

  const totalPuzzles = $derived(data.totalPuzzles);
  const todayPuzzle = $derived(data.todayPuzzle);

  function formatDisplayDate(dateKey: string): string {
    return new Date(`${dateKey}T12:00:00`).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const todayLabel = $derived(formatDisplayDate(data.todayPuzzle.date));
  const publishedDate = $derived(`${data.todayPuzzle.date}T00:00:00Z`);
  const metaTitle = $derived(`Searchle Answer Today (${todayLabel}) - Prompt and Answer`);
  const pageTitle = $derived(`Searchle Answer Today (${todayLabel})`);
  const pageDescription = $derived(
    data.meta?.description ??
      `Today's Searchle autocomplete answer revealed. See the prompt, copy the answer, and browse ${totalPuzzles.toLocaleString('en-US')} past puzzles in the archive.`
  );
  const pageKeywords = $derived(
    `searchle answer today, searchle answer, searchle hint, searchle hint today, searchle answer for ${todayLabel}`
  );

  const faqs = [
    {
      question: 'What is Searchle?',
      answer:
        'Searchle is a daily puzzle where you guess the missing word in a Google autocomplete prompt.'
    },
    {
      question: 'How are Searchle answers calculated?',
      answer:
        'Searchle answers are mapped by date from the original Searchle puzzle list and update daily.'
    },
    {
      question: 'Can I view previous Searchle answers?',
      answer:
        'Yes. Use the Searchle archive page to browse any previous day and reveal its answer.'
    },
    {
      question: 'Where does the data come from?',
      answer:
        "Searchle answers come from the game's official daily puzzle list."
    }
  ];

  const faqSchema = generateFAQSchema(faqs);
  const howToSchema = generateHowToSchema('How to use the Searchle answer page', [
    { name: 'Read the prompt', text: 'Check today\u2019s Searchle prompt before revealing the answer.' },
    { name: 'Reveal or copy the answer', text: 'Use the answer card tools to confirm the solution quickly.' },
    { name: 'Open the archive', text: 'Use the dedicated archive page when you need an older Searchle answer.' }
  ]);
  const webPageSchema = $derived({
    ...generateWebPageSchema(
      metaTitle,
      pageDescription,
      'https://wordsolverx.com/searchle-answer-today'
    ),
    author: generatePersonAuthorSchema(
      'Preston Hayes',
      'https://wordsolverx.com/about#preston-hayes',
      'https://wordsolverx.com/author-wordsolverx.webp'
    )
  });
</script>

<svelte:head>
  <title>{metaTitle}</title>
  <meta name="description" content={pageDescription} />
  <meta name="keywords" content={pageKeywords} />
  <meta property="og:title" content={metaTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://wordsolverx.com/searchle-answer-today" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href="https://wordsolverx.com/searchle-answer-today" />
  {@html `<script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(howToSchema)}</script>`}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Searchle" answer={todayPuzzle.answer.toUpperCase()} />

<div class="min-h-screen bg-slate-50">
  <main class="max-w-5xl mx-auto px-4 py-8">
    <div class="text-center mb-8">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-4">
        <span>{totalPuzzles.toLocaleString('en-US')} Real Puzzles from Searchle</span>
      </div>
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
        Searchle Answer Today ({todayLabel})
      </h1>
      <p class="text-slate-600 max-w-xl mx-auto">
        Today&apos;s Searchle prompt and answer, with a dedicated archive page for older puzzles.
      </p>
      <div class="inline-flex items-center gap-1.5 text-xs text-slate-500 mt-2">
        <span class="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
        Updated Daily
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden mb-8">
      <div class="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      <div class="p-6 text-center">
        <div class="flex items-center justify-center gap-2 mb-2">
          <span class="text-sm font-semibold">Today&apos;s Searchle</span>
          <span class="text-xs px-2 py-0.5 rounded-full border border-slate-200">
            {todayPuzzle.date}
          </span>
        </div>
        <div class="text-lg text-slate-600 mb-4 italic">
          "{todayPuzzle.prompt}"
        </div>
        <div class="font-mono text-5xl font-bold text-purple-600 uppercase tracking-wider mb-6">
          {todayPuzzle.answer}
        </div>
        <div class="flex justify-center gap-3 flex-wrap">
          <button
            type="button"
            data-copy-value={todayPuzzle.answer.toUpperCase()}
            data-copy-default="Copy Answer"
            data-copy-success="Copied"
            class="px-3 py-2 rounded-lg border border-slate-200 text-sm"
          >
            Copy Answer
          </button>
          <a
            href="/searchle-archive"
            class="px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50"
          >
            Browse Archive
          </a>
          <a
            href="/searchle-solver"
            class="px-3 py-2 rounded-lg bg-purple-500 text-white text-sm hover:bg-purple-600"
          >
            Open Solver
          </a>
        </div>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 mb-8">
      <h2 class="text-xl font-bold text-slate-900">Need an older Searchle answer?</h2>
      <p class="mt-3 text-slate-600">
        Looking for an older Searchle answer? Head to the archive.
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <a
          href="/searchle-archive"
          class="inline-flex items-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-500  "
        >
          Open Searchle Archive
        </a>
        <a
          href="/searchle-solver"
          class="inline-flex items-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Try the Solver
        </a>
      </div>
    </div>


    <GeneratedTodayArticle articleKey="searchle-answer-today" articleDate={data.todayPuzzle.date} />
    <div class="mt-12">
      <AuthorCard
        name={PRESTON_HAYES_AUTHOR_NAME}
        image={PRESTON_HAYES_AUTHOR_IMAGE}
        description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
      />

      <InternalLinkSection currentGame="Searchle" />
    </div>

    {#if false}
    <article class="mx-auto max-w-5xl px-4 pb-12 space-y-8">
      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">What is Searchle?</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Searchle is a daily puzzle built around Google autocomplete suggestions. Each day, the game shows you a Google search prompt with a blank, and your job is to guess the word or phrase that Google would autocomplete. For example, if the prompt is &quot;Why does my cat always ___&quot;, the answer might be &quot;STARE&quot; or &quot;MEOW&quot; — whatever Google&apos;s autocomplete engine suggests first.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Today&apos;s Searchle prompt is &quot;{todayPuzzle.prompt}&quot; and the answer is <strong class="text-slate-900">{todayPuzzle.answer.toUpperCase()}</strong>.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The game taps into something people already do every day — type partial searches into Google and read the suggestions. Searchle turns that everyday behavior into a structured puzzle. The answer pool is enormous because it reflects actual search behavior, which means some answers are surprising, funny, or oddly specific.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          You cannot solve Searchle through vocabulary knowledge alone; you need to think like a search engine user. That makes Searchle one of the most unique daily puzzle games available.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Searchle launched in 2022 during the daily puzzle boom. It has a smaller player base than Wordle or Nerdle, but its audience is notably engaged — the game appeals to people who spend time on the internet, understand how autocomplete works, and enjoy the detective-like process of reverse-engineering search behavior.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          With {totalPuzzles.toLocaleString('en-US')} past puzzles available, there is plenty of archival material to study.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          What makes Searchle particularly interesting is that it is not testing knowledge in the traditional sense. A trivia game asks whether you know a fact. Searchle asks whether you can predict what millions of people are searching for. That distinction matters — the answer is not &quot;correct&quot; in any academic sense, but it is &quot;correct&quot; in terms of human behavior.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          That psychological angle is what makes Searchle feel different from almost every other daily puzzle game.
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">How Searchle Works</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Each day, Searchle picks one puzzle from its collection of {totalPuzzles.toLocaleString('en-US')} past prompts. The puzzle consists of a Google search prompt — a partial sentence or question with a blank where the autocomplete word goes.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Your job is to type the word that completes the prompt. The prompt for today ({todayLabel}) is shown above, and you can reveal the answer using the answer card.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The daily cycle resets at midnight. Each puzzle is mapped to a specific date, so the answer on any given day is always the same. This page tracks the current day&apos;s puzzle and displays the prompt and answer together, along with a copy button and links to the archive and solver.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The archive lets you browse every past puzzle by date, and the solver can help you narrow down possible answers if you want to work through the deduction process.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          There is no guess limit or color feedback system — it is a straight prediction challenge. You either know the autocomplete answer or you do not. That makes Searchle fundamentally different from deduction games like Wordle. It is closer to trivia, except the answers are based on real Google behavior rather than general knowledge.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Some players love this no-feedback format because it feels more like a pure test of intuition and internet awareness.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          Google autocomplete is influenced by search volume, geographic location, trending topics, and changes to the search algorithm. That means Searchle answers can shift over time even for the same prompt — what autocomplete suggests today might differ from what it suggested six months ago.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The Searchle answer list captures the autocomplete state at the time each puzzle was created, so the answers reflect a specific moment in search behavior.
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Today&apos;s Searchle Answer</h2>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The Searchle answer for {todayLabel} is <strong class="text-slate-900">{todayPuzzle.answer.toUpperCase()}</strong>. The prompt for today&apos;s puzzle is &quot;{todayPuzzle.prompt}&quot;. You can copy the answer using the button above, or use the solver link if you want to work through the puzzle yourself before revealing the solution.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          If you solved today&apos;s puzzle without help, that is impressive — Searchle does not give you the incremental feedback that Wordle-style games provide. You either know the answer or you do not. Getting it right on instinct alone feels more rewarding precisely because there is no safety net.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          If you did not get it, do not worry — many Searchle answers are obscure or counterintuitive, and the only way to get better is to see enough past answers that the patterns start clicking.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          For previous days, visit the Searchle archive.
        </p>
        <p class="mt-4 text-lg leading-8 text-slate-600">
          The archive contains all {totalPuzzles.toLocaleString('en-US')} puzzles with their prompts and answers, searchable by date. Spending 10 minutes browsing past puzzles is one of the fastest ways to improve at Searchle because you start recognizing the types of prompts and answers the game uses.
        </p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Strategy Tips for Searchle</h2>
        <div class="mt-6 space-y-6">
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Think about what people actually search for</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Google autocomplete reflects real search behavior, not correct information. If a prompt starts with &quot;Why is the sky ___&quot;, the answer is not necessarily a scientifically accurate completion — it is whatever people type most often.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          &quot;BLUE&quot; might be the answer even if the real reason is Rayleigh scattering. Always think about what a typical person would type, not what an expert would say. Human behavior drives autocomplete, not facts.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Consider the length of the blank</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Google autocomplete typically suggests one or two words. If the prompt ends with a space before the blank, the answer is probably a single word. Longer completions are rare in autocomplete.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          If the blank is at the start of a question, think about common question words like HOW, WHAT, WHY, WHEN, and WHERE. Keeping the answer short dramatically narrows the possibilities.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Category awareness helps</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Searchle prompts fall into recognizable categories: health questions (&quot;Why does my ___ hurt&quot;), tech questions (&quot;How to fix ___&quot;), food questions (&quot;What is the best ___ for&quot;), and personality questions (&quot;Why am I always ___&quot;).
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          Recognizing the category helps you narrow the answer space to words that commonly appear in that context. Health prompts favor body parts; tech prompts favor device names; food prompts favor common ingredients or cuisines.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Try typing the prompt into Google yourself</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          If you are genuinely stuck, type the prompt into Google and see what the autocomplete suggests. That is technically cheating, but it is also how you learn the patterns. After doing it a few times, you will start recognizing which words Google favors without needing to look.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          The autocomplete results might differ slightly from the Searchle answer due to timing and personalization, but they will usually point you in the right direction.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Browse the archive for patterns</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          The Searchle archive has {totalPuzzles.toLocaleString('en-US')} puzzles you can browse by date. Scanning through a week of past answers teaches you which words Google autocomplete favors — common verbs like MAKE, GET, FIX, and FIND appear disproportionately often.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          The archive is the best study tool for improving your Searchle performance.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-xl font-bold text-slate-900">Think about emotions and common complaints</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          A huge percentage of Google searches are complaints, curiosities, or emotional questions. Prompts like &quot;Why do I always feel ___&quot; or &quot;Why is my ___ so ___&quot; dominate the Searchle answer pool. Common completions include TIRED, ANXIOUS, STRESSED, SAD, and LONELY for emotional prompts.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          Understanding that people use Google to process negative emotions more than positive ones gives you a significant edge.
        </p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Common Searchle Prompt Categories</h2>
        <div class="mt-6 grid gap-6 sm:grid-cols-2">
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-lg font-bold text-slate-900">Health and Body</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Prompts like &quot;Why does my ___ hurt&quot; or &quot;What causes ___&quot; are extremely common. People turn to Google for health questions more than almost any other category. The answers usually involve common body parts (HEAD, BACK, STOMACH, CHEST) or symptoms (DIZZY, NAUSEOUS, TIRED).
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          If the prompt mentions a body part, the answer is usually another body part or a symptom.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-lg font-bold text-slate-900">Technology and How-To</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          &quot;How to fix ___&quot; and &quot;How to remove ___&quot; prompts appear constantly. People use Google as a repair manual for everything from phones to relationships. Common tech answers include SCREEN, BATTERY, WIFI, PRINTER, and PASSWORD.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          The technology category is one of the most predictable in Searchle because the vocabulary is relatively small.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-lg font-bold text-slate-900">Food and Cooking</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Food questions like &quot;What is the best way to ___&quot; or &quot;How long do you ___&quot; reflect how many people use Google while cooking. Answers tend to be common cooking actions (BOIL, ROAST, FREEZE, STORE) or ingredients (CHICKEN, RICE, EGGS, PASTA).
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          If the prompt sounds like a cooking question, the answer almost always involves a common food item or technique.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-lg font-bold text-slate-900">Animals and Pets</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Pet-related prompts are surprisingly common in Searchle. &quot;Why does my dog always ___&quot; or &quot;Can cats ___&quot; tap into the massive pet-owner community that uses Google for animal questions.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          Answers often involve common pet behaviors (BARK, SHED, PURR, BITE) or concerns (EAT, SLEEP, DRINK). If the prompt mentions an animal, the answer is usually a behavior or health-related term.
        </p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
        <h2 class="text-3xl font-black tracking-tight text-slate-900">Searchle vs Similar Games</h2>
        <div class="mt-6 grid gap-6 sm:grid-cols-2">
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-lg font-bold text-slate-900">Searchle vs Abridged</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Abridged shows you a condensed book summary and you guess the title. Searchle shows you a Google prompt and you guess the autocomplete. Both test pattern recognition, but Abridged is about literary knowledge while Searchle is about search behavior.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          The skill sets are completely different — Abridged rewards reading, Searchle rewards internet awareness.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-lg font-bold text-slate-900">Searchle vs Contexto</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Contexto measures how close your word is to the target using AI embeddings. Searchle measures whether your word matches Google autocomplete exactly. Contexto is about semantic proximity; Searchle is about predicting real-world behavior.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          Contexto is softer and more forgiving; Searchle is binary — either you match the top autocomplete or you do not.
        </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-lg font-bold text-slate-900">Searchle vs Wordle</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
              Wordle gives you feedback after each guess so you can deduce the answer. Searchle gives you one shot — no feedback, no second chances. Wordle rewards logical deduction; Searchle rewards internet literacy and pattern recognition. They are both daily puzzles but test completely different abilities.
            </p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-6">
            <h3 class="text-lg font-bold text-slate-900">Who is Searchle best for?</h3>
            <p class="mt-2 text-base leading-7 text-slate-600">
          Searchle appeals to people who spend a lot of time online and pay attention to autocomplete suggestions. If you have ever noticed patterns in what Google suggests, you will have a natural advantage.
        </p>
        <p class="mt-2 text-base leading-7 text-slate-600">
          It also appeals to people who enjoy &quot;predict the most common answer&quot; style puzzles — the kind of person who always knows what the crowd will choose.
        </p>
          </div>
        </div>
      </section>
    </article>
    {/if}
  </main>

  <FAQSection {faqs} />
</div>

