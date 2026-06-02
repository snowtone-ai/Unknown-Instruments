import { useMemo, useRef, useState } from 'react';
import { Sequencer } from '../../engine/Sequencer';
import { exportSongWav } from '../../engine/WavExport';
import { useAppStore } from '../../stores/appStoreHooks';
import { createEmptySong } from '../../stores/appStoreModel';
import type { Note, ScaleType, Song } from '../../types';
import { createId } from '../../utils/id';
import { midiToNoteName } from '../../utils/midi';
import { getGridNotes } from '../../utils/scales';

export function StudioPage() {
  const { instruments, songs, saveSong, deleteSong, settings } = useAppStore();
  const [songId, setSongId] = useState(songs[0]?.id ?? '');
  const sequencerRef = useRef(new Sequencer());
  const song = useMemo(() => songs.find((item) => item.id === songId) ?? songs[0], [songId, songs]);
  const notes = useMemo(() => getGridNotes(song?.scale ?? settings.defaultScale, [3, 5]).slice(0, 12), [settings.defaultScale, song?.scale]);
  const cells = song ? song.barCount * song.timeSignature[0] * 4 : 16;

  function ensureSong(): Song {
    const existing = song ?? createEmptySong('Untitled Song', instruments[0]?.id ?? '');
    if (!song) {
      saveSong(existing);
      setSongId(existing.id);
    }
    return existing;
  }

  function updateSong(patch: Partial<Song>) {
    const current = ensureSong();
    saveSong({ ...current, ...patch });
  }

  function addTrack() {
    const current = ensureSong();
    const instrument = instruments.find((item) => !current.tracks.some((track) => track.instrumentId === item.id)) ?? instruments[0];
    if (!instrument || current.tracks.length >= 8) return;
    saveSong({ ...current, tracks: [...current.tracks, { id: createId('track'), instrumentId: instrument.id, notes: [], volume: 0.8, muted: false, solo: false }] });
  }

  function toggleNote(trackId: string, pitch: number, cell: number) {
    if (!song) return;
    const startBeat = cell / 4;
    saveSong({
      ...song,
      tracks: song.tracks.map((track) => {
        if (track.id !== trackId) return track;
        const exists = track.notes.some((note) => note.pitch === pitch && note.startBeat === startBeat);
        const nextNotes = exists
          ? track.notes.filter((note) => !(note.pitch === pitch && note.startBeat === startBeat))
          : [...track.notes, { pitch, startBeat, duration: 0.25, velocity: 0.8 } satisfies Note];
        return { ...track, notes: nextNotes };
      }),
    });
  }

  async function downloadWav() {
    if (!song) return;
    const blob = await exportSongWav(song, instruments);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${song.name || 'unknown-instruments'}.wav`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2>Studio</h2>
      <div className="button-row">
        <select value={song?.id ?? ''} onChange={(event) => setSongId(event.target.value)}>
          {songs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button className="primary-button" type="button" onClick={() => { const next = createEmptySong(`Song ${songs.length + 1}`, instruments[0]?.id ?? ''); saveSong(next); setSongId(next.id); }}>New song</button>
        {song ? <button className="secondary-button danger" type="button" onClick={() => deleteSong(song.id)}>Delete song</button> : null}
      </div>
      {song ? (
        <>
          <div className="transport-bar">
            <input className="input" value={song.name} onChange={(event) => updateSong({ name: event.target.value })} />
            <label>BPM <input type="number" min="60" max="240" value={song.tempo} onChange={(event) => updateSong({ tempo: Number(event.target.value) })} /></label>
            <label>Bars <input type="number" min="1" max="16" value={song.barCount} onChange={(event) => updateSong({ barCount: Number(event.target.value) })} /></label>
            <select value={song.scale} onChange={(event) => updateSong({ scale: event.target.value as ScaleType })}>
              {['chromatic', 'major', 'minor', 'pentatonic_major', 'pentatonic_minor', 'dorian', 'mixolydian', 'blues', 'whole_tone'].map((scale) => <option key={scale} value={scale}>{scale}</option>)}
            </select>
            <button className="secondary-button" type="button" onClick={() => void sequencerRef.current.play(song, instruments)}>Play</button>
            <button className="secondary-button" type="button" onClick={() => sequencerRef.current.stop()}>Stop</button>
            <button className="secondary-button" type="button" onClick={() => void downloadWav()}>Export WAV</button>
          </div>
          <div className="studio-layout">
            <div className="sequencer-grid" style={{ gridTemplateColumns: `72px repeat(${cells}, minmax(24px, 1fr))` }}>
              {song.tracks[0] ? notes.map((pitch) => (
                <div className="grid-row" style={{ display: 'contents' }} key={pitch}>
                  <div className="note-label">{midiToNoteName(pitch)}</div>
                  {Array.from({ length: cells }, (_, cell) => {
                    const active = song.tracks[0]?.notes.some((note) => note.pitch === pitch && note.startBeat === cell / 4);
                    return <button key={cell} className={active ? 'grid-cell active' : 'grid-cell'} type="button" onClick={() => toggleNote(song.tracks[0].id, pitch, cell)} />;
                  })}
                </div>
              )) : <p className="muted">トラックを追加してください。</p>}
            </div>
            <aside className="track-panel">
              {song.tracks.map((track, index) => (
                <article className="specimen-card" key={track.id}>
                  <h3>Track {index + 1}</h3>
                  <select value={track.instrumentId} onChange={(event) => saveSong({ ...song, tracks: song.tracks.map((item) => item.id === track.id ? { ...item, instrumentId: event.target.value } : item) })}>
                    {instruments.map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.name}</option>)}
                  </select>
                  <label><input type="checkbox" checked={track.muted} onChange={(event) => saveSong({ ...song, tracks: song.tracks.map((item) => item.id === track.id ? { ...item, muted: event.target.checked } : item) })} /> Mute</label>
                  <label><input type="checkbox" checked={track.solo} onChange={(event) => saveSong({ ...song, tracks: song.tracks.map((item) => item.id === track.id ? { ...item, solo: event.target.checked } : item) })} /> Solo</label>
                  <input type="range" min="0" max="1" step="0.01" value={track.volume} onChange={(event) => saveSong({ ...song, tracks: song.tracks.map((item) => item.id === track.id ? { ...item, volume: Number(event.target.value) } : item) })} />
                </article>
              ))}
              <button className="secondary-button" type="button" onClick={addTrack} disabled={!instruments.length || song.tracks.length >= 8}>Add track</button>
            </aside>
          </div>
        </>
      ) : <article className="specimen-card empty-state"><h3>曲を作成</h3><p className="muted">先にWorkshopで楽器を作ると、トラックへ割り当てられます。</p></article>}
    </div>
  );
}
