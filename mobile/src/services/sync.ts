/**
 * Sync Manager
 * Handles offline-first data synchronization with Firebase
 */
import NetInfo from '@react-native-community/netinfo';
import { getUnsyncedItems, markSynced } from './storage';
import { SyncQueueItem } from '../models/types';

// Firebase config - will be set up in Phase 6
let firebaseEnabled = false;

export const setFirebaseEnabled = (enabled: boolean) => {
  firebaseEnabled = enabled;
};

/**
 * Check network connectivity
 */
export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

/**
 * Sync all pending items to Firebase
 * Called when connectivity is restored
 */
export const syncToFirebase = async (): Promise<{
  synced: number;
  failed: number;
}> => {
  if (!firebaseEnabled) {
    return { synced: 0, failed: 0 };
  }

  const online = await isOnline();
  if (!online) {
    return { synced: 0, failed: 0 };
  }

  const unsyncedItems = await getUnsyncedItems();
  let synced = 0;
  let failed = 0;

  for (const item of unsyncedItems) {
    try {
      await syncItem(item);
      await markSynced(item.id);
      synced++;
    } catch (error) {
      console.error('Sync failed for item:', item.id, error);
      failed++;
    }
  }

  return { synced, failed };
};

/**
 * Sync a single item to Firebase.
 *
 * BUG (fixed): this used to be a no-op that only logged to console, yet
 * the caller (syncToFirebase) marked every item as `synced` regardless.
 * That meant real patient data queued for sync was silently discarded —
 * marked as delivered to Firebase when it never left the device. There is
 * also currently no Firebase SDK configured anywhere in the mobile app
 * (no firebase package in mobile/package.json, no init code), so this
 * cannot actually sync yet.
 *
 * Until real Firestore writes are implemented here, this throws so the
 * caller correctly counts the item as `failed` and leaves it in the queue
 * instead of losing it.
 */
const syncItem = async (item: SyncQueueItem): Promise<void> => {
  throw new Error(
    `syncItem not implemented — Firebase sync is not wired up in the mobile app yet ` +
      `(collection: ${item.collection}, documentId: ${item.documentId}, action: ${item.action})`
  );
};

/**
 * Start periodic sync check
 */
let syncInterval: ReturnType<typeof setInterval> | null = null;

export const startPeriodicSync = (intervalMs: number = 60000): void => {
  if (syncInterval) clearInterval(syncInterval);

  syncInterval = setInterval(async () => {
    const online = await isOnline();
    if (online) {
      await syncToFirebase();
    }
  }, intervalMs);
};

export const stopPeriodicSync = (): void => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

/**
 * Listen for connectivity changes and sync when online
 */
export const setupConnectivityListener = (): void => {
  NetInfo.addEventListener(async (state: any) => {
    if (state.isConnected) {
      console.log('Device is online, syncing...');
      await syncToFirebase();
    } else {
      console.log('Device is offline, queueing changes');
    }
  });
};
