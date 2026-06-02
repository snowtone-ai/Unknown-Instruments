import { describe, expect, it } from 'vitest';
import { validateAndClampInstrument } from '../src/ai/validator';

describe('validateAndClampInstrument', () => {
  it('falls back and clamps unsafe raw AI output', () => {
    const instrument = validateAndClampInstrument({
      synth: { type: 'unknown', attack: -1, base_frequency: 99999 },
      filter: { type: 'bad', frequency: 1, q: 99 },
      visual: { template: 'bad', complexity: 99, element_count: 99 },
      interaction: { type: 'bad' },
      decay_profile: { lifespan: 999, decay_character: 'bad' },
    }, 'test');

    expect(instrument.synth.type).toBe('fm');
    expect(instrument.synth.attack).toBeGreaterThanOrEqual(0.001);
    expect(instrument.synth.baseFrequency).toBe(880);
    expect(instrument.filter.frequency).toBe(80);
    expect(instrument.visual.elementCount).toBe(12);
    expect(instrument.decay.lifespan).toBe(100);
  });

  it('normalizes unsafe display and decay fields', () => {
    const instrument = validateAndClampInstrument({
      instrument: { name: 'x'.repeat(200) },
      visual: {
        primary_color: 'url(javascript:alert(1))',
        accent_color: '#abc',
      },
      decay_profile: { primary_decay_target: '__proto__.polluted' },
    }, 'origin');

    expect(instrument.name).toHaveLength(80);
    expect(instrument.visual.primaryColor).toBe('#6f6654');
    expect(instrument.visual.accentColor).toBe('#aabbcc');
    expect(instrument.decay.decayVectors[0].paramPath).toBe('filter.frequency');
  });
});
