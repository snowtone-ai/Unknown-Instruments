export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  const lo = min <= max ? min : max;
  const hi = min <= max ? max : min;
  return Math.max(lo, Math.min(hi, value));
}

export function clampInteger(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max));
}
