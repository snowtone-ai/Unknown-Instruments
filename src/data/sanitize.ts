import type {
  AppSettings,
  DecayCharacter,
  EffectParams,
  EffectType,
  FilterType,
  Instrument,
  InteractionType,
  OscillatorType,
  ScaleType,
  Song,
  SynthType,
  TextureType,
  VisualTemplate,
} from '../types';
import { clamp, clampInteger } from '../utils/clamp';
import { normalizeHexColor } from '../utils/color';

const synthTypes = ['fm', 'am', 'mono', 'pluck', 'metal'] as const;
const oscillatorTypes = ['sine', 'sawtooth', 'square', 'triangle'] as const;
const filterTypes = ['lowpass', 'highpass', 'bandpass'] as const;
const effectTypes = ['reverb', 'distortion', 'delay', 'chorus', 'tremolo', 'autofilter'] as const;
const visualTemplates = ['stringed', 'wind', 'percussion', 'crystalline', 'organic', 'spiral'] as const;
const textureTypes = ['smooth', 'rough', 'metallic', 'organic', 'crystalline'] as const;
const interactionTypes = ['keys', 'slide', 'tap', 'drag', 'bow'] as const;
const decayCharacters = ['oxidation', 'erosion', 'crystallization', 'withering', 'dissolution'] as const;
const scaleTypes = ['chromatic', 'major', 'minor', 'pentatonic_major', 'pentatonic_minor', 'dorian', 'mixolydian', 'blues', 'whole_tone'] as const;
const decayPaths = ['synth.attack', 'synth.decay', 'synth.sustain', 'synth.release', 'synth.baseFrequency', 'filter.frequency', 'filter.q'] as const;

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

function asString(value: unknown, fallback: string, maxLength = 240): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

function asOptionalString(value: unknown, maxLength = 120): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback;
}

function asStringArray(value: unknown, fallback: string[], maxItems = 8): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim().slice(0, 80)).slice(0, maxItems)
    : fallback;
}

export function sanitizeSettings(value: unknown, fallback: AppSettings): AppSettings {
  const source = asObject(value);
  return {
    apiKey: asString(source.apiKey, fallback.apiKey, 200),
    decayEnabled: asBoolean(source.decayEnabled, fallback.decayEnabled),
    timeSensitivityEnabled: asBoolean(source.timeSensitivityEnabled, fallback.timeSensitivityEnabled),
    defaultScale: pick<ScaleType>(source.defaultScale, scaleTypes, fallback.defaultScale),
    language: pick(source.language, ['ja', 'en'] as const, fallback.language),
  };
}

export function sanitizeBackupSettings(value: unknown, fallback: Omit<AppSettings, 'apiKey'>): Omit<AppSettings, 'apiKey'> {
  const source = asObject(value);
  return {
    decayEnabled: asBoolean(source.decayEnabled, fallback.decayEnabled),
    timeSensitivityEnabled: asBoolean(source.timeSensitivityEnabled, fallback.timeSensitivityEnabled),
    defaultScale: pick<ScaleType>(source.defaultScale, scaleTypes, fallback.defaultScale),
    language: pick(source.language, ['ja', 'en'] as const, fallback.language),
  };
}

export function sanitizeInstrument(value: unknown): Instrument | null {
  const source = asObject(value);
  const id = asOptionalString(source.id);
  if (!id) return null;
  const synth = asObject(source.synth);
  const filter = asObject(source.filter);
  const visual = asObject(source.visual);
  const interaction = asObject(source.interaction);
  const decay = asObject(source.decay);
  const lineage = asObject(source.lineage);
  const lifespan = clampInteger(asNumber(decay.lifespan, 60), 30, 100);
  const playCount = clampInteger(asNumber(decay.playCount, 0), 0, 100);

  return {
    id,
    name: asString(source.name, 'Unknown Instrument', 80),
    nameEtymology: asString(source.nameEtymology, '', 160),
    description: asString(source.description, '説明のない楽器です。', 500),
    materials: asStringArray(source.materials, ['unknown material']),
    shape: asString(source.shape, 'unknown shape', 240),
    playingMethod: asString(source.playingMethod, '画面上の演奏UIで鳴らす', 240),
    originText: asString(source.originText, 'imported sound', 500),
    synth: {
      type: pick<SynthType>(synth.type, synthTypes, 'fm'),
      oscillatorType: pick<OscillatorType>(synth.oscillatorType, oscillatorTypes, 'sine'),
      harmonicity: clamp(asNumber(synth.harmonicity, 3), 0.5, 10),
      modulationIndex: clamp(asNumber(synth.modulationIndex, 10), 1, 20),
      modulationType: pick<OscillatorType>(synth.modulationType, oscillatorTypes, 'sine'),
      attackNoise: clamp(asNumber(synth.attackNoise, 4), 1, 20),
      dampening: clamp(asNumber(synth.dampening, 4000), 1000, 8000),
      resonance: clamp(asNumber(synth.resonance, 0.6), 0.1, 1),
      octaves: clamp(asNumber(synth.octaves, 1.5), 0.5, 4),
      attack: clamp(asNumber(synth.attack, 0.1), 0.001, 3),
      decay: clamp(asNumber(synth.decay, 0.3), 0.01, 2),
      sustain: clamp(asNumber(synth.sustain, 0.5), 0, 1),
      release: clamp(asNumber(synth.release, 1), 0.01, 5),
      baseFrequency: clamp(asNumber(synth.baseFrequency, 220), 55, 880),
    },
    filter: {
      type: pick<FilterType>(filter.type, filterTypes, 'lowpass'),
      frequency: clamp(asNumber(filter.frequency, 1200), 80, 12000),
      q: clamp(asNumber(filter.q, 2), 0.5, 15),
    },
    effects: sanitizeEffects(source.effects),
    visual: {
      template: pick<VisualTemplate>(visual.template, visualTemplates, 'crystalline'),
      primaryColor: normalizeHexColor(visual.primaryColor, '#6f6654'),
      accentColor: normalizeHexColor(visual.accentColor, '#d6b66f'),
      texture: pick<TextureType>(visual.texture, textureTypes, 'crystalline'),
      complexity: clampInteger(asNumber(visual.complexity, 3), 1, 5),
      elementCount: clampInteger(asNumber(visual.elementCount, 7), 1, 12),
      formDescription: asString(visual.formDescription, '未知の楽器', 240),
    },
    interaction: {
      type: pick<InteractionType>(interaction.type, interactionTypes, 'keys'),
      description: asString(interaction.description, '画面上の演奏UIを操作して音を出す', 240),
    },
    decay: {
      lifespan,
      playCount,
      decayVectors: sanitizeDecayVectors(decay.decayVectors),
      decayCharacter: pick<DecayCharacter>(decay.decayCharacter, decayCharacters, 'erosion'),
      seed: clampInteger(asNumber(decay.seed, 1), 1, 1_000_000),
      isDead: asBoolean(decay.isDead, false) || playCount >= lifespan,
    },
    lineage: {
      parentId: asOptionalString(lineage.parentId),
      generation: clampInteger(asNumber(lineage.generation, 1), 1, 99),
      childIds: asStringArray(lineage.childIds, [], 200),
      crossbreedParentIds: sanitizeParentPair(lineage.crossbreedParentIds),
    },
    snapshots: sanitizeSnapshots(source.snapshots),
    createdAt: clampInteger(asNumber(source.createdAt, Date.now()), 0, Date.now()),
    lastPlayedAt: typeof source.lastPlayedAt === 'number' && Number.isFinite(source.lastPlayedAt) ? Math.max(0, source.lastPlayedAt) : null,
  };
}

export function sanitizeInstruments(value: unknown): Instrument[] {
  return Array.isArray(value) ? value.map(sanitizeInstrument).filter((item): item is Instrument => item !== null).slice(0, 500) : [];
}

export function sanitizeSong(value: unknown): Song | null {
  const source = asObject(value);
  const id = asOptionalString(source.id);
  if (!id) return null;
  const timeSignature = Array.isArray(source.timeSignature) ? source.timeSignature : [4, 4];
  return {
    id,
    name: asString(source.name, 'Untitled Song', 80),
    tempo: clampInteger(asNumber(source.tempo, 120), 60, 240),
    scale: pick<ScaleType>(source.scale, scaleTypes, 'pentatonic_major'),
    timeSignature: [clampInteger(asNumber(timeSignature[0], 4), 1, 12), clampInteger(asNumber(timeSignature[1], 4), 1, 16)],
    barCount: clampInteger(asNumber(source.barCount, 4), 1, 16),
    tracks: sanitizeTracks(source.tracks),
    loop: asBoolean(source.loop, true),
    decayMode: asBoolean(source.decayMode, false),
    decayStartedAt: typeof source.decayStartedAt === 'number' && Number.isFinite(source.decayStartedAt) ? Math.max(0, source.decayStartedAt) : null,
    decayRatePerDay: clamp(asNumber(source.decayRatePerDay, 0.03), 0, 1),
    createdAt: clampInteger(asNumber(source.createdAt, Date.now()), 0, Date.now()),
  };
}

export function sanitizeSongs(value: unknown): Song[] {
  return Array.isArray(value) ? value.map(sanitizeSong).filter((item): item is Song => item !== null).slice(0, 100) : [];
}

function sanitizeEffects(value: unknown): EffectParams[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const effect = asObject(item);
    return {
      type: pick<EffectType>(effect.type, effectTypes, 'reverb'),
      wet: clamp(asNumber(effect.wet, 0.3), 0, 1),
      decayTime: clamp(asNumber(effect.decayTime, 2), 0.5, 10),
      distortion: clamp(asNumber(effect.distortion, 0.2), 0, 1),
      delayTime: clamp(asNumber(effect.delayTime, 0.25), 0.05, 1),
      feedback: clamp(asNumber(effect.feedback, 0.25), 0, 0.9),
      frequency: clamp(asNumber(effect.frequency, 2), 0.1, 20),
      depth: clamp(asNumber(effect.depth, 0.4), 0, 1),
      baseFrequency: clamp(asNumber(effect.baseFrequency, 600), 100, 4000),
      filterOctaves: clamp(asNumber(effect.filterOctaves, 2), 0.5, 6),
    };
  }).slice(0, 4);
}

function sanitizeDecayVectors(value: unknown) {
  if (!Array.isArray(value)) {
    return [{ paramPath: 'filter.frequency', direction: -1 as const, weight: 0.5 }];
  }
  const vectors = value.map((item) => {
    const vector = asObject(item);
    return {
      paramPath: pick(vector.paramPath, decayPaths, 'filter.frequency'),
      direction: vector.direction === 1 ? 1 as const : -1 as const,
      weight: clamp(asNumber(vector.weight, 0.5), 0, 1),
    };
  }).slice(0, 4);
  return vectors.length > 0 ? vectors : [{ paramPath: 'filter.frequency', direction: -1 as const, weight: 0.5 }];
}

function sanitizeParentPair(value: unknown): [string, string] | undefined {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const first = asOptionalString(value[0]);
  const second = asOptionalString(value[1]);
  return first && second ? [first, second] : undefined;
}

function sanitizeTracks(value: unknown): Song['tracks'] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const track = asObject(item);
    const id = asOptionalString(track.id);
    const instrumentId = asOptionalString(track.instrumentId);
    if (!id || !instrumentId) return null;
    return {
      id,
      instrumentId,
      notes: sanitizeNotes(track.notes),
      volume: clamp(asNumber(track.volume, 0.8), 0, 1),
      muted: asBoolean(track.muted, false),
      solo: asBoolean(track.solo, false),
    };
  }).filter((item): item is Song['tracks'][number] => item !== null).slice(0, 8);
}

function sanitizeNotes(value: unknown): Song['tracks'][number]['notes'] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const note = asObject(item);
    return {
      pitch: clampInteger(asNumber(note.pitch, 60), 24, 96),
      startBeat: clamp(asNumber(note.startBeat, 0), 0, 256),
      duration: clamp(asNumber(note.duration, 0.25), 0.125, 16),
      velocity: clamp(asNumber(note.velocity, 0.8), 0, 1),
    };
  }).slice(0, 4096);
}

function sanitizeSnapshots(value: unknown): Instrument['snapshots'] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const snapshot = asObject(item);
    const id = asOptionalString(snapshot.id);
    if (!id) return null;
    const safeParams = sanitizeInstrument({
      id: 'snapshot-probe',
      synth: snapshot.synth,
      filter: snapshot.filter,
      effects: snapshot.effects,
      visual: snapshot.visual,
      interaction: {},
      decay: {},
      lineage: {},
    });
    if (!safeParams) return null;
    return {
      id,
      label: asString(snapshot.label, 'Snapshot', 80),
      synth: safeParams.synth,
      filter: safeParams.filter,
      effects: safeParams.effects,
      visual: safeParams.visual,
      playCountAtCapture: clampInteger(asNumber(snapshot.playCountAtCapture, 0), 0, 100),
      createdAt: clampInteger(asNumber(snapshot.createdAt, Date.now()), 0, Date.now()),
    };
  }).filter((item): item is Instrument['snapshots'][number] => item !== null).slice(0, 20);
}
