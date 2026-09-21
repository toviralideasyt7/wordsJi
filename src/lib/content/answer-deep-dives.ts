/**
 * Presentation extras for the 19 prose "-answer-today" articles.
 *
 * Kept out of `registry.ts` for the same reason `guide-deep-dives.ts` is kept out
 * of `guides.ts`: every other consumer of `ARTICLE_CONTENT` (archive calendars,
 * solver pages, ~40 route files) must keep rendering the exact HTML it renders
 * today. Only <AnswerArticle> applies what is in here.
 *
 * Each entry adds:
 *   - `keyTakeaways` — the scannable summary block guides already ship.
 *   - `visuals`      — figure blocks, keyed by the article's raw H2 heading.
 *
 * ACCURACY RULE, identical to guide-deep-dives.ts: a number is only allowed if it
 * is (a) a published rule of the game that this page is about, or (b) arithmetic
 * over words already printed on the same page. Illustrative tile boards must be
 * self-consistent — every colour has to follow from the row above it — and their
 * captions must say they are illustrative. No invented statistics, no first-person
 * experience (see AGENTS.md and docs/SEO-INDEXING.md Part 4).
 *
 * The heading keys are matched against the raw (un-substituted) heading string,
 * so a heading rename fails the build loudly instead of silently dropping a figure.
 */

import type {
	StaticArticleContent,
	StaticArticleVisual
} from './registry';

export interface AnswerExtras {
	keyTakeaways?: string[];
	/** Keyed by the section's raw heading text. */
	visuals?: Record<string, StaticArticleVisual | StaticArticleVisual[]>;
}

export const ANSWER_EXTRAS: Record<string, AnswerExtras> = {
	/* ══ 1. wordle-answer-today ═══════════════════════════════════════════════ */
	'wordle-answer-today': {
		keyTakeaways: [
			'<strong>Six guesses, five letters, three tile states</strong> — every decision is about which guess buys the most information, not which guess feels closest.',
			'A fixed opener beats a clever one: you learn what its gray tiles rule out, and that knowledge carries between games.',
			'Yellow means the letter is in the answer and in the wrong slot. Move it every guess; filing it under the slot where it first appeared is what ends hard boards.',
			'Doubled letters are common enough that ruling them out early is the most expensive assumption on the board.'
		],
		visuals: {
			'The second guess decides your Wordle, not the opener': {
				type: 'tiles',
				title: 'Two guesses spent on information, none wasted',
				rows: [
					{
						word: 'SLATE',
						states: ['absent', 'absent', 'absent', 'absent', 'absent'],
						note: 'Five letters eliminated in one row.'
					},
					{
						word: 'POUND',
						states: ['absent', 'absent', 'absent', 'correct', 'correct'],
						note: 'N and D lock into slots four and five.'
					},
					{
						word: 'GRIND',
						states: ['correct', 'correct', 'correct', 'correct', 'correct'],
						note: 'Guess three closes the board.'
					}
				],
				caption:
					'Illustrative board, not the daily answer. Every state follows from the row above it, and no row reuses a letter an earlier row ruled out.'
			},
			'Why a fixed Wordle opener beats a clever one': {
				type: 'stats',
				title: 'The fixed budget every Wordle is played on',
				stats: [
					{ value: '6', label: 'Guesses per puzzle' },
					{ value: '5', label: 'Letters per guess' },
					{ value: '3', label: 'Tile states', note: 'Green, yellow, gray.' },
					{ value: '1', label: 'Answer per day' }
				]
			}
		}
	},

	/* ══ 2. quordle-answer-today ══════════════════════════════════════════════ */
	'quordle-answer-today': {
		keyTakeaways: [
			'<strong>Nine guesses cover four boards</strong>, so a guess that only helps one board is a gift to the other three.',
			'Every guess lands on all four boards at once. Read the four feedback rows side by side before deciding what to play next.',
			'Two wide openers test ten or more distinct letters across the whole puzzle before any board has a decision to make.',
			'Endgames belong to whichever board has the fewest candidates — that is where one guess removes the most uncertainty.'
		],
		visuals: {
			'The 2.25 number that runs the whole game': {
				type: 'stats',
				title: 'The Quordle budget, spread across the board',
				stats: [
					{ value: '4', label: 'Boards per puzzle' },
					{ value: '9', label: 'Guesses for all four' },
					{ value: '5', label: 'Letters per word' },
					{
						value: '2.25',
						label: 'Boards each guess must advance',
						note: 'Nine guesses divided across four boards.'
					}
				]
			},
			'The endgame: stop gathering, start solving': {
				type: 'steps',
				title: 'Splitting the last few guesses between four boards',
				steps: [
					{
						title: 'Count survivors, not guesses',
						body: 'Rank the four boards by how many words still fit. The board with two candidates is finished in one guess; the board with forty is not.'
					},
					{
						title: 'Convert a wide guess into a narrow one',
						body: 'When two boards are close, play the word that is a candidate on one and a strong separator on the other, so a single guess does both jobs.'
					},
					{
						title: 'Stop probing once a board is down to one',
						body: 'A guess that cannot possibly be the answer buys nothing on a board that already has a unique candidate. Play the candidate.'
					}
				]
			}
		}
	},

	/* ══ 3. nerdle-answer-today ═══════════════════════════════════════════════ */
	'nerdle-answer-today': {
		keyTakeaways: [
			'Nerdle Classic is <strong>eight characters wide</strong>, and the equals sign holds the same slot in every puzzle, so it carries no information.',
			'Only one tile lights up per matching character. A single purple digit is not proof the equation contains exactly one copy of it.',
			'A census opener such as 9-8*7=56 tests every digit and three operators before you have guessed the answer once.',
			'The duplicates already sitting in the archive are the reason boards die on guess six: read a purple as "at least one", never as "exactly one".'
		],
		visuals: {
			'Green, purple, black, and the purple lie': {
				type: 'table',
				title: 'What each Nerdle result proves',
				headers: ['Tile', 'What it proves'],
				rows: [
					{ label: 'Green', value: 'Right character, right slot.', highlight: true },
					{ label: 'Purple', value: 'In the equation, in a different slot.' },
					{ label: 'Black', value: 'Not in the equation at all.' },
					{ label: 'A single purple', value: 'At least one copy — never exactly one.' }
				]
			},
			'Two census openers, and why the equals sign never moves': {
				type: 'stats',
				title: 'The fixed frame of a Classic Nerdle',
				stats: [
					{ value: '8', label: 'Characters per equation' },
					{ value: '6', label: 'Guesses per puzzle' },
					{ value: '3', label: 'Result states' },
					{ value: '1', label: 'Equals sign per equation' }
				]
			}
		}
	},

	/* ══ 4. spotle-answer-today ═══════════════════════════════════════════════ */
	'spotle-answer-today': {
		keyTakeaways: [
			'Every guess returns a <strong>direction and a range</strong>. That pair is the whole signal; the artist name you typed only matters for where it sits on the map.',
			'Open with an artist you know cold, so the feedback describes the answer rather than your own uncertainty.',
			'Yellow marks direction, not membership. Two yellows can point at genuinely different neighbourhoods until the range narrows.',
			'Late in the board the arrows invert: the answer is between your last two guesses, and picking the midpoint beats another famous name.'
		],
		visuals: {
			'Stop playing trivia, start playing ranges': {
				type: 'steps',
				title: 'Reading a Spotle board, in order',
				steps: [
					{
						title: 'Fix the anchor',
						body: 'Play an artist whose catalog you know precisely. A guess you are vague about produces a range you cannot use.'
					},
					{
						title: 'Halve the range',
						body: 'Take the range the answer sits inside and choose an artist whose debut falls near the middle of it.'
					},
					{
						title: 'Read the direction before the distance',
						body: 'The arrow tells you which way to move; the range tells you how far. Moving the wrong way spends a guess even when the range was right.'
					}
				]
			},
			'The endgame flips the rule': {
				type: 'stats',
				title: 'The Spotle budget',
				stats: [
					{ value: '10', label: 'Guesses per puzzle' },
					{ value: '1', label: 'Artist per day', note: 'The same puzzle for every player.' },
					{ value: '2', label: 'Signals per guess', note: 'Direction and range.' }
				]
			}
		}
	},

	/* ══ 5. contexto-answer-today ═════════════════════════════════════════════ */
	'contexto-answer-today': {
		keyTakeaways: [
			'The Contexto rank is a <strong>distance, not a percentage</strong>. Rank 250 means 249 words sit closer to the answer than yours does.',
			'Common words beat clever ones. A rare synonym tells you almost nothing about which direction the answer lies in.',
			'Three broad guesses that bracket the answer from different angles map the neighbourhood faster than ten variations on one theme.',
			'Guesses are unlimited. The cost of a wasted guess is the time you spend on it, not a place in the budget.'
		],
		visuals: {
			'The number is a distance, not a grade': {
				type: 'table',
				title: 'Reading a Contexto rank',
				headers: ['Rank', 'What it tells you'],
				rows: [
					{ label: '1', value: 'The answer itself.', highlight: true },
					{ label: 'Under 1,000', value: 'Same neighbourhood — start refining, not probing.' },
					{ label: 'Around 10,000', value: 'Same broad topic, wrong region.' },
					{ label: 'Very high', value: 'No usable signal. Change the kind of word you are playing.' }
				]
			},
			'Triangulation is the whole skill': {
				type: 'steps',
				title: 'Turning three ranks into a location',
				steps: [
					{
						title: 'Play three unrelated broad words',
						body: 'An object, an action and an emotion, all common. You are mapping the space, not guessing the answer.'
					},
					{
						title: 'Keep the closest, discard the rest',
						body: 'The best rank of the three tells you which region to walk into. The other two told you where the answer is not.'
					},
					{
						title: 'Move in small steps once you are close',
						body: 'Near the answer, a big jump in meaning usually overshoots. Change one property of your word at a time.'
					}
				]
			}
		}
	},

	/* ══ 6. colordle-answer-today ═════════════════════════════════════════════ */
	'colordle-answer-today': {
		keyTakeaways: [
			'Six guesses against a percentage score, so every guess has to change something measurable.',
			'Fix the hue family first, then brightness and saturation. Nudging all three at once produces guesses you cannot learn from.',
			'Two primaries bracket the hue better than one near-miss colour: the pair tells you which direction the answer lies in.',
			'If the score stops moving, stop guessing blind and enumerate what still fits the signals you already have.'
		],
		visuals: {
			'Hue first, brightness later: the order that matters': {
				type: 'steps',
				title: 'Four guesses that each change one variable',
				steps: [
					{
						title: 'Guess one: a pure primary',
						body: 'Red, green or blue. You are establishing which direction the answer sits in, not trying to land on it.'
					},
					{
						title: 'Guess two: a neighbouring primary',
						body: 'The pair of scores brackets the hue family. Where the answer sits between them is now a range, not a guess.'
					},
					{
						title: 'Guesses three and four: one channel at a time',
						body: 'Hold the hue and move brightness, then hold brightness and move saturation. A score that does not move tells you which channel is already right.'
					}
				]
			},
			'The fine-tuning trap that ends Colordle streaks': {
				type: 'stats',
				title: 'The Colordle budget',
				stats: [
					{ value: '6', label: 'Guesses per puzzle' },
					{ value: '3', label: 'Colour channels', note: 'Hue, brightness, saturation.' },
					{ value: '1', label: 'Target per day' }
				]
			}
		}
	},

	/* ══ 7. globle-answer-today ═══════════════════════════════════════════════ */
	'globle-answer-today': {
		keyTakeaways: [
			'The heat map is a <strong>proximity</strong> signal, not a direction. Two guesses that both run warm can sit on opposite sides of the answer.',
			'Anchor guesses should be far apart and easy to place: a central country and an extreme one bracket more of the map than two neighbours.',
			'Unfamiliar countries are still useful. A small state that runs hot eliminates every border it has.',
			'Once two guesses run warm, the answer lies between them — name the borders in that band rather than guessing continents.'
		],
		visuals: {
			'Three anchors that bracket any country on Earth': {
				type: 'steps',
				title: 'Building a Globle bracket',
				steps: [
					{
						title: 'Open in the middle of a landmass',
						body: 'A central country is close to more neighbours than a coastal one, so its heat reading carries more information.'
					},
					{
						title: 'Add an extreme',
						body: 'A country at the edge of the map turns one reading into a direction: the answer is on the side the two guesses disagree about.'
					},
					{
						title: 'Name the borders in the warm band',
						body: 'When two guesses are close, the answer shares a border with one of them. Testing border neighbours is faster than testing big names.'
					}
				]
			},
			'Why the boring central country beats the famous one': {
				type: 'table',
				title: 'What a heat reading buys you',
				headers: ['Reading', 'Usable signal'],
				rows: [
					{ label: 'Deep red', value: 'The closest band — test a bordering country next.', highlight: true },
					{ label: 'Orange', value: 'Same region. You have a direction, not a border.' },
					{ label: 'Cooler', value: 'Rules out a whole region of the map.' },
					{ label: 'Cold', value: 'Still useful: it fixes one end of the bracket.' }
				]
			}
		}
	},

	/* ══ 8. semantle-answer-today ═════════════════════════════════════════════ */
	'semantle-answer-today': {
		keyTakeaways: [
			'Every guess scores <strong>0–100 on semantic similarity</strong>. The number measures closeness in meaning, not percentage of the way there.',
			'Guesses are unlimited, so a wasted guess costs time rather than a place in the budget.',
			'A run of scores in the 3–8 range is not progress; it means the whole lane is wrong and the next guess should change the subject.',
			'Once one guess crosses 40, commit to that lane and vary the word class instead of jumping to another topic.'
		],
		visuals: {
			'What the Semantle score is actually measuring': {
				type: 'table',
				title: 'Reading a Semantle score',
				headers: ['Score', 'What it means'],
				rows: [
					{ label: '100', value: 'The answer itself.', highlight: true },
					{ label: 'Above 40', value: 'Same lane. Stop probing and start refining.' },
					{ label: 'Around 20', value: 'Related topic, wrong part of it.' },
					{ label: 'Under 10', value: 'No shared meaning worth following.' }
				]
			},
			'A Semantle probing routine: three broad words, then commit': {
				type: 'steps',
				title: 'Three probes, then one lane',
				steps: [
					{
						title: 'Probe with common words',
						body: 'Pick words from three different regions of meaning. You are looking for the one that scores highest, not for the answer.'
					},
					{
						title: 'Keep the strongest lane',
						body: 'Discard the other two probes entirely. Mixing lanes is what produces hundreds of guesses in the teens.'
					},
					{
						title: 'Change the word class, not the topic',
						body: 'Inside the right lane, move between noun, verb and adjective forms of the same idea. That is where the last few points live.'
					}
				]
			}
		}
	},

	/* ══ 9. waffle-answer-today ═══════════════════════════════════════════════ */
	'waffle-answer-today': {
		keyTakeaways: [
			'Waffle is a <strong>swap puzzle</strong>: the 25 letters are all present, so the only question is which exchanges fix the grid.',
			'Every tile belongs to two words at once, which is why a swap that fixes one row can break the column through it.',
			'A swap budget is spent, not saved. Look for the exchange that corrects two words at the same time before moving anything.',
			'Read the grid by column after each swap. Rows are the easy read; columns are where the remaining errors hide.'
		],
		visuals: {
			'Waffle is a swap puzzle, not a spelling test': {
				type: 'stats',
				title: 'The Waffle grid, fixed',
				stats: [
					{ value: '25', label: 'Tiles on the board' },
					{ value: '6', label: 'Five-letter words' },
					{ value: '5×5', label: 'Grid shape' },
					{ value: '2', label: 'Words per tile', note: 'One across, one down.' }
				]
			},
			'The double-swap that saves the budget': {
				type: 'steps',
				title: 'Spending a swap budget deliberately',
				steps: [
					{
						title: 'Read all six words before moving anything',
						body: 'Name each across and down word from the letters already in place, even where it is still wrong. You are looking for pairs of misplaced letters.'
					},
					{
						title: 'Prefer the swap that fixes two words',
						body: 'An exchange that corrects a row and the column crossing it costs one move and removes two errors.'
					},
					{
						title: 'Re-check the columns after every swap',
						body: 'Rows usually look right before the grid is. The remaining mistakes tend to sit in the intersections.'
					}
				]
			}
		}
	},

	/* ══ 10. phoodle-answer-today ═════════════════════════════════════════════ */
	'phoodle-answer-today': {
		keyTakeaways: [
			'The answer pool is <strong>food vocabulary</strong>, which is a real constraint: a five-letter guess that fits food language tests more useful letters than a generic opener.',
			'Openers built from food letters — steak, spice, olive — do double duty as both information and plausible answers.',
			'Cooking terms, cuts, dishes and ingredients are all in scope, so a word that feels like a kitchen verb is a legitimate candidate.',
			'The page shows the letter hints and the recent food words; use both before spending a guess on a hunch.'
		],
		visuals: {
			'The food constraint is a gift, not a handicap': {
				type: 'table',
				title: 'Where Phoodle answers come from',
				headers: ['Category', 'Examples of the kind of word'],
				rows: [
					{ label: 'Ingredients', value: 'Store-cupboard basics with five letters.', highlight: true },
					{ label: 'Dishes', value: 'Named plates and preparations.' },
					{ label: 'Kitchen verbs', value: 'What you do to food, not just what it is called.' },
					{ label: 'Cuts and parts', value: 'Butchery and produce terminology.' }
				]
			},
			'Openers, and why STEAK beats SLATE here': {
				type: 'tiles',
				title: 'Food-lane opener, then two rows of narrowing',
				rows: [
					{
						word: 'STEAK',
						states: ['absent', 'absent', 'absent', 'absent', 'absent'],
						note: 'Five food-lane letters ruled out in one row.'
					},
					{
						word: 'BLOND',
						states: ['absent', 'present', 'absent', 'absent', 'absent'],
						note: 'L is in the answer, somewhere other than slot two.'
					},
					{
						word: 'CHILI',
						states: ['absent', 'absent', 'absent', 'correct', 'absent'],
						note: 'L locks slot four; the rest of the row is ruled out.'
					}
				],
				caption:
					'Illustrative board, not the daily answer. Every state follows from the row above it, and no row reuses a letter an earlier row ruled out.'
			}
		}
	},

	/* ══ 11. phrazle-answer-today ═════════════════════════════════════════════ */
	'phrazle-answer-today': {
		keyTakeaways: [
			'A Phrazle guess must match the <strong>shape of the phrase</strong> — same word count, same letter count per word — or the board rejects it.',
			'Fix the shape before chasing letters. One correct word in the wrong length is worth less than a whole guess spent on the structure.',
			'Function words (the, of, a, to) are cheap to test and appear in most phrases, so they carry more information than a rare content word.',
			'Read the feedback per word, not per letter: a phrase is won by getting one word of it right and working outward.'
		],
		visuals: {
			'Why multi-word guessing changes the strategy': {
				type: 'steps',
				title: 'Solving a phrase instead of a word',
				steps: [
					{
						title: 'Count the shape first',
						body: 'Note how many words and how many letters in each. The shape rules out most candidate phrases before a single letter is tested.'
					},
					{
						title: 'Spend a guess on function words',
						body: 'Articles and prepositions repeat across phrases, so confirming them narrows the whole board rather than one slot.'
					},
					{
						title: 'Lock one word, then rebuild outward',
						body: 'Once a word is green, reason about the phrases that contain it. Phrases are memorised units, so the rest usually follows.'
					}
				]
			},
			'Phrase-shape mistakes worth unlearning': {
				type: 'table',
				title: 'What the shape constrains',
				headers: ['Constraint', 'Why it matters'],
				rows: [
					{ label: 'Word count', value: 'A shape mismatch is not a weaker guess, it is not a guess.', highlight: true },
					{ label: 'Letters per word', value: 'Rejects most phrases that share the same words.' },
					{ label: 'Word order', value: 'The sequence is fixed, so the phrase is the target, not the words.' }
				]
			}
		}
	},

	/* ══ 12. canuckle-answer-today ════════════════════════════════════════════ */
	'canuckle-answer-today': {
		keyTakeaways: [
			'Canuckle answers are <strong>Canadian in content</strong>, so place names, provincial words and national vocabulary are legitimate candidates.',
			'The daily fact is a clue, not decoration: it tells you which corner of Canadian vocabulary the answer was drawn from.',
			'US-first openers underperform here. Build an opener from letters that appear in Canadian spelling and place names.',
			'The page carries the letter hints and the recent answers, so a failing board can be checked before the streak ends.'
		],
		visuals: {
			'Why the Canadian pool changes the guess list': {
				type: 'table',
				title: 'What the Canadian pool favours',
				headers: ['Category', 'Examples of the kind of word'],
				rows: [
					{ label: 'Places', value: 'Provinces, cities and landmarks.', highlight: true },
					{ label: 'Spelling variants', value: 'The -our and -re forms that mark Canadian English.' },
					{ label: 'Culture', value: 'Hockey, wildlife, food and national symbols.' },
					{ label: 'Everyday nouns', value: 'Ordinary five-letter words with Canadian slant.' }
				]
			},
			'The opener that works best': {
				type: 'steps',
				title: 'Building a Canuckle opener',
				steps: [
					{
						title: 'Weight the Canadian letters',
						body: 'Pick letters that recur in place names and Canadian spelling. They test the pool the answer actually comes from.'
					},
					{
						title: 'Read the fact against your board',
						body: 'A fact about geography or hockey narrows the topic before you spend a guess on a word from the wrong corner.'
					},
					{
						title: 'Treat the double letter as likely',
						body: 'Canadian vocabulary contains plenty of doubled letters. Do not discard a doubled candidate just because it repeats.'
					}
				]
			}
		}
	},

	/* ══ 13. worldle-answer-today ═════════════════════════════════════════════ */
	'worldle-answer-today': {
		keyTakeaways: [
			'Read the <strong>silhouette</strong> before guessing. Coastline shape, island count and borders rule out most of the map on their own.',
			'The distance reading is a compass as much as a measurement: the direction matters more than the number.',
			'The bands are the useful unit — under 500 km means a neighbour, over 5,000 km means another continent.',
			'A narrow country is a stronger clue than a large one, because its borders constrain where the answer can be.'
		],
		visuals: {
			'The distance arrow is a compass, not a suggestion': {
				type: 'table',
				title: 'Reading Worldle distance bands',
				headers: ['Distance', 'What it means'],
				rows: [
					{ label: 'Under 500 km', value: 'A neighbour, or across a small sea.', highlight: true },
					{ label: '500–2,000 km', value: 'Same region, one or two borders away.' },
					{ label: '2,000–5,000 km', value: 'Same continent, different region.' },
					{ label: 'Over 5,000 km', value: 'Another continent. Change your whole shortlist.' }
				]
			},
			'The silhouette is the whole game, and most players skip it': {
				type: 'steps',
				title: 'Reading a silhouette before guessing',
				steps: [
					{
						title: 'Classify the shape',
						body: 'Is it an island, a long north-south strip, or a compact inland block? That single judgement removes most continents.'
					},
					{
						title: 'Count the boundaries',
						body: 'A silhouette with no visible land border has to be an island or a peninsula. That is a stronger filter than any famous name.'
					},
					{
						title: 'Use the arrow to finish',
						body: 'Once the region is right, the direction points at the country and the distance band tells you how many neighbours to test.'
					}
				]
			}
		}
	},

	/* ══ 14. betweenle-answer-today ═══════════════════════════════════════════ */
	'betweenle-answer-today': {
		keyTakeaways: [
			'Betweenle hands you <strong>two boundary words</strong> and nothing else. The answer is the word that sorts alphabetically between them.',
			'The first shared letter is the strongest single clue: both boundaries and the answer agree up to that point.',
			'Move in alphabetical steps rather than jumping to a favourite word. Every guess you make is itself a new boundary.',
			'When the gap closes to a few letters, the answer is usually determined — do not spend a guess on a word the boundaries already exclude.'
		],
		visuals: {
			'The midpoint method in plain terms': {
				type: 'steps',
				title: 'Narrowing an alphabetical gap',
				steps: [
					{
						title: 'Compare the boundaries letter by letter',
						body: 'Everything the two words share at the start is a constraint the answer must satisfy too.'
					},
					{
						title: 'Guess something in the middle of the gap',
						body: 'A word roughly halfway through the alphabet range halves the search no matter which side of it the answer lands.'
					},
					{
						title: 'Let your own guess become a boundary',
						body: 'Each guess replaces one side of the range. Two or three steps of halving close a gap faster than circling candidate words.'
					}
				]
			},
			'What the two boundary words tell you': {
				type: 'table',
				title: 'Mining the boundary pair',
				headers: ['Feature', 'What it constrains'],
				rows: [
					{ label: 'Shared prefix', value: 'Letters the answer must start with.', highlight: true },
					{ label: 'First differing letter', value: 'The answer sits between those two letters.' },
					{ label: 'Length', value: 'Published as five letters, so length alone rules out nothing.' },
					{ label: 'Vowel order', value: 'Whether the answer is earlier or later than each boundary.' }
				]
			}
		}
	},

	/* ══ 15. colorfle-answer-today ════════════════════════════════════════════ */
	'colorfle-answer-today': {
		keyTakeaways: [
			'The daily puzzle blends <strong>three unique colours</strong>, so any guess containing a repeat is a structural mistake before it is a wrong answer.',
			'Slot hints are per colour, not per guess: a yellow colour is in the recipe in a different proportion, not in the wrong place.',
			'Proportions decide more boards than colour choice. Two correct colours at the wrong percentages still lose.',
			'A guess that changes both the palette and the proportions teaches you nothing about which of the two was wrong.'
		],
		visuals: {
			'Three colors, six tries, one recipe': {
				type: 'table',
				title: 'What a Colorfle board fixes',
				headers: ['Rule', 'Consequence'],
				rows: [
					{ label: 'Three colours', value: 'A repeat in your guess can never be correct.', highlight: true },
					{ label: 'Unique blend', value: 'The same recipe for every player, so boards are comparable.' },
					{ label: 'Share per colour', value: 'Each guess sets a percentage, not just a palette.' },
					{ label: 'Six tries', value: 'Palette first, proportions second, refinement last.' }
				]
			},
			'Green, yellow, and blank: reading the slot hints': {
				type: 'steps',
				title: 'Reading Colorfle slot feedback',
				steps: [
					{
						title: 'Green means the colour and its share are right',
						body: 'Lock that colour in and change nothing about it on the next guess.'
					},
					{
						title: 'Yellow means the colour belongs, the share does not',
						body: 'Keep the colour and move its percentage in the direction the score improved on.'
					},
					{
						title: 'Blank means the colour is not in the recipe',
						body: 'Replace it rather than adjusting it. A share tweak on a colour that is absent is a wasted guess.'
					}
				]
			}
		}
	},

	/* ══ 16. countryle-answer-today ═══════════════════════════════════════════ */
	'countryle-answer-today': {
		keyTakeaways: [
			'Countryle returns a bundle of properties per guess — continent, hemisphere, direction, distance and the like — and the property you ignore is usually the one that was decisive.',
			'Distance plus an arrow beats distance alone: the arrow turns a measurement into a direction to travel in.',
			'Open with countries that divide the map cleanly, then let border logic close the last stretch.',
			'Islands and small states follow the same rules; their readings are narrower, not different, and they eliminate more per guess.'
		],
		visuals: {
			'Distance plus an arrow beats either one alone': {
				type: 'steps',
				title: 'Turning Countryle clues into a location',
				steps: [
					{
						title: 'Use the property that splits the map hardest',
						body: 'Sort the feedback by how much of the world it removes. Continent and hemisphere outrank temperature or population.'
					},
					{
						title: 'Walk along the arrow',
						body: 'Combine the direction with the distance band to pick a country further along the line, not simply a closer one.'
					},
					{
						title: 'Finish on borders',
						body: 'When two candidates are close, the answer shares a border with one of them. Test neighbours before testing names.'
					}
				]
			},
			'Border logic closes the last thousand kilometers': {
				type: 'table',
				title: 'Clue classes, ranked by how much they remove',
				headers: ['Clue', 'How to use it'],
				rows: [
					{ label: 'Continent', value: 'Removes all but one sixth of the map.', highlight: true },
					{ label: 'Direction arrow', value: 'Turns the remaining map into a line.' },
					{ label: 'Distance', value: 'Tells you how far along that line to look.' },
					{ label: 'Borders', value: 'Determines which of the final candidates is right.' }
				]
			}
		}
	},

	/* ══ 17. framed-answer-today ═════════════════════════════════════════════ */
	'framed-answer-today': {
		keyTakeaways: [
			'Each frame is a <strong>deliberate removal of information</strong>. Reading what a frame chooses to show is faster than naming a film from a feeling.',
			'Costume, palette, aspect ratio and camera format all date a film before any actor is recognisable.',
			'Sequels and franchises burn guesses: a frame that looks like a franchise entry often belongs to a different one, or to the earlier film.',
			'Wide shots identify a director faster than close-ups do, because framing and blocking are the parts of a style that survive a crop.'
		],
		visuals: {
			'Read the frame before naming the film': {
				type: 'steps',
				title: 'Reading a frame in the order that pays',
				steps: [
					{
						title: 'Date it before you name it',
						body: 'Stock, grain, aspect ratio and colour grade narrow the decade. A decade is a shortlist; a genre is not.'
					},
					{
						title: 'Identify the production, not the star',
						body: 'Lighting style and set design point at a studio or a cinematographer, which is a much smaller set than "films with this actor".'
					},
					{
						title: 'Spend the later frames confirming',
						body: 'Once one candidate is leading, use the next two frames to rule it out rather than to raise a second name you cannot test.'
					}
				]
			},
			'What six frames actually hand you': {
				type: 'table',
				title: 'What each frame class usually reveals',
				headers: ['Frame', 'Most useful signal'],
				rows: [
					{ label: 'First frame', value: 'Colour grade, aspect ratio and period.', highlight: true },
					{ label: 'Middle frames', value: 'Setting and production design.' },
					{ label: 'Late frames', value: 'Faces, costumes and confirmed franchise markers.' }
				]
			}
		}
	},

	/* ══ 18. searchle-answer-today ════════════════════════════════════════════ */
	'searchle-answer-today': {
		keyTakeaways: [
			'Searchle prompts are the <strong>top suggestion</strong> for a search fragment, so the answer is the most common continuation, not the cleverest one.',
			'Think like a typist: what would most people be about to type, rather than what would a quiz setter choose?',
			'Prompt shapes repeat. A prompt that reads like a question wants a question-shaped completion; a bare phrase wants the most frequent next words.',
			'When a board stalls, the completions you have ruled out describe the prompt genre well enough to guess the intended one.'
		],
		visuals: {
			'Think like a typist, not a quizzer': {
				type: 'steps',
				title: 'Approaching a Searchle prompt',
				steps: [
					{
						title: 'Read the prompt as a fragment',
						body: 'Decide what kind of text is likely to follow it: a question, a list, a name, or a common phrase.'
					},
					{
						title: 'Play the most ordinary completion',
						body: 'The answer is the most popular continuation. Boring and common beats specific and clever.'
					},
					{
						title: 'Use rejections as a genre clue',
						body: 'Completions that are ruled out tell you which genre the prompt does not belong to, which is half the narrowing.'
					}
				]
			},
			'Prompt shapes and what they want': {
				type: 'table',
				title: 'Prompt shapes and their completions',
				headers: ['Prompt shape', 'Likely completion'],
				rows: [
					{ label: 'Question stem', value: 'A question-shaped continuation.', highlight: true },
					{ label: 'Bare phrase', value: 'The most frequently typed next words.' },
					{ label: 'Name fragment', value: 'A person or place that completes it.' },
					{ label: 'Instruction', value: 'A verb-led continuation people commonly type.' }
				]
			}
		}
	},

	/* ══ 19. worgle-answer-today ══════════════════════════════════════════════ */
	'worgle-answer-today': {
		keyTakeaways: [
			'The answers are <strong>Welsh five-letter words</strong>, so Welsh letter frequency beats English instinct.',
			'W and Y are vowels in Welsh. Treating them as consonants produces openers that waste a slot.',
			'English spelling habits misfire here: a word that looks like a misspelling is often the correct Welsh form.',
			'The page lists the letter hints and the recent words, which is the fastest way to check an opening guess before it costs a life.'
		],
		visuals: {
			'Welsh tiles play by Welsh rules': {
				type: 'table',
				title: 'Welsh rules that change the guess list',
				headers: ['Rule', 'Consequence'],
				rows: [
					{ label: 'W and Y are vowels', value: 'Both belong in the vowel slots of an opener.', highlight: true },
					{ label: 'Letter frequency differs', value: 'Welsh-heavy letters outrank English favourites.' },
					{ label: 'Spelling is not English', value: 'A form that looks irregular in English can be regular Welsh.' },
					{ label: 'Six guesses', value: 'Same budget as Wordle, a different alphabet to spend it on.' }
				]
			},
			'Openers that fit the language': {
				type: 'steps',
				title: 'Choosing a Welsh opener',
				steps: [
					{
						title: 'Include at least one of W and Y',
						body: 'They carry vowel work in Welsh, so leaving both out of guess one under-tests the word.'
					},
					{
						title: 'Do not dismiss an unusual-looking word',
						body: 'Welsh orthography is not English orthography. A candidate that looks wrong to an English eye may be perfectly regular.'
					},
					{
						title: 'Read the hints before the third guess',
						body: 'The letter hints on this page narrow the alphabet faster than another blind guess does.'
					}
				]
			}
		}
	}
};

/**
 * Merge an entry's extras into its article content.
 *
 * Throws when a figure is keyed to a heading the article does not have: a silent
 * drop would ship a page missing a figure, and a build failure is a much cheaper
 * way to find out.
 */
export function withAnswerExtras(
	content: StaticArticleContent,
	extras?: AnswerExtras
): StaticArticleContent {
	if (!extras) return content;

	const { keyTakeaways, visuals } = extras;
	const sections = content.sections.map((section) => {
		const visual = visuals?.[section.heading];
		return visual ? { ...section, visual } : section;
	});

	if (visuals) {
		for (const heading of Object.keys(visuals)) {
			if (!content.sections.some((section) => section.heading === heading)) {
				throw new Error(
					`answer-deep-dives: "${content.key}" has no section titled "${heading}". ` +
						'Figures are keyed by the raw heading text — update the key when a heading is reworded.'
				);
			}
		}
	}

	return {
		...content,
		...(keyTakeaways?.length ? { keyTakeaways } : {}),
		sections
	};
}
