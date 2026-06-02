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

  it('sanitizes imported backup records before merge', () => {
    const backup = parseBackup(JSON.stringify({
      version: 1,
      exportedAt: Date.now(),
      instruments: [{
        id: 'inst-import',
        name: 'Imported',
        materials: ['glass'],
        synth: { type: 'bad', attack: Number.NaN, decay: -1, sustain: 9, release: 99, baseFrequency: 0 },
        filter: { type: 'bad', frequency: 999999, q: -1 },
        visual: { template: 'bad', primaryColor: 'url(http://bad)', accentColor: '#abc', complexity: 99, elementCount: 99 },
        interaction: { type: 'bad' },
        decay: { lifespan: 1, playCount: 999, decayVectors: [{ paramPath: '__proto__.x', direction: 1, weight: 99 }] },
        lineage: { generation: 0 },
      }],
      songs: [{
        id: 'song-import',
        name: 'Song',
        tempo: 999,
        scale: 'bad',
        timeSignature: [99, 99],
        barCount: 999,
        tracks: [{ id: 'track-import', instrumentId: 'inst-import', volume: 99, notes: [{ pitch: -99, startBeat: -1, duration: 99, velocity: 99 }] }],
      }],
      settings: {
        decayEnabled: true,
        timeSensitivityEnabled: true,
        defaultScale: 'bad',
        language: 'bad',
        apiKey: 'must-not-import',
      },
    }));

    expect(backup.instruments[0].synth.type).toBe('fm');
    expect(backup.instruments[0].visual.primaryColor).toBe('#6f6654');
    expect(backup.instruments[0].decay.decayVectors[0].paramPath).toBe('filter.frequency');
    expect(backup.songs[0].tempo).toBe(240);
    expect(backup.songs[0].tracks[0].notes[0].pitch).toBe(24);
    expect(JSON.stringify(backup.settings)).not.toContain('must-not-import');
  });
});
