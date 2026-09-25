<script lang="ts">
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { generateWebPageSchema } from '$lib/seo';
  import { GUIDES } from '$lib/content/guides';
  import { countArticleWords, estimateReadingMinutes } from '$lib/content/article-metrics';

  const formatGuideDate = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

  const guideReadingMinutes = (slug: string) => {
    const guide = GUIDES.find((g) => g.slug === slug);
    return guide ? estimateReadingMinutes(countArticleWords(guide.body)) : 5;
  };

  // Full strategy articles, grouped for display on the hub.
  const guideGroups = (() => {
    const order = ['Wordle Core', 'Word Lists', 'Multi-Board', 'Non-Word Games', 'Getting Better'];
    const map = new Map<string, typeof GUIDES>();
    for (const g of GUIDES) {
      if (!map.has(g.group)) map.set(g.group, [] as unknown as typeof GUIDES);
      (map.get(g.group) as unknown as typeof GUIDES[number][]).push(g);
    }
    return order
      .filter((k) => map.has(k))
      .map((k) => ({ title: k, items: map.get(k) as unknown as typeof GUIDES }));
  })();

  const faqs = [
    {
      question: 'What\'s the best Wordle starting word?',
      answer: 'Words like "CRANE", "SLATE", "CRATE", and "TRACE" are popular because they contain common letters in good positions. The ideal starting word has a mix of vowels and common consonants. Our Wordle Solver can show you the mathematically best options based on letter frequency.'
    },
    {
      question: 'How is Quordle different from Wordle?',
      answer: 'Quordle gives you nine guesses to solve four Wordle puzzles at the same time. Each guess applies to all four boards. The key strategy is to use your first few guesses to gather information across all boards, then solve them one by one.'
    },
    {
      question: 'What kinds of words appear in Phoodle?',
      answer: 'Phoodle uses food-related words including ingredients (like "flour", "basil"), cooking terms (like "grill", "whisk"), dishes (like "pasta", "curry"), and kitchen items. Thinking about food categories can help narrow down possibilities.'
    },
    {
      question: 'How do I get better at Semantle?',
      answer: 'Semantle is about word meaning, not spelling. Start with common words and pay attention to the similarity score. Words with scores above 30 are getting "warm." Think about synonyms, related concepts, and word associations rather than letter patterns.'
    },
    {
      question: 'Is there a strategy for Colordle?',
      answer: 'Yes! Learn to recognize common color names and their hex codes. Colors like "Crimson", "Navy", and "Forest Green" appear often. Also, pay attention to the RGB hints — they tell you whether you\'re too red, too green, or too blue.'
    }
  ];
</script>

<svelte:head>
  <title>Guides & Strategies - Expert Tips for Word Puzzles</title>
  <meta name="description" content="Expert guides and strategies for Wordle, Quordle, Phoodle, Waffle, Colordle, and Semantle. Learn the best techniques to improve your puzzle-solving skills." />
  <link rel="canonical" href="https://wordsolverx.com/guides" />
  <meta property="og:title" content="Guides & Strategies - Expert Tips for Word Puzzles" />
  <meta property="og:description" content="Read practical puzzle guides, strategy tips, and improvement advice for Wordle, Quordle, Phoodle, Waffle, Colordle, and Semantle." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://wordsolverx.com/guides" />
  <meta property="og:site_name" content="WordSolverX" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Guides & Strategies - Expert Tips for Word Puzzles" />
  <meta name="twitter:description" content="Improve your puzzle solving with practical guides and strategy breakdowns from WordSolverX." />
  <meta name="twitter:image" content="https://wordsolverx.com/wordsolverx.webp" />
  {@html `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        'name': 'Puzzle Guides & Strategies',
        'description': 'Expert guides for word puzzle games',
        'url': 'https://wordsolverx.com/guides'
      },
      {
        ...generateWebPageSchema(
          'Puzzle Guides & Strategies',
          'Strategy articles and learning content for daily puzzle fans.',
          'https://wordsolverx.com/guides'
        )
      }
    ]
  })}</script>`}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
  <Breadcrumbs />

  <!-- Page header -->
  <div class="mb-12">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
        <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      </div>
      <span class="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">{GUIDES.length} guides</span>
    </div>
    <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.1]">
      Puzzle Guides &amp; Strategy — Wordle Strategy, Quordle Strategy &amp; More
    </h1>
    <p class="mt-3 text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
      Practical strategy breakdowns for the games you actually play. No filler, no generic advice.
    </p>
  </div>

  <!-- In-depth strategy articles (full guide pages) -->
  <div class="space-y-10 mb-16">
    {#each guideGroups as group}
      <section>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-5">{group.title}</h2>
        <div class="grid gap-5">
          {#each group.items as guide}
            <article class="group border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800/50 overflow-hidden transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg">
              <a href={`/guides/${guide.slug}`} class="flex h-full flex-col sm:flex-row">
                <div class="sm:w-44 shrink-0 bg-gradient-to-br {guide.gradient} flex items-center justify-center p-8 sm:p-6">
                  <span class="text-5xl">{guide.icon}</span>
                </div>
                <div class="flex-1 p-6 sm:p-7">
                  <div class="flex flex-wrap items-center gap-2 mb-2.5">
                    <span class="rounded-full bg-teal-50 dark:bg-teal-900/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">{group.title}</span>
                    <span class="text-xs text-slate-400 dark:text-slate-500">{formatGuideDate(guide.publishedDate)} · {guideReadingMinutes(guide.slug)} min read</span>
                  </div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">{guide.cardTitle}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{guide.description}</p>
                  <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400">
                    Read the guide
                    <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </a>
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </div>

  <!-- ═══════════════════════════════════════════════════
       SEO ARTICLE CONTENT — 1500+ words
       ═══════════════════════════════════════════════════ -->
  <article>
    <div class="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20">

      <h2 class="text-slate-900 dark:text-slate-50">Why Puzzle Strategy Actually Matters</h2>

      <p>
        Word games look simple from the outside. Guess a word, get some colored tiles, guess again. But underneath that simplicity is a pure information theory problem: you have a fixed number of guesses to identify one correct answer out of thousands of possibilities. Every guess you make either eliminates possibilities or wastes a turn. The difference between a strategic player and a random guesser isn't intelligence — it's understanding how much information each guess provides.
      
      </p>
      <p>
        A player who starts every Wordle with "FJORD" is mathematically disadvantaged compared to a player who starts with "CRANE," even if both players are equally smart. The first guess tests four uncommon letters. The second tests five common letters across five positions. After one guess, the "CRANE" player has dramatically narrowed the field while the "FJORD" player has learned almost nothing. Strategy is about maximizing information gain per guess, not about being clever or creative.
      
      </p>
      <p>
        This page collects our best strategies for each game. The goal isn't to memorize a list of starting words — it's to understand the underlying principles so you can adapt when games change, when new variants appear, or when a particular puzzle breaks the usual patterns.
      

      </p>
      <h2 class="text-slate-900 dark:text-slate-50">The Universal Principle: Information Density</h2>

      <p>
        Every word puzzle has the same core mechanic: you make a guess, you receive feedback, you use that feedback to make a better guess. The feedback varies — colored tiles in Wordle, distance numbers in Worldle, similarity scores in Semantle — but the structure is identical. The question is always: "how efficiently did this guess reduce my uncertainty?"
      
      </p>
      <p>
        Information density is the metric that matters. A guess with high information density eliminates a large fraction of remaining possibilities. A guess with low information density eliminates very few. The math gets complex, but the intuition is simple: if your guess could match 500 possible answers, it's probably a bad guess. If it could only match 20, it's probably a good one — assuming those 20 are well-distributed across different answer patterns.
      
      </p>
      <p>
        This principle applies regardless of the game. In Wordle, it means choosing starting words with common, well-distributed letters. In Quordle, it means choosing guesses that provide useful information across all four boards simultaneously. In Colordle, it means picking colors that split the remaining color space roughly in half. In every case, the goal is the same: make the biggest dent in the possibility space with each guess.
      

      </p>
      <h2 class="text-slate-900 dark:text-slate-50">Wordle-Specific Strategy</h2>

      <p>
        Wordle is the most analyzed puzzle game in history, and the strategic consensus has mostly settled around a few key ideas. First, your opening guess should test five different common letters. "CRANE," "SLATE," and "TRACE" all score well because they contain R, A, T, E, and at least one of C/S/L — all among the most frequent letters in the Wordle answer list.
      
      </p>
      <p>
        Second, avoid repeating letters in your first two guesses. If you guess "CRANE" and get nothing, guessing "STARE" wastes a turn because you're retesting R and A. A better second guess would be something like "LINTY" or "GHOST" that covers completely new territory. The fewer letters you retest, the more information you gain.
      
      </p>
      <p>
        Third, in the mid-game (guesses 3-4), switch from information-gathering mode to elimination mode. You have enough clues by this point to start ruling out large categories of words. If you know the word ends in "CK," there are only about 20 possible answers. If you also know the third letter is "A," you're down to maybe 5. At that point, you're not gathering information anymore — you're hunting for the specific word.
      
      </p>
      <p>
        The most common Wordle mistake is guessing a word that retests letters you already know are wrong. The solver tool eliminates this error by filtering out every word that conflicts with your existing clues. Using it as a learning tool teaches you to think in terms of constraints rather than vibes.
      

      </p>
      <h2 class="text-slate-900 dark:text-slate-50">Quordle: A Completely Different Mental Model</h2>

      <p>
        Quordle's strategy is almost the opposite of Wordle's. In Wordle, you want every guess to be a valid candidate answer (because any guess could be correct). In Quordle, your first three or four guesses should almost never be attempts to solve any individual board. They should be pure information-gathering plays that spread clues across all four boards.
      
      </p>
      <p>
        A good Quordle opening is something like "CRANE" followed by "SLIME" or "GHOST." These two guesses together test 9-10 different letters across all positions. After both guesses, you'll have color feedback on all four boards, which is usually enough to start solving individual puzzles. With nine total guesses and four puzzles, you have an average of 2.25 guesses per puzzle after the opening. That's tight, which is why efficiency in the early game matters so much.
      
      </p>
      <p>
        The biggest Quordle mistake is "falling in love" with one board. You see green letters on board two, get excited, and spend three guesses solving it while boards one, three, and four sit untouched. Now you have six guesses left for three puzzles — doable but stressful. Solve the easiest boards first (the ones with the most green letters after your opening), and leave the hardest for last when you have the fewest constraints but also the fewest remaining possibilities.
      

      </p>
      <h2 class="text-slate-900 dark:text-slate-50">Phoodle: The Power of Domain Knowledge</h2>

      <p>
        Phoodle restricts answers to food-related words, which means strategy is less about letter frequency and more about food vocabulary. If you cook regularly, you have an advantage. If you don't, building a mental catalog of food terms — ingredients, cooking methods, cuisines, kitchen equipment — will improve your game dramatically.
      
      </p>
      <p>
        Common Phoodle answers include ingredients like "OLIVE," "BASIL," "SUGAR," and "FLOUR"; cooking methods like "GRILL," "BAKE," "ROAST," and "STEAM"; dishes like "PASTA," "CURRY," "SUSHI," and "SALAD"; and kitchen tools like "KNIFE," "WHISK," "SPOON," and "PLATE." Most daily Phoodle answers come from a pool of roughly 500-600 food words, which is much smaller than Wordle's 2,300+ pool.
      
      </p>
      <p>
        Because the answer pool is smaller and more specialized, Phoodle rewards vocabulary depth over pure letter strategy. Knowing that "THYME" is a valid food word but "THEME" isn't saves you a guess. The Phoodle solver tool is particularly useful here because it only considers food words — so the suggestions it makes are always valid Phoodle guesses.
      

      </p>
      <h2 class="text-slate-900 dark:text-slate-50">Colordle and Waffle: Non-Letter Strategies</h2>

      <p>
        Colordle is fundamentally a binary search problem. Each guess tells you whether the target color is more red, more green, or more blue than your guess. The optimal strategy is to choose colors that are evenly spaced across the color space — start with a mid-range color, then halve the remaining range with each guess.
      
      </p>
      <p>
        Learning hex codes helps enormously. The hex color system is intuitive once you understand it: #FF0000 is pure red, #00FF00 is pure green, #0000FF is pure blue. Colors are mixed by adjusting each pair of hex digits. Knowing that #FF8800 is orange (high red, medium green, no blue) lets you make informed guesses about warm colors. Similarly, #008888 is teal (medium green, medium blue, no red).
      
      </p>
      <p>
        Waffle is a spatial reasoning puzzle. You're given all the correct letters but in the wrong positions, and you need to swap rows and columns to fix them. The key insight is that you should identify which letters are already in the correct position (the green ones) and never move them. Then focus on the remaining letters and figure out which single swap fixes the most cells. Solving a waffle in the minimum number of moves (10 swaps, minus 1 for each swap that fixes two cells simultaneously) requires planning, not trial and error.
      

      </p>
      <h2 class="text-slate-900 dark:text-slate-50">Semantle: Thinking in Concepts, Not Letters</h2>

      <p>
        Semantle breaks all the rules that other word games teach you. Letter position doesn't matter. Common letters don't matter. What matters is meaning — how close your guess is to the answer in semantic space, measured by a word embedding model.
      
      </p>
      <p>
        The strategy for Semantle is to start with extremely common words: "RUN," "GO," "BE," "HAVE," "MAKE," "SAY." These words have many semantic connections, so at least one of them will score reasonably high and point you in the right direction. A high score (above 50) means you're very close. A moderate score (20-50) means you're in the right conceptual neighborhood. A low score (below 10) means you're in the wrong area entirely.
      
      </p>
      <p>
        Once you have a warm word, explore related concepts. If "HAPPY" scores 40, try "SAD" (opposite), "JOY" (synonym), "SMILE" (related action), "LAUGH" (related action). The model clusters related concepts, so moving through semantic neighborhoods systematically is more efficient than random guessing.
      

      </p>
      <h2 class="text-slate-900 dark:text-slate-50">Getting Better: The Feedback Loop</h2>

      <p>
        Reading strategy guides is a good start, but improvement comes from deliberate practice with feedback. Here's the loop: play a game, use the solver to see what you could have done differently, identify the specific decision where you lost efficiency, and adjust your approach for the next game.
      
      </p>
      <p>
        The Wordle Analyzer tool on this site is designed for exactly this purpose. You enter your completed game (the sequence of guesses you made), and it compares each guess to the mathematically optimal choice. If you took four guesses but could have solved it in three, it shows you which guess was suboptimal and what you should have guessed instead. Over time, patterns emerge — you'll notice that you consistently waste guesses on letter combinations that look reasonable but provide less information than the alternatives.
      
      </p>
      <p>
        The same approach works for every game. After a Quordle session, review which boards took the most guesses and why. After a Semantle round, look at the scores of your guesses and trace the path you took through semantic space. The specific game doesn't matter — the principle is the same: practice with awareness, identify inefficiencies, fix them.
      
      </p>
    </div>

    <div class="mt-12">
      <FAQSection title="Frequently Asked Questions" {faqs} />
    </div>
  </article>
</div>
