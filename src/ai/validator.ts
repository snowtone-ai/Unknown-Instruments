import type { DecayCharacter, EffectParams, EffectType, FilterType, Instrument, InteractionType, OscillatorType, SynthType, TextureType, VisualTemplate } from '../types';
import { clamp, clampInteger } from '../utils/clamp';
import { normalizeHexColor } from '../utils/color';
import { createId } from '../utils/id';

const SAFE_DECAY_PATHS = [
  'synth.attack',
  'synth.decay',
  'synth.sustain',
  'synth.release',
  'synth.baseFrequency',
  'filter.frequency',
  'filter.q',
] as const;

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string, maxLength = 240): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim().slice(0, 80)).slice(0, 8)
    : fallback;
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const obj = value as Record<string, unknown>;
  if ('__proto__' in obj || 'constructor' in obj || 'prototype' in obj) {
    const safe: Record<string, unknown> = Object.create(null);
    for (const key of Object.keys(obj)) {
      if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') safe[key] = obj[key];
    }
    return safe;
  }
  return obj;
}

function toCamelEffect(raw: Record<string, unknown>): EffectParams {
  const type = pick<EffectType>(raw.type, ['reverb', 'distortion', 'delay', 'chorus', 'tremolo', 'autofilter'], 'reverb');
  return {
    type,
    wet: clamp(asNumber(raw.wet, 0.3), 0, 1),
    decayTime: clamp(asNumber(raw.decay_time ?? raw.decayTime, 2), 0.5, 10),
    distortion: clamp(asNumber(raw.distortion, 0.2), 0, 1),
    delayTime: clamp(asNumber(raw.delay_time ?? raw.delayTime, 0.25), 0.05, 1),
    feedback: clamp(asNumber(raw.feedback, 0.25), 0, 0.9),
    frequency: clamp(asNumber(raw.frequency, 2), 0.1, 20),
    depth: clamp(asNumber(raw.depth, 0.4), 0, 1),
    baseFrequency: clamp(asNumber(raw.base_frequency ?? raw.baseFrequency, 600), 100, 4000),
    filterOctaves: clamp(asNumber(raw.filter_octaves ?? raw.filterOctaves, 2), 0.5, 6),
  };
}

export function validateAndClampInstrument(raw: unknown, originText: string): Instrument {
  const source = asObject(raw);
  const instrument = asObject(source.instrument);
  const synth = asObject(source.synth);
  const filter = asObject(source.filter);
  const visual = asObject(source.visual);
  const interaction = asObject(source.interaction);
  const decayProfile = asObject(source.decay_profile ?? source.decayProfile);

  const now = Date.now();
  const lifespan = clampInteger(asNumber(decayProfile.lifespan, 60), 30, 100);

  return {
    id: createId('inst'),
    name: asString(instrument.name, 'Auralith（オーラリス）', 80),
    nameEtymology: asString(instrument.name_etymology ?? instrument.nameEtymology, 'aural と lith を合わせた造語', 160),
    description: asString(instrument.description, '薄い結晶板と中空の胴体を持つ架空の楽器。触れる位置で倍音が変わる。', 500),
    materials: asStringArray(instrument.materials, ['結晶化した樹脂', '古い真鍮', '黒檀']),
    shape: asString(instrument.shape, '非対称な標本のような形状', 240),
    playingMethod: asString(instrument.playing_method ?? instrument.playingMethod, '表面を撫でる、弾く、または長押しして鳴らす', 240),
    originText: asString(originText, 'unknown sound', 500),
    synth: {
      type: pick<SynthType>(synth.type, ['fm', 'am', 'mono', 'pluck', 'metal'], 'fm'),
      oscillatorType: pick<OscillatorType>(synth.oscillator_type ?? synth.oscillatorType, ['sine', 'sawtooth', 'square', 'triangle'], 'sine'),
      harmonicity: clamp(asNumber(synth.harmonicity, 3), 0.5, 10),
      modulationIndex: clamp(asNumber(synth.modulation_index ?? synth.modulationIndex, 10), 1, 20),
      modulationType: pick<OscillatorType>(synth.modulation_type ?? synth.modulationType, ['sine', 'sawtooth', 'square', 'triangle'], 'sine'),
      attackNoise: clamp(asNumber(synth.attack_noise ?? synth.attackNoise, 4), 1, 20),
      dampening: clamp(asNumber(synth.dampening, 4000), 1000, 8000),
      resonance: clamp(asNumber(synth.resonance, 0.6), 0.1, 1),
      octaves: clamp(asNumber(synth.octaves, 1.5), 0.5, 4),
      attack: clamp(asNumber(synth.attack, 0.1), 0.001, 3),
      decay: clamp(asNumber(synth.decay, 0.3), 0.01, 2),
      sustain: clamp(asNumber(synth.sustain, 0.5), 0, 1),
      release: clamp(asNumber(synth.release, 1), 0.01, 5),
      baseFrequency: clamp(asNumber(synth.base_frequency ?? synth.baseFrequency, 220), 55, 880),
    },
    filter: {
      type: pick<FilterType>(filter.type, ['lowpass', 'highpass', 'bandpass'], 'lowpass'),
      frequency: clamp(asNumber(filter.frequency, 1200), 80, 12000),
      q: clamp(asNumber(filter.q, 2), 0.5, 15),
    },
    effects: (Array.isArray(source.effects) ? source.effects : []).map((effect) => toCamelEffect(asObject(effect))).slice(0, 4),
    visual: {
      template: pick<VisualTemplate>(visual.template, ['stringed', 'wind', 'percussion', 'crystalline', 'organic', 'spiral'], 'crystalline'),
      primaryColor: normalizeHexColor(visual.primary_color ?? visual.primaryColor, '#6f6654'),
      accentColor: normalizeHexColor(visual.accent_color ?? visual.accentColor, '#d6b66f'),
      texture: pick<TextureType>(visual.texture, ['smooth', 'rough', 'metallic', 'organic', 'crystalline'], 'crystalline'),
      complexity: clampInteger(asNumber(visual.complexity, 3), 1, 5),
      elementCount: clampInteger(asNumber(visual.element_count ?? visual.elementCount, 7), 1, 12),
      formDescription: asString(visual.form_description ?? visual.formDescription, '標本箱に収められた未知の結晶楽器', 240),
    },
    interaction: {
      type: pick<InteractionType>(interaction.type, ['keys', 'slide', 'tap', 'drag', 'bow'], 'keys'),
      description: asString(interaction.description, '画面上の演奏UIを操作して音を出す', 240),
    },
    decay: {
      lifespan,
      playCount: 0,
      decayVectors: [{
        paramPath: pick(decayProfile.primary_decay_target ?? decayProfile.primaryDecayTarget, SAFE_DECAY_PATHS, 'filter.frequency'),
        direction: -1,
        weight: 0.5,
      }],
      decayCharacter: pick<DecayCharacter>(decayProfile.decay_character ?? decayProfile.decayCharacter, ['oxidation', 'erosion', 'crystallization', 'withering', 'dissolution'], 'erosion'),
      seed: Math.floor(Math.random() * 1_000_000),
      isDead: false,
    },
    lineage: {
      parentId: null,
      generation: 1,
      childIds: [],
    },
    snapshots: [],
    createdAt: now,
    lastPlayedAt: null,
  };
}
