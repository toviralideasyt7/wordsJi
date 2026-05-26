import { colornames } from 'color-name-list';
import DeltaE from 'delta-e';
import targetColorNames from './data/colordle-targets.json';
import { colordleColorOverrides } from './data/colordle-color-overrides.js';

export interface ColorData {
    name: string;
    hex: string;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

let targetColorsCache: ColorData[] | null = null;
let colorLookupCache: Map<string, ColorData> | null = null;
let allColorsCache: ColorData[] | null = null;

const normalizeColorName = (name: string): string => {
    return name.toLowerCase().replace(/ /g, "");
};

const getAugmentedColors = (): ColorData[] => {
    if (allColorsCache) {
        return allColorsCache;
    }

    const colors: ColorData[] = [];
    const seen = new Set<string>();

    const appendColor = (color: ColorData) => {
        const normalized = normalizeColorName(color.name);
        if (seen.has(normalized)) {
            return;
        }

        seen.add(normalized);
        colors.push(color);
    };

    for (const color of colornames) {
        appendColor(color);
    }

    for (const color of Object.values(colordleColorOverrides) as ColorData[]) {
        appendColor(color);
    }

    allColorsCache = colors;
    return allColorsCache;
};

export const getAllColors = (): ColorData[] => {
    return getAugmentedColors();
};

const getColorLookup = (): Map<string, ColorData> => {
    if (colorLookupCache) {
        return colorLookupCache;
    }

    const colorMap = new Map<string, ColorData>();

    for (const c of getAugmentedColors()) {
        const normalized = normalizeColorName(c.name);
        if (!colorMap.has(normalized)) {
            colorMap.set(normalized, c);
        }
    }

    colorLookupCache = colorMap;
    return colorLookupCache;
};

export const getBundledTargetColorNames = (): string[] => {
    return targetColorNames.colors;
};

export const resolveTargetColors = (targetNames: string[]): ColorData[] => {
    const colorMap = getColorLookup();
    const orderedTargets: ColorData[] = [];

    for (const name of targetNames) {
        const normalizedName = normalizeColorName(name);
        const match = colorMap.get(normalizedName);

        if (match) {
            orderedTargets.push(match);
        } else {
            console.warn(`Colordle Target Missing in Library: ${name}`);
            orderedTargets.push({
                name: name,
                hex: '#000000'
            });
        }
    }

    return orderedTargets;
};

export const getTargetColors = (): ColorData[] => {
    if (targetColorsCache) {
        return targetColorsCache;
    }

    targetColorsCache = resolveTargetColors(targetColorNames.colors);
    return targetColorsCache;
};

export const getUniqueTargetColors = (): ColorData[] => {
    const targets = getTargetColors();
    const seen = new Set<string>();
    const unique: ColorData[] = [];

    for (const t of targets) {
        const key = normalizeColorName(t.name);
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(t);
        }
    }

    return unique;
};

export const hexToRgb = (hex: string): RGB | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
};

function srgbToLinear(channel: number): number {
    const normalized = channel / 255;
    return normalized <= 0.04045
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

function rgbToLab(color: RGB): [number, number, number] {
    const red = srgbToLinear(color.r);
    const green = srgbToLinear(color.g);
    const blue = srgbToLinear(color.b);

    const x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) * 100;
    const y = (red * 0.2126 + green * 0.7152 + blue * 0.0722) * 100;
    const z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) * 100;

    const refX = 95.047;
    const refY = 100;
    const refZ = 108.883;
    const epsilon = 216 / 24389;
    const kappa = 24389 / 27;

    const transform = (value: number): number => {
        const normalized = value;
        return normalized > epsilon
            ? Math.cbrt(normalized)
            : (kappa * normalized + 16) / 116;
    };

    const fx = transform(x / refX);
    const fy = transform(y / refY);
    const fz = transform(z / refZ);

    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export const colorDiff = (c1: RGB, c2: RGB): number => {
    try {
        const color1 = rgbToLab(c1);
        const color2 = rgbToLab(c2);
        const color1LAB = { L: color1[0], A: color1[1], B: color1[2] };
        const color2LAB = { L: color2[0], A: color2[1], B: color2[2] };

        const dE = DeltaE.getDeltaE00(color1LAB, color2LAB);
        // The game score is 100 - DeltaE
        return Math.max(0, 100 - dE);
    } catch (e) {
        console.error('Error calculating color difference:', e);
        return 0;
    }
};

export const findBestCandidates = (
    candidates: ColorData[],
    guesses: { guess: ColorData; percent: number }[]
): ColorData[] => {
    if (guesses.length === 0) return candidates;

    return candidates.filter((candidate) => {
        const candidateRgb = hexToRgb(candidate.hex);
        if (!candidateRgb) return false;

        // Check if this candidate is consistent with ALL guesses
        return guesses.every((g) => {
            const guessRgb = hexToRgb(g.guess.hex);
            if (!guessRgb) return false;

            const calculatedPercent = colorDiff(candidateRgb, guessRgb);

            // Tolerance for floating point/display rounding. 
            // The game displays 2 decimals (e.g., 19.69).
            // A tolerance of 0.01-0.05 is usually safe.
            // We use 0.02 to be reasonably strict but allow for small library differences.
            return Math.abs(calculatedPercent - g.percent) < 0.02;
        });
    });
};
