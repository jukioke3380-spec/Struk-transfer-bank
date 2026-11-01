import { ScanResult, TransferReceipt } from '../types';

const DB_NAME = 'LensaTeks_PWA_DB';
const DB_VERSION = 2;
const STORE_SCANS = 'scans';
const STORE_RECEIPTS = 'transfer_receipts';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_SCANS)) {
        const store = db.createObjectStore(STORE_SCANS, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('title', 'title', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_RECEIPTS)) {
        const receiptStore = db.createObjectStore(STORE_RECEIPTS, { keyPath: 'id' });
        receiptStore.createIndex('createdAt', 'createdAt', { unique: false });
        receiptStore.createIndex('refNumber', 'refNumber', { unique: false });
        receiptStore.createIndex('recipientName', 'recipientName', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Scans Table Methods ---
export async function getAllScans(): Promise<ScanResult[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SCANS, 'readonly');
      const store = tx.objectStore(STORE_SCANS);
      const index = store.index('createdAt');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = (request.result as ScanResult[]) || [];
        resolve(results.reverse());
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get scans from IndexedDB:', err);
    return [];
  }
}

export async function saveScan(scan: ScanResult): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCANS, 'readwrite');
    const store = tx.objectStore(STORE_SCANS);
    const request = store.put(scan);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteScan(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCANS, 'readwrite');
    const store = tx.objectStore(STORE_SCANS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllScans(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SCANS, 'readwrite');
    const store = tx.objectStore(STORE_SCANS);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- Transfer Receipts Table Methods ---
export async function getAllReceipts(): Promise<TransferReceipt[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECEIPTS, 'readonly');
      const store = tx.objectStore(STORE_RECEIPTS);
      const index = store.index('createdAt');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = (request.result as TransferReceipt[]) || [];
        resolve(results.reverse());
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get receipts from IndexedDB:', err);
    return [];
  }
}

export async function saveReceipt(receipt: TransferReceipt): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite');
    const store = tx.objectStore(STORE_RECEIPTS);
    const request = store.put(receipt);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteReceipt(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite');
    const store = tx.objectStore(STORE_RECEIPTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllReceipts(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_RECEIPTS, 'readwrite');
    const store = tx.objectStore(STORE_RECEIPTS);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function exportReceiptsAsJSON(receipts: TransferReceipt[]): void {
  const jsonStr = JSON.stringify(receipts, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rekap-nota-transfer-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportScansAsJSON(scans: ScanResult[]): void {
  const jsonStr = JSON.stringify(scans, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lensateks-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
