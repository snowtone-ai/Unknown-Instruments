import { createBackup, backupFileName, estimateBytes, mergeBackup, parseBackup } from '../../data/exportImport';
import { useAppStore } from '../../stores/appStoreHooks';
import type { ScaleType } from '../../types';

export function SettingsPage() {
  const { instruments, songs, settings, updateSettings, replaceCollection, resetAll } = useAppStore();
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
    const backup = parseBackup(await file.text());
    replaceCollection(mergeBackup({ instruments, songs }, backup));
  }

  return (
    <div>
      <h2>Settings</h2>
      <div className="card-grid">
        <article className="specimen-card">
          <h3>Gemini API</h3>
          <p className="muted">Source: {apiKeySource}</p>
          <label className="form-row">
            <span>Local API key</span>
            <input className="input" type="password" value={settings.apiKey} onChange={(event) => updateSettings({ apiKey: event.target.value })} placeholder="AIza..." />
          </label>
        </article>
        <article className="specimen-card">
          <h3>Decay</h3>
          <label><input type="checkbox" checked={settings.decayEnabled} onChange={(event) => updateSettings({ decayEnabled: event.target.checked })} /> Decay</label>
          <label><input type="checkbox" checked={settings.timeSensitivityEnabled} onChange={(event) => updateSettings({ timeSensitivityEnabled: event.target.checked })} /> Time sensitivity</label>
          <label className="form-row">
            <span>Default scale</span>
            <select value={settings.defaultScale} onChange={(event) => updateSettings({ defaultScale: event.target.value as ScaleType })}>
              {['chromatic', 'major', 'minor', 'pentatonic_major', 'pentatonic_minor', 'dorian', 'mixolydian', 'blues', 'whole_tone'].map((scale) => <option key={scale} value={scale}>{scale}</option>)}
            </select>
          </label>
        </article>
        <article className="specimen-card">
          <h3>Data</h3>
          <p className="muted">Instruments: {instruments.length} / Songs: {songs.length}</p>
          <p className="muted">Storage estimate: {(bytes / 1024).toFixed(1)} KB</p>
          <div className="button-row">
            <button className="secondary-button" type="button" onClick={exportJson}>Export JSON</button>
            <label className="secondary-button file-button">Import JSON<input type="file" accept="application/json" onChange={(event) => void importJson(event.target.files?.[0] ?? null)} /></label>
            <button className="secondary-button danger" type="button" onClick={() => confirm('全データを削除しますか？') && resetAll()}>Delete all</button>
          </div>
        </article>
      </div>
    </div>
  );
}
