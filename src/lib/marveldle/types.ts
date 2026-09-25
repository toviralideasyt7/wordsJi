// src/lib/marveldle/types.ts
// Shared character/tiles types for the Marveldle solver and answer pages.
// Ported from sujitbhai7710/marveldle-answers src/lib/solver-types.ts
// (read-only pull). The exact game color codes were extracted there from
// Marveldle's own client bundle and are preserved below.

export interface CharacterData {
	id: string;
	name: string;
	gender: string;
	type: string;
	species: string[];
	powerTypes: string[];
	origin: string;
	keywords: string[];
	apparitionYear?: number;
	firstApparitionComicTitle?: string;
	actorName?: string;
	appearanceTypes?: string[];
	affiliations?: string[];
}

export interface MarveldleDayEntry {
	date: string;
	dateId: string;
	comics: CharacterData | null;
	mcu: CharacterData | null;
	solvedAt: string;
}

export type MarveldleMode = 'comics' | 'mcu';

// Upstream calls the MCU mode "audiovisual"; we call it "mcu" in routes/props.
export const UPSTREAM_MODE: Record<MarveldleMode, 'comics' | 'audiovisual'> = {
	comics: 'comics',
	mcu: 'audiovisual'
};

export type TileColor = 'none' | 'exact' | 'partial' | 'upper' | 'lower';

export interface TileState {
	key: string;
	label: string;
	value: string | number | string[];
	color: TileColor;
	isArray?: boolean;
	isNumeric?: boolean;
}

export interface GuessEntry {
	character: CharacterData;
	tiles: TileState[];
}

export function getComicsTiles(c: CharacterData): TileState[] {
	return [
		{ key: 'gender', label: 'Gender', value: c.gender, color: 'none' },
		{ key: 'type', label: 'Type', value: c.type, color: 'none' },
		{ key: 'species', label: 'Species', value: c.species || [], color: 'none', isArray: true },
		{ key: 'powerTypes', label: 'Powers', value: c.powerTypes || [], color: 'none', isArray: true },
		{ key: 'origin', label: 'Origin', value: c.origin, color: 'none' },
		{ key: 'apparitionYear', label: 'Year', value: c.apparitionYear || 0, color: 'none', isNumeric: true }
	];
}

export function getMCUTiles(c: CharacterData): TileState[] {
	return [
		{ key: 'gender', label: 'Gender', value: c.gender, color: 'none' },
		{ key: 'type', label: 'Type', value: c.type, color: 'none' },
		{ key: 'species', label: 'Species', value: c.species || [], color: 'none', isArray: true },
		{ key: 'powerTypes', label: 'Powers', value: c.powerTypes || [], color: 'none', isArray: true },
		{ key: 'origin', label: 'Origin', value: c.origin, color: 'none' },
		{ key: 'appearanceTypes', label: 'Appearances', value: c.appearanceTypes || [], color: 'none', isArray: true },
		{ key: 'affiliations', label: 'Teams', value: c.affiliations || [], color: 'none', isArray: true }
	];
}

/**
 * EXACT Marveldle color codes (from the game's own client bundle).
 *
 * .exact  -> green (#008000)
 * .partial-> dark orange (#FF8C00)
 * .none   -> brown (#A52A2A)
 * .upper  -> purple (#800080) + up arrow (Comics Year only)
 * .lower  -> bright blue (#4E5AFF) + down arrow (Comics Year only)
 *
 * All tiles use white text, a 1px white border, and an inset box-shadow.
 */
export const TILE_COLORS: {
	value: TileColor;
	bgHex: string;
	label: string;
	symbol: string;
	description: string;
}[] = [
	{ value: 'none', bgHex: '#A52A2A', label: 'None', symbol: '✕', description: 'No match at all' },
	{ value: 'exact', bgHex: '#008000', label: 'Exact', symbol: '✓', description: 'Exact match' },
	{ value: 'partial', bgHex: '#FF8C00', label: 'Partial', symbol: '◐', description: 'Some items match, but not all' },
	{ value: 'upper', bgHex: '#800080', label: 'Higher', symbol: '↑', description: 'Answer year is higher (Comics only)' },
	{ value: 'lower', bgHex: '#4E5AFF', label: 'Lower', symbol: '↓', description: 'Answer year is lower (Comics only)' }
];

/** Get color hex for a given TileColor */
export function getColorHex(color: TileColor): string {
	const found = TILE_COLORS.find((c) => c.value === color);
	return found ? found.bgHex : '#A52A2A';
}

export function cycleTileColor(tile: TileState): TileColor {
	if (tile.isNumeric) {
		const order: TileColor[] = ['none', 'exact', 'upper', 'lower'];
		const idx = order.indexOf(tile.color);
		return order[(idx + 1) % order.length];
	}
	const order: TileColor[] = ['none', 'exact', 'partial'];
	const idx = order.indexOf(tile.color);
	return order[(idx + 1) % order.length];
}

/**
 * Lazy-load the character database for a mode. The full DBs (458 comics +
 * 338 MCU entries) are split out of the initial page bundle and fetched
 * only when the solver mounts.
 */
export async function loadCharacters(mode: MarveldleMode): Promise<CharacterData[]> {
	const module =
		mode === 'comics'
			? await import('$lib/data/marveldle-comics.json')
			: await import('$lib/data/marveldle-mcu.json');
	return (module.default ?? module) as CharacterData[];
}

export function formatTileValue(tile: TileState): string {
	if (Array.isArray(tile.value)) return tile.value.join(', ') || '—';
	if (tile.value === 0 || tile.value === '') return '—';
	return String(tile.value);
}
