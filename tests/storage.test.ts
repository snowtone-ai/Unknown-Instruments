import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageAdapter } from '../src/data/storage';

describe('LocalStorageAdapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('drops malformed JSON instead of throwing during load', async () => {
    const backing: Record<string, string> = { broken: '{bad json' };
    vi.stubGlobal('localStorage', {
      setItem: (key: string, value: string) => { backing[key] = value; },
      getItem: (key: string) => backing[key] ?? null,
      removeItem: (key: string) => { delete backing[key]; },
    });

    const adapter = new LocalStorageAdapter();

    await expect(adapter.load('broken')).resolves.toBeNull();
    expect(backing.broken).toBeUndefined();
  });
});
