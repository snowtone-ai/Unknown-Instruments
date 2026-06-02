import { useState } from 'react';
import { createBackup, backupFileName, estimateBytes, mergeBackup, parseBackup } from '../../data/exportImport';
import { useAppStore } from '../../stores/appStoreHooks';
import type { ScaleType } from '../../types';

const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

export function SettingsPage() {
  const { instruments, songs, settings, updateSettings, replaceCollection, resetAll } = useAppStore();
  const [dataStatus, setDataStatus] = useState('');
  const apiKeySource = settings.apiKey ? 'Settings local key' : ((import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ? '.env.local VITE key' : 'Not configured');
  const bytes = estimateBytes({ instruments, songs, settings: { ...settings, apiKey: undefined } });

  function exportJson() {
    const backup = createBackup(instruments, songs, settings);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = backupFileName();
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File | null) {
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error('20MB以下のバックアップJSONを選択してください。');
      const backup = parseBackup(await file.text());
      replaceCollection(mergeBackup({ instruments, songs }, backup));
      setDataStatus(`Import complete: ${backup.instruments.length} instruments / ${backup.songs.length} songs`);
    } catch (error) {
      setDataStatus(error instanceof Error ? error.message : 'Importに失敗しました。');
    }
  }

  return (
    <div>
      <h2>Settings</h2>
      <div className="card-grid">
        {/* Gemini API */}
        <article className="specimen-card">
          <h3>Gemini API</h3>
          <p className="muted" style={{ marginBottom: 'var(--space-md)' }}>Source: {apiKeySource}</p>
          <label className="form-row">
            <span>API Key</span>
            <input className="input" type="password" value={settings.apiKey} onChange={(event) => updateSettings({ apiKey: event.target.value })} placeholder="AIza..." />
          </label>
        </article>

        {/* Playback */}
        <article className="specimen-card">
          <h3>Playback</h3>
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" checked={settings.decayEnabled} onChange={(event) => updateSettings({ decayEnabled: event.target.checked })} />
              Decay（演奏による劣化）
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)' }}>
              <input type="checkbox" checked={settings.timeSensitivityEnabled} onChange={(event) => updateSettings({ timeSensitivityEnabled: event.target.checked })} />
              Time Sensitivity（時間感応）
            </label>
            <label className="form-row">
              <span>Default Scale</span>
              <select value={settings.defaultScale} onChange={(event) => updateSettings({ defaultScale: event.target.value as ScaleType })}>
                {['chromatic', 'major', 'minor', 'pentatonic_major', 'pentatonic_minor', 'dorian', 'mixolydian', 'blues', 'whole_tone'].map((scale) => <option key={scale} value={scale}>{scale}</option>)}
              </select>
            </label>
          </div>
        </article>

        {/* Data */}
        <article className="specimen-card">
          <h3>Data</h3>
          <div style={{ display: 'grid', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
            <span className="muted">Instruments: {instruments.length} / Songs: {songs.length}</span>
            <span className="muted">Storage: {(bytes / 1024).toFixed(1)} KB</span>
          </div>
          <div className="button-row">
            <button className="secondary-button" type="button" onClick={exportJson}>Export</button>
            <label className="secondary-button file-button">
              Import
              <input type="file" accept="application/json" onChange={(event) => { void importJson(event.target.files?.[0] ?? null); event.currentTarget.value = ''; }} />
            </label>
          </div>
          {dataStatus ? <p className="status-line">{dataStatus}</p> : null}
          <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
            <button className="secondary-button danger" type="button" onClick={() => confirm('全データを削除しますか？この操作は取り消せません。') && resetAll()}>
              Delete All Data
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
