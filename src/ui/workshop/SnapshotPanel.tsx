import type { Instrument } from '../../types';
import { createId } from '../../utils/id';

export function SnapshotPanel({ instrument, onChange }: { instrument: Instrument; onChange: (instrument: Instrument) => void }) {
  function saveSnapshot() {
    const label = `Snapshot ${instrument.snapshots.length + 1}`;
    onChange({
      ...instrument,
      snapshots: [{
        id: createId('snap'),
        label,
        synth: instrument.synth,
        filter: instrument.filter,
        effects: instrument.effects,
        visual: instrument.visual,
        playCountAtCapture: instrument.decay.playCount,
        createdAt: Date.now(),
      }, ...instrument.snapshots],
    });
  }

  return (
    <div>
      <button type="button" className="secondary-button" onClick={saveSnapshot}>Save snapshot</button>
      <div className="snapshot-list">
        {instrument.snapshots.map((snapshot) => (
          <button key={snapshot.id} type="button" onClick={() => onChange({ ...instrument, synth: snapshot.synth, filter: snapshot.filter, effects: snapshot.effects, visual: snapshot.visual })}>
            {snapshot.label} ({snapshot.playCountAtCapture})
          </button>
        ))}
      </div>
    </div>
  );
}
