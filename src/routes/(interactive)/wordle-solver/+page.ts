import { getWordleLengthPageConfig } from '$lib/wordlebot-wasm/route-config';

export function load() {
	return {
		config: getWordleLengthPageConfig(5)
	};
}
