/**
 * Local-First Dream Persistence — Phase 2
 *
 * IndexedDB-backed store for dreams that haven't been uploaded to the server yet.
 * Handles the full lifecycle:
 *   captured → pending → uploading → uploaded → deleted
 *   captured → pending → failed → retrying → uploaded → deleted
 *
 * ──────────────────────────────────────────────────────────────────
 * HONEST GUARANTEES:
 *   ✅ Survives: page refresh, navigation, tab close, network loss,
 *               app re-open, browser restart (same profile)
 *   ✅ Multiple drafts are stored separately with unique IDs
 *   ✅ Audio Blob stored after recording stops (best-effort)
 *   ❌ Does NOT survive: browser data clear, private/incognito session end
 *   ❌ iOS Safari may evict after ~7 days of inactivity (mitigated by persist())
 *   ❌ If browser force-kills mid-recording, audio RAM chunks are lost
 *      (text content is safe via localStorage draft, not audio)
 * ──────────────────────────────────────────────────────────────────
 */

const DB_NAME = 'subconscious_local_dreams';
const DB_VERSION = 1;
const STORE_DREAMS = 'pending_dreams';

export type LocalDreamStatus =
  | 'captured'   // Recorded/typed locally, not yet attempted upload
  | 'uploading'  // Upload in progress right now
  | 'uploaded'   // Successfully confirmed on server — safe to delete
  | 'failed';    // Last upload attempt failed — will retry

export interface LocalDream {
  /** Unique local ID (UUID-style) — never reused. Prevents duplicate uploads. */
  localId: string;
  /** User's Supabase user ID — used to scope queries */
  userId: string;
  /** The dream text content */
  content: string;
  /** Dream date (YYYY-MM-DD) */
  date: string;
  /** Optional user-provided title */
  title?: string;
  /** Mood */
  mood?: string | null;
  /** Lucidity */
  lucidity?: string | null;
  /** Tags */
  tags?: string[];
  /** Memory type */
  memoryType?: string;
  /** Whether voice was used */
  usedVoice: boolean;
  /** Optional audio Blob — stored after recording stops. Best-effort only. */
  audioBlobBase64?: string;
  /** MIME type of audio (e.g., 'audio/webm') */
  audioMimeType?: string;
  /** Language code for transcription */
  audioLang?: string;
  /** ISO timestamp when this was first captured locally */
  capturedAt: string;
  /** ISO timestamp of last status change */
  updatedAt: string;
  /** Current upload status */
  status: LocalDreamStatus;
  /** Number of upload attempts */
  uploadAttempts: number;
  /** ISO timestamp of last upload attempt */
  lastAttemptAt?: string;
  /** Error message from last failed attempt */
  lastError?: string;
  /** Server dream ID — only set after successful upload */
  serverDreamId?: string;
  /** Phase 7: Multiple segments captured locally */
  segments?: LocalSegment[];
}

export interface LocalSegment {
  localSegmentId: string;
  type: 'voice' | 'text';
  content: string;
  rawTranscript?: string;
  audioBlobBase64?: string;
  audioMimeType?: string;
  audioLang?: string;
  durationSeconds?: number;
  segmentIndex: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Database initialization
// ─────────────────────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available in SSR'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_DREAMS)) {
        const store = db.createObjectStore(STORE_DREAMS, { keyPath: 'localId' });
        store.createIndex('by_userId', 'userId', { unique: false });
        store.createIndex('by_userId_status', ['userId', 'status'], { unique: false });
        store.createIndex('by_status', 'status', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null; // Allow retry
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('[LocalDreams] IDB upgrade blocked — another tab may have it open.');
    };
  });

  return dbPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core operations
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a unique local ID */
export function generateLocalId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 9);
  return `dream_${timestamp}_${random}`;
}

/** Request durable storage to prevent iOS/browser eviction */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('storage' in navigator)) return false;
  try {
    if (navigator.storage && navigator.storage.persist) {
      const granted = await navigator.storage.persist();
      return granted;
    }
    return false;
  } catch {
    return false;
  }
}

/** Save a new local dream (status = 'captured') */
export async function saveLocalDream(
  dream: Omit<LocalDream, 'capturedAt' | 'updatedAt' | 'status' | 'uploadAttempts'>
): Promise<LocalDream> {
  const db = await openDB();
  const now = new Date().toISOString();
  const record: LocalDream = {
    ...dream,
    capturedAt: now,
    updatedAt: now,
    status: 'captured',
    uploadAttempts: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DREAMS, 'readwrite');
    const req = tx.objectStore(STORE_DREAMS).add(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

/** Update fields on an existing local dream (by localId) */
export async function updateLocalDream(
  localId: string,
  updates: Partial<LocalDream>
): Promise<void> {
  const db = await openDB();
  const now = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DREAMS, 'readwrite');
    const store = tx.objectStore(STORE_DREAMS);
    const getReq = store.get(localId);

    getReq.onsuccess = () => {
      const existing = getReq.result as LocalDream | undefined;
      if (!existing) {
        reject(new Error(`LocalDream ${localId} not found`));
        return;
      }
      const updated: LocalDream = { ...existing, ...updates, updatedAt: now };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

/** Get a single local dream by localId */
export async function getLocalDream(localId: string): Promise<LocalDream | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DREAMS, 'readonly');
    const req = tx.objectStore(STORE_DREAMS).get(localId);
    req.onsuccess = () => resolve((req.result as LocalDream) || null);
    req.onerror = () => reject(req.error);
  });
}

/** Get all local dreams for a user (any status) */
export async function getAllLocalDreams(userId: string): Promise<LocalDream[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DREAMS, 'readonly');
    const index = tx.objectStore(STORE_DREAMS).index('by_userId');
    const req = index.getAll(IDBKeyRange.only(userId));
    req.onsuccess = () => {
      const results = (req.result as LocalDream[]) || [];
      // Sort newest first
      results.sort(
        (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
      );
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Get all local dreams with a specific status for a user */
export async function getLocalDreamsByStatus(
  userId: string,
  status: LocalDreamStatus
): Promise<LocalDream[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DREAMS, 'readonly');
    const index = tx.objectStore(STORE_DREAMS).index('by_userId_status');
    const req = index.getAll(IDBKeyRange.only([userId, status]));
    req.onsuccess = () => {
      const results = (req.result as LocalDream[]) || [];
      results.sort(
        (a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime()
      );
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Get count of pending+failed (unsynced) local dreams for a user */
export async function getPendingCount(userId: string): Promise<number> {
  try {
    const [captured, failed, uploading] = await Promise.all([
      getLocalDreamsByStatus(userId, 'captured'),
      getLocalDreamsByStatus(userId, 'failed'),
      getLocalDreamsByStatus(userId, 'uploading'),
    ]);
    return captured.length + failed.length + uploading.length;
  } catch {
    return 0;
  }
}

/**
 * Mark a dream as 'uploaded' and remove it from the local store.
 * Only call this AFTER confirming server-side persistence.
 */
export async function confirmAndDeleteLocalDream(localId: string, serverDreamId: string): Promise<void> {
  // First mark as uploaded (safety checkpoint)
  await updateLocalDream(localId, { status: 'uploaded', serverDreamId });

  // Then delete
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DREAMS, 'readwrite');
    const req = tx.objectStore(STORE_DREAMS).delete(localId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Delete a local dream by localId (discard/cancel) */
export async function deleteLocalDream(localId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DREAMS, 'readwrite');
    const req = tx.objectStore(STORE_DREAMS).delete(localId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Delete all 'uploaded' dreams older than maxAgeDays (cleanup) */
export async function cleanupUploadedDreams(maxAgeDays = 7): Promise<void> {
  try {
    const db = await openDB();
    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000).toISOString();

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DREAMS, 'readwrite');
      const index = tx.objectStore(STORE_DREAMS).index('by_status');
      const req = index.openCursor(IDBKeyRange.only('uploaded'));

      req.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (!cursor) {
          resolve();
          return;
        }
        const dream = cursor.value as LocalDream;
        if (dream.updatedAt < cutoff) {
          cursor.delete();
        }
        cursor.continue();
      };
      req.onerror = () => resolve(); // Non-critical
    });
  } catch {
    // Non-critical
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Audio Blob helpers (best-effort — not guaranteed across browser kill)
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a Blob to base64 string for IndexedDB storage */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (data:audio/webm;base64,...)
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Convert stored base64 back to Blob for transcription retry */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}
