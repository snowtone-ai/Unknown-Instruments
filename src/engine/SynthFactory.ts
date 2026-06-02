import * as Tone from 'tone';
import type { EffectParams, FilterParams, SynthParams } from '../types';

export interface PlayableSynth {
  triggerAttackRelease(note: string | number, duration: string | number, time?: number, velocity?: number): void;
  chain?: (...nodes: unknown[]) => void;
  connect?: (node: unknown) => void;
  dispose(): void;
}

class PluckSynthPool implements PlayableSynth {
  private readonly voices: Tone.PluckSynth[];
  private nextVoice = 0;

  constructor(params: SynthParams, size = 8) {
    this.voices = Array.from({ length: size }, () => new Tone.PluckSynth({
      attackNoise: params.attackNoise ?? 4,
      dampening: params.dampening ?? 4000,
      resonance: params.resonance ?? 0.6,
    }));
  }

  triggerAttackRelease(note: string | number, duration: string | number, time?: number, velocity?: number): void {
    const voice = this.voices[this.nextVoice];
    this.nextVoice = (this.nextVoice + 1) % this.voices.length;
    voice?.triggerAttackRelease(note, duration, time, velocity);
  }

  chain(...nodes: unknown[]): void {
    for (const voice of this.voices) (voice as unknown as { chain: (...next: unknown[]) => void }).chain(...nodes);
  }

  connect(node: unknown): void {
    for (const voice of this.voices) (voice as unknown as { connect: (next: unknown) => void }).connect(node);
  }

  dispose(): void {
    for (const voice of this.voices) voice.dispose();
  }
}

export function createSynth(params: SynthParams): PlayableSynth {
  switch (params.type) {
    case 'am':
      return new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: params.harmonicity ?? 3,
        oscillator: { type: params.oscillatorType ?? 'sine' },
        envelope: envelope(params),
      }) as unknown as PlayableSynth;
    case 'mono':
      return new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: { type: params.oscillatorType ?? 'sine' },
        envelope: envelope(params),
      }) as unknown as PlayableSynth;
    case 'pluck':
      return new PluckSynthPool(params);
    case 'metal':
      return new Tone.PolySynth(Tone.MetalSynth, {
        harmonicity: params.harmonicity ?? 3,
        modulationIndex: params.modulationIndex ?? 10,
        resonance: params.resonance ?? 0.6,
        octaves: params.octaves ?? 1.5,
        envelope: envelope(params),
      }) as unknown as PlayableSynth;
    case 'fm':
    default:
      return new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: params.harmonicity ?? 3,
        modulationIndex: params.modulationIndex ?? 10,
        oscillator: { type: params.oscillatorType ?? 'sine' },
        modulation: { type: params.modulationType ?? 'sine' },
        envelope: envelope(params),
      }) as unknown as PlayableSynth;
  }
}

export function createFilter(params: FilterParams) {
  return new Tone.Filter(params.frequency, params.type).set({ Q: params.q });
}

export function createEffect(effect: EffectParams) {
  switch (effect.type) {
    case 'distortion': return new Tone.Distortion(effect.distortion ?? 0.2).set({ wet: effect.wet });
    case 'delay': return new Tone.FeedbackDelay(effect.delayTime ?? 0.25, effect.feedback ?? 0.25).set({ wet: effect.wet });
    case 'chorus': return new Tone.Chorus(effect.frequency ?? 1.5, 2.5, effect.depth ?? 0.4).set({ wet: effect.wet }).start();
    case 'tremolo': return new Tone.Tremolo(effect.frequency ?? 3, effect.depth ?? 0.4).set({ wet: effect.wet }).start();
    case 'autofilter': return new Tone.AutoFilter(effect.frequency ?? 1).set({ wet: effect.wet }).start();
    case 'reverb':
    default: return new Tone.Reverb(effect.decayTime ?? 2).set({ wet: effect.wet });
  }
}

function envelope(params: SynthParams) {
  return {
    attack: params.attack,
    decay: params.decay,
    sustain: params.sustain,
    release: params.release,
  };
}
