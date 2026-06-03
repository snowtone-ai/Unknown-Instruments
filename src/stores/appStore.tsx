import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppSettings, Instrument, Song } from '../types';
import { storage } from '../data/storage';
import { sanitizeInstruments, sanitizeSettings, sanitizeSongs } from '../data/sanitize';
import { AppStoreContext, INSTRUMENTS_KEY, SETTINGS_KEY, SONGS_KEY, defaultSettings, type AppStore } from './appStoreModel';

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([
      safeLoad<Instrument[]>(INSTRUMENTS_KEY),
      safeLoad<Song[]>(SONGS_KEY),
      safeLoad<Partial<AppSettings>>(SETTINGS_KEY),
    ]).then(([loadedInstruments, loadedSongs, loadedSettings]) => {
      if (!alive) return;
      setInstruments(sanitizeInstruments(loadedInstruments));
      setSongs(sanitizeSongs(loadedSongs));
      setSettings(sanitizeSettings(loadedSettings, defaultSettings));
      setHydrated(true);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void storage.save(INSTRUMENTS_KEY, instruments).catch(logStorageError);
  }, [hydrated, instruments]);

  useEffect(() => {
    if (!hydrated) return;
    void storage.save(SONGS_KEY, songs).catch(logStorageError);
  }, [hydrated, songs]);

  useEffect(() => {
    if (!hydrated) return;
    void storage.save(SETTINGS_KEY, settings).catch(logStorageError);
  }, [hydrated, settings]);

  const saveInstrument = useCallback((instrument: Instrument) => {
    setInstruments((current) => {
      const exists = current.some((item) => item.id === instrument.id);
      return exists ? current.map((item) => item.id === instrument.id ? instrument : item) : [instrument, ...current];
    });
    setSelectedInstrumentId(instrument.id);
  }, []);

  const deleteInstrument = useCallback((id: string) => {
    setInstruments((current) => current.filter((item) => item.id !== id));
    setSelectedInstrumentId((current) => current === id ? null : current);
  }, []);

  const saveSong = useCallback((song: Song) => {
    setSongs((current) => current.some((item) => item.id === song.id)
      ? current.map((item) => item.id === song.id ? song : item)
      : [song, ...current]);
  }, []);

  const deleteSong = useCallback((id: string) => {
    setSongs((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, []);

  const replaceCollection = useCallback((next: { instruments: Instrument[]; songs: Song[]; settings?: Partial<AppSettings> }) => {
    setInstruments(next.instruments);
    setSongs(next.songs);
    setSettings((current) => ({ ...current, ...(next.settings ?? {}), apiKey: current.apiKey }));
  }, []);

  const resetAll = useCallback(() => {
    setInstruments([]);
    setSongs([]);
    setSelectedInstrumentId(null);
    setSettings((current) => ({ ...defaultSettings, apiKey: current.apiKey }));
  }, []);

  const value = useMemo<AppStore>(() => ({
    instruments,
    songs,
    settings,
    hydrated,
    selectedInstrumentId,
    setSelectedInstrumentId,
    saveInstrument,
    deleteInstrument,
    saveSong,
    deleteSong,
    updateSettings,
    replaceCollection,
    resetAll,
  }), [deleteInstrument, deleteSong, hydrated, instruments, replaceCollection, resetAll, saveInstrument, saveSong, selectedInstrumentId, settings, updateSettings, songs]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

function safeLoad<T>(key: string): Promise<T | null> {
  return storage.load<T>(key).catch((error) => {
    logStorageError(error);
    return null;
  });
}

function logStorageError(error: unknown): void {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn('[Unknown-Instruments] storage error:', error instanceof Error ? error.message : error);
  }
}
