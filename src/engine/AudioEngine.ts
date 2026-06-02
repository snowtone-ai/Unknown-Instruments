import * as Tone from 'tone';
import type { Instrument } from '../types';
import { createEffect, createFilter, createSynth, type PlayableSynth } from './SynthFactory';

export class AudioEngine {
  private synth: PlayableSynth | null = null;
  private nodes: Array<{ dispose: () => void }> = [];

  async start(): Promise<void> {
    await Tone.start();
  }

  loadInstrument(instrument: Instrument): void {
    this.dispose();
    if (instrument.decay.isDead) return;
    const synth = createSynth(instrument.synth);
    const filter = createFilter(instrument.filter);
    const effects = instrument.effects.map(createEffect);
    if (typeof synth.chain === 'function') synth.chain(filter, ...effects, Tone.getDestination());
    else synth.connect?.(filter);
    this.synth = synth;
    this.nodes = [filter, ...effects] as Array<{ dispose: () => void }>;
  }

  trigger(note: string | number, duration: string | number = '8n', velocity = 0.8): void {
    this.synth?.triggerAttackRelease(note, duration, undefined, velocity);
  }

  dispose(): void {
    this.synth?.dispose();
    for (const node of this.nodes) node.dispose();
    this.synth = null;
    this.nodes = [];
  }
}
