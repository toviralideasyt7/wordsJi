<script lang="ts">
        import AnswerPageMeta from '$lib/components/AnswerPageMeta.svelte';
        import AnswerPageNoscript from '$lib/components/AnswerPageNoscript.svelte';
        import InternalLinkSection from '$lib/components/InternalLinkSection.svelte';
  import StaticArticle from '$lib/components/StaticArticle.svelte';
  import { ARTICLE_CONTENT } from '$lib/content/registry';
  import AuthorCard from '$lib/components/AuthorCard.svelte';
        import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
        import FAQSection from '$lib/components/FAQSection.svelte';
        import {
                PRESTON_HAYES_AUTHOR_DESCRIPTION,
                PRESTON_HAYES_AUTHOR_IMAGE,
                PRESTON_HAYES_AUTHOR_NAME
        } from '$lib/authors';
        import type { SpotleAnswer, SpotleArtist } from '$lib/spotle';
        import { generateArticleSchema, stripStructuredDataTypes } from '$lib/seo';

        let { data }: {
                data: {
                        todayStr: string;
                        todayFormatted: string;
                        todayAnswer: SpotleAnswer | null;
                        todayArtist: SpotleArtist | null;
                        last30Days: {
                                date: string;
                                dayNumber: number;
                                artistName: string;
                                track: string | null;
                                soundcloudUrl: string | null;
                                artist: SpotleArtist | null;
                        }[];
                        faqItems: { question: string; answer: string }[];
                        schemaJson: string;
                        meta: { title: string; description: string; keywords?: string };
                        stats: { totalArtists: number; totalAnswers: number; lastSyncedAt: string | null };
                        labels: { countryNames: Record<string, string>; genderNames: Record<string, string> };
                };
        } = $props();

        const todayFormatted = $derived(data.todayFormatted);
        const todayAnswer = $derived(data.todayAnswer);
        const todayArtist = $derived(data.todayArtist);
        const last30Days = $derived(data.last30Days);
        const faqItems = $derived(data.faqItems);
        const schemaJson = $derived(stripStructuredDataTypes(data.schemaJson, ['FAQPage', 'HowTo']));
        const meta = $derived(data.meta);
        const stats = $derived(data.stats);
        const labels = $derived(data.labels);
        const publishedDate = $derived(`${data.todayAnswer?.date ?? data.todayStr}T00:00:00Z`);
        const articleSchema = $derived(
                generateArticleSchema({
                        headline: meta.title,
                        description: meta.description,
                        url: 'https://wordsolverx.com/spotle-answer-today',
                        image: 'https://wordsolverx.com/images/spotle-answer-today.webp',
                        datePublished: publishedDate,
                        dateModified: publishedDate
                })
        );

        function toSpotifyArtistUrl(uri?: string): string | null {
                if (!uri?.startsWith('spotify:artist:')) {
                        return null;
                }

                return `https://open.spotify.com/artist/${uri.replace('spotify:artist:', '')}`;
        }
</script>

<svelte:head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta name="keywords" content={meta.keywords ?? 'spotle answer today, spotle answer, spotle hint, spotle artist today'} />
        <link rel="canonical" href="https://wordsolverx.com/spotle-answer-today" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://wordsolverx.com/spotle-answer-today" />
        <meta property="og:site_name" content="WordSolverX" />
        <meta property="og:image" content="https://wordsolverx.com/images/spotle-answer-today.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        {@html `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>`}
        {#if schemaJson}
                {@html `<script type="application/ld+json">${schemaJson}</script>`}
        {/if}
</svelte:head>

<AnswerPageMeta publishedDate={publishedDate} />
<AnswerPageNoscript gameName="Spotle" answer={todayArtist?.artist ?? null} />

<div class="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-6xl">
                <Breadcrumbs hideSchema={true} />

                <header class="relative overflow-hidden rounded-[2rem] border border-teal-100 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.16),transparent_30%),linear-gradient(135deg,#ffffff_0%,#ecfdf5_55%,#f0fdfa_100%)] p-8 shadow-[0_28px_80px_rgba(16,185,129,0.10)] sm:p-10">
                        <div class="absolute -right-10 top-0 h-32 w-32 rounded-full bg-teal-200/40 blur-3xl"></div>
                        <div class="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-teal-200/40 blur-3xl"></div>
                        <div class="relative">
                                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Daily Spotle</p>
                                <h1 class="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                                        Spotle Answer Today
                                </h1>
                                <p class="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                                        Today's Spotle artist, genre, and details for <span class="font-semibold text-teal-700">{todayFormatted}</span>.
                                </p>

                                <div class="mt-7 flex flex-wrap gap-3">
                                        <a
                                                href="#spotle-answer-card"
                                                class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                                        >
                                                View Today's Artist
                                        </a>
                                        <a
                                                href="/spotle-archive"
                                                class="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-3 text-sm font-bold text-teal-700 shadow-sm transition hover:bg-teal-50"
                                        >
                                                Open Spotle Archive
                                        </a>
                                        <a
                                                href="/spotle-solver"
                                                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                        >
                                                Use Spotle Solver
                                        </a>
                                </div>
                        </div>
                </header>

                <section id="spotle-answer-card" class="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                        <div class="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
                                <h2 class="text-2xl font-black text-slate-900">Today's Spotle artist</h2>

                                {#if todayArtist && todayAnswer}
                                        <p class="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
                                                Day #{todayAnswer.dayNumber}
                                        </p>
                                        <h3 class="mt-2 text-4xl font-black text-slate-900">{todayArtist.artist}</h3>
                                        <p class="mt-3 text-lg text-slate-600">
                                                {labels.countryNames[todayArtist.country] ?? todayArtist.country.toUpperCase()} · {todayArtist.genre}
                                        </p>

                                        <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">Rank</p>
                                                        <p class="mt-2 text-xl font-bold text-slate-900">#{todayArtist.index + 1}</p>
                                                </div>
                                                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">Debut Year</p>
                                                        <p class="mt-2 text-xl font-bold text-slate-900">{todayArtist.debut_album_year}</p>
                                                </div>
                                                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">Group Size</p>
                                                        <p class="mt-2 text-xl font-bold text-slate-900">
                                                                {todayArtist.group_size === 1 ? 'Solo' : `${todayArtist.group_size} members`}
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">Gender</p>
                                                        <p class="mt-2 text-xl font-bold text-slate-900">
                                                                {labels.genderNames[todayArtist.gender] ?? todayArtist.gender}
                                                        </p>
                                                </div>
                                                <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                                                        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">Featured Track</p>
                                                        <p class="mt-2 text-xl font-bold text-slate-900">
                                                                {todayAnswer.track || todayArtist.track_name || 'Track info not stored yet'}
                                                        </p>
                                                </div>
                                        </div>

                                        <div class="mt-6 flex flex-wrap gap-3">
                                                {#if todayAnswer.soundcloudUrl}
                                                        <a
                                                                href={todayAnswer.soundcloudUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                class="inline-flex items-center rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
                                                        >
                                                                Listen on SoundCloud
                                                        </a>
                                                {/if}
                                                {#if toSpotifyArtistUrl(todayArtist.uri)}
                                                        <a
                                                                href={toSpotifyArtistUrl(todayArtist.uri) ?? '#'}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                class="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                                Open Artist Profile
                                                        </a>
                                                {/if}
                                        </div>
                                {:else}
                                        <p class="mt-4 text-base leading-7 text-slate-600">
                                                Today's Spotle artist hasn't been posted yet. The archive page will still help you browse older dates while the next refresh lands.
                                        </p>
                                {/if}
                        </div>

                        <div class="space-y-6">
                                <div class="rounded-[2rem] bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-lg shadow-teal-500/25">
                                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">Data status</p>
                                        <div class="mt-5 space-y-3 text-sm">
                                                <div class="flex items-center justify-between gap-4">
                                                        <span>Total Artists</span>
                                                        <span class="font-bold">{stats.totalArtists}</span>
                                                </div>
                                                <div class="flex items-center justify-between gap-4">
                                                        <span>Total Stored Answers</span>
                                                        <span class="font-bold">{stats.totalAnswers}</span>
                                                </div>
                                                <div class="flex items-center justify-between gap-4">
                                                        <span>Last Sync</span>
                                                        <span class="text-right font-bold">
                                                                {stats.lastSyncedAt ? new Date(stats.lastSyncedAt).toLocaleString('en-US') : 'Not recorded'}
                                                        </span>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </section>

                <section class="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                        <h2 class="text-2xl font-black text-slate-900">Recent Spotle answers</h2>
                        <p class="mt-3 text-base leading-7 text-slate-600">
                                The 30 most recent Spotle answers.
                        </p>

                        <div class="mt-6 grid gap-3 md:grid-cols-2">
                                {#each last30Days as entry}
                                        <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                                <div class="flex items-start justify-between gap-4">
                                                        <div class="min-w-0">
                                                                <p class="text-sm font-semibold text-slate-500">{entry.date}</p>
                                                                <p class="mt-1 text-xl font-black text-slate-900">{entry.artistName}</p>
                                                                <p class="mt-1 text-sm text-slate-600">
                                                                        Day #{entry.dayNumber}
                                                                        {#if entry.artist}
                                                                                · {labels.countryNames[entry.artist.country] ?? entry.artist.country.toUpperCase()}
                                                                        {/if}
                                                                </p>
                                                                {#if entry.track}
                                                                        <p class="mt-3 text-sm text-slate-700">Track: <span class="font-semibold">{entry.track}</span></p>
                                                                {/if}
                                                        </div>
                                                        {#if entry.soundcloudUrl}
                                                                <a
                                                                        href={entry.soundcloudUrl}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        class="shrink-0 rounded-full border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
                                                                >
                                                                        Play
                                                                </a>
                                                        {/if}
                                                </div>
                                        </div>
                                {/each}
                        </div>
                </section>

                <div class="mt-10">
                        <FAQSection title="Spotle Answer FAQ" faqs={faqItems} />
                </div>

                {#if false}
                <article class="mt-10 space-y-8">
                        <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                                <h2 class="text-3xl font-black tracking-tight text-slate-900">How today's clues work</h2>
                                <p class="mt-4 text-lg leading-8 text-slate-600">
                                        Spotle gives you clues about a music artist — genre, debut year, group size, gender, nationality. Start by narrowing the genre and decade, then use the more specific attributes. Country and genre together eliminate roughly 90% of the {stats.totalArtists}-artist database in two guesses.
                                </p>
                                <p class="mt-4 text-lg leading-8 text-slate-600">
                                        Debut year is the sleeper clue most people underuse. If it says 2015 or later, you're looking at relatively recent acts. Before 2000 is classic territory — classic rock, early hip-hop, legendary pop. Combining country, genre, and debut year usually gets you down to fewer than 10 candidates.
                                </p>
                        </section>

                        <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                                <h2 class="text-3xl font-black tracking-tight text-slate-900">Solo vs group matters more than you'd think</h2>
                                <p class="mt-4 text-lg leading-8 text-slate-600">
                                        Solo artists are usually easier because the name is a person's name — you either recognize it or you don't. Groups are trickier. Band names can be abstract (Coldplay), geographic (Arctic Monkeys), or completely unrelated to music (Foo Fighters). If the answer is a group, think about iconic bands from the country and genre you've identified.
                                </p>
                                <p class="mt-4 text-lg leading-8 text-slate-600">
                                        Gender classification is especially useful in K-pop, where boy groups and girl groups are separate categories with entirely different artist pools. Outside K-pop, gender eliminates roughly half the candidates in most genres.
                                </p>
                        </section>

                        <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                                <h2 class="text-3xl font-black tracking-tight text-slate-900">When the solver saves you time</h2>
                                <p class="mt-4 text-lg leading-8 text-slate-600">
                                        Spotle doesn't limit itself to Western pop. The database includes artists from Africa, Asia, South America, and Eastern Europe — genres and markets that many English-speaking players know nothing about. When a Japanese rock band or Nigerian Afrobeats artist comes up, you'll need the solver to filter systematically.
                                </p>
                                <p class="mt-4 text-lg leading-8 text-slate-600">
                                        When the page includes a SoundCloud link, use it. Thirty seconds of the artist's music is often enough to recognize them, even if the name doesn't ring a bell. Audio recognition beats metadata recall every time.
                                </p>
                        </section>

                        <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
                                <h2 class="text-3xl font-black tracking-tight text-slate-900">Questions players keep asking</h2>
                                <div class="mt-6 space-y-4">
                                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                <h3 class="text-base font-bold text-slate-900">What time does Spotle reset?</h3>
                                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                                        Midnight UTC. If you're on EST, that's 7 PM the night before.
                                                </p>
                                        </div>
                                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                <h3 class="text-base font-bold text-slate-900">How many artists are in the database?</h3>
                                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                                        Currently {stats.totalArtists} artists across every continent and major genre. Repeat answers are infrequent.
                                                </p>
                                        </div>
                                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                <h3 class="text-base font-bold text-slate-900">Can I listen to today's artist?</h3>
                                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                                        When a SoundCloud or Spotify link is available, yes — the links are in the answer card above. Even if you knew the artist, you might discover a track you hadn't heard.
                                                </p>
                                        </div>
                                        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                                <h3 class="text-base font-bold text-slate-900">What's the best first guess strategy?</h3>
                                                <p class="mt-2 text-sm leading-7 text-slate-600">
                                                        Guess an artist you know well from a common genre and country. The feedback tells you what you matched, and from there you can narrow systematically using the solver.
                                                </p>
                                        </div>
                                </div>
                        </section>
                </article>
                {/if}

                <div class="mt-12">
                        <div class="mt-12">
  <StaticArticle content={ARTICLE_CONTENT['spotle-answer-today']} />
</div>

<AuthorCard
                                name={PRESTON_HAYES_AUTHOR_NAME}
                                image={PRESTON_HAYES_AUTHOR_IMAGE}
                                description={PRESTON_HAYES_AUTHOR_DESCRIPTION}
                        />

      <InternalLinkSection currentGame="Spotle" />
                </div>
        </div>
</div>
