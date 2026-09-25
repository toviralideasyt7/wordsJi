/**
 * The 10 Terminus symbol glyphs as SVG inner markup.
 *
 * Ported from the terminum-z-ai solver page (10 inline SVGs, viewBox 0 0 80 80).
 * Kept as data strings so the Svelte component can render each inside a single
 * <svg> wrapper with {@html}; colors come from currentColor.
 */
export interface TerminusSymbolArt {
  value: number;
  svg: string;
}

export const TERMINUS_SYMBOL_ART: TerminusSymbolArt[] = [
  {
    value: 0,
    svg: '<circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" stroke-width="4"/>'
  },
  {
    value: 1,
    svg: '<circle cx="40" cy="28" r="18" fill="currentColor"/><circle cx="40" cy="55" r="18" fill="none" stroke="currentColor" stroke-width="4"/>'
  },
  {
    value: 2,
    svg: '<circle cx="28" cy="40" r="22" fill="currentColor"/><circle cx="52" cy="40" r="22" fill="none" stroke="currentColor" stroke-width="4"/>'
  },
  {
    value: 3,
    svg: '<ellipse cx="40" cy="20" rx="16" ry="14" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="40" cy="40" rx="24" ry="12" fill="currentColor"/><ellipse cx="40" cy="60" rx="16" ry="14" fill="none" stroke="currentColor" stroke-width="4"/>'
  },
  {
    value: 4,
    svg: '<ellipse cx="26" cy="26" rx="14" ry="12" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="54" cy="26" rx="14" ry="12" fill="currentColor"/><ellipse cx="26" cy="54" rx="14" ry="12" fill="currentColor"/><ellipse cx="54" cy="54" rx="14" ry="12" fill="none" stroke="currentColor" stroke-width="4"/>'
  },
  {
    value: 5,
    svg: '<ellipse cx="26" cy="26" rx="14" ry="12" fill="currentColor"/><ellipse cx="54" cy="26" rx="14" ry="12" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="26" cy="54" rx="14" ry="12" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="54" cy="54" rx="14" ry="12" fill="currentColor"/>'
  },
  {
    value: 6,
    svg: '<ellipse cx="26" cy="26" rx="14" ry="12" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="54" cy="26" rx="14" ry="12" fill="currentColor"/><ellipse cx="26" cy="54" rx="14" ry="12" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="54" cy="54" rx="14" ry="12" fill="currentColor"/>'
  },
  {
    value: 7,
    svg: '<polygon points="40,8 72,35 60,72 20,72 8,35" fill="none" stroke="currentColor" stroke-width="4"/><polygon points="40,18 62,38 54,65 26,65 18,38" fill="currentColor"/>'
  },
  {
    value: 8,
    svg: '<ellipse cx="40" cy="26" rx="20" ry="18" fill="none" stroke="currentColor" stroke-width="4"/><ellipse cx="40" cy="54" rx="20" ry="18" fill="none" stroke="currentColor" stroke-width="4"/>'
  },
  {
    value: 9,
    svg: '<circle cx="40" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="40" cy="32" r="12" fill="currentColor"/><line x1="40" y1="56" x2="40" y2="74" stroke="currentColor" stroke-width="4"/>'
  }
];
