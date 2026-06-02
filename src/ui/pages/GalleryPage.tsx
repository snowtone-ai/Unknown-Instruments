import { useAppStore } from '../../stores/appStoreHooks';
import { InstrumentTile } from '../gallery/InstrumentTile';
import { LineageTree } from '../gallery/LineageTree';
import { RuinsView } from '../gallery/RuinsView';

export function GalleryPage() {
  const { instruments, deleteInstrument, setSelectedInstrumentId } = useAppStore();
  const living = instruments.filter((instrument) => !instrument.decay.isDead);
  const ruins = instruments.filter((instrument) => instrument.decay.isDead);

  if (!instruments.length) {
    return (
      <div>
        <h2>Gallery</h2>
        <article className="specimen-card empty-state">
          <h3>まだ標本はありません</h3>
          <p className="muted">Workshopで音のイメージを入力して、最初の楽器を生成してください。</p>
        </article>
      </div>
    );
  }

  return (
    <div>
      <h2>Gallery</h2>

      {living.length > 0 && (
        <section>
          <div className="section-header">
            <h3>Living Instruments</h3>
            <span className="count">{living.length}</span>
          </div>
          <div className="card-grid">
            {living.map((instrument) => (
              <InstrumentTile
                key={instrument.id}
                instrument={instrument}
                onOpen={() => setSelectedInstrumentId(instrument.id)}
                onDelete={() => deleteInstrument(instrument.id)}
              />
            ))}
          </div>
        </section>
      )}

      {ruins.length > 0 && (
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <div className="section-header">
            <h3>Ruins</h3>
            <span className="count">{ruins.length}</span>
          </div>
          <RuinsView ruins={ruins} onOpen={setSelectedInstrumentId} onDelete={deleteInstrument} />
        </section>
      )}

      {instruments.length > 1 && (
        <section style={{ marginTop: 'var(--space-xl)' }}>
          <LineageTree instruments={instruments} />
        </section>
      )}
    </div>
  );
}
