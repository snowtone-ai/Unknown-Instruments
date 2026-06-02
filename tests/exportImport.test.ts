import { describe, expect, it } from 'vitest';
import { createBackup, mergeBackup, parseBackup } from '../src/data/exportImport';
import type { AppSettings, Instrument } from '../src/types';
import { generateFallbackInstrument } from '../src/ai/fallbackGenerator';

describe('exportImport', () => {
  it('excludes api keys from exported settings', () => {
    const settings: AppSettings = {
      apiKey: 'secret',
      decayEnabled: true,
      timeSensitivityEnabled: false,
      defaultScale: 'major',
      language: 'ja',
    };
    const backup = createBackup([], [], settings);
    expect(JSON.stringify(backup)).not.toContain('secret');
  });

  it('parses and merges backups by id', () => {
    const instrument = generateFallbackInstrument('glass rain') as Instrument;
    const backup = parseBackup(JSON.stringify(createBackup([instrument], [], {
      apiKey: '',
      decayEnabled: false,
      timeSensitivityEnabled: false,
      defaultScale: 'major',
      language: 'ja',
    })));
    const merged = mergeBackup({ instruments: [instrument], songs: [] }, backup);
    expect(merged.instruments).toHaveLength(1);
  });
});
