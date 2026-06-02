import { describe, expect, it } from 'vitest';
import { frequencyToMidi, midiToFrequency, midiToNoteName } from '../src/utils/midi';

describe('midi helpers', () => {
  it('maps A4 consistently', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440);
    expect(frequencyToMidi(440)).toBe(69);
    expect(midiToNoteName(69)).toBe('A4');
  });
});
