import { useCallback } from "react";
import { useAtom } from "jotai";
import { ISyncService } from "../services/interfaces/ISyncService";
import { syncStatusAtom, lastSyncedAtAtom, errorAtom } from "../store/atoms";

/**
 * ViewModel for Cloud Sync
 * Manages cloud backup and synchronization
 */
export function useSyncViewModel(syncService: ISyncService) {
  const [syncStatus, setSyncStatus] = useAtom(syncStatusAtom);
  const [lastSyncedAt, setLastSyncedAt] = useAtom(lastSyncedAtAtom);
  const [error, setError] = useAtom(errorAtom);

  /**
   * Load sync metadata
   */
  const loadSyncMetadata = useCallback(async () => {
    try {
      const metadata = await syncService.getSyncMetadata();
      if (metadata?.lastSyncedAt) {
        setLastSyncedAt(metadata.lastSyncedAt);
      }
    } catch (err) {
      console.error("Error loading sync metadata:", err);
    }
  }, [syncService, setLastSyncedAt]);

  /**
   * Sync to cloud
   */
  const syncToCloud = useCallback(
    async (
      provider: "google_drive" | "dropbox" | "onedrive",
      accessToken: string,
      password: string
    ) => {
      try {
        setSyncStatus({ isSyncing: true });
        setError(null);

        const status = await syncService.syncToCloud(
          provider,
          accessToken,
          password
        );

        setSyncStatus(status);
        if (status.lastSyncedAt) {
          setLastSyncedAt(status.lastSyncedAt);
        }

        return status;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Sync failed";
        setError(errorMessage);
        setSyncStatus({
          isSyncing: false,
          error: errorMessage,
        });
        throw err;
      }
    },
    [syncService, setSyncStatus, setLastSyncedAt, setError]
  );

  /**
   * Export database
   */
  const exportDatabase = useCallback(
    async (password: string) => {
      try {
        setError(null);
        return await syncService.exportDatabase(password);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Export failed";
        setError(errorMessage);
        throw err;
      }
    },
    [syncService, setError]
  );

  /**
   * Import database
   */
  const importDatabase = useCallback(
    async (encryptedData: string, password: string) => {
      try {
        setError(null);
        await syncService.importDatabase(encryptedData, password);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Import failed";
        setError(errorMessage);
        throw err;
      }
    },
    [syncService, setError]
  );

  return {
    // State
    syncStatus,
    lastSyncedAt,
    error,

    // Actions
    loadSyncMetadata,
    syncToCloud,
    exportDatabase,
    importDatabase,
  };
}
