export function calculateDecayFactor(playCount: number, lifespan: number): number {
  if (lifespan <= 0) return 1;
  const p = Math.min(Math.max(playCount / lifespan, 0), 1);
  return p * p;
}
