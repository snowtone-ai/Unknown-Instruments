export const instrumentResponseSchema = {
  type: 'object',
  properties: {
    instrument: { type: 'object' },
    synth: { type: 'object' },
    filter: { type: 'object' },
    effects: { type: 'array' },
    visual: { type: 'object' },
    interaction: { type: 'object' },
    decay_profile: { type: 'object' },
  },
  required: ['instrument', 'synth', 'filter', 'effects', 'visual', 'interaction', 'decay_profile'],
} as const;
