import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateInstrument } from '../src/ai/GeminiClient';

describe('generateInstrument', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the current Gemini structured output request shape', async () => {
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const text = JSON.stringify({
        instrument: { name: 'Glass Rain' },
        synth: { type: 'fm', attack: 0.1, decay: 0.2, sustain: 0.5, release: 1, base_frequency: 220 },
        filter: { type: 'lowpass', frequency: 1200, q: 2 },
        effects: [],
        visual: { template: 'crystalline', primary_color: '#123456', accent_color: '#abcdef', texture: 'crystalline', complexity: 3, element_count: 5 },
        interaction: { type: 'keys' },
        decay_profile: { lifespan: 60 },
      });
      expect(init?.headers).toMatchObject({ 'x-goog-api-key': 'test-key' });
      return new Response(JSON.stringify({
        candidates: [{ content: { parts: [{ text }] } }],
      }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const instrument = await generateInstrument('glass rain', 'test-key');
    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);

    expect(body.generationConfig.responseFormat.text.mimeType).toBe('application/json');
    expect(body.generationConfig.responseFormat.text.schema.required).toContain('instrument');
    expect(instrument.name).toBe('Glass Rain');
  });
});
