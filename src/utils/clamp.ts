export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function clampInteger(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max));
}
