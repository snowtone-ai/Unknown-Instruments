import type { Instrument } from '../../types';

export function LineageTree({ instruments }: { instruments: Instrument[] }) {
  if (!instruments.length) return null;
  return (
    <article className="specimen-card">
      <h3>Lineage</h3>
      <div className="lineage-list">
        {instruments.map((instrument) => (
          <div key={instrument.id}>
            <strong>{instrument.name}</strong>
            <span className="muted">gen {instrument.lineage.generation}</span>
            {instrument.lineage.parentId ? <span className="muted">← {findName(instruments, instrument.lineage.parentId)}</span> : null}
            {instrument.lineage.crossbreedParentIds ? <span className="muted">⨉ {instrument.lineage.crossbreedParentIds.map((id) => findName(instruments, id)).join(' + ')}</span> : null}
          </div>
        ))}
      </div>
    </article>
  );
}

function findName(instruments: Instrument[], id: string): string {
  return instruments.find((i) => i.id === id)?.name ?? id.slice(-6);
}
