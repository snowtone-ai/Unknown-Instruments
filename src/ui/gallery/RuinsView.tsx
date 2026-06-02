import type { Instrument } from '../../types';
import { InstrumentTile } from './InstrumentTile';

export function RuinsView({ ruins, onOpen, onDelete }: { ruins: Instrument[]; onOpen: (id: string) => void; onDelete: (id: string) => void }) {
  if (!ruins.length) {
    return <p className="muted">遺跡化した楽器はまだありません。</p>;
  }
  return <div className="card-grid ruins-grid">{ruins.map((instrument) => <InstrumentTile key={instrument.id} instrument={instrument} onOpen={() => onOpen(instrument.id)} onDelete={() => onDelete(instrument.id)} />)}</div>;
}
