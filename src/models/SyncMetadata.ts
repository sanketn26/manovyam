/**
 * Sync Metadata
 */
export interface SyncMetadata {
  id: number;
  lastSyncedAt?: Date;
  syncProvider?: "google_drive" | "dropbox" | "onedrive";
  cloudFileId?: string;
  cloudFileModifiedAt?: Date;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt?: Date;
  error?: string;
}
