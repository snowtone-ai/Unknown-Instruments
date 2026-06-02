import type { Instrument } from '../../types';
import { calculateDecayFactor } from '../../utils/decay';
import { InstrumentRenderer } from '../../visual/InstrumentRenderer';

export function InstrumentTile({ instrument, onOpen, onDelete }: { instrument: Instrument; onOpen: () => void; onDelete: () => void }) {
  const life = instrument.decay.isDead ? 0 : 1 - instrument.decay.playCount / instrument.decay.lifespan;
  return (
    <article className="specimen-card tile-card">
      <button type="button" className="tile-open" onClick={onOpen}>
        <InstrumentRenderer instrument={instrument} compact />
        <h3>{instrument.name}</h3>
      </button>
      <p className="muted">Gen {instrument.lineage.generation} / {instrument.visual.template}</p>
      <div className="life-bar"><span style={{ width: `${Math.max(0, life) * 100}%` }} /></div>
      <p className="muted">{Math.round(calculateDecayFactor(instrument.decay.playCount, instrument.decay.lifespan) * 100)}% decay</p>
      <button className="secondary-button danger" type="button" onClick={onDelete}>Delete</button>
    </article>
  );
}
