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
    const chain: Array<{ dispose: () => void }> = [filter, ...effects];
    if (typeof synth.chain === 'function') {
      synth.chain(filter, ...effects, Tone.getDestination());
    } else if (typeof synth.connect === 'function') {
      // Fallback: manually connect synth → filter → effects → destination
      let prev: { connect?: (node: unknown) => void } = synth as unknown as { connect?: (node: unknown) => void };
      for (const node of [filter, ...effects]) {
        prev.connect?.(node);
        prev = node as unknown as { connect?: (node: unknown) => void };
      }
      prev.connect?.(Tone.getDestination());
    }
    this.synth = synth;
    this.nodes = chain;
  }

  trigger(note: string | number, duration: string | number = '8n', velocity = 0.8): void {
    const safeVelocity = Math.max(0, Math.min(1, velocity));
    this.synth?.triggerAttackRelease(note, duration, undefined, safeVelocity);
  }

  dispose(): void {
    this.synth?.dispose();
    for (const node of this.nodes) node.dispose();
    this.synth = null;
    this.nodes = [];
  }
}
