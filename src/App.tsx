import { useState } from 'react';
import { AudioEngine } from './engine/AudioEngine';
import { GalleryPage } from './ui/pages/GalleryPage';
import { SettingsPage } from './ui/pages/SettingsPage';
import { StudioPage } from './ui/pages/StudioPage';
import { WorkshopPage } from './ui/pages/WorkshopPage';
import { Navigation, type PageKey } from './ui/common/Navigation';
import { AppStoreProvider } from './stores/appStore';

const pages: Record<PageKey, JSX.Element> = {
  gallery: <GalleryPage />,
  workshop: <WorkshopPage />,
  studio: <StudioPage />,
  settings: <SettingsPage />,
};

export default function App() {
  const [page, setPage] = useState<PageKey>('gallery');
  const [audioReady, setAudioReady] = useState(false);

  async function startAudio() {
    const engine = new AudioEngine();
    await engine.start();
    engine.dispose();
    setAudioReady(true);
  }

  return (
    <AppStoreProvider>
      <main className="app-shell">
        {!audioReady ? (
          <div className="audio-start">
            <button className="primary-button" type="button" onClick={() => void startAudio()}>Start Audio</button>
          </div>
        ) : null}
        <header className="app-header">
          <div>
            <p className="eyebrow">Local-only sound artifact lab</p>
            <h1>Unknown Instruments</h1>
          </div>
        </header>
        <section className="page-panel">{pages[page]}</section>
        <Navigation current={page} onChange={setPage} />
      </main>
    </AppStoreProvider>
  );
}
