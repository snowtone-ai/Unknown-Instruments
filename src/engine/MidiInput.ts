import { midiToNoteName } from '../utils/midi';

export interface MidiNoteHandler {
  noteOn(note: string, velocity: number): void;
  noteOff(note: string): void;
}

export async function connectMidiInput(handler: MidiNoteHandler): Promise<() => void> {
  if (!('requestMIDIAccess' in navigator)) {
    throw new Error('Web MIDI is not available in this browser.');
  }
  const access = await (navigator as Navigator & {
    requestMIDIAccess: () => Promise<MIDIAccess>;
  }).requestMIDIAccess();
  const listeners: Array<[MIDIInput, (event: MIDIMessageEvent) => void]> = [];
  for (const input of access.inputs.values()) {
    const listener = (event: MIDIMessageEvent) => {
      const [status = 0, pitch = 60, velocity = 0] = Array.from(event.data ?? []);
      const command = status & 0xf0;
      if (command === 0x90 && velocity > 0) handler.noteOn(midiToNoteName(pitch), velocity / 127);
      if (command === 0x80 || (command === 0x90 && velocity === 0)) handler.noteOff(midiToNoteName(pitch));
    };
    input.addEventListener('midimessage', listener);
    listeners.push([input, listener]);
  }
  return () => {
    for (const [input, listener] of listeners) input.removeEventListener('midimessage', listener);
  };
}
