import type { StorageAdapter } from './storage';

const DB_NAME = 'unknown-instruments';
const STORE_NAME = 'records';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed.'));
    request.onsuccess = () => resolve(request.result);
  });
}

export class IndexedDbStorageAdapter implements StorageAdapter {
  async save<T>(key: string, data: T): Promise<void> {
    const db = await openDb();
    await tx(db, 'readwrite', (store) => store.put(data, key));
    db.close();
  }

  async load<T>(key: string): Promise<T | null> {
    const db = await openDb();
    const result = await tx<T | undefined>(db, 'readonly', (store) => store.get(key));
    db.close();
    return result ?? null;
  }

  async delete(key: string): Promise<void> {
    const db = await openDb();
    await tx(db, 'readwrite', (store) => store.delete(key));
    db.close();
  }

  async listKeys(prefix: string): Promise<string[]> {
    const db = await openDb();
    const keys = await tx<IDBValidKey[]>(db, 'readonly', (store) => store.getAllKeys());
    db.close();
    return keys.filter((key): key is string => typeof key === 'string' && key.startsWith(prefix));
  }
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
    request.onsuccess = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
  });
}
