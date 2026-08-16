import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const GAME_DLE_REWRITES = {
  'loldle-answer-today-updated': `<article class="space-y-8">
      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">How today's clues work</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          LoLdle gives you one champion to guess and six tries to get there. The clues cover gender, position, species, region, and release year — and that last one catches people out more than you'd think. If you've been playing League since 2013, you probably know the old champions cold. But if a 2024 release comes up and you haven't kept up, you're going to have a bad time.
        </p>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Classic mode splits attributes into match, partial, and miss. A green box means exact match — your guess and the answer share that attribute. Yellow means close but not quite (like both being mages but one is burst and one is control). Gray means it's not a match at all. Four modes total: Classic, Quote, Ability, and Splash Art. Each one tests a different part of your champion knowledge.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Two regional variants — America and Europe — run separate answer pools. So the Classic answer for NA might be completely different from EU on the same day. This page tracks both.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">The mode that trips people up</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Splash Art mode is where most players lose their streak. The game crops a tiny section of a splash art — could be a weapon edge, a piece of armor, or just a color gradient in the background — and you have to figure out which champion it belongs to. If you don't actively browse splash art galleries, you're guessing blind.
        </p>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Quote mode is the second-hardest. Everyone knows Yasuo's "Hasagi!" but when you get some obscure line from a champion who got reworked three years ago, you're in trouble. The wiki has every voice line if you want to study up, but honestly, just playing more ARAM helps — you see champions you'd never pick in draft.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Ability mode sounds hard but isn't as bad as you'd think. Most ability icons have a distinctive color palette tied to the champion's theme. Once you've seen a few hundred, you start recognizing them by style alone.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Quick tips from the community</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          <strong>Start with a weird champion in Classic.</strong> Someone with uncommon attributes — like a manaless yordle or a non-human support — splits the pool fast. Gnar, Kennen, or Rek'Sai are solid openers because their attribute combos are rare.
        </p>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          <strong>Learn which champions are resourceless.</strong> Mana is the default, but energy (Zed, Akali, Lee Sin), fury (Renekton, Tryndamere), and no-cost (Riven, Katarina, Yasuo) champions are a minority. If the answer doesn't use mana, you've just eliminated 70% of the roster.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          <strong>Use the solver for Splash mode.</strong> There's no shame in it. Enter the colors and shapes you see, and the solver narrows it down. Better to use help than to stare at a crop of a cape for ten minutes.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What time does LoLdle reset?</h3>
            <p class="leading-relaxed">Midnight UTC. If you're on EST, that's 7 PM the night before.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Why do America and Europe have different answers?</h3>
            <p class="leading-relaxed">Separate answer pools for each region. Keeps things fresh and prevents spoilers across time zones.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">How many champions are in the pool?</h3>
            <p class="leading-relaxed">Over 160, and it grows every time Riot releases a new one. New champions are tricky because fewer people have memorized their attributes yet.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Is there a LoLdle app?</h3>
            <p class="leading-relaxed">No app — it's browser-based. Works fine on mobile though.</p>
          </div>
        </div>
      </section>
    </article>`,

  'dotadle-answer-today-updated': `<article class="space-y-8">
      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Today's puzzle at a glance</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Dotadle picks one Dota 2 hero and you have to guess who it is. The feedback covers attack type (melee/ranged), primary attribute (Strength, Agility, Intelligence, or Universal), roles, and the hero's complexity rating. That Universal attribute trips people up — it was added when Valve reclassified some heroes, and it's still unfamiliar to returning players.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Dota's hero pool is around 125 heroes, but the flexible lane assignments make guessing harder than it looks. Unlike League where roles are more rigid, a Dota hero can play multiple positions. A hero labeled "carry" might also show up as mid or offlane in your games. That flexibility means role-based elimination is less reliable here than in other character-guessing games.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Why some heroes are harder to guess</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          The heroes nobody plays are the ones that ruin your streak. You know Invoker's attributes because you see him constantly, but when's the last time you thought about Visage, Meepo, or Lone Druid? The meta favorites are easy — it's the niche picks that get you.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Complexity rating is your secret weapon here. Most players don't track it consciously, but heroes get rated 1-3 stars for complexity. If the answer is a 3-star hero, you can eliminate roughly half the pool immediately. That narrows things faster than almost any other attribute.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">When to use the solver vs gut</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          After two guesses, you usually have enough attribute data to make the solver useful. Enter what you know — primary attribute, attack type, roles — and it filters the hero pool down to a manageable shortlist. From there, go with your gut on the remaining candidates.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          If you're stuck between two or three heroes, check their complexity ratings and release dates. Those attributes are less obvious than roles or attack type, but they're just as effective for splitting a close call.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What time does Dotadle reset?</h3>
            <p class="leading-relaxed">New puzzle drops at midnight UTC every day.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What are the Dotadle modes?</h3>
            <p class="leading-relaxed">Classic (attribute guessing), Ability (icon recognition), Quote (voice lines), and Splash (cropped artwork). Each mode picks a different hero.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Does Dotadle include all heroes?</h3>
            <p class="leading-relaxed">Yes, the full Dota 2 roster including the most recent additions. New heroes get added to the pool as they're released.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Why are some heroes classified as Universal?</h3>
            <p class="leading-relaxed">Valve reclassified several heroes when they added the Universal attribute type. These heroes don't fit neatly into STR/AGI/INT — they benefit from all attributes equally. About 20 heroes fall into this category.</p>
          </div>
        </div>
      </section>
    </article>`,

  'narutodle-answer-today-updated': `<article class="space-y-8">
      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Reading between the clue lines</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Narutodle gives you attributes like village, rank, chakra nature, and debut arc to narrow down from the Naruto character roster. Village is the strongest early filter — Konoha characters alone make up a huge chunk of the pool, so getting a "not Konoha" feedback immediately rules out dozens of names.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Rank works differently than you'd expect. Academy student, genin, chunin, jonin, and Kage are the main tiers, but plenty of characters change rank across the series. Naruto starts as a genin and ends as Hokage. The puzzle uses the character's most commonly associated rank, not necessarily their final one.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Part 1 vs Shippuden knowledge gap</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          This is where newer fans struggle. If you only watched Part 1, you're missing roughly half the roster. Shippuden introduces hundreds of characters — Akatsuki members, the Five Kage, all the jinchuriki, and every member of the reanimated army in the war arc. If a Shippuden-only character comes up and you stopped watching at the Chunin Exams, you're guessing at random.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Conversely, if you skipped Part 1 and went straight to Shippuden, you might not know characters like Zabuza, Haku, or the Sound Four. The puzzle pulls from the entire franchise, so gaps in either direction will cost you.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Common wrong-guess patterns</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          People default to guessing main characters first — Naruto, Sasuke, Sakura, Kakashi. That's fine for guess one, but if none of them match, stop guessing Konoha jounin and switch to a different village. The solver helps here: enter your feedback and it shows you exactly which characters still fit.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Chakra nature is underused as a filter. Most players focus on village and rank, but if the answer uses Wind Release and you've already guessed a Fire Release character, you've eliminated a big chunk of the roster with that one clue. Pay attention to the nature type — it's more discriminating than people think.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What time does Narutodle reset?</h3>
            <p class="leading-relaxed">Midnight UTC, same as most daily puzzle games.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Does Narutodle include Boruto characters?</h3>
            <p class="leading-relaxed">The focus is on Naruto and Shippuden characters. Boruto additions may appear but aren't the primary source.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What are the Narutodle modes?</h3>
            <p class="leading-relaxed">Classic (attribute-based), Quote (voice lines), and Ability (jutsu icons). Each mode picks a different character.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">How many characters are in the pool?</h3>
            <p class="leading-relaxed">Hundreds — from main characters to side characters and villains. The deeper your Naruto knowledge, the better you'll do.</p>
          </div>
        </div>
      </section>
    </article>`,

  'onepiecedle-answer-today-updated': `<article class="space-y-8">
      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Today's character breakdown</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          OnePiecedle picks a character from the One Piece universe and you narrow it down using attributes like crew, bounty, devil fruit status, haki type, and debut arc. Crew affiliation is your strongest first filter — Straw Hat, Heart Pirates, Big Mom Pirates, and the other major crews each have distinctive attribute patterns that eliminate large chunks of the pool.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Bounty ranges shift dramatically across the series. Early-series characters might have bounties in the tens of millions, while post-Wano characters can hit billions. If the answer's bounty is in a range you don't recognize, you're probably looking at a character from an arc you haven't watched yet.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Arc-specific knowledge matters</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          One Piece has over 1,100 episodes and 30+ arcs. The puzzle pulls characters from all of them. If you're current with the manga, you have a massive advantage — you know the recent reveals, the updated bounties, and the characters who just showed up for the first time. If you're an anime-only viewer, you're roughly a year behind on character introductions.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          This creates a real knowledge gap. Someone who stopped at Dressrosa doesn't know Wano characters. Someone who skipped Skypeia might miss characters that Oda brought back 800 chapters later. The solver helps bridge these gaps by filtering what's left after you enter your feedback.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Devil fruit and haki as filters</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Devil fruit status is binary — either the character has one or they don't. That alone cuts the pool roughly in half. If they have a fruit, knowing the type (Paramecia, Zoan, Logia, or the newer classification system) narrows it further. Logia users are the rarest, so if the answer is Logia, you've got a short list.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Haki type is less useful early because many characters have multiple types. But Conqueror's Haki specifically is rare — only a handful of characters have it confirmed. If the answer has Conqueror's, you're looking at top-tier characters only.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What time does OnePiecedle reset?</h3>
            <p class="leading-relaxed">The daily puzzle flips at midnight UTC.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Does it include manga-only characters?</h3>
            <p class="leading-relaxed">Yes — characters who have appeared in the manga are in the pool even if they haven't shown up in the anime yet.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">How many characters are in the pool?</h3>
            <p class="leading-relaxed">Hundreds, from Straw Hat crew members to minor arc villains. One Piece has one of the largest character rosters in manga history.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What are the OnePiecedle modes?</h3>
            <p class="leading-relaxed">Classic (attribute guessing), Quote (dialogue), and Ability (character abilities or techniques). Each mode picks independently.</p>
          </div>
        </div>
      </section>
    </article>`,

  'pokedle-answer-today-updated': `<article class="space-y-8">
      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Gen 1 attributes that matter most</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Pokedle uses Pokemon as answers and gives you feedback on type, generation, evolution stage, habitat, and color. Gen 1 Pokemon dominate the recognizable end of the pool — everyone knows Charizard, Pikachu, and Mewtwo. But that familiarity is a trap: you'll guess Gen 1 Pokemon by default even when the answer is from Gen 5 or later.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Generation is your strongest filter after type. There are currently 9 generations, and each one has a distinct design philosophy. Gen 1 creatures are simpler in shape, Gen 5 introduced a huge batch, and recent generations have more complex silhouettes. If the answer isn't from Gen 1, stop guessing Kanto Pokemon immediately.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Type combinations as shortcuts</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Single-type Pokemon are more common in earlier generations. Dual types become more prevalent from Gen 3 onward. If the answer is a dual type like Water/Ground, you can eliminate every pure Water and pure Ground type immediately. That's the kind of clue that cuts the pool from 800+ to under 50.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          The rarest type combinations are your best friends when guessing. Bug/Dragon, Fire/Grass, Normal/Ice — these have very few Pokemon each. If you can identify a rare type combo, the answer narrows to a handful of candidates instantly.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Evolution stage is underrated</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Most players focus on type and generation, but evolution stage is surprisingly discriminating. If the answer is a fully evolved Pokemon, you can eliminate every base form and middle evolution. If it's a base form that doesn't evolve (like Tauros or Lapras), your pool shrinks dramatically — there are fewer standalone Pokemon than you'd think.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          The solver tracks this automatically. Enter your feedback on type, generation, and evolution stage, and it filters the remaining candidates. Two guesses in, you'll see the list drop from 800+ to maybe 30.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What time does Pokedle reset?</h3>
            <p class="leading-relaxed">Resets at midnight UTC — same time as Wordle.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Does Pokedle include all generations?</h3>
            <p class="leading-relaxed">Yes, all Pokemon from Gen 1 through the most recent generation are in the pool.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What are the Pokedle modes?</h3>
            <p class="leading-relaxed">Classic (attribute-based), Ability (move or ability recognition), and Quote (Pokedex entries or character dialogue). Each mode picks a different Pokemon.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">How many Pokemon are in the pool?</h3>
            <p class="leading-relaxed">Over 1,000 across all generations. That's a lot of candidates, which is why type and generation filters are so important.</p>
          </div>
        </div>
      </section>
    </article>`,

  'smashdle-answer-today-updated': `<article class="space-y-8">
      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Universe as your best filter</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Smashdle uses the Super Smash Bros. Ultimate roster, and universe (the franchise a fighter comes from) is the single strongest attribute to filter on. Mario characters alone make up a significant chunk, but once you rule out one universe, you can focus your guesses on fighters from other franchises. If the answer is from a niche universe like Xenoblade or Fatal Fury, knowing your Nintendo history pays off.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          The roster has roughly 80+ fighters including DLC. That's smaller than most other character-guessing games, but the attribute overlap between fighters from the same universe makes it tricky. Multiple Mario characters share similar weight classes and jump counts, so you need to dig deeper into specific attributes to split them.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Weight and jump count tricks</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          Weight class and number of jumps are the attributes most players ignore — and they shouldn't. Weight ranges from featherweight (Jigglypuff) to super heavyweight (Bowser), and it's a continuous scale, not just categories. If the answer is in the lightweight range, you can eliminate every heavyweight immediately.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          Jump count is even more discriminating. Most fighters have 1 jump (plus their midair jump). Characters like Kirby, Meta Knight, and Pit have multiple midair jumps, which is rare. If the answer has 5+ jumps, you're looking at a very short list. This attribute alone can narrow things to under 10 fighters.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">DLC fighters that stump people</h2>
        <p class="text-base text-slate-600 mb-4 leading-relaxed">
          DLC characters are the biggest source of wrong guesses. Fighters like Kazuya, Sephiroth, Pyra/Mythra, and Sora come from franchises that many Nintendo players don't follow closely. If you don't play Tekken, you won't know Kazuya's weight class or how many jumps he has. If you haven't played Kingdom Hearts, Sora's attributes are a mystery.
        </p>
        <p class="text-base text-slate-600 leading-relaxed">
          The solver handles this well. Enter what you got from your first guess — universe mismatch, weight class, jump count — and it filters the roster down to candidates that match. When the list hits single digits, you're almost there.
        </p>
      </section>

      <section class="bg-white rounded-3xl p-5 sm:p-8 shadow-lg border border-slate-100">
        <h2 class="text-3xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        <div class="space-y-6 text-lg text-slate-600">
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What time does Smashdle reset?</h3>
            <p class="leading-relaxed">Midnight UTC, so NA players get it in the evening.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Does Smashdle include DLC fighters?</h3>
            <p class="leading-relaxed">Yes — all DLC fighters from Fighters Pass Vol. 1, Vol. 2, and individual releases like Piranha Plant are in the pool.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">What attributes does Smashdle use?</h3>
            <p class="leading-relaxed">Universe, weight class, number of jumps, and other fighter-specific stats. Each attribute helps narrow the pool differently.</p>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">How many fighters are in the pool?</h3>
            <p class="leading-relaxed">The full Ultimate roster — over 80 fighters including every DLC addition.</p>
          </div>
        </div>
      </section>
    </article>`
};

const routesBase = join(process.cwd(), 'wordsolverx-z-ai', 'src', 'routes', '(content)');

for (const [dirName, newContent] of Object.entries(GAME_DLE_REWRITES)) {
  const filePath = join(routesBase, dirName, '+page.svelte');
  
  try {
    let fileContent = readFileSync(filePath, 'utf-8');
    
    // Find the seoContent snippet and replace its content
    const snippetStart = fileContent.indexOf('{#snippet seoContent()}');
    const snippetEnd = fileContent.indexOf('{/snippet}', snippetStart);
    
    if (snippetStart === -1 || snippetEnd === -1) {
      console.log(`SKIP: ${dirName} - no seoContent snippet found`);
      continue;
    }
    
    // Replace content between snippet tags
    const before = fileContent.substring(0, snippetStart + '{#snippet seoContent()}'.length);
    const after = fileContent.substring(snippetEnd);
    
    const newFileContent = before + '\n    ' + newContent + '\n  ' + after;
    writeFileSync(filePath, newFileContent, 'utf-8');
    console.log(`FIXED: ${dirName}`);
  } catch (err) {
    console.log(`ERROR: ${dirName} - ${err.message}`);
  }
}

console.log('\nDone fixing GameDle answer pages.');