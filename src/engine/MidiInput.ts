import { midiToNoteName } from '../utils/midi';
import { clamp, clampInteger } from '../utils/clamp';

export interface MidiNoteHandler {
  noteOn(note: string, velocity: number): void;
  noteOff(note: string): void;
}

export async function connectMidiInput(handler: MidiNoteHandler): Promise<() => void> {
  if (!('navigator' in globalThis) || !('requestMIDIAccess' in navigator)) {
    throw new Error('Web MIDI is not available in this browser.');
  }
  const access = await (navigator as Navigator & {
    requestMIDIAccess: () => Promise<MIDIAccess>;
  }).requestMIDIAccess();
  const listeners: Array<[MIDIInput, (event: MIDIMessageEvent) => void]> = [];
  for (const input of access.inputs.values()) {
    const listener = (event: MIDIMessageEvent) => {
      const [status = 0, pitch = 60, velocity = 0] = Array.from(event.data ?? []);
      const safePitch = clampInteger(pitch, 0, 127);
      const safeVelocity = clamp(velocity, 0, 127);
      const command = status & 0xf0;
      if (command === 0x90 && safeVelocity > 0) handler.noteOn(midiToNoteName(safePitch), safeVelocity / 127);
      if (command === 0x80 || (command === 0x90 && safeVelocity === 0)) handler.noteOff(midiToNoteName(safePitch));
    };
    input.addEventListener('midimessage', listener);
    listeners.push([input, listener]);
  }
  return () => {
    for (const [input, listener] of listeners) input.removeEventListener('midimessage', listener);
  };
}
