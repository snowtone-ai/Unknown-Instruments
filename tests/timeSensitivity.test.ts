import { describe, expect, it } from 'vitest';
import { applyTimeSensitivity } from '../src/engine/TimeSensitivity';
import { generateFallbackInstrument } from '../src/ai/fallbackGenerator';

describe('applyTimeSensitivity', () => {
  it('does nothing when disabled', () => {
    const instrument = generateFallbackInstrument('morning wire');
    const result = applyTimeSensitivity(instrument.synth, instrument.filter, false, new Date('2026-06-02T06:00:00'));
    expect(result.filter.frequency).toBe(instrument.filter.frequency);
  });

  it('brightens early morning playback when enabled', () => {
    const instrument = generateFallbackInstrument('morning wire');
    const result = applyTimeSensitivity(instrument.synth, instrument.filter, true, new Date('2026-06-02T06:00:00'));
    expect(result.filter.frequency).toBeGreaterThan(instrument.filter.frequency);
    expect(result.synth.attack).toBeLessThan(instrument.synth.attack);
  });
});
