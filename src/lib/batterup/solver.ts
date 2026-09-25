// src/lib/batterup/solver.ts
// Batter Up (batter-up.app) engine: attribute comparison, candidate filtering
// and the hybrid entropy+minimax solver.
// Ported from sujitbhai7710/batter-up-helper src/app/page.tsx (read-only pull).
// All functions are framework-free TypeScript; UI lives in the solver route.
//
// Game rules (batter mode only):
//   6 columns per guess: Jersey #, Team, Division, Born (country), Age, Position.
//   - Jersey: green = exact number, yellow = same tens digit, white = otherwise
//   - Team: green = exact, NEVER yellow
//   - Division: green = exact division, yellow = same league (AL/NL), white = otherwise
//   - Born: green = exact country, NEVER yellow
//   - Age: green = exact, yellow = within 2 years, white = otherwise
//   - Position: green = exact, yellow = same category (INF: 1B/2B/3B/SS, OF: LF/CF/RF),
//     white = otherwise. DH/SP/RP are in no category — only exact matches score.

export interface Player {
	player_name: string;
	player_id: string;
	team_name: string;
	born: string;
	birth_date: string;
	position: string[];
	debut: number;
	jersey_number: number | null;
}

export interface BatterUpDayEntry {
	date: string;
	gameNumber: number;
	player: Player;
	videoDescription: string | null;
	rawVideo: string | null;
	sourceDate: string;
	fetchedAt: string;
}

export type Color = 'green' | 'yellow' | 'white';

// 6 columns matching the real game: #, Team, Div, Born, Age, Pos
export interface GuessResult {
	jersey: Color;
	team: Color;
	div: Color;
	born: Color;
	age: Color;
	pos: Color;
}

export interface GuessEntry {
	guess: Player;
	result: GuessResult;
}

// ============================
// Division Mapping (SHORT team names from the CDN)
// ============================

export const TEAM_DIVISION_MAP: Record<string, string> = {
	// AL East
	Orioles: 'AL East',
	'Red Sox': 'AL East',
	Yankees: 'AL East',
	Rays: 'AL East',
	'Blue Jays': 'AL East',
	// AL Central
	'White Sox': 'AL Central',
	Guardians: 'AL Central',
	Tigers: 'AL Central',
	Royals: 'AL Central',
	Twins: 'AL Central',
	// AL West
	Astros: 'AL West',
	Angels: 'AL West',
	Athletics: 'AL West',
	Mariners: 'AL West',
	Rangers: 'AL West',
	// NL East
	Braves: 'NL East',
	Marlins: 'NL East',
	Mets: 'NL East',
	Phillies: 'NL East',
	Nationals: 'NL East',
	// NL Central
	Cubs: 'NL Central',
	Reds: 'NL Central',
	Brewers: 'NL Central',
	Pirates: 'NL Central',
	Cardinals: 'NL Central',
	// NL West
	DBacks: 'NL West',
	Diamondbacks: 'NL West',
	Rockies: 'NL West',
	Dodgers: 'NL West',
	Padres: 'NL West',
	Giants: 'NL West'
};

export function getTeamDivision(teamName: string): string {
	if (TEAM_DIVISION_MAP[teamName]) return TEAM_DIVISION_MAP[teamName];
	// Fallback: try to match partial names
	for (const [key, div] of Object.entries(TEAM_DIVISION_MAP)) {
		if (teamName.includes(key) || key.includes(teamName)) return div;
	}
	return 'Unknown';
}

export function getLeague(div: string): string {
	return div.slice(0, 2); // "AL" or "NL"
}

// ============================
// Age Calculation (exact match to game)
// ============================

export function calculateAge(birthDate: string): number {
	const birth = new Date(birthDate);
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();
	const dayDiff = today.getDate() - birth.getDate();
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
	return age;
}

export function getTensDigit(n: number | null): number {
	if (n === null) return -1;
	return Math.floor((n / 10) % 10);
}

// ============================
// Position Categories (matching real game)
// ============================

export const INFIELD = ['1B', '2B', '3B', 'SS'];
export const OUTFIELD = ['LF', 'CF', 'RF'];
// DH, SP, RP are NOT in any category - they only match green (exact) or white
export const isINF = (p: string) => INFIELD.includes(p);
export const isOF = (p: string) => OUTFIELD.includes(p);

// Filter out pitchers from the solver pool (matching real game's batter-only pool)
export function isEligibleForPool(p: Player): boolean {
	return p.position[0] !== 'SP' && p.position[0] !== 'RP';
}

// ============================
// EXACT Color Comparison (6 columns - matching real game source)
// ============================

export function compareGuess(guess: Player, answer: Player): GuessResult {
	// 1. Jersey #: green=exact, yellow=same tens digit, white=otherwise
	let jersey: Color = 'white';
	if (guess.jersey_number === null && answer.jersey_number === null) {
		jersey = 'green';
	} else if (guess.jersey_number !== null && answer.jersey_number !== null) {
		if (guess.jersey_number === answer.jersey_number) {
			jersey = 'green';
		} else if (getTensDigit(guess.jersey_number) === getTensDigit(answer.jersey_number)) {
			jersey = 'yellow';
		}
	}

	// 2. Team: green=exact, NEVER yellow in batterup mode
	const team: Color = guess.team_name === answer.team_name ? 'green' : 'white';

	// 3. Division: green=exact division, yellow=same league (AL/NL), white=otherwise
	const guessDiv = getTeamDivision(guess.team_name);
	const answerDiv = getTeamDivision(answer.team_name);
	let div: Color = 'white';
	if (guessDiv === answerDiv) {
		div = 'green';
	} else if (getLeague(guessDiv) === getLeague(answerDiv)) {
		div = 'yellow';
	}

	// 4. Born: green=exact, NEVER yellow in batterup mode
	const born: Color = guess.born === answer.born ? 'green' : 'white';

	// 5. Age: green=exact, yellow=within 2 years, white=otherwise
	const guessAge = calculateAge(guess.birth_date);
	const answerAge = calculateAge(answer.birth_date);
	let age: Color = 'white';
	if (guessAge === answerAge) {
		age = 'green';
	} else if (Math.abs(guessAge - answerAge) <= 2) {
		age = 'yellow';
	}

	// 6. Position: green=exact, yellow=same category (INF or OF), white=otherwise
	//    DH, SP, RP are NOT in any category - only exact match gives green
	const gPos = guess.position[0];
	const aPos = answer.position[0];
	let pos: Color = 'white';
	if (gPos === aPos) {
		pos = 'green';
	} else if ((isINF(gPos) && isINF(aPos)) || (isOF(gPos) && isOF(aPos))) {
		pos = 'yellow';
	}

	return { jersey, team, div, born, age, pos };
}

// ============================
// Filter Function (correct for each column - ALL colors filter!)
// ============================

export function filterPlayers(
	remaining: Player[],
	guessPlayer: Player,
	result: GuessResult
): Player[] {
	const guessTensDigit = getTensDigit(guessPlayer.jersey_number);
	const guessDiv = getTeamDivision(guessPlayer.team_name);
	const guessLeague = getLeague(guessDiv);
	const guessAge = calculateAge(guessPlayer.birth_date);
	const guessPos = guessPlayer.position[0];

	return remaining.filter((p) => {
		if (p.player_id === guessPlayer.player_id) return false;

		// Jersey # (green=exact, yellow=same tens digit, white=DIFFERENT tens digit)
		if (result.jersey === 'green') {
			if (p.jersey_number !== guessPlayer.jersey_number) return false;
		} else if (result.jersey === 'yellow') {
			// Same tens digit (but not exact - already excluded above)
			if (getTensDigit(p.jersey_number) !== guessTensDigit) return false;
		} else {
			// White: tens digit MUST be different
			if (getTensDigit(p.jersey_number) === guessTensDigit) return false;
		}

		// Team (green=exact, white=different team, never yellow)
		if (result.team === 'green') {
			if (p.team_name !== guessPlayer.team_name) return false;
		} else {
			// White: NOT on the same team
			if (p.team_name === guessPlayer.team_name) return false;
		}

		// Division (green=exact div, yellow=same league different div, white=different league)
		if (result.div === 'green') {
			if (getTeamDivision(p.team_name) !== guessDiv) return false;
		} else if (result.div === 'yellow') {
			// Same league but DIFFERENT division
			const pLeague = getLeague(getTeamDivision(p.team_name));
			if (pLeague !== guessLeague) return false;
			if (getTeamDivision(p.team_name) === guessDiv) return false;
		} else {
			// White: entirely different league
			if (getLeague(getTeamDivision(p.team_name)) === guessLeague) return false;
		}

		// Born (green=exact, white=different country, never yellow)
		if (result.born === 'green') {
			if (p.born !== guessPlayer.born) return false;
		} else {
			// White: different birth country
			if (p.born === guessPlayer.born) return false;
		}

		// Age (green=exact, yellow=within 2, white=outside 2)
		const pAge = calculateAge(p.birth_date);
		if (result.age === 'green') {
			if (pAge !== guessAge) return false;
		} else if (result.age === 'yellow') {
			if (Math.abs(pAge - guessAge) > 2) return false;
		} else {
			// White: age is NOT within 2 years (and not exact)
			if (Math.abs(pAge - guessAge) <= 2) return false;
		}

		// Position (green=exact, yellow=same category different pos, white=diff category AND diff pos)
		if (result.pos === 'green') {
			if (p.position[0] !== guessPos) return false;
		} else if (result.pos === 'yellow') {
			// Same category (INF or OF) but different specific position
			const sameCat =
				(isINF(guessPos) && isINF(p.position[0])) || (isOF(guessPos) && isOF(p.position[0]));
			if (!sameCat) return false;
			if (p.position[0] === guessPos) return false; // exact would be green
		} else {
			// White: NOT same position AND NOT same category
			if (p.position[0] === guessPos) return false; // exact would be green
			const sameCat =
				(isINF(guessPos) && isINF(p.position[0])) || (isOF(guessPos) && isOF(p.position[0]));
			if (sameCat) return false;
		}

		return true;
	});
}

// ============================
// Hybrid Entropy + Minimax Solver
// ============================

export function resultKey(r: GuessResult): string {
	return `${r.jersey}-${r.team}-${r.div}-${r.born}-${r.age}-${r.pos}`;
}

export interface GuessScore {
	player: Player;
	entropy: number;
	worstCase: number;
	score: number;
}

export function scoreGuess(guessPlayer: Player, possibleAnswers: Player[]): GuessScore {
	if (possibleAnswers.length <= 1) {
		return { player: guessPlayer, entropy: 0, worstCase: 0, score: 0 };
	}

	const patterns = new Map<string, number>();
	for (const answer of possibleAnswers) {
		if (answer.player_id === guessPlayer.player_id) continue;
		const result = compareGuess(guessPlayer, answer);
		const key = resultKey(result);
		patterns.set(key, (patterns.get(key) || 0) + 1);
	}

	const total = possibleAnswers.length - 1;
	if (total <= 0) return { player: guessPlayer, entropy: 0, worstCase: 0, score: 0 };

	let entropy = 0;
	let worstCase = 0;
	for (const count of patterns.values()) {
		if (count > 0) {
			const p = count / total;
			entropy -= p * Math.log2(p);
			if (count > worstCase) worstCase = count;
		}
	}

	// Hybrid score: 65% normalized entropy + 35% minimax worst-case + 5% candidate bonus
	// Entropy normalized by max possible (log2 of number of distinct patterns)
	const maxEntropy = Math.log2(Math.max(patterns.size, 2));
	const entropyNorm = maxEntropy > 0 ? entropy / maxEntropy : 0;

	// Minimax: inverse of worst-case bucket ratio (higher = better)
	const worstNorm = 1.0 - worstCase / total;

	// Primary: prefer candidates (answers in the pool) to close out games faster
	const isCandidate = possibleAnswers.some((a) => a.player_id === guessPlayer.player_id);
	const candidateBonus = isCandidate ? 0.05 : 0;

	const score = 0.65 * entropyNorm + 0.35 * worstNorm + candidateBonus;

	return { player: guessPlayer, entropy, worstCase, score };
}

export function getBestGuesses(
	remaining: Player[],
	allPlayers: Player[],
	limit: number = 10
): GuessScore[] {
	if (remaining.length === 0) return [];
	if (remaining.length === 1) return [{ player: remaining[0], entropy: 0, worstCase: 0, score: 0 }];

	// Search ALL eligible players (not just remaining) for probe guesses
	// This is the MIT/WordleBot approach: non-candidate guesses often provide more info
	let searchPool: Player[];
	if (remaining.length <= 10) {
		// Small pool: only search remaining candidates (they can close out the game)
		searchPool = remaining;
	} else {
		// Larger pool: search all eligible players for maximum info gain
		searchPool = allPlayers;
	}

	// For very large pools, sample to avoid UI freeze in interactive mode
	if (searchPool.length > 300) {
		// Prioritize remaining candidates + sample from rest
		const remainingSet = new Set(remaining.map((p) => p.player_id));
		const fromRemaining = searchPool.filter((p) => remainingSet.has(p.player_id));
		const others = searchPool.filter((p) => !remainingSet.has(p.player_id));
		// Shuffle and take top portion
		const shuffled = [...others].sort(() => Math.random() - 0.5);
		searchPool = [...fromRemaining, ...shuffled.slice(0, 200)];
	}

	const scored = searchPool.map((guess) => scoreGuess(guess, remaining));

	// Sort by score (higher = better), tiebreak by worstCase (lower = better)
	scored.sort((a, b) => b.score - a.score || a.worstCase - b.worstCase);

	return scored.slice(0, limit);
}

// ============================
// Backtest Engine (used to sanity-check the solver against real games)
// ============================

export function runBacktestForGame(
	answer: Player,
	allEligible: Player[]
): { guessesNeeded: number; poolSizes: number[]; success: boolean } {
	let remaining = allEligible.filter((p) => p.player_id !== answer.player_id);
	const poolSizes: number[] = [remaining.length + 1];
	const maxGuesses = 6; // Hard cap

	for (let i = 0; i < maxGuesses; i++) {
		if (remaining.length === 0) {
			return { guessesNeeded: i, poolSizes, success: true };
		}

		// Use the improved solver: search all eligible for best guess
		const best = getBestGuesses(remaining, allEligible, 5);
		if (best.length === 0) break;

		const guessPlayer = best[0].player;

		// Compute colors against the actual answer
		const result = compareGuess(guessPlayer, answer);

		// Filter using the fixed filterPlayers function (includes ALL color filters)
		remaining = filterPlayers(remaining, guessPlayer, result);

		poolSizes.push(remaining.length + 1);

		if (remaining.length <= 1) {
			return { guessesNeeded: i + 1, poolSizes, success: true };
		}
	}

	return { guessesNeeded: maxGuesses, poolSizes, success: remaining.length <= 1 };
}
