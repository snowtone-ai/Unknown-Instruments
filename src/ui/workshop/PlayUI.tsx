import { useCallback, useMemo, useRef } from 'react';
import type { Instrument, InteractionType } from '../../types';
import { frequencyToMidi, midiToNoteName } from '../../utils/midi';

interface PlayUIProps {
  instrument: Instrument;
  forcedType?: InteractionType;
  onPlay: (note: string, duration?: string, velocity?: number) => void;
}

export function PlayUI({ instrument, forcedType, onPlay }: PlayUIProps) {
  const type = forcedType ?? instrument.interaction.type;
  const baseMidi = Math.round(frequencyToMidi(instrument.synth.baseFrequency));
  const notes = useMemo(() => Array.from({ length: 8 }, (_, index) => midiToNoteName(baseMidi + index)), [baseMidi]);
  const lastDragNote = useRef<string | null>(null);
  const throttleRef = useRef(0);

  const handleDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return;
    const now = Date.now();
    if (now - throttleRef.current < 80) return;
    const note = notes[Math.floor((event.nativeEvent.offsetY / Math.max(1, event.currentTarget.clientHeight)) * notes.length)] ?? notes[0];
    if (note === lastDragNote.current) return;
    lastDragNote.current = note;
    throttleRef.current = now;
    onPlay(note, '16n', 0.55);
  }, [notes, onPlay]);

  if (type === 'slide') {
    return <div className="play-surface slide-surface" onPointerDown={(event) => onPlay(notes[Math.floor((event.nativeEvent.offsetX / Math.max(1, event.currentTarget.clientWidth)) * notes.length)] ?? notes[0], '4n', 0.75)} />;
  }
  if (type === 'tap') {
    return <div className="tap-grid">{notes.slice(0, 6).map((note) => <button key={note} type="button" onClick={() => onPlay(note, '8n', 0.82)}>{note}</button>)}</div>;
  }
  if (type === 'drag') {
    return <div className="play-surface drag-surface" onPointerMove={handleDrag} onPointerLeave={() => { lastDragNote.current = null; }} />;
  }
  if (type === 'bow') {
    return <div className="play-surface bow-surface" onPointerDown={() => onPlay(notes[2] ?? notes[0], '2n', 0.62)} />;
  }
  return <div className="keys-row">{notes.map((note) => <button key={note} type="button" onClick={() => onPlay(note, '8n', 0.78)}>{note}</button>)}</div>;
}
