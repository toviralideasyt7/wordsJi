<script lang="ts">
        import StaticArticle from '$lib/components/StaticArticle.svelte';
        import { ARTICLE_CONTENT } from '$lib/content/registry';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import WordleAnalyzerClient from '$lib/components/wordle-analyzer/WordleAnalyzerClient.svelte';
        import {
                generateBreadcrumbSchema,
                generateFAQSchema,
                generateHowToSchema,
                generateSoftwareApplicationSchema,
                stripStructuredDataTypes,
                generateWebPageSchema
        } from '$lib/seo';

        const pageTitle = 'Wordle Analyzer - Replay and Grade Every Move';
        const pageDescription =
                'Paste a finished Wordle to compare each move with AI, check hard mode discipline, and create spoiler-safe share links.';
        const pageUrl = 'https://wordsolverx.com/wordle-analyzer';

        const faqs = [
                {
                        question: 'How is the Wordle Analyzer different from a Wordle solver?',
                        answer:
                                'A solver helps you find the next move while a puzzle is live. The analyzer reviews a completed game and grades each guess against what an AI would have done with the same information. It shows how much you gained or lost at every step.'
                },
                {
                        question: 'Can shared links spoil the answer?',
                        answer:
                                'No. Shared analyzer links encode the game in the URL query string. When you open one, the page shows a spoiler warning and waits for you to confirm before revealing the answer and analysis.'
                },
                {
                        question: 'What does hard mode checking flag?',
                        answer:
                                'Hard mode requires every guess to respect confirmed clues — green letters must stay in place, yellow letters must appear somewhere. The analyzer flags any guess that violates a locked clue, even if it was technically a valid word.'
                },
                {
                        question: 'What is guess quality?',
                        answer:
                                'Quality measures how well your guess narrowed the remaining possibilities. A guess that splits the remaining pool roughly in half scores near 100%. A guess that barely reduces the candidate set scores low. It is calculated from entropy — how much information each guess revealed.'
                },
                {
                        question: 'Does this work for Wordle variants like Dordle or Quordle?',
                        answer:
                                'No. The analyzer is built for the original 5-letter Wordle only. Variants with multiple simultaneous boards produce different clue states that this tool does not model.'
                },
                {
                        question: 'Where does the AI line come from?',
                        answer:
                                'The AI line is recalculated after each of your guesses using the same clue state you had at that moment. It is the best-ranked guess from a dictionary of 12,000+ words based on information gain — not a fixed strategy or pre-programmed sequence.'
                },
                {
                        question: 'What do the "remaining words preview" labels mean?',
                        answer:
                                '"Common" labels words from the official answer list. "Other" labels words that are valid guesses but were never actual answers. The analyzer tracks both because a good early guess narrows the entire guess pool, not just the plausible answers.'
                },
                {
                        question: 'Can I analyze games in unlimited or practice mode?',
                        answer:
                                'Yes. Enter any sequence of 1-6 guesses followed by the answer, mark hard mode if you played it, and run the analysis. The tool works for any finished game regardless of whether it was the daily puzzle.'
                }
        ];

        const schemas = JSON.stringify([
                generateFAQSchema(faqs),
                generateHowToSchema('How to use the Wordle Analyzer', [
                        {
                                name: 'Enter your guesses',
                                text: 'Type your guesses in order in the top rows. Place the final answer in the last row labeled "Answer." Each guess must be exactly 5 letters.'
                        },
                        {
                                name: 'Mark hard mode if used',
                                text: 'Toggle the hard mode checkbox if you played by hard mode rules. This enables rule-violation checking for every guess.'
                        },
                        {
                                name: 'Run the analysis',
                                text: 'Click Analyze Game to replay the puzzle. The tool rebuilds the clue state after each turn and compares your line against the AI alternative.'
                        },
                        {
                                name: 'Review and share',
                                text: 'Scroll through the turn-by-turn breakdown. Copy the spoiler-safe link or the emoji recap to share with friends.'
                        }
                ]),
                {
                        ...generateSoftwareApplicationSchema('Wordle Analyzer', 'GameApplication'),
                        keywords: ['wordle analyzer', 'wordle replay', 'wordle review', 'wordle hard mode checker']
                },
                generateBreadcrumbSchema([
                        { name: 'Home', url: 'https://wordsolverx.com' },
                        { name: 'Solver', url: 'https://wordsolverx.com/solver' },
                        { name: 'Wordle Analyzer', url: pageUrl }
                ]),
                generateWebPageSchema('Wordle Analyzer', pageDescription, pageUrl)
        ]);
</script>

<svelte:head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
                name="keywords"
                content="wordle analyzer, wordle replay, wordle review tool, wordle hard mode checker, wordle share link"
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:image" content="https://wordsolverx.com/images/wordle-analyzer.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {@html `<script type="application/ld+json">${stripStructuredDataTypes(schemas, ['FAQPage', 'HowTo']) ?? schemas}</script>`}
</svelte:head>

<main class="min-h-screen bg-white">
        <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Breadcrumbs hideSchema={true} />
        </div>

        <WordleAnalyzerClient />

        <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
                <StaticArticle content={ARTICLE_CONTENT['wordle-analyzer']} />
        </div>
</main>
