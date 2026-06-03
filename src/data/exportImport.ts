import type { AppBackup, AppSettings, Instrument, Song } from '../types';
import { sanitizeBackupSettings, sanitizeInstruments, sanitizeSongs } from './sanitize';

export function createBackup(instruments: Instrument[], songs: Song[], settings: AppSettings): AppBackup {
  return {
    version: 1,
    exportedAt: Date.now(),
    instruments,
    songs,
    settings: {
      decayEnabled: settings.decayEnabled,
      timeSensitivityEnabled: settings.timeSensitivityEnabled,
      defaultScale: settings.defaultScale,
      language: settings.language,
    },
  };
}

export function backupFileName(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `unknown-instruments-backup-${stamp}.json`;
}

export function parseBackup(raw: string): AppBackup {
  if (raw.length > 50_000_000) throw new Error('バックアップファイルが大きすぎます (50MB上限)。');
  let parsed: Partial<AppBackup>;
  try {
    parsed = JSON.parse(raw) as Partial<AppBackup>;
  } catch {
    throw new Error('JSONの解析に失敗しました。正しいバックアップファイルを選択してください。');
  }
  if (parsed.version !== 1 || !Array.isArray(parsed.instruments) || !Array.isArray(parsed.songs) || !parsed.settings) {
    throw new Error('Unknown Instruments のバックアップJSONではありません。');
  }
  return {
    version: 1,
    exportedAt: typeof parsed.exportedAt === 'number' && Number.isFinite(parsed.exportedAt) ? parsed.exportedAt : Date.now(),
    instruments: sanitizeInstruments(parsed.instruments),
    songs: sanitizeSongs(parsed.songs),
    settings: sanitizeBackupSettings(parsed.settings, {
      decayEnabled: false,
      timeSensitivityEnabled: false,
      defaultScale: 'pentatonic_major',
      language: 'ja',
    }),
  };
}

export function mergeBackup(
  current: { instruments: Instrument[]; songs: Song[] },
  backup: AppBackup,
): { instruments: Instrument[]; songs: Song[]; settings: AppBackup['settings'] } {
  const instrumentMap = new Map(current.instruments.map((instrument) => [instrument.id, instrument]));
  const songMap = new Map(current.songs.map((song) => [song.id, song]));
  for (const instrument of backup.instruments) instrumentMap.set(instrument.id, instrument);
  for (const song of backup.songs) songMap.set(song.id, song);
  return {
    instruments: [...instrumentMap.values()],
    songs: [...songMap.values()],
    settings: backup.settings,
  };
}

export function estimateBytes(value: unknown): number {
  return new Blob([JSON.stringify(value)]).size;
}
