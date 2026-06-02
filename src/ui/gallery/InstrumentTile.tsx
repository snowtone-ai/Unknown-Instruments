import type { Instrument } from '../../types';
import { calculateDecayFactor } from '../../utils/decay';
import { InstrumentRenderer } from '../../visual/InstrumentRenderer';

export function InstrumentTile({ instrument, onOpen, onDelete }: { instrument: Instrument; onOpen: () => void; onDelete: () => void }) {
  const life = instrument.decay.isDead ? 0 : 1 - instrument.decay.playCount / instrument.decay.lifespan;
  const decayPercent = Math.round(calculateDecayFactor(instrument.decay.playCount, instrument.decay.lifespan) * 100);

  return (
    <article className="specimen-card tile-card">
      <button type="button" className="tile-open" onClick={onOpen}>
        <InstrumentRenderer instrument={instrument} compact />
        <h3>{instrument.name}</h3>
        <span className="muted" style={{ fontSize: 'var(--font-xs)', textTransform: 'capitalize' }}>{instrument.visual.template}</span>
      </button>
      <div className="tile-meta">
        <div className="life-bar"><span style={{ width: `${Math.max(0, life) * 100}%` }} /></div>
      </div>
      <div className="tile-footer">
        <span className="muted">Gen {instrument.lineage.generation} · {decayPercent}% decay</span>
        <button className="tile-delete" type="button" onClick={(event) => { event.stopPropagation(); if (confirm('この楽器を削除しますか？')) onDelete(); }}>Delete</button>
      </div>
    </article>
  );
}
