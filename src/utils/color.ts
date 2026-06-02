const HEX_3 = /^#?([0-9a-f]{3})$/i;
const HEX_6 = /^#?([0-9a-f]{6})$/i;

export function normalizeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  const short = HEX_3.exec(trimmed);
  if (short) {
    return `#${short[1].split('').map((part) => part + part).join('').toLowerCase()}`;
  }
  const full = HEX_6.exec(trimmed);
  return full ? `#${full[1].toLowerCase()}` : fallback;
}
