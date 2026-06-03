export interface StorageAdapter {
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  listKeys(prefix: string): Promise<string[]>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async save<T>(key: string, data: T): Promise<void> {
    if (!('localStorage' in globalThis)) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
        throw new Error(`localStorage quota exceeded while saving "${key}".`);
      }
      throw error;
    }
  }

  async load<T>(key: string): Promise<T | null> {
    if (!('localStorage' in globalThis)) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!('localStorage' in globalThis)) return;
    localStorage.removeItem(key);
  }

  async listKeys(prefix: string): Promise<string[]> {
    if (!('localStorage' in globalThis)) return [];
    return Object.keys(localStorage).filter((key) => key.startsWith(prefix));
  }
}

export class HybridStorageAdapter implements StorageAdapter {
  private readonly local = new LocalStorageAdapter();
  private readonly largePrefix = 'idb:';
  private readonly thresholdBytes = 4_500_000;

  async save<T>(key: string, data: T): Promise<void> {
    const raw = JSON.stringify(data);
    if (raw.length < this.thresholdBytes || !('indexedDB' in globalThis)) {
      try {
        await this.local.save(key, data);
        if ('localStorage' in globalThis) localStorage.removeItem(`${this.largePrefix}${key}`);
        if ('indexedDB' in globalThis) {
          const { IndexedDbStorageAdapter } = await import('./indexedDbStorage');
          await new IndexedDbStorageAdapter().delete(key).catch(() => undefined);
        }
        return;
      } catch (error) {
        if (!('indexedDB' in globalThis)) throw error;
        // localStorage full — fall through to IndexedDB
      }
    }
    if (!('indexedDB' in globalThis)) {
      await this.local.save(key, data);
      return;
    }
    const { IndexedDbStorageAdapter } = await import('./indexedDbStorage');
    await new IndexedDbStorageAdapter().save(key, data);
    try {
      if ('localStorage' in globalThis) localStorage.setItem(`${this.largePrefix}${key}`, '1');
    } catch {
      // marker write failed (quota), but data is safe in IndexedDB
    }
  }

  async load<T>(key: string): Promise<T | null> {
    if ('localStorage' in globalThis && localStorage.getItem(`${this.largePrefix}${key}`) && 'indexedDB' in globalThis) {
      const { IndexedDbStorageAdapter } = await import('./indexedDbStorage');
      try {
        return await new IndexedDbStorageAdapter().load<T>(key);
      } catch {
        localStorage.removeItem(`${this.largePrefix}${key}`);
      }
    }
    return this.local.load<T>(key);
  }

  async delete(key: string): Promise<void> {
    await this.local.delete(key);
    if ('localStorage' in globalThis) localStorage.removeItem(`${this.largePrefix}${key}`);
    if ('indexedDB' in globalThis) {
      const { IndexedDbStorageAdapter } = await import('./indexedDbStorage');
      await new IndexedDbStorageAdapter().delete(key);
    }
  }

  async listKeys(prefix: string): Promise<string[]> {
    const keys = await this.local.listKeys(prefix);
    if (!('indexedDB' in globalThis)) return keys;
    const { IndexedDbStorageAdapter } = await import('./indexedDbStorage');
    return [...new Set([...keys, ...await new IndexedDbStorageAdapter().listKeys(prefix)])];
  }
}

export const storage = new HybridStorageAdapter();
