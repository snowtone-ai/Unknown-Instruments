import * as Tone from 'tone';
import type { Instrument, Song } from '../types';
import { clamp } from '../utils/clamp';
import { midiToNoteName } from '../utils/midi';
import { createEffect, createFilter, createSynth } from './SynthFactory';
import { audioBufferToWav } from './audioBufferToWav';

export function calculateSongDurationSeconds(song: Song): number {
  const tempo = clamp(song.tempo, 60, 240);
  const beats = song.barCount * song.timeSignature[0];
  return beats * (60 / tempo);
}

export async function exportSongWav(song: Song, instruments: Instrument[]): Promise<Blob> {
  const duration = calculateSongDurationSeconds(song);
  const tempo = clamp(song.tempo, 60, 240);
  const instrumentMap = new Map(instruments.map((instrument) => [instrument.id, instrument]));
  const buffer = await Tone.Offline(() => {
    for (const track of activeTracks(song)) {
      const instrument = instrumentMap.get(track.instrumentId);
      if (!instrument) continue;
      const synth = createSynth(instrument.synth);
      const filter = createFilter(instrument.filter);
      const effects = instrument.effects.map(createEffect);
      (synth as unknown as { chain?: (...nodes: unknown[]) => void }).chain?.(filter, ...effects, Tone.getDestination());
      for (const note of track.notes) {
        const time = note.startBeat * (60 / tempo);
        const noteDuration = note.duration * (60 / tempo);
        synth.triggerAttackRelease(midiToNoteName(note.pitch), noteDuration, time, note.velocity * track.volume);
      }
    }
  }, duration);
  const audioBuffer = buffer.get();
  if (!audioBuffer) throw new Error('WAV export failed to render audio.');
  return audioBufferToWav(audioBuffer);
}

function activeTracks(song: Song) {
  const hasSolo = song.tracks.some((track) => track.solo);
  return song.tracks.filter((track) => !track.muted && (!hasSolo || track.solo));
}
