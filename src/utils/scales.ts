import type { ScaleType } from '../types';

export const SCALES: Record<ScaleType, number[]> = {
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  blues: [0, 3, 5, 6, 7, 10],
  whole_tone: [0, 2, 4, 6, 8, 10],
};

export function getGridNotes(scale: ScaleType, octaveRange: [number, number] = [3, 5]): number[] {
  const intervals = SCALES[scale];
  const notes: number[] = [];
  for (let octave = octaveRange[0]; octave <= octaveRange[1]; octave += 1) {
    for (const interval of intervals) notes.push((octave + 1) * 12 + interval);
  }
  return notes.reverse();
}
