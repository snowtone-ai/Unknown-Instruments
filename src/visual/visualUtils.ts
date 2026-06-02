import { normalizeHexColor } from '../utils/color';

/** Deterministic seed from two hex color strings. */
export function colorSeed(primary: string, accent: string): number {
  let h = 0;
  const s = primary + accent;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Unique SVG element ID derived from seed + name. */
export function makeId(seed: number, name: string): string {
  return `v${(seed % 99999).toString(36)}${name}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHexColor(hex, '#000000').replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function lighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (v: number) => Math.min(255, Math.round(v + (255 - v) * amount));
  return `#${[f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (v: number) => Math.max(0, Math.round(v * (1 - amount)));
  return `#${[f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Mulberry32 seeded PRNG — deterministic random from a given seed. */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
