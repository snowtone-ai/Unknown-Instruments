import type { Song } from '../types';
import { clamp } from '../utils/clamp';

export function calculateSongDecayFactor(song: Song, now = Date.now()): number {
  if (!song.decayMode || song.decayStartedAt === null) return 0;
  const days = Math.max(0, (now - song.decayStartedAt) / 86_400_000);
  return clamp(days * song.decayRatePerDay, 0, 1);
}

export function applySongDecayVelocity(velocity: number, song: Song, now = Date.now()): number {
  const factor = calculateSongDecayFactor(song, now);
  return clamp(velocity * (1 - factor * 0.45), 0, 1);
}
