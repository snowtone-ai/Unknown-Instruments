import type { StorageAdapter } from './storage';

const DB_NAME = 'unknown-instruments';
const STORE_NAME = 'records';
const TX_TIMEOUT_MS = 10_000;

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
    try {
      await tx(db, 'readwrite', (store) => store.put(data, key));
    } finally {
      db.close();
    }
  }

  async load<T>(key: string): Promise<T | null> {
    const db = await openDb();
    try {
      const result = await tx<T | undefined>(db, 'readonly', (store) => store.get(key));
      return result ?? null;
    } finally {
      db.close();
    }
  }

  async delete(key: string): Promise<void> {
    const db = await openDb();
    try {
      await tx(db, 'readwrite', (store) => store.delete(key));
    } finally {
      db.close();
    }
  }

  async listKeys(prefix: string): Promise<string[]> {
    const db = await openDb();
    try {
      const keys = await tx<IDBValidKey[]>(db, 'readonly', (store) => store.getAllKeys());
      return keys.filter((key): key is string => typeof key === 'string' && key.startsWith(prefix));
    } finally {
      db.close();
    }
  }
}

function tx<T>(db: IDBDatabase, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => { if (!settled) { settled = true; fn(); } };

    const transaction = db.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));

    const timeout = setTimeout(() => {
      settle(() => {
        try { transaction.abort(); } catch { /* already completed */ }
        reject(new Error('IndexedDB transaction timed out.'));
      });
    }, TX_TIMEOUT_MS);

    request.onsuccess = () => {
      // Wait for transaction.oncomplete to ensure data is committed
    };
    request.onerror = () => settle(() => { clearTimeout(timeout); reject(request.error ?? new Error('IndexedDB request failed.')); });

    transaction.oncomplete = () => settle(() => { clearTimeout(timeout); resolve(request.result); });
    transaction.onerror = () => settle(() => { clearTimeout(timeout); reject(transaction.error ?? new Error('IndexedDB transaction failed.')); });
    transaction.onabort = () => settle(() => { clearTimeout(timeout); reject(transaction.error ?? new Error('IndexedDB transaction aborted.')); });
  });
}
