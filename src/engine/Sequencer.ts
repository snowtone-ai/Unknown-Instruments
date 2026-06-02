import * as Tone from 'tone';
import type { Instrument, Song } from '../types';
import { midiToNoteName } from '../utils/midi';
import { AudioEngine } from './AudioEngine';

export class Sequencer {
  private timeoutIds: number[] = [];
  private engines: AudioEngine[] = [];

  async play(song: Song, instruments: Instrument[]): Promise<void> {
    this.stop();
    const instrumentMap = new Map(instruments.map((instrument) => [instrument.id, instrument]));
    await Tone.start();
    const hasSolo = song.tracks.some((track) => track.solo);
    for (const track of song.tracks) {
      if (track.muted || (hasSolo && !track.solo)) continue;
      const instrument = instrumentMap.get(track.instrumentId);
      if (!instrument) continue;
      const engine = new AudioEngine();
      engine.loadInstrument(instrument);
      this.engines.push(engine);
      for (const note of track.notes) {
        const delay = note.startBeat * (60 / song.tempo) * 1000;
        const id = window.setTimeout(() => engine.trigger(midiToNoteName(note.pitch), `${note.duration * (60 / song.tempo)}`, note.velocity * track.volume), delay);
        this.timeoutIds.push(id);
      }
    }
  }

  stop(): void {
    for (const id of this.timeoutIds) window.clearTimeout(id);
    this.timeoutIds = [];
    for (const engine of this.engines) engine.dispose();
    this.engines = [];
  }
}
