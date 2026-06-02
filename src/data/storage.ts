export interface StorageAdapter {
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  listKeys(prefix: string): Promise<string[]>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async save<T>(key: string, data: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async load<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async listKeys(prefix: string): Promise<string[]> {
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
      await this.local.save(key, data);
      return;
    }
    const { IndexedDbStorageAdapter } = await import('./indexedDbStorage');
    await new IndexedDbStorageAdapter().save(key, data);
    localStorage.setItem(`${this.largePrefix}${key}`, '1');
  }

  async load<T>(key: string): Promise<T | null> {
    if (localStorage.getItem(`${this.largePrefix}${key}`) && 'indexedDB' in globalThis) {
      const { IndexedDbStorageAdapter } = await import('./indexedDbStorage');
      return new IndexedDbStorageAdapter().load<T>(key);
    }
    return this.local.load<T>(key);
  }

  async delete(key: string): Promise<void> {
    await this.local.delete(key);
    localStorage.removeItem(`${this.largePrefix}${key}`);
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
