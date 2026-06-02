import { useAppStore } from '../../stores/appStoreHooks';
import { InstrumentTile } from '../gallery/InstrumentTile';
import { LineageTree } from '../gallery/LineageTree';
import { RuinsView } from '../gallery/RuinsView';

export function GalleryPage() {
  const { instruments, deleteInstrument, setSelectedInstrumentId } = useAppStore();
  const living = instruments.filter((instrument) => !instrument.decay.isDead);
  const ruins = instruments.filter((instrument) => instrument.decay.isDead);

  return (
    <div>
      <h2>Gallery</h2>
      {!instruments.length ? <article className="specimen-card empty-state"><h3>まだ標本はありません</h3><p className="muted">Workshopで最初の楽器を生成してください。</p></article> : null}
      <h3>Living Instruments</h3>
      <div className="card-grid">
        {living.map((instrument) => <InstrumentTile key={instrument.id} instrument={instrument} onOpen={() => setSelectedInstrumentId(instrument.id)} onDelete={() => deleteInstrument(instrument.id)} />)}
      </div>
      <h3>Ruins</h3>
      <RuinsView ruins={ruins} onOpen={setSelectedInstrumentId} onDelete={deleteInstrument} />
      <LineageTree instruments={instruments} />
    </div>
  );
}
