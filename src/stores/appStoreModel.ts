import { createContext } from 'react';
import type { AppSettings, Instrument, Song } from '../types';
import { createId } from '../utils/id';

export const INSTRUMENTS_KEY = 'ui:collection:instruments';
export const SONGS_KEY = 'ui:collection:songs';
export const SETTINGS_KEY = 'ui:settings';

export const defaultSettings: AppSettings = {
  apiKey: '',
  decayEnabled: false,
  timeSensitivityEnabled: false,
  defaultScale: 'pentatonic_major',
  language: 'ja',
};

export function createEmptySong(name = 'Untitled Song', instrumentId = ''): Song {
  const now = Date.now();
  return {
    id: createId('song'),
    name,
    tempo: 120,
    scale: 'pentatonic_major',
    timeSignature: [4, 4],
    barCount: 4,
    tracks: instrumentId
      ? [{ id: createId('track'), instrumentId, notes: [], volume: 0.8, muted: false, solo: false }]
      : [],
    loop: true,
    decayMode: false,
    decayStartedAt: null,
    decayRatePerDay: 0.03,
    createdAt: now,
  };
}

export interface AppStore {
  instruments: Instrument[];
  songs: Song[];
  settings: AppSettings;
  hydrated: boolean;
  selectedInstrumentId: string | null;
  setSelectedInstrumentId: (id: string | null) => void;
  saveInstrument: (instrument: Instrument) => void;
  deleteInstrument: (id: string) => void;
  saveSong: (song: Song) => void;
  deleteSong: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  replaceCollection: (next: { instruments: Instrument[]; songs: Song[]; settings?: Partial<AppSettings> }) => void;
  resetAll: () => void;
}

export const AppStoreContext = createContext<AppStore | null>(null);
