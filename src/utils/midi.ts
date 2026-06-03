export function midiToFrequency(note: number): number {
  const safeNote = Number.isFinite(note) ? note : 69;
  return 440 * 2 ** ((safeNote - 69) / 12);
}

export function frequencyToMidi(frequency: number): number {
  if (!Number.isFinite(frequency) || frequency <= 0) return 69;
  const raw = Math.round(69 + 12 * Math.log2(frequency / 440));
  return Math.max(0, Math.min(127, raw));
}

export function midiToNoteName(note: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const safeNote = Math.round(Number.isFinite(note) ? note : 60);
  const octave = Math.floor(safeNote / 12) - 1;
  const index = ((safeNote % 12) + 12) % 12;
  return `${names[index]}${octave}`;
}
