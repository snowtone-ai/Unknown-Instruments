import type { Instrument } from '../types';
import { validateAndClampInstrument } from './validator';

export function generateFallbackInstrument(userText: string): Instrument {
  return validateAndClampInstrument({
    instrument: {
      name: 'Auralith（オーラリス）',
      name_etymology: 'aural と lith を合わせた造語',
      description: '薄い結晶板と中空の胴体を持つ架空の楽器。触れる位置で倍音が変わる。',
      materials: ['結晶化した樹脂', '古い真鍮', '黒檀'],
      shape: '非対称な標本のような結晶体',
      playing_method: '表面を撫でる、弾く、または長押しして鳴らす',
    },
    synth: { type: 'fm', oscillator_type: 'sine', harmonicity: 3, modulation_index: 8, attack: 0.08, decay: 0.3, sustain: 0.45, release: 1.4, base_frequency: 220 },
    filter: { type: 'lowpass', frequency: 1800, q: 2.5 },
    effects: [{ type: 'reverb', wet: 0.35, decay_time: 2.8 }, { type: 'chorus', wet: 0.18, frequency: 1.2, depth: 0.35 }],
    visual: { template: 'crystalline', primary_color: '#6f6654', accent_color: '#d6b66f', texture: 'crystalline', complexity: 3, element_count: 7, form_description: '標本箱に収められた未知の結晶楽器' },
    interaction: { type: 'keys', description: '鍵盤またはMIDI入力で結晶板を鳴らす' },
    decay_profile: { lifespan: 60, primary_decay_target: 'filter.frequency', decay_character: 'crystallization' },
  }, userText);
}
