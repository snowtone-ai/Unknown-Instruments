import { describe, expect, it } from 'vitest';
import { frequencyToMidi, midiToFrequency, midiToNoteName } from '../src/utils/midi';

describe('midi helpers', () => {
  it('maps A4 consistently', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440);
    expect(frequencyToMidi(440)).toBe(69);
    expect(midiToNoteName(69)).toBe('A4');
  });

  it('handles invalid values without producing broken note names', () => {
    expect(frequencyToMidi(0)).toBe(69);
    expect(midiToNoteName(Number.NaN)).toBe('C4');
    expect(midiToNoteName(-1)).toBe('B-2');
  });
});
