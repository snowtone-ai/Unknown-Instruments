import { useState } from 'react';
import { AudioEngine } from './engine/AudioEngine';
import { GalleryPage } from './ui/pages/GalleryPage';
import { SettingsPage } from './ui/pages/SettingsPage';
import { StudioPage } from './ui/pages/StudioPage';
import { WorkshopPage } from './ui/pages/WorkshopPage';
import { Navigation, type PageKey } from './ui/common/Navigation';
import { AppStoreProvider } from './stores/appStore';
import { ErrorBoundary } from './ui/common/ErrorBoundary';

const pages: Record<PageKey, JSX.Element> = {
  gallery: <GalleryPage />,
  workshop: <WorkshopPage />,
  studio: <StudioPage />,
  settings: <SettingsPage />,
};

export default function App() {
  const [page, setPage] = useState<PageKey>('gallery');
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState('');

  async function startAudio() {
    try {
      setAudioError('');
      const engine = new AudioEngine();
      await engine.start();
      engine.dispose();
      setAudioReady(true);
    } catch (error) {
      setAudioError(error instanceof Error ? error.message : 'Audio start failed.');
    }
  }

  return (
    <AppStoreProvider>
      <main className="app-shell">
        {!audioReady ? (
          <div className="audio-start">
            <div className="ring-1" />
            <div className="ring-2" />
            <div className="ring-3" />
            <div className="audio-start-brand">
              <p className="eyebrow">Sound Artifact Lab</p>
              <h1>Unknown Instruments</h1>
            </div>
            <button className="start-button" type="button" onClick={() => void startAudio()}>
              <span>Tap to Begin</span>
            </button>
            <p className="audio-start-hint">ブラウザのオーディオを有効にします</p>
            {audioError ? <p className="status-line">{audioError}</p> : null}
          </div>
        ) : null}
        <header className="app-header">
          <div>
            <p className="eyebrow">Sound Artifact Lab</p>
            <h1>Unknown Instruments</h1>
          </div>
        </header>
        <section className="page-panel">
          <ErrorBoundary key={page}>{pages[page]}</ErrorBoundary>
        </section>
        <Navigation current={page} onChange={setPage} />
      </main>
    </AppStoreProvider>
  );
}
