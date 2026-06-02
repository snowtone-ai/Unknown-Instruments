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
  const [playing, setPlaying] = useState(false);
  const sequencerRef = useRef(new Sequencer());
  const song = useMemo(() => songs.find((item) => item.id === songId) ?? songs[0], [songId, songs]);
  const notes = useMemo(() => getGridNotes(song?.scale ?? settings.defaultScale, [3, 5]).slice(0, 12), [settings.defaultScale, song?.scale]);
  const cells = song ? song.barCount * song.timeSignature[0] * 4 : 16;
  const beatsPerBar = song ? song.timeSignature[0] * 4 : 16;

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

  async function handlePlay() {
    if (!song) return;
    setPlaying(true);
    await sequencerRef.current.play(song, instruments);
    setPlaying(false);
  }

  function handleStop() {
    sequencerRef.current.stop();
    setPlaying(false);
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

      {/* Song Selection */}
      <div className="button-row">
        <select value={song?.id ?? ''} onChange={(event) => setSongId(event.target.value)}>
          {songs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <button className="primary-button" type="button" onClick={() => { const next = createEmptySong(`Song ${songs.length + 1}`, instruments[0]?.id ?? ''); saveSong(next); setSongId(next.id); }}>
          New Song
        </button>
        {song ? (
          <button className="secondary-button danger" type="button" onClick={() => confirm('この曲を削除しますか？') && deleteSong(song.id)}>
            Delete
          </button>
        ) : null}
      </div>

      {song ? (
        <>
          {/* Transport */}
          <div className="transport-bar">
            <input className="input" style={{ maxWidth: 180 }} value={song.name} onChange={(event) => updateSong({ name: event.target.value })} />
            <label>BPM <input type="number" min="60" max="240" value={song.tempo} onChange={(event) => updateSong({ tempo: Number(event.target.value) })} style={{ width: 60 }} /></label>
            <label>Bars <input type="number" min="1" max="16" value={song.barCount} onChange={(event) => updateSong({ barCount: Number(event.target.value) })} style={{ width: 52 }} /></label>
            <select value={song.scale} onChange={(event) => updateSong({ scale: event.target.value as ScaleType })}>
              {['chromatic', 'major', 'minor', 'pentatonic_major', 'pentatonic_minor', 'dorian', 'mixolydian', 'blues', 'whole_tone'].map((scale) => <option key={scale} value={scale}>{scale}</option>)}
            </select>
            <div style={{ flex: 1 }} />
            <button
              className={playing ? 'secondary-button' : 'primary-button'}
              type="button"
              onClick={playing ? handleStop : () => void handlePlay()}
              style={playing ? { borderColor: 'var(--color-accent)', color: 'var(--color-accent)' } : undefined}
            >
              {playing ? '■ Stop' : '▶ Play'}
            </button>
            <button className="secondary-button" type="button" onClick={() => void downloadWav()}>Export WAV</button>
          </div>

          {/* Grid + Tracks */}
          <div className="studio-layout">
            <div className="sequencer-grid" style={{ gridTemplateColumns: `60px repeat(${cells}, minmax(22px, 1fr))` }}>
              {song.tracks[0] ? notes.map((pitch) => (
                <div className="grid-row" style={{ display: 'contents' }} key={pitch}>
                  <div className="note-label">{midiToNoteName(pitch)}</div>
                  {Array.from({ length: cells }, (_, cell) => {
                    const active = song.tracks[0]?.notes.some((note) => note.pitch === pitch && note.startBeat === cell / 4);
                    const isBeatStart = cell % beatsPerBar === 0 && cell > 0;
                    return (
                      <button
                        key={cell}
                        className={`grid-cell${active ? ' active' : ''}${isBeatStart ? ' beat-marker' : ''}`}
                        type="button"
                        onClick={() => toggleNote(song.tracks[0].id, pitch, cell)}
                      />
                    );
                  })}
                </div>
              )) : <p className="muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-lg)' }}>トラックを追加してください</p>}
            </div>

            <aside className="track-panel">
              {song.tracks.map((track, index) => (
                <article className="specimen-card" key={track.id}>
                  <h3>Track {index + 1}</h3>
                  <select value={track.instrumentId} onChange={(event) => saveSong({ ...song, tracks: song.tracks.map((item) => item.id === track.id ? { ...item, instrumentId: event.target.value } : item) })}>
                    {instruments.map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.name}</option>)}
                  </select>
                  <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                      <input type="checkbox" checked={track.muted} onChange={(event) => saveSong({ ...song, tracks: song.tracks.map((item) => item.id === track.id ? { ...item, muted: event.target.checked } : item) })} />
                      Mute
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
                      <input type="checkbox" checked={track.solo} onChange={(event) => saveSong({ ...song, tracks: song.tracks.map((item) => item.id === track.id ? { ...item, solo: event.target.checked } : item) })} />
                      Solo
                    </label>
                  </div>
                  <div style={{ marginTop: 'var(--space-sm)' }}>
                    <span className="muted" style={{ fontSize: 'var(--font-xs)' }}>Vol {Math.round(track.volume * 100)}%</span>
                    <input type="range" min="0" max="1" step="0.01" value={track.volume} onChange={(event) => saveSong({ ...song, tracks: song.tracks.map((item) => item.id === track.id ? { ...item, volume: Number(event.target.value) } : item) })} />
                  </div>
                </article>
              ))}
              <button className="secondary-button" type="button" onClick={addTrack} disabled={!instruments.length || song.tracks.length >= 8} style={{ justifyContent: 'center' }}>
                + Add Track
              </button>
            </aside>
          </div>
        </>
      ) : (
        <article className="specimen-card empty-state">
          <h3>曲を作成</h3>
          <p className="muted">Workshopで楽器を作ってから、トラックに割り当てて作曲できます。</p>
        </article>
      )}
    </div>
  );
}
