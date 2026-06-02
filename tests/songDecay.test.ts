import { describe, expect, it } from 'vitest';
import { applySongDecayVelocity, calculateSongDecayFactor } from '../src/engine/SongDecay';
import { createEmptySong } from '../src/stores/appStoreModel';

describe('SongDecay', () => {
  it('is disabled until song decay is enabled', () => {
    const song = createEmptySong();
    expect(calculateSongDecayFactor(song)).toBe(0);
  });

  it('reduces playback velocity independently from instrument decay', () => {
    const song = { ...createEmptySong(), decayMode: true, decayStartedAt: 0, decayRatePerDay: 0.1 };
    expect(applySongDecayVelocity(1, song, 86_400_000)).toBeCloseTo(0.955);
  });
});
