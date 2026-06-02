export type SynthType = 'fm' | 'am' | 'mono' | 'pluck' | 'metal';
export type OscillatorType = 'sine' | 'sawtooth' | 'square' | 'triangle';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass';
export type EffectType = 'reverb' | 'distortion' | 'delay' | 'chorus' | 'tremolo' | 'autofilter';
export type VisualTemplate = 'stringed' | 'wind' | 'percussion' | 'crystalline' | 'organic' | 'spiral';
export type TextureType = 'smooth' | 'rough' | 'metallic' | 'organic' | 'crystalline';
export type InteractionType = 'keys' | 'slide' | 'tap' | 'drag' | 'bow';
export type DecayCharacter = 'oxidation' | 'erosion' | 'crystallization' | 'withering' | 'dissolution';

export type ScaleType =
  | 'chromatic'
  | 'major'
  | 'minor'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'dorian'
  | 'mixolydian'
  | 'blues'
  | 'whole_tone';

export interface SynthParams {
  type: SynthType;
  oscillatorType?: OscillatorType;
  harmonicity?: number;
  modulationIndex?: number;
  modulationType?: OscillatorType;
  attackNoise?: number;
  dampening?: number;
  resonance?: number;
  octaves?: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  baseFrequency: number;
}

export interface FilterParams {
  type: FilterType;
  frequency: number;
  q: number;
}

export interface EffectParams {
  type: EffectType;
  wet: number;
  decayTime?: number;
  distortion?: number;
  delayTime?: number;
  feedback?: number;
  frequency?: number;
  depth?: number;
  baseFrequency?: number;
  filterOctaves?: number;
}

export interface VisualParams {
  template: VisualTemplate;
  primaryColor: string;
  accentColor: string;
  texture: TextureType;
  complexity: number;
  elementCount: number;
  formDescription: string;
}

export interface InteractionParams {
  type: InteractionType;
  description: string;
}

export interface DecayVector {
  paramPath: string;
  direction: 1 | -1;
  weight: number;
}

export interface DecayState {
  lifespan: number;
  playCount: number;
  decayVectors: DecayVector[];
  decayCharacter: DecayCharacter;
  seed: number;
  isDead: boolean;
}

export interface LineageInfo {
  parentId: string | null;
  generation: number;
  childIds: string[];
  crossbreedParentIds?: [string, string];
}

export interface Snapshot {
  id: string;
  label: string;
  synth: SynthParams;
  filter: FilterParams;
  effects: EffectParams[];
  visual: VisualParams;
  playCountAtCapture: number;
  createdAt: number;
}

export interface Instrument {
  id: string;
  name: string;
  nameEtymology: string;
  description: string;
  materials: string[];
  shape: string;
  playingMethod: string;
  originText: string;
  synth: SynthParams;
  filter: FilterParams;
  effects: EffectParams[];
  visual: VisualParams;
  interaction: InteractionParams;
  decay: DecayState;
  lineage: LineageInfo;
  snapshots: Snapshot[];
  createdAt: number;
  lastPlayedAt: number | null;
}

export interface Note {
  pitch: number;
  startBeat: number;
  duration: number;
  velocity: number;
}

export interface Track {
  id: string;
  instrumentId: string;
  notes: Note[];
  volume: number;
  muted: boolean;
  solo: boolean;
}

export interface Song {
  id: string;
  name: string;
  tempo: number;
  scale: ScaleType;
  timeSignature: [number, number];
  barCount: number;
  tracks: Track[];
  loop: boolean;
  decayMode: boolean;
  decayStartedAt: number | null;
  decayRatePerDay: number;
  createdAt: number;
}

export interface AppSettings {
  apiKey: string;
  decayEnabled: boolean;
  timeSensitivityEnabled: boolean;
  defaultScale: ScaleType;
  language: 'ja' | 'en';
}

export interface AppBackup {
  version: 1;
  exportedAt: number;
  instruments: Instrument[];
  songs: Song[];
  settings: Omit<AppSettings, 'apiKey'>;
}
