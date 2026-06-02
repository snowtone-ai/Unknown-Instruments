import { describe, expect, it } from 'vitest';
import { applyDecayToParams, markPlayed } from '../src/engine/DecayEngine';
import { generateFallbackInstrument } from '../src/ai/fallbackGenerator';

describe('DecayEngine', () => {
  it('increments play count only when enabled', () => {
    const instrument = generateFallbackInstrument('dry metal');
    expect(markPlayed(instrument, false).decay.playCount).toBe(0);
    expect(markPlayed(instrument, true).decay.playCount).toBe(1);
  });

  it('applies deterministic clamped parameter mutation', () => {
    const instrument = {
      ...generateFallbackInstrument('dry metal'),
      decay: {
        ...generateFallbackInstrument('dry metal').decay,
        playCount: 100,
        lifespan: 100,
        seed: 1,
        decayVectors: [{ paramPath: 'filter.frequency', direction: -1 as const, weight: 1 }],
      },
    };
    const result = applyDecayToParams(instrument.synth, instrument.filter, instrument);
    expect(result.filter.frequency).toBeGreaterThanOrEqual(80);
    expect(result.filter.frequency).toBeLessThan(instrument.filter.frequency);
  });
});
