import { useEffect, useMemo, useRef, useState } from 'react';
import { generateLocalCrossbreed } from '../../ai/crossbreedGenerator';
import { generateFallbackInstrument } from '../../ai/fallbackGenerator';
import { generateInstrument } from '../../ai/GeminiClient';
import { createSuccessionText } from '../../ai/reverseGenerator';
import { markPlayed } from '../../engine/DecayEngine';
import { AudioEngine } from '../../engine/AudioEngine';
import { applyTimeSensitivity } from '../../engine/TimeSensitivity';
import type { Instrument, InteractionType } from '../../types';
import { calculateDecayFactor } from '../../utils/decay';
import { InstrumentRenderer } from '../../visual/InstrumentRenderer';
import { useAppStore } from '../../stores/appStoreHooks';
import { ParameterPanel } from '../workshop/ParameterPanel';
import { PlayUI } from '../workshop/PlayUI';
import { SnapshotPanel } from '../workshop/SnapshotPanel';

export function WorkshopPage() {
  const [text, setText] = useState('夜明け前の空気が割れるような音');
  const [status, setStatus] = useState('');
  const [forceKeys, setForceKeys] = useState(false);
  const [crossbreedId, setCrossbreedId] = useState('');
  const engineRef = useRef<AudioEngine | null>(null);
  const { instruments, selectedInstrumentId, settings, saveInstrument } = useAppStore();
  const selectedInstrument = useMemo(
    () => instruments.find((instrument) => instrument.id === selectedInstrumentId) ?? instruments[0],
    [instruments, selectedInstrumentId],
  );

  useEffect(() => () => engineRef.current?.dispose(), []);

  async function handleGenerate(sourceText = text) {
    if (!sourceText.trim()) {
      setStatus('音のイメージを入力してください。');
      return;
    }
    setStatus('楽器を生成しています。');
    try {
      const instrument = await generateInstrument(sourceText, settings.apiKey);
      saveInstrument(instrument);
      setStatus('Geminiで楽器を生成しました。');
    } catch (error) {
      const fallback = generateFallbackInstrument(sourceText);
      saveInstrument(fallback);
      setStatus(error instanceof Error ? `Gemini生成に失敗したためローカル生成を使いました: ${error.message}` : 'ローカル生成を使いました。');
    }
  }

  async function play(note: string, duration = '8n', velocity = 0.8) {
    if (!selectedInstrument) return;
    if (selectedInstrument.decay.isDead) {
      setStatus('この楽器は遺跡化しているため通常演奏できません。');
      return;
    }
    const engine = engineRef.current ?? new AudioEngine();
    engineRef.current = engine;
    await engine.start();
    const timed = applyTimeSensitivity(selectedInstrument.synth, selectedInstrument.filter, settings.timeSensitivityEnabled);
    engine.loadInstrument({ ...selectedInstrument, synth: timed.synth, filter: timed.filter });
    engine.trigger(note, duration, velocity);
    const updated = markPlayed(selectedInstrument, settings.decayEnabled);
    saveInstrument(updated);
  }

  function updateInstrument(instrument: Instrument) {
    saveInstrument(instrument);
  }

  function createChild() {
    if (!selectedInstrument) return;
    void handleGenerate(createSuccessionText(selectedInstrument));
  }

  function crossbreed() {
    if (!selectedInstrument || !crossbreedId) return;
    const other = instruments.find((instrument) => instrument.id === crossbreedId);
    if (!other) return;
    const child = generateLocalCrossbreed(selectedInstrument, other);
    saveInstrument(child);
    saveInstrument({ ...selectedInstrument, lineage: { ...selectedInstrument.lineage, childIds: [...selectedInstrument.lineage.childIds, child.id] } });
    saveInstrument({ ...other, lineage: { ...other.lineage, childIds: [...other.lineage.childIds, child.id] } });
    setStatus('交配から子楽器を作成しました。');
  }

  return (
    <div className="workshop-layout">
      <section>
        <h2>Workshop</h2>
        <label className="form-row">
          <span>Sound image</span>
          <textarea className="textarea" value={text} onChange={(event) => setText(event.target.value)} rows={4} maxLength={500} />
        </label>
        <div className="button-row">
          <button className="primary-button" type="button" onClick={() => void handleGenerate()}>Generate Instrument</button>
          {selectedInstrument ? <button className="secondary-button" type="button" onClick={() => void handleGenerate(selectedInstrument.originText)}>Regenerate</button> : null}
        </div>
        {status ? <p className="status-line">{status}</p> : null}
      </section>

      {selectedInstrument ? (
        <section className="instrument-detail">
          <InstrumentRenderer instrument={selectedInstrument} />
          <article className="specimen-card">
            <h3>{selectedInstrument.name}</h3>
            <p className="muted">{selectedInstrument.nameEtymology}</p>
            <p>{selectedInstrument.description}</p>
            <dl className="fact-list">
              <div><dt>Materials</dt><dd>{selectedInstrument.materials.join(', ')}</dd></div>
              <div><dt>Shape</dt><dd>{selectedInstrument.shape}</dd></div>
              <div><dt>Method</dt><dd>{selectedInstrument.playingMethod}</dd></div>
              <div><dt>Life</dt><dd>{selectedInstrument.decay.playCount}/{selectedInstrument.decay.lifespan} ({Math.round(calculateDecayFactor(selectedInstrument.decay.playCount, selectedInstrument.decay.lifespan) * 100)}%)</dd></div>
            </dl>
            <div className="button-row">
              <button className="secondary-button" type="button" onClick={() => setForceKeys((value) => !value)}>Keyboard fallback</button>
              <button className="secondary-button" type="button" onClick={() => void play('C4', '4n', 0.7)}>Preview</button>
            </div>
            <PlayUI instrument={selectedInstrument} forcedType={forceKeys ? 'keys' as InteractionType : undefined} onPlay={(note, duration, velocity) => void play(note, duration, velocity)} />
            <ParameterPanel instrument={selectedInstrument} onChange={updateInstrument} />
            <SnapshotPanel instrument={selectedInstrument} onChange={updateInstrument} />
            <div className="button-row">
              <button className="secondary-button" type="button" disabled={selectedInstrument.decay.playCount / selectedInstrument.decay.lifespan < 0.5} onClick={createChild}>Generation succession</button>
              <select value={crossbreedId} onChange={(event) => setCrossbreedId(event.target.value)}>
                <option value="">Crossbreed with...</option>
                {instruments.filter((instrument) => instrument.id !== selectedInstrument.id).map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.name}</option>)}
              </select>
              <button className="secondary-button" type="button" disabled={!crossbreedId} onClick={crossbreed}>Crossbreed</button>
            </div>
          </article>
        </section>
      ) : (
        <article className="specimen-card empty-state">
          <h3>最初の楽器を生成</h3>
          <p className="muted">音のイメージを入力して、架空の楽器を作成してください。</p>
        </article>
      )}
    </div>
  );
}
